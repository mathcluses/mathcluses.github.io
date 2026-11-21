// ============================================================================
//  POSER UNE OPÉRATION SUR LE SITE (6e) : addition, soustraction, multiplication,
//  division euclidienne, division décimale.
//  À charger après flash.js : <script src="../commun/poser.js"></script>
//
//  Chaque fonction renvoie un « widget » pour une question du moteur :
//     { q: "Pose et calcule : 4 587 + 2 936", r: "7 523", widget: POSER.addition(4587, 2936) }
//  L'opération est déjà posée (chiffres alignés, virgules alignées). L'élève remplit les cases :
//   • les petites cases (retenues) et les lignes intermédiaires (produits partiels, soustractions de la division)
//     sont un brouillon : elles ne sont pas corrigées ;
//   • seule la ligne du résultat (et le quotient / le reste des divisions) est corrigée.
//  Une case = un chiffre. Sur téléphone, le clavier numérique s'ouvre ; après un chiffre, on passe à la case
//  suivante (vers la gauche pour un résultat, comme quand on calcule ; vers la droite pour un quotient).
//  La virgule d'une multiplication ou d'un quotient décimal se place en touchant l'espace entre deux cases.
// ============================================================================
(function(){
  var O=FLASH.outils;

  // chiffres d'un nombre (texte sans virgule) et nombre de chiffres après la virgule
  function decoupe(x){
    var s=String(Math.round(x*1e6)/1e6),p=s.split(".");
    return {ent:p[0],dec:p[1]||"",tout:p[0]+(p[1]||"")};
  }
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}

  // ---------- La grille ----------
  // Une grille = des lignes de n colonnes. Chaque case : null (vide), {t:"7"} (chiffre écrit), {t:"0",gris:1} (zéro ajouté),
  // {saisie:"res"|"brouillon"|"petit"} (case à remplir), avec virg:1 (virgule après la case) ou gap:1 (virgule à placer).
  function Grille(n){this.n=n;this.lignes=[];this.cases=[]}
  Grille.prototype.ligne=function(cases,opt){this.lignes.push({cases:cases,opt:opt||{}});return this};
  Grille.prototype.trait=function(){this.lignes.push({trait:true});return this};
  Grille.prototype.html=function(conteneur){
    var self=this,g=el("div","pz-grille");g.style.setProperty("--n",this.n);
    this.lignes.forEach(function(l,ri){
      if(l.trait){g.appendChild(el("div","pz-trait"));return}
      var ligne=el("div","pz-ligne"+(l.opt.petit?" pz-petite":""));
      for(var c=0;c<self.n;c++){
        var d=l.cases[c],cell;
        if(d&&d.saisie){
          cell=el("span","pz-case"+(d.virg?" virg":""));
          var inp=el("input","pz-in pz-"+d.saisie);
          inp.setAttribute("inputmode","numeric");inp.setAttribute("maxlength","1");inp.setAttribute("autocomplete","off");
          inp.setAttribute("aria-label",d.saisie==="res"?"chiffre du résultat":"brouillon");
          inp._ligne=ri;inp._col=c;inp._dir=l.opt.dir||-1;
          cell.appendChild(inp);
          if(d.gap){var b=el("button","pz-gap");b.type="button";b.setAttribute("aria-label","placer la virgule ici");b._cell=cell;cell.appendChild(b)}
          self.cases.push(inp);
        }else{
          cell=el("span","pz-case pz-fixe"+(d&&d.virg?" virg":"")+(d&&d.gris?" pz-gris":"")+(d&&d.signe?" pz-signe":""),d?d.t:"");
        }
        ligne.appendChild(cell);
      }
      g.appendChild(ligne);
    });
    conteneur.appendChild(g);
    this.el=g;
    // saisie : un chiffre par case, puis case suivante dans le sens de la ligne
    var cases=this.cases;
    function voisine(inp,sens){
      var l=cases.filter(function(x){return x._ligne===inp._ligne}).sort(function(a,b){return a._col-b._col}),i=l.indexOf(inp);
      return l[i+sens];
    }
    cases.forEach(function(inp){
      inp.addEventListener("input",function(){
        var v=inp.value.replace(/\D/g,"");inp.value=v.slice(-1);
        if(inp.value){var s=voisine(inp,inp._dir);if(s)s.focus()}
      });
      inp.addEventListener("keydown",function(e){
        if(e.key==="Backspace"&&!inp.value){var s=voisine(inp,-inp._dir);if(s){s.focus();s.value="";e.preventDefault()}}
        else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){var t=voisine(inp,e.key==="ArrowLeft"?-1:1);if(t){t.focus();e.preventDefault()}}
        else if(e.key==="Enter"){e.preventDefault();e.stopPropagation();if(self.valider)self.valider()}   // (sans passer aussi à la question suivante)
      });
      inp.addEventListener("focus",function(){inp.select()});
    });
    // virgule à placer : toucher l'espace entre deux cases (une seule virgule par ligne)
    [].forEach.call(g.querySelectorAll(".pz-gap"),function(b){
      b.addEventListener("click",function(e){
        e.stopPropagation();
        var ligne=b._cell.parentNode,deja=b._cell.classList.contains("virg");
        [].forEach.call(ligne.querySelectorAll(".pz-case"),function(c){c.classList.remove("virg")});
        if(!deja)b._cell.classList.add("virg");
      });
    });
    return g;
  };
  // lit un nombre dans les cases de saisie d'une ligne : chiffres de gauche à droite, virgule après la case .virg ;
  // cases vides au début ou à la fin ignorées, case vide au milieu = réponse incomplète (null)
  function lire(cases){
    var t="";
    cases.forEach(function(inp){t+=(inp.value||"_")+(inp.parentNode.classList.contains("virg")?",":"")});
    t=t.replace(/^_+/,"").replace(/_+$/,"").replace(/,$/,"");
    if(t[0]===",")t="0"+t;
    if(!t||t.indexOf("_")>=0)return null;
    return parseFloat(t.replace(",","."));
  }
  function casesDe(grille,saisie,ligne){
    return grille.cases.filter(function(x){return x.classList.contains("pz-"+saisie)&&(ligne==null||x._ligne===ligne)}).sort(function(a,b){return a._col-b._col});
  }

  // Un widget = la grille + un bouton « Valider ». lireReponse() → {ok, texte} ; lignes de résultat colorées à la fin.
  function widget(construire,attendu,lireReponse,aide){
    return function(zone,termine){
      zone.innerHTML="";
      if(aide)zone.appendChild(el("p","pz-aide",aide));
      var boite=el("div","pz-boite");zone.appendChild(boite);
      var g=construire(boite);
      // taille des cases : toutes les colonnes de l'opération doivent tenir dans la largeur (téléphone compris)
      var tot=0;[].forEach.call(boite.querySelectorAll(".pz-grille"),function(x){if(!x.closest(".pz-ligne-reste"))tot+=+x.style.getPropertyValue("--n")});
      boite.style.setProperty("--tot",tot);
      var rang=el("div","row pz-boutons"),bt=el("button","pz-valider","Valider");bt.type="button";rang.appendChild(bt);zone.appendChild(rang);
      var fait=false;
      g.valider=function(){
        if(fait)return;fait=true;
        var rep=lireReponse(g);
        g.cases.forEach(function(x){x.disabled=true});
        [].forEach.call(zone.querySelectorAll(".pz-gap"),function(b){b.disabled=true});
        g.cases.filter(function(x){return x.classList.contains("pz-res")||x.classList.contains("pz-reste")}).forEach(function(x){x.classList.add(rep.ok?"pz-bon":"pz-faux")});
        rang.className="hide";
        termine(rep.ok,rep.texte);                     // la correction de la question (q.correction) donne le résultat attendu
      };
      bt.addEventListener("click",function(e){e.stopPropagation();g.valider()});
      var res=casesDe(g,"res");
      var premiere=res.length?(res[0]._dir>0?res[0]:res[res.length-1]):g.cases[0];
      if(premiere&&matchMedia("(pointer:fine)").matches)setTimeout(function(){premiere.focus()},50);   // pas sur téléphone (le clavier cacherait tout)
    };
  }
  function txt(v){return v==null?"(incomplet)":O.nb(v)}

  // ---------- ADDITION et SOUSTRACTION (virgules alignées) ----------
  function addSous(a,b,plus){
    var A=decoupe(a),B=decoupe(b),D=Math.max(A.dec.length,B.dec.length),I=Math.max(A.ent.length,B.ent.length)+(plus?1:0),n=1+I+D;
    var r=Math.round((plus?a+b:a-b)*1e6)/1e6;
    function col(p){return 1+(I-1-p)}                // place (0 unités, 1 dizaines, −1 dixièmes…) → colonne
    function ligneNombre(X,signe){
      var c=new Array(n).fill(null);
      if(signe)c[0]={t:signe,signe:1};
      for(var i=0;i<X.ent.length;i++)c[col(X.ent.length-1-i)]={t:X.ent[i]};
      for(var j=0;j<D;j++)c[col(-(j+1))]=j<X.dec.length?{t:X.dec[j]}:{t:"0",gris:1};
      if(D)c[col(0)].virg=1;
      return c;
    }
    function ligneSaisie(type){
      var c=new Array(n).fill(null);
      for(var k=1;k<n;k++)c[k]={saisie:type,virg:D&&k===col(0)?1:0};
      return c;
    }
    return widget(function(boite){
      var g=new Grille(n);
      g.ligne(ligneSaisie("petit"),{petit:1}).ligne(ligneNombre(A)).ligne(ligneNombre(B,plus?"+":"−")).trait().ligne(ligneSaisie("res"));
      g.html(boite);return g;
    },O.nb(r),function(g){var v=lire(casesDe(g,"res"));return {ok:v!==null&&Math.abs(v-r)<1e-9,texte:txt(v)}},
    "Les petites cases du haut servent aux retenues.");
  }

  // ---------- MULTIPLICATION (nombres alignés à droite) ----------
  function multiplication(a,b){
    var A=decoupe(a),B=decoupe(b),n=1+Math.max(A.tout.length+B.tout.length,A.tout.length+1,B.tout.length+1),dec=A.dec.length+B.dec.length;
    var r=Math.round(a*b*1e6)/1e6;
    function ligneNombre(X,signe){
      var c=new Array(n).fill(null),s=X.tout;
      if(signe)c[0]={t:signe,signe:1};
      for(var i=0;i<s.length;i++)c[n-s.length+i]={t:s[i],virg:X.dec&&i===X.ent.length-1?1:0};
      return c;
    }
    function ligneSaisie(type,gap){var c=new Array(n).fill(null);for(var k=1;k<n;k++)c[k]={saisie:type,gap:gap&&k<n-1?1:0};return c}
    var partiels=B.tout.length>1?B.tout.length:0;
    return widget(function(boite){
      var g=new Grille(n);
      g.ligne(ligneSaisie("petit"),{petit:1}).ligne(ligneNombre(A)).ligne(ligneNombre(B,"×")).trait();
      if(partiels){
        for(var k=0;k<partiels;k++){var l=ligneSaisie("brouillon");if(k===partiels-1)l[0]={t:"+",signe:1};g.ligne(l)}
        g.trait();
      }
      g.ligne(ligneSaisie("res",dec>0));
      g.html(boite);return g;
    },O.nb(r),function(g){var v=lire(casesDe(g,"res"));return {ok:v!==null&&Math.abs(v-r)<1e-9,texte:txt(v)}},
    (partiels?"Une ligne par chiffre de "+O.nb(b)+", puis on additionne. ":"")+(dec?"Pour placer la virgule du résultat, touche l’espace entre deux cases.":"Les petites cases du haut servent aux retenues."));
  }

  // ---------- DIVISIONS (potence) ----------
  // euclidienne : quotient entier + reste ; décimale : on prolonge le dividende par des zéros, virgule à placer au quotient
  function division(a,b,decimale){
    // division décimale : un zéro de plus que nécessaire au dividende (sans dépasser les millièmes), et autant de cases
    // au quotient que de chiffres possibles : des cases pas trop petites sur téléphone
    var q=decimale?Math.round(a/b*1e6)/1e6:Math.floor(a/b),Q=decoupe(q),A=decoupe(a);
    var ext=decimale?Math.min(3,Math.max(Q.dec.length-A.dec.length,0)+1)-(A.dec.length>=3?1:0):0;
    ext=Math.max(0,Math.min(ext,3-A.dec.length));
    var dvd=A.tout+"0".repeat(ext),nDec=A.dec.length+ext,n=dvd.length+1,reste=decimale?null:a-q*b;
    var nq=decimale?Q.ent.length+Math.max(Q.dec.length,1)+1:Math.max(1,A.ent.length-String(b).length+1),nr=String(b).length;
    var etapes=Math.min(2*(decimale?Q.tout.length:nq),8);
    return widget(function(boite){
      var pot=el("div","pz-potence");boite.appendChild(pot);
      var gauche=el("div","pz-dividende"),droite=el("div","pz-diviseur");pot.appendChild(gauche);pot.appendChild(droite);
      var g=new Grille(n);
      var c=new Array(n).fill(null);
      for(var i=0;i<dvd.length;i++)c[1+i]={t:dvd[i],gris:i>=A.tout.length?1:0,virg:nDec&&i===A.ent.length-1?1:0};
      g.ligne(c);
      for(var k=0;k<etapes;k++){var l=new Array(n).fill(null);for(var j=1;j<n;j++)l[j]={saisie:"brouillon"};if(k%2===0)l[0]={t:"−",signe:1};g.ligne(l)}
      g.html(gauche);
      // à droite : le diviseur, puis le quotient (et le reste, pour la division euclidienne)
      var gd=new Grille(Math.max(nq,String(b).length));
      var cd=new Array(gd.n).fill(null);String(b).split("").forEach(function(ch,i){cd[i]={t:ch}});
      gd.ligne(cd).trait();
      var cq=new Array(gd.n).fill(null);for(var m=0;m<nq;m++)cq[m]={saisie:"res",gap:decimale&&m<nq-1?1:0};
      gd.ligne(cq,{dir:1});
      gd.html(droite);
      gd.el.classList.add("pz-quotient");
      if(!decimale){
        var lr=el("div","pz-ligne-reste");lr.appendChild(el("span","pz-etiq","Reste :"));droite.appendChild(lr);
        var gr=new Grille(nr),cr=new Array(nr).fill(null);for(var t=0;t<nr;t++)cr[t]={saisie:"reste"};
        gr.ligne(cr);gr.html(lr);g.cases=g.cases.concat(gr.cases);
      }
      g.cases=g.cases.concat(gd.cases);
      // le bouton Valider et la touche Entrée doivent voir toutes les cases
      [gd,gr].forEach(function(x){if(x)x.valider=function(){g.valider()}});
      return g;
    },decimale?O.nb(q):"quotient "+q+", reste "+reste,function(g){
      var vq=lire(casesDe(g,"res"));
      if(decimale)return {ok:vq!==null&&Math.abs(vq-q)<1e-9,texte:txt(vq)};
      var vr=lire(casesDe(g,"reste"));
      return {ok:vq===q&&vr===reste,texte:"quotient "+txt(vq)+", reste "+txt(vr)};
    },decimale?"Si le reste n’est pas nul, continue après la virgule (les zéros gris). Pour placer la virgule du quotient, touche l’espace entre deux cases."
              :"Les lignes sous le dividende servent aux soustractions. Écris le quotient sous le diviseur, puis le reste.");
  }

  window.POSER={
    addition:function(a,b){return addSous(a,b,true)},
    soustraction:function(a,b){return addSous(a,b,false)},
    multiplication:multiplication,
    euclidienne:function(a,b){return division(a,b,false)},
    decimale:function(a,b){return division(a,b,true)}
  };
})();

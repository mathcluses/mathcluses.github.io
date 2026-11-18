// ============================================================================
//  MOTEUR DES QUESTIONS FLASH (6e)
//  Ce fichier est commun à tous les chapitres : il n'y a rien à y modifier pour
//  ajouter des questions. Les questions d'un chapitre sont dans le index.html
//  de son dossier (voir le mode d'emploi en haut de ces fichiers).
//
//  Déroulement voulu, très simple (pensé pour le téléphone et pour des élèves de 6e) :
//   • l'élève touche une partie du chapitre → la série démarre tout de suite ;
//   • il répond en touchant une proposition parmi 6 à 8 (jamais de clavier) ;
//   • on passe tout seul à la question suivante ;
//   • une échelle de couleur (rouge → vert) bouge à chaque réponse ; à la fin, pas de note,
//     seulement un niveau en couleur.
//
//  Plan : outils pour écrire les questions (H) → fabrication des propositions →
//  niveau en couleur → écrans → FLASH.chapitre().
// ============================================================================
(function(){
  var $=function(i){return document.getElementById(i)};

  // Durées avant de passer tout seul à la question suivante (en millisecondes).
  // Après une erreur, l'élève lit la correction puis touche l'écran ou une touche ; sinon on passe au bout de 15 s.
  var PAUSE_JUSTE=1100, PAUSE_FAUX=15000;

  // ===== 1. OUTILS DONNÉS AUX GÉNÉRATEURS DE QUESTIONS (paramètre « h ») =====
  var H={
    // entier au hasard entre a et b (inclus)
    rnd:function(a,b){return Math.floor(Math.random()*(b-a+1))+a},
    // un élément au hasard d'une liste
    choix:function(l){return l[Math.floor(Math.random()*l.length)]},
    // copie mélangée d'une liste
    melange:function(l){var t=l.slice();for(var i=t.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=t[i];t[i]=t[j];t[j]=x}return t},
    // plus grand diviseur commun (pour simplifier une fraction)
    pgcd:function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t}return a},
    // écriture française d'un nombre : 12345.6 → « 12 345,6 » (espaces fines insécables)
    nb:function(x){
      x=Math.round(x*1e9)/1e9;
      var neg=x<0,s=String(Math.abs(x));
      if(s.indexOf("e")>=0)s=Math.abs(x).toFixed(9).replace(/0+$/,"");
      var p=s.split("."),ent=p[0].replace(/\B(?=(\d{3})+(?!\d))/g," ");
      return (neg?"−":"")+ent+(p[1]?","+p[1]:"");
    },
    // fraction écrite avec un trait horizontal
    frac:function(n,d){return '<span class="frac"><span>'+n+'</span><span>'+d+'</span></span>'},
    // entier + fraction (« nombre mixte ») : 1 + 5/8
    mixte:function(e,r,d){return '<span class="nw">'+e+' + '+H.frac(r,d)+'</span>'},
    // morceau d'énoncé qui ne se coupe pas en fin de ligne
    nw:function(s){return '<span class="nw">'+s+'</span>'},

    // --- Figures (SVG) ---
    // bandes partagées en n parts égales, k parts coloriées en tout (plusieurs bandes côte à côte si k > n)
    bande:function(n,k){
      var nb=Math.max(1,Math.ceil(k/n)),g=14,l=nb>1?110:300,h=36,W=nb*l+(nb-1)*g;
      var s='<svg class="fig" viewBox="0 0 '+(W+4)+' '+(h+4)+'" width="'+(W+4)+'" role="img" aria-label="'+nb+' bande(s) partagée(s) en '+n+' parts">';
      for(var b=0;b<nb;b++)for(var i=0;i<n;i++)
        s+='<rect x="'+(2+b*(l+g)+i*l/n)+'" y="2" width="'+(l/n)+'" height="'+h+'" class="'+(b*n+i<k?"plein":"vide")+'"/>';
      return s+'</svg>';
    },
    // disques (« gâteaux ») partagés en n parts égales, k parts coloriées en tout (plusieurs gâteaux si k > n)
    disque:function(n,k){
      var nb=Math.max(1,Math.ceil(k/n)),r=58,c=62,W=nb*124+(nb-1)*12;
      var s='<svg class="fig" viewBox="0 0 '+W+' 124" width="'+W+'" role="img" aria-label="'+nb+' disque(s) partagé(s) en '+n+' parts">';
      for(var b=0;b<nb;b++){
        var cx=c+b*136;
        for(var i=0;i<n;i++){
          var a1=-Math.PI/2+2*Math.PI*i/n,a2=-Math.PI/2+2*Math.PI*(i+1)/n;
          s+='<path class="'+(b*n+i<k?"plein":"vide")+'" d="M'+cx+' '+c+' L'+(cx+r*Math.cos(a1)).toFixed(2)+' '+(c+r*Math.sin(a1)).toFixed(2)+
             ' A'+r+' '+r+' 0 0 1 '+(cx+r*Math.cos(a2)).toFixed(2)+' '+(c+r*Math.sin(a2)).toFixed(2)+' Z"/>';
        }
      }
      return s+'</svg>';
    },
    // demi-droite graduée de 0 à « max » unités, chaque unité partagée en b ; point A sur la k-ième graduation
    droite:function(b,k,max){
      var L=320,x0=14,u=L/max,y=34,s='<svg class="fig" viewBox="0 0 '+(L+40)+' 62" width="'+(L+40)+'" role="img" aria-label="demi-droite graduée">';
      s+='<line class="trait" x1="'+x0+'" y1="'+y+'" x2="'+(x0+L+20)+'" y2="'+y+'"/>'+
         '<path class="trait" d="M'+(x0+L+20)+' '+y+' l-8 -5 M'+(x0+L+20)+' '+y+' l-8 5"/>';
      for(var i=0;i<=max*b;i++){
        var x=x0+i*u/b,ent=i%b===0;
        s+='<line class="trait" x1="'+x+'" y1="'+(y-(ent?9:5))+'" x2="'+x+'" y2="'+(y+(ent?9:5))+'"/>';
        if(ent)s+='<text x="'+x+'" y="'+(y+24)+'" text-anchor="middle">'+(i/b)+'</text>';
      }
      var xa=x0+k*u/b;
      return s+'<circle class="point" cx="'+xa+'" cy="'+y+'" r="4.5"/><text x="'+xa+'" y="'+(y-14)+'" text-anchor="middle" font-weight="700">A</text></svg>';
    }
  };

  function norm(s){return String(s).trim().replace(/[\s  ]/g,"")}
  function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}

  // ===== 2. FABRICATION DES PROPOSITIONS (6 à 8, proches de la bonne réponse) =====
  // Une question donne SA bonne réponse sous l'une de ces formes :
  //   r: 12 ou r: "0,25"     un nombre → propositions numériques (erreurs de virgule, ±1…)
  //   fraction: [13, 8]      une fraction → propositions en fractions
  //   mixte: [1, 5, 8]       entier + fraction (1 + 5/8) → propositions sous la même forme
  //   choix: […], r: "…"     les propositions sont écrites à la main (par exemple <, = et >)
  // pieges : erreurs typiques proposées en priorité (mêmes formes : nombres, [n, d] ou [e, r, d]).
  // Aucune proposition fausse n'a la même valeur que la bonne réponse.
  function garder(liste,cle,valeur,ok){
    var vus={},res=[];vus[cle(valeur)]=1;
    liste.forEach(function(x){if(!ok(x))return;var c=cle(x);if(vus[c])return;vus[c]=1;res.push(x)});
    return res;
  }
  function nbDecimales(v){var p=H.nb(v).split(",");return p[1]?p[1].length:0}

  function propositionsNombre(q,v){
    var dp=nbDecimales(v),u=Math.pow(10,-dp);
    var autour=[v*10,v/10,v+u,v-u,v+2*u,v-2*u,v*100,v/100,v+1,v-1,v+10*u,v-10*u,2*v,v+3*u,v-3*u,v+5*u];
    var fausses=garder((q.pieges||[]).concat(H.melange(autour)),function(x){return Math.round(x*1e6)},v,function(x){
      return x>=0&&nbDecimales(x)<=dp+2&&(dp>0||Math.round(x)===x);
    });
    var liste=[v].concat(fausses.slice(0,H.rnd(6,8)-1)).sort(function(a,b){return a-b});
    q.choix=liste.map(H.nb);q.r=H.nb(v);
  }
  // De temps en temps (PART_DOUBLE), quand la fraction se simplifie, sa forme simplifiée est proposée aussi :
  // les deux sont justes (5/10 et 1/2), l'élève peut toucher l'une ou l'autre.
  var PART_DOUBLE=.15;
  function propositionsFraction(q){
    var n=q.fraction[0],d=q.fraction[1],g=H.pgcd(n,d);
    var autour=[[n+1,d],[n-1,d],[n,d+1],[n,d-1],[d,n],[n+2,d],[n-2,d],[n,d+2],[n+1,d+1],[n-1,d-1],[2*n,d],[n,2*d],[n+d,d],[n*d,d],
                [n+3,d],[n,d+3],[n+1,d+2],[n+2,d+1],[2*n+1,d],[n+1,d-1]];
    var fausses=garder((q.pieges||[]).concat(H.melange(autour)),function(p){return Math.round(p[0]/p[1]*1e6)},[n,d],function(p){return p[0]>=1&&p[1]>=2});
    var justes=[[n,d]];
    if(g>1&&d/g>=2&&Math.random()<PART_DOUBLE)justes.push([n/g,d/g]);
    q.choix=H.melange(justes.concat(fausses.slice(0,H.rnd(6,8)-justes.length))).map(function(p){return H.frac(p[0],p[1])});
    q.r=H.frac(n,d);
    if(justes.length>1){
      q.autres=[H.frac(n/g,d/g)];
      q.correction=(q.correction?q.correction+" ":"")+"Deux réponses étaient justes : "+q.r+" = "+q.autres[0]+".";
    }
  }
  function propositionsMixte(q){
    var e=q.mixte[0],r=q.mixte[1],d=q.mixte[2];
    var autour=[[e,r+1,d],[e,r-1,d],[e+1,r,d],[e-1,r,d],[e,d-r,d],[e,r,d+1],[e,r,d-1],[e+1,r-1,d],[e-1,r+1,d],[e+2,r,d],[e,r+2,d],[e,r-2,d],
                [e,r,d+2],[e,r,2*d],[e+1,r,d+1],[e-1,r,d+1],[e+3,r,d],[e+1,r,2*d]];
    var fausses=garder((q.pieges||[]).concat(H.melange(autour)),function(p){return Math.round((p[0]+p[1]/p[2])*1e6)},[e,r,d],
      function(p){return p[0]>=1&&p[1]>=1&&p[1]<p[2]&&p[2]>=2});
    q.choix=H.melange([[e,r,d]].concat(fausses.slice(0,H.rnd(6,8)-1))).map(function(p){return H.mixte(p[0],p[1],p[2])});
    q.r=H.mixte(e,r,d);
  }
  function preparer(q){
    if(q.choix)return;
    if(q.mixte)return propositionsMixte(q);
    if(q.fraction)return propositionsFraction(q);
    var v=typeof q.r==="number"?q.r:parseFloat(norm(q.r).replace(",","."));
    propositionsNombre(q,v);
  }

  // ===== 3. NIVEAU EN COULEUR (pas de note chiffrée) =====
  // p va de 0 (rouge) à 1 (vert) en passant par l'orange, le jaune et le vert clair :
  // une couleur au milieu de chacun des 5 niveaux (voir NIVEAUX plus bas).
  var COULEURS=[[.1,[198,40,40]],[.325,[239,108,0]],[.575,[249,168,37]],[.8,[124,179,66]],[.95,[46,125,50]]];
  function rgb(p){
    p=Math.max(COULEURS[0][0],Math.min(COULEURS[COULEURS.length-1][0],p));
    for(var i=1;i<COULEURS.length;i++)if(p<=COULEURS[i][0]){
      var a=COULEURS[i-1],b=COULEURS[i],t=(p-a[0])/(b[0]-a[0]);
      return a[1].map(function(x,j){return Math.round(x+(b[1][j]-x)*t)});
    }
  }
  function couleur(p){return "rgb("+rgb(p).join(",")+")"}
  // texte noir sur les couleurs claires (jaune), blanc sur les foncées
  function encre(p){var c=rgb(p);return (.299*c[0]+.587*c[1]+.114*c[2])>150?"#1b1b1b":"#fff"}
  // 5 niveaux, un par couleur de l'échelle (seuils = proportion de bonnes réponses)
  var NIVEAUX=[[.2,"Non acquis"],[.45,"Début d’acquisition"],[.7,"En cours d’acquisition"],[.9,"Acquis"],[1.01,"Maîtrisé"]];
  function niveau(p){for(var i=0;i<NIVEAUX.length;i++)if(p<NIVEAUX[i][0])return NIVEAUX[i][1]}
  var DEGRADE="linear-gradient(90deg,"+COULEURS.map(function(c){return "rgb("+c[1].join(",")+") "+(100*c[0])+"%"}).join(",")+")";
  // Échelle : dégradé avec un trait à chaque changement de niveau, et un curseur
  function echelle(id){
    var traits=NIVEAUX.slice(0,-1).map(function(n){return '<i style="left:'+(100*n[0])+'%"></i>'}).join("");
    return '<div class="echelle" aria-hidden="true"><div class="degrade" style="background:'+DEGRADE+'">'+traits+'</div><div class="curseur" id="'+id+'"></div>'+
           '<div class="bornes"><span>'+NIVEAUX[0][1]+'</span><span>'+NIVEAUX[NIVEAUX.length-1][1]+'</span></div></div>';
  }

  // ===== 4. FOND DE PAGE : DEUX FRACTALES DE JULIA, DE PART ET D'AUTRE DU MENU =====
  // Ensembles de Julia (z → z² + c) : de larges bras en spirale, aux couleurs néon sur fond nuit.
  // Calculés par la page (pas d'image à télécharger). Sur ordinateur, ils encadrent le menu (à gauche
  // et à droite) ; en portrait (téléphone), trop étroit, ils vont dans deux coins opposés.
  //   c       : le nombre complexe qui donne sa forme à la fractale
  //   paysage / portrait : position du centre, en fraction de la largeur et de la hauteur de l'écran
  //   teinte  : décalage dans le dégradé néon, pour que les deux ne soient pas jumelles
  var FRACTALES=[
    {c:[-.8,.156],    paysage:[.95,.66], portrait:[.9,.86],  teinte:0},    // à droite
    {c:[-.7,.27015],  paysage:[.05,.34], portrait:[.08,.13], teinte:.45}   // à gauche
  ];
  var NEON=[[99,102,241],[168,85,247],[236,72,153],[45,212,191],[99,102,241]];
  function neon(t){                               // t entre 0 et 1 → couleur du dégradé néon
    t=(t%1+1)%1*(NEON.length-1);var i=Math.floor(t),f=t-i,a=NEON[i],b=NEON[i+1];
    return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];
  }
  function dessinerFractale(c){
    var r=innerWidth<700?1:.5;                     // petit écran : pleine résolution (sinon trop pixelisé)
    var w=c.width=Math.max(120,Math.round(innerWidth*r)),h=c.height=Math.max(120,Math.round(innerHeight*r));
    var ctx=c.getContext("2d"),img=ctx.createImageData(w,h),d=img.data,MAX=130,portrait=h>w;
    // unités par pixel : en paysage, chaque fractale tient dans la marge à côté du menu ; en portrait, plus grande
    var u=portrait?3.4/w:1.5/(.27*w);
    var centres=FRACTALES.map(function(f){var p=portrait?f.portrait:f.paysage;return [p[0]*w,p[1]*h]});
    for(var py=0;py<h;py++)for(var px=0;px<w;px++){
      var k=(py*w+px)*4,best=0;
      for(var f=0;f<FRACTALES.length;f++){        // chaque pixel : la plus lumineuse des deux fractales
        var C=FRACTALES[f].c,zr=(px-centres[f][0])*u,zi=(py-centres[f][1])*u,n=0,zr2=zr*zr,zi2=zi*zi;
        if(zr2+zi2>16)continue;                    // loin de la fractale : rien à dessiner
        while(n<MAX&&zr2+zi2<16){zi=2*zr*zi+C[1];zr=zr2-zi2+C[0];zr2=zr*zr;zi2=zi*zi;n++}
        var col,a;
        if(n===MAX){col=[46,34,120];a=150}         // intérieur : indigo sombre, pour bien voir la forme
        else{
          var t=(n+1-Math.log(Math.log(Math.sqrt(zr2+zi2)))/Math.LN2)/MAX;
          col=neon(Math.sqrt(t)*2.6+FRACTALES[f].teinte);
          a=Math.min(255,Math.pow(t*5,1.15)*255);  // lumière concentrée près du bord (comme un néon)
        }
        if(a>best){best=a;d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=a}
      }
    }
    ctx.putImageData(img,0,0);
  }
  function fondFractale(){
    var c=document.createElement("canvas");c.id="fond-fractale";c.setAttribute("aria-hidden","true");
    document.body.insertBefore(c,document.body.firstChild);
    dessinerFractale(c);
    var dernier=[innerWidth,innerHeight],minuteur=null;
    addEventListener("resize",function(){            // on ne redessine que si la taille change vraiment (rotation…)
      clearTimeout(minuteur);
      minuteur=setTimeout(function(){
        if(Math.abs(innerWidth-dernier[0])>80||Math.abs(innerHeight-dernier[1])>160){dernier=[innerWidth,innerHeight];dessinerFractale(c)}
      },300);
    });
  }

  // ===== 5. LES ÉCRANS =====
  var CATALOGUE_6E="../../../index.html?niveau=6eme";
  var ICONE_RECOMMENCER='<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
  var ICONE_CHAPITRES='<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/></svg>';
  var GABARIT=
    '<p class="retour"><a href="'+CATALOGUE_6E+'">← Tous les chapitres de 6e</a></p>'+
    // Bandeau du chapitre : titre + illustration du chapitre (def.image)
    '<header class="bandeau"><div><span class="sur">Questions flash · 6e</span><h1 id="titre"></h1></div><span class="ill-chap" id="illchap" aria-hidden="true"></span></header>'+
    // Choix de la partie : un bouton = une série qui démarre tout de suite
    '<section id="accueil"><p class="muted" id="intro"></p><div class="parties" id="parties"></div></section>'+
    // Question (toucher la carte après une réponse fait passer plus vite à la suivante)
    '<section class="card hide" id="carte" aria-live="polite">'+
      '<div class="top"><span class="muted" id="prog"></span><button class="sec petit" id="stop">Quitter</button></div>'+
      echelle("curseur-direct")+
      '<div id="q"></div>'+
      '<div class="choix" id="zchoix"></div>'+
      '<div id="fb" role="status"></div>'+
      '<p class="muted passer hide" id="passer">Touche n’importe où pour continuer</p>'+
    '</section>'+
    // Résultat : une couleur et une échelle, pas de note
    '<section class="hide" id="fin">'+
      '<div class="resultat" id="resultat"><span>Ton niveau</span><b id="niveau"></b></div>'+
      echelle("curseur")+
      '<div id="bilan"></div>'+
      // Et après ? Trois choix illustrés : refaire la même partie, une autre partie du chapitre, un autre chapitre
      '<div class="tuiles">'+
        '<button type="button" class="tuile" id="encore"><span class="ill">'+ICONE_RECOMMENCER+'</span><span>Recommencer</span></button>'+
        '<button type="button" class="tuile" id="autre"><span class="ill" id="illautre"></span><span>Autre partie<small id="txtautre"></small></span></button>'+
        '<a class="tuile" href="'+CATALOGUE_6E+'"><span class="ill">'+ICONE_CHAPITRES+'</span><span>Changer de chapitre</span></a>'+
      '</div>'+
      '<details class="revoir"><summary>Revoir les questions</summary><ul id="list"></ul></details>'+
    '</section>';

  // def.sections : [{ nom, image, types:[…] }, …]  (ou def.types seul pour un chapitre sans parties)
  //   image : petite illustration HTML de la partie (figure h.disque(…) ou mini-calcul), affichée sur son bouton
  // def.imageTest : illustration du test (par défaut : celles des premières parties, en réduction)
  // def.image : illustration du chapitre (bandeau, et bouton « Autre partie » de l'écran de fin)  // def.nbQuestions : questions par partie (10 par défaut) ; def.nbTest : questions du test (20 par défaut)
  function chapitre(def){
    var main=$("flash");main.innerHTML=GABARIT;
    document.title="6e · Questions flash : "+def.titre;
    $("titre").textContent=def.titre;
    $("illchap").innerHTML=def.image||"";$("illautre").innerHTML=def.image||"";
    $("txtautre").textContent=def.titre;
    try{fondFractale()}catch(e){}                  // sans canvas : le fond nuit simple reste

    var ok=function(t){return t&&typeof t.gen==="function"};
    var sections=(def.sections||[{nom:"Commencer",types:def.types||[]}]).map(function(s){
      return {nom:s.nom,image:s.image,types:(s.types||[]).filter(ok).map(function(t){t.section=s.nom;return t})};
    }).filter(function(s){return s.types.length});

    if(!sections.length){
      $("intro").textContent="Ce chapitre est en préparation : les questions arrivent bientôt.";
      return;
    }
    $("intro").textContent=sections.length>1?"Touche ce que tu veux travailler :":"";

    // Avec plusieurs parties, on ajoute un « test » qui pioche dans toutes les parties.
    var tous=[].concat.apply([],sections.map(function(s){return s.types}));
    if(sections.length>1)sections.push({nom:"Test : tout le chapitre",test:true,types:tous,
      image:def.imageTest||'<span class="ill-test">'+sections.slice(0,4).map(function(s){return '<span>'+(s.image||"")+'</span>'}).join("")+'</span>'});

    // Bouton d'une partie : illustration (pour reconnaître la partie sans lire) + nom + pastille de niveau.
    // La pastille donne la MOYENNE DES 3 DERNIÈRES SÉRIES faites sur cet appareil, en 4 couleurs (BILAN) :
    // une seule bonne série ne suffit pas (pas de coup de chance), et l'élève voit sa progression.
    // « Maîtrisé » n'est possible qu'après 3 séries. Sous le niveau, une jauge de 4 barres (1 = Non acquis … 4 = Maîtrisé).
    // Plus tard, elle pourra montrer la progression enregistrée avec un compte élève.
    var BILAN=[[.4,"#c62828","Non acquis"],[.65,"#ef6c00","En cours"],[.85,"#7cb342","Acquis"],[1.01,"#2e7d32","Maîtrisé"]];
    var cle=function(s){return "flash6|"+def.titre+"|"+s.nom};
    function historique(s){                        // les 3 derniers résultats (de 0 à 1), du plus ancien au plus récent
      try{var v=JSON.parse(localStorage.getItem(cle(s)));return Array.isArray(v)?v:(typeof v==="number"?[v]:[])}catch(e){return []}
    }
    function retenir(s,p){try{localStorage.setItem(cle(s),JSON.stringify(historique(s).concat([p]).slice(-3)))}catch(e){}}
    function bilan(s){
      var h=historique(s);if(!h.length)return null;
      var moy=h.reduce(function(a,b){return a+b},0)/h.length,i=0;
      while(moy>=BILAN[i][0])i++;
      if(h.length<3&&i===BILAN.length-1)i--;       // « Maîtrisé » seulement après 3 séries
      return {n:h.length,rang:i,couleur:BILAN[i][1],nom:BILAN[i][2]};
    }
    sections.forEach(function(s,i){
      var b=document.createElement("button");b.type="button";b.className="partie"+(s.test?" test":"");
      b.innerHTML=(s.image?'<span class="ill" aria-hidden="true">'+s.image+'</span>':'')+'<span class="nom">'+esc(s.nom)+'</span><span class="etat"></span>';
      b.addEventListener("click",function(){nouvelleSerie(i)});
      $("parties").appendChild(b);
    });
    function majEtats(){
      [].forEach.call($("parties").children,function(b,i){
        var x=bilan(sections[i]),c=b.querySelector(".etat");
        c.className="etat"+(x?" fait":"");
        c.style.background=x?x.couleur:"";
        c.style.color=x&&x.nom==="Acquis"?"#13210b":"";   // texte foncé sur le vert clair (lisibilité)
        c.innerHTML=x?'<b>'+x.nom+'</b><span class="barres">'+BILAN.map(function(b,j){return '<i'+(j<=x.rang?' class="on"':'')+'></i>'}).join("")+'</span>'
                     :'<b>À faire</b>';
        c.title=x?"Moyenne des "+(x.n>1?x.n+" dernières séries":"de la dernière série"):"Pas encore fait";
      });
    }
    majEtats();

    var sec=0,serie=[],k=0,rep=[],fini=false,attente=null,affichee=0;

    // Une série : les questions sont réparties équitablement entre les types de la partie, puis mélangées.
    function nouvelleSerie(i){
      sec=i;var s=sections[i];
      var n=Math.min(25,s.test?(def.nbTest||20):(def.nbQuestions||10)),liste=[];
      var types=H.melange(s.types);                 // au test, chaque série tombe sur des types différents
      for(var j=0;j<n;j++)liste.push(types[j%types.length]);
      liste=H.melange(liste);
      serie=[];
      liste.forEach(function(t){
        var q,essais=0;
        do{q=t.gen(H);essais++}while(essais<10&&serie.some(function(p){return p.q===q.q}));  // pas deux fois la même question
        preparer(q);
        q.type=t.nom;q.section=t.section;serie.push(q);
      });
      k=0;rep=[];
      $("accueil").className="hide";$("fin").className="hide";$("carte").className="card";
      main.className="en-serie";                     // pendant les questions, le bandeau se replie (place sur téléphone)
      document.body.classList.add("en-serie");       // … et le fond s'assombrit (plus de concentration)
      majEchelle();afficher();
    }

    // Pendant la série, le curseur part du milieu et bouge d'un cran à chaque réponse :
    // vers le vert si c'est juste, vers le rouge si c'est faux. À la fin, il est sur la proportion de bonnes réponses.
    function niveauDirect(){
      var b=rep.filter(function(r){return r.ok}).length;
      return .5+(b-(rep.length-b))/(2*serie.length);
    }
    function majEchelle(){
      var p=niveauDirect();
      $("curseur-direct").style.left=(100*p)+"%";
      $("carte").style.borderLeftColor=couleur(p);
    }

    function afficher(){
      var q=serie[k];fini=false;affichee=Date.now();
      $("prog").textContent="Question "+(k+1)+" / "+serie.length+(sections[sec].test&&q.section?" · "+q.section:"");
      $("q").innerHTML=q.q;
      $("fb").className="";$("fb").innerHTML="";
      $("passer").className="muted passer hide";
      var z=$("zchoix");z.className="choix"+(q.choix.length>4?" nombreux":"");z.innerHTML="";
      q.choix.forEach(function(c){
        var b=document.createElement("button");b.type="button";b.innerHTML=String(c);
        // les propositions ignorent les clics pendant un court instant : un double-clic pour passer
        // la question précédente ne doit pas répondre par accident à la nouvelle
        b.addEventListener("click",function(e){e.stopPropagation();if(!fini&&Date.now()-affichee>400)corriger(String(c),b)});
        z.appendChild(b);
      });
      window.scrollTo(0,0);
    }

    function corriger(choisi,bouton){
      fini=true;
      var q=serie[k];
      // bonne réponse : q.r, ou l'une des q.autres (forme simplifiée proposée en plus)
      var juste=function(c){return [q.r].concat(q.autres||[]).some(function(x){return norm(x)===norm(c)})};
      var ok=juste(choisi);
      rep.push({q:q,choisi:choisi,ok:ok});
      // Les propositions ne réagissent plus (sans être « disabled » : un bouton désactivé avalerait le clic,
      // alors qu'on veut qu'un clic n'importe où, même sur une proposition, fasse passer à la suite).
      $("zchoix").className+=" repondu";
      [].forEach.call($("zchoix").children,function(b,i){
        if(juste(q.choix[i]))b.className="bon";
        else if(b===bouton)b.className="faux";
        b.setAttribute("aria-disabled","true");
      });
      var fb=$("fb");fb.className=ok?"ok":"ko";
      // la correction s'affiche après une erreur, et aussi quand deux réponses étaient justes (pour le faire remarquer)
      fb.innerHTML='<span class="verdict">'+(ok?"Bravo !":"Pas tout à fait.")+'</span>'+((!ok||q.autres)&&q.correction?'<div>'+q.correction+'</div>':"");
      if(!ok)$("passer").className="muted passer";
      majEchelle();
      attente=setTimeout(suivante,ok?PAUSE_JUSTE:PAUSE_FAUX);
    }

    function suivante(){
      clearTimeout(attente);attente=null;
      k++;
      if(k<serie.length){afficher();return}
      $("carte").className="card hide";$("fin").className="";main.className="";document.body.classList.remove("en-serie");
      var p=rep.filter(function(r){return r.ok}).length/rep.length;
      retenir(sections[sec],p);
      $("resultat").style.background=couleur(p);$("resultat").style.color=encre(p);
      $("niveau").textContent=niveau(p);
      $("curseur").style.left=(100*p)+"%";
      // Au test : niveau de chaque partie du chapitre, pour savoir quoi retravailler
      var bil=$("bilan");bil.innerHTML="";
      if(sections[sec].test){
        var par={};
        rep.forEach(function(r){var s=r.q.section;par[s]=par[s]||{ok:0,n:0};par[s].n++;if(r.ok)par[s].ok++});
        var ul=document.createElement("ul");ul.className="bilan";
        sections.forEach(function(s){
          var x=par[s.nom];if(!x)return;
          var li=document.createElement("li");li.style.borderLeftColor=couleur(x.ok/x.n);
          li.innerHTML='<span class="pastille" style="background:'+couleur(x.ok/x.n)+'"></span>'+esc(s.nom);
          ul.appendChild(li);
        });
        bil.appendChild(ul);
      }
      var ul2=$("list");ul2.innerHTML="";
      rep.forEach(function(r){
        var li=document.createElement("li");li.className=r.ok?"ok":"ko";
        li.innerHTML='<span class="rq">'+r.q.q+'</span><br>'+(r.ok?"Juste : ":"Réponse : ")+"<b>"+r.q.r+"</b>"+
          (r.q.autres?" ou <b>"+r.q.autres.join("</b> ou <b>")+"</b>":"")+(r.ok?"":" (tu avais choisi "+r.choisi+")");
        ul2.appendChild(li);
      });
      window.scrollTo(0,0);
    }

    // Après une réponse : un clic ou un toucher n'importe où sur la page, ou n'importe quelle touche,
    // passe tout de suite à la suite
    function passer(){if(fini&&attente)suivante()}
    document.addEventListener("click",passer);
    document.addEventListener("keydown",function(e){
      if(!fini||!attente||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/^F\d/.test(e.key))return;   // F5, Ctrl+… gardent leur rôle
      e.preventDefault();passer();
    });

    if(sections.length===1)$("autre").className="tuile hide";   // pas d'autre partie à choisir
    function accueil(){clearTimeout(attente);attente=null;majEtats();main.className="";document.body.classList.remove("en-serie");$("carte").className="card hide";$("fin").className="hide";$("accueil").className="";window.scrollTo(0,0)}
    $("encore").addEventListener("click",function(){nouvelleSerie(sec)});
    $("autre").addEventListener("click",accueil);
    $("stop").addEventListener("click",function(e){e.stopPropagation();accueil()});
    if(sections.length===1)nouvelleSerie(0);       // chapitre sans parties : la série démarre directement
  }

  window.FLASH={chapitre:chapitre,outils:H};
})();

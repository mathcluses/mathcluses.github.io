// ============================================================================
//  OUTILS COMMUNS AUX CHAPITRES « NOMBRES ENTIERS » ET « NOMBRES DÉCIMAUX » (6e)
//  À charger après flash.js : <script src="../commun/nombres.js"></script>, puis var N = NOMBRES;
//
//  Les nombres sont fabriqués CHIFFRE PAR CHIFFRE (chaînes : partie entière e, partie décimale d)
//  puis écrits par ecrire(e, d) : pas d'erreur d'arrondi, même avec des milliards.
// ============================================================================
(function(){
  var O=FLASH.outils;
  var ESP=" ";                                  // espace fine insécable (entre les classes de chiffres)

  // chiffre au hasard (non nul si nonNul)
  function ch(h,nonNul){return String(nonNul?h.rnd(1,9):h.rnd(0,9))}
  // un nombre : nEnt chiffres avant la virgule (le premier non nul, sauf « 0 »), nDec après (le dernier non nul)
  function nombre(h,nEnt,nDec){
    var e=nEnt?ch(h,true):"0",d="";
    for(var i=1;i<nEnt;i++)e+=ch(h);
    for(var j=0;j<(nDec||0);j++)d+=ch(h,j===nDec-1);
    return {e:e,d:d,v:val(e,d)};
  }
  function val(e,d){return parseFloat(e+(d?"."+d:""))}
  // valeur d'un texte « 12 345,6 » (espaces et virgule française)
  function valeur(s){return parseFloat(String(s).replace(/[\s  ]/g,"").replace(",","."))}
  // écriture française : classes de 3 chiffres ; pos (facultatif) = rang du chiffre à colorer (0 unités, 1 dizaines, −1 dixièmes…)
  function ecrire(e,d,pos){
    var s="",vise=function(c,p){return p===pos?'<span class="chiffre-vise">'+c+'</span>':c};
    for(var i=0;i<e.length;i++){var p=e.length-1-i;s+=vise(e[i],p);if(p>0&&p%3===0)s+=ESP}
    if(d){s+=",";for(var j=0;j<d.length;j++)s+=vise(d[j],-(j+1))}
    return '<span class="nw">'+s+'</span>';
  }
  var RANGS={"11":"centaines de milliards","10":"dizaines de milliards","9":"unités de milliards","8":"centaines de millions",
    "7":"dizaines de millions","6":"unités de millions","5":"centaines de mille","4":"dizaines de mille","3":"unités de mille",
    "2":"centaines","1":"dizaines","0":"unités","-1":"dixièmes","-2":"centièmes","-3":"millièmes"};
  // rang d'un nom de rang (pour ranger des propositions des milliards aux millièmes)
  function valeurRang(nom){for(var r in RANGS)if(RANGS[r]===nom)return Number(r);return 0}

  // Propositions écrites à la main : la bonne + des fausses, chacune [texte, valeur], sans doublon ni valeur égale à la bonne
  // (memeValeurOk : on garde les fausses de même valeur, utile quand la question porte sur l'écriture et pas la valeur).
  // On en garde 6 à 8 (ou exactement « combien »), mélangées ou triées par valeur.
  function propositions(h,bonne,fausses,trier,memeValeurOk,combien){
    var vus={},liste=[bonne];vus[bonne[0]]=1;
    h.melange(fausses).forEach(function(f){
      if(vus[f[0]]||(!memeValeurOk&&Math.abs(f[1]-bonne[1])<1e-9)||!(f[1]>=0))return;
      vus[f[0]]=1;liste.push(f);
    });
    liste=[bonne].concat(liste.slice(1,combien||h.rnd(6,8)));
    liste=trier?liste.sort(function(a,b){return a[1]-b[1]}):h.melange(liste);
    return liste.map(function(x){return x[0]});
  }
  function arrondi(x){return Math.round(x*1e6)/1e6}
  // « 1 unité », « 3 unités », « 1 dixième »… (mot donné au pluriel)
  function qte(n,mot){return O.nb(n)+" "+(n<2?mot.replace(/s$/,""):mot)}

  // Morceau de demi-droite graduée : debut, pas (valeur d'une graduation), nb graduations, une étiquette toutes les « tous »
  // graduations ; points : [{k, nom}] placés sur la k-ième graduation
  function droite(debut,pas,nb,tous,points){
    var L=320,x0=18,y=42,dx=L/nb,W=L+46;
    var s='<svg class="fig" viewBox="0 0 '+W+' 72" width="'+W+'" role="img" aria-label="demi-droite graduée">'+
      '<line class="trait" x1="4" y1="'+y+'" x2="'+(W-4)+'" y2="'+y+'"/><path class="trait" d="M'+(W-4)+' '+y+' l-8 -5 M'+(W-4)+' '+y+' l-8 5"/>';
    for(var i=0;i<=nb;i++){
      var x=x0+i*dx,maj=i%tous===0,mil=tous%2===0&&i%(tous/2)===0,t=maj?10:mil?7:4;
      s+='<line class="trait" x1="'+x+'" y1="'+(y-t)+'" x2="'+x+'" y2="'+(y+t)+'"/>';
      if(maj)s+='<text x="'+x+'" y="'+(y+26)+'" text-anchor="middle" font-size="14">'+O.nb(arrondi(debut+i*pas))+'</text>';
    }
    (points||[]).forEach(function(p){
      var x=x0+p.k*dx;
      s+='<circle class="point" cx="'+x+'" cy="'+y+'" r="4.5"/><text x="'+x+'" y="'+(y-15)+'" text-anchor="middle" font-weight="700">'+p.nom+'</text>';
    });
    return s+'</svg>';
  }

  // Nombre entier écrit en lettres, orthographe rectifiée de 1990 (recommandée par le programme) :
  // traits d'union entre tous les mots-nombres (« deux-cent-trente-et-un »), mais « million » et « milliard »
  // sont des noms : ils restent séparés par des espaces et prennent un s (« deux millions trois-cent-mille »).
  // « cent » et « vingt » (quatre-vingts) prennent un s quand ils terminent le nombre et sont multipliés ;
  // « mille » est invariable.
  var U=["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
  var D={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
  function moins100(n,fin){                          // 1 à 99 ; fin : rien d'autre (sauf million/milliard) ne suit
    if(n<17)return U[n];
    if(n<20)return "dix-"+U[n-10];
    var d=Math.floor(n/10),u=n%10;
    if(d===7)return u===1?"soixante-et-onze":"soixante-"+moins100(10+u,fin);
    if(d===9)return "quatre-vingt-"+moins100(10+u,fin);
    if(d===8)return u?"quatre-vingt-"+U[u]:"quatre-vingt"+(fin?"s":"");
    return u===0?D[d]:u===1?D[d]+"-et-un":D[d]+"-"+U[u];
  }
  function moins1000(n,fin){                         // 1 à 999
    var c=Math.floor(n/100),r=n%100,s="";
    if(c===1)s="cent";else if(c>1)s=U[c]+"-cent"+(r===0&&fin?"s":"");
    if(r)s+=(s?"-":"")+moins100(r,fin);
    return s;
  }
  function lettres(n){
    if(n===0)return "zéro";
    var G=Math.floor(n/1e9),M=Math.floor(n/1e6)%1000,T=Math.floor(n/1000)%1000,R=n%1000,mots=[];
    if(G)mots.push(moins1000(G,true)+" milliard"+(G>1?"s":""));
    if(M)mots.push(moins1000(M,true)+" million"+(M>1?"s":""));
    var fin="";
    if(T)fin=T===1?"mille":moins1000(T,false)+"-mille";
    if(R)fin+=(fin?"-":"")+moins1000(R,true);
    if(fin)mots.push(fin);
    return mots.join(" ");
  }

  window.NOMBRES={ESP:ESP,ch:ch,nombre:nombre,val:val,valeur:valeur,ecrire:ecrire,RANGS:RANGS,valeurRang:valeurRang,
    propositions:propositions,arrondi:arrondi,qte:qte,droite:droite,lettres:lettres};
})();

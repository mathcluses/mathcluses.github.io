// ============================================================================
//  TUTOS DE GÉOMÉTRIE (6e) : petites animations (moins de 20 s) qui montrent une construction
//  avec les mêmes instruments que l'atelier (règle, équerre, compas, rapporteur).
//  À charger après geo.js : <script src="../commun/tuto.js"></script>
//
//   • TUTO.ouvrir("rectangle") ouvre le tuto dans une fenêtre (Pause, Revoir, Plus lent, Fermer) ;
//   • dans une question : GEO.tache({…, tuto:"rectangle"}) ajoute le bouton « ▶ Tuto » à la barre d'outils ;
//   • dans un chapitre : une partie { …, tutos:["rectangle","carre"] } montre ses tutos sous la partie.
//
//  Un tuto = un titre + une fonction qui dessine les données et renvoie la liste des étapes.
//  Chaque étape dure d secondes, peut changer la phrase du haut (txt), et anime quelque chose (f(e), e de 0 à 1).
//  Phrases très courtes et numérotées : ce sont des élèves de 6e.
// ============================================================================
(function(){
  var V=GEO.V,el=GEO.el,INS=GEO.INSTRUMENTS,W=GEO.W,H=GEO.H;
  function f(x){return (+x).toFixed(3)}
  function lisse(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function mix(a,b,t){return a+(b-a)*t}
  function mixP(a,b,t){return [mix(a[0],b[0],t),mix(a[1],b[1],t)]}
  function dAng(a,b){return ((b-a)%360+540)%360-180}        // le plus court pour tourner de a vers b
  function pol(c,r,deg){return V.add(c,V.mul(V.rot([1,0],deg),r))}
  function arcD(c,r,a0,bal){                                 // arc en deux moitiés (marche aussi pour un tour complet)
    if(Math.abs(bal)<.05)return "";
    var p0=pol(c,r,a0),p1=pol(c,r,a0+bal/2),p2=pol(c,r,a0+bal),s=bal>0?1:0;
    return "M"+f(p0[0])+" "+f(p0[1])+" A"+f(r)+" "+f(r)+" 0 0 "+s+" "+f(p1[0])+" "+f(p1[1])+" A"+f(r)+" "+f(r)+" 0 0 "+s+" "+f(p2[0])+" "+f(p2[1]);
  }

  // ---------- LA SCÈNE : la même figure que l'atelier (10 cm × 7,5 cm) ----------
  function scene(svg){
    var S={};
    el("rect",{x:0,y:0,width:W,height:H,class:"gb-fond"},svg);
    for(var gx=1;gx<W;gx++)el("line",{x1:gx,y1:0,x2:gx,y2:H,class:"gb-grille"},svg);
    for(var gy=1;gy<H;gy++)el("line",{x1:0,y1:gy,x2:W,y2:gy,class:"gb-grille"},svg);
    var gF=el("g",{},svg),gD=el("g",{},svg),gT=el("g",{},svg),gC=el("g",{},svg),gP=el("g",{},svg),gI=el("g",{},svg),gK=el("g",{class:"tu-crayon"},svg);
    S.gT=gT;S.gC=gC;S.gP=gP;S.gF=gF;
    // crayon : la pointe est en (0, 0)
    el("path",{d:"M0 0 L.16 -.42 L.42 -.26 Z",class:"cr-bois"},gK);el("path",{d:"M0 0 L.06 -.16 L.16 -.1 Z",class:"cr-mine"},gK);
    el("path",{d:"M.16 -.42 L.86 -1.54 L1.12 -1.38 L.42 -.26 Z",class:"cr-corps"},gK);el("path",{d:"M.86 -1.54 L.98 -1.73 L1.24 -1.57 L1.12 -1.38 Z",class:"cr-gomme"},gK);
    gK.style.display="none";
    // le doigt : montre quelle prise du compas on tire (comme dans l'atelier)
    var gDoigt=el("g",{class:"tu-doigt"},svg);el("circle",{r:.5,class:"tu-doigt-ext"},gDoigt);el("circle",{r:.16,class:"tu-doigt-int"},gDoigt);gDoigt.style.display="none";
    S.doigt=function(p){if(!p){gDoigt.style.display="none";return}gDoigt.style.display="";gDoigt.setAttribute("transform","translate("+f(p[0])+" "+f(p[1])+")")};
    S.crayon=function(p){if(!p){gK.style.display="none";return}gK.style.display="";gK.setAttribute("transform","translate("+f(p[0])+" "+f(p[1])+")")};
    // données : droite (prolongée), segment, point (croix + nom)
    S.droite=function(p,q,nom,dec){
      var u=V.unit(V.sub(q,p)),a=V.sub(p,V.mul(u,30)),b=V.add(p,V.mul(u,30));
      el("line",{x1:f(a[0]),y1:f(a[1]),x2:f(b[0]),y2:f(b[1]),class:"gb-donnee"},gD);
      if(nom){var t=V.add(q,dec||[.15,-.2]);el("text",{x:f(t[0]),y:f(t[1]),class:"gb-nom"},gD).textContent=nom}
    };
    S.segment=function(p,q){el("line",{x1:f(p[0]),y1:f(p[1]),x2:f(q[0]),y2:f(q[1]),class:"gb-donnee"},gD)};
    S.croix=function(p,nom,dec,g,cls){
      g=g||gD;var s=.13;
      el("path",{d:"M"+f(p[0]-s)+" "+f(p[1]-s)+" L"+f(p[0]+s)+" "+f(p[1]+s)+" M"+f(p[0]-s)+" "+f(p[1]+s)+" L"+f(p[0]+s)+" "+f(p[1]-s),class:cls||"gb-pt"},g);
      if(nom){var t=V.add(p,dec||[.18,-.18]);el("text",{x:f(t[0]),y:f(t[1]),class:"gb-nom"+(cls?" tu-nom":"")},g).textContent=nom}
    };
    // instruments (dessin de geo.js) : position du pivot, angle, opacité
    S.instrument=function(nom){
      var I={nom:nom,x:0,y:0,a:0,o:0};
      I.g=el("g",{class:"gi gi-"+nom+" tu-instr"},gI);INS[nom].dessin(el("g",{},I.g));
      I.maj=function(){I.g.setAttribute("transform","translate("+f(I.x)+" "+f(I.y)+") rotate("+f(I.a)+")");I.g.style.opacity=I.o};
      I.maj();return I;
    };
    S.compas=function(){
      var C={P:[0,0],M:[1,0],o:0};
      C.g=el("g",{class:"gi gi-compas tu-instr"},gI);
      var j=el("path",{class:"gi-jambes"},C.g),
          hp=el("circle",{r:.3,class:"gi-pointe"},C.g),hm=el("circle",{r:.32,class:"gi-mine"},C.g),ht=el("circle",{r:.3,class:"gi-tete"},C.g),
          et=el("text",{class:"gi-ouv"},C.g);
      C.maj=function(){
        var m=V.mul(V.add(C.P,C.M),.5),d=V.dist(C.P,C.M),u=V.unit(V.sub(C.M,C.P)),n=[u[1],-u[0]];if(n[1]>0)n=V.mul(n,-1);
        var t=V.add(m,V.mul(n,Math.max(1.4,3.2-d*.25)));C.T=t;
        j.setAttribute("d","M"+f(C.P[0])+" "+f(C.P[1])+" L"+f(t[0])+" "+f(t[1])+" L"+f(C.M[0])+" "+f(C.M[1]));
        hp.setAttribute("cx",f(C.P[0]));hp.setAttribute("cy",f(C.P[1]));hm.setAttribute("cx",f(C.M[0]));hm.setAttribute("cy",f(C.M[1]));
        ht.setAttribute("cx",f(t[0]));ht.setAttribute("cy",f(t[1]));
        et.setAttribute("x",f(t[0]));et.setAttribute("y",f(t[1]-.45));et.textContent=FLASH.outils.nb(Math.round(d*10)/10)+" cm";
        C.g.style.opacity=C.o;
      };
      C.maj();return C;
    };
    // codages de la figure finale
    S.angleDroit=function(g,c,u1,u2,s){s=s||.32;u1=V.unit(u1);u2=V.unit(u2);
      var a=V.add(c,V.mul(u1,s)),b=V.add(a,V.mul(u2,s)),d=V.add(c,V.mul(u2,s));
      el("path",{d:"M"+f(a[0])+" "+f(a[1])+" L"+f(b[0])+" "+f(b[1])+" L"+f(d[0])+" "+f(d[1]),class:"tu-code"},g)};
    S.egal=function(g,p,q,k){var m=V.mul(V.add(p,q),.5),u=V.unit(V.sub(q,p)),n=[-u[1],u[0]];
      for(var i=0;i<k;i++){var c=V.add(m,V.mul(u,(i-(k-1)/2)*.14)),a=V.add(c,V.mul(n,.18)),b=V.sub(c,V.mul(n,.18));
        el("line",{x1:f(a[0]),y1:f(a[1]),x2:f(b[0]),y2:f(b[1]),class:"tu-code"},g)}};
    S.texte=function(g,p,txt,cls){var t=el("text",{x:f(p[0]),y:f(p[1]),class:"tu-texte"+(cls?" "+cls:"")},g);t.textContent=txt;return t};
    S.forme=function(g,pts){el("polygon",{points:pts.map(function(p){return f(p[0])+","+f(p[1])}).join(" "),class:"tu-forme"},g)};
    S.pointille=function(g,p,q){el("line",{x1:f(p[0]),y1:f(p[1]),x2:f(q[0]),y2:f(q[1]),class:"tu-pointille"},g)};
    S.arcAngle=function(g,c,r,a0,a1){el("path",{d:arcD(c,r,a0,a1-a0),class:"tu-code"},g)};
    return S;
  }

  // ---------- LES ÉTAPES ----------
  function etapes(S){
    var K={
      attendre:function(d,txt){return {d:d,txt:txt}},
      // faire apparaître (à une position donnée) ou disparaître un instrument
      montrer:function(I,pos,d){return {d:d||.4,debut:function(){if(pos){for(var k in pos)I[k]=pos[k]}},f:function(e){I.o=e;I.maj()}}},
      cacher:function(I,d){return {d:d||.4,f:function(e){I.o=1-e;I.maj()}}},
      // déplacer (et tourner) un instrument : pivot (x, y) et angle a
      aller:function(I,but,d,txt){var de;return {d:d,txt:txt,debut:function(){de={x:I.x,y:I.y,a:I.a}},
        f:function(e){I.x=mix(de.x,but.x,e);I.y=mix(de.y,but.y,e);I.a=de.a+dAng(de.a,but.a)*e;I.maj()}}},
      // compas, comme dans l'atelier : on RÈGLE l'écartement (le compas au repos, en bas à gauche, s'ouvre),
      // on TOUCHE un point (le doigt), le compas s'y pose et TRACE tout seul (arc, pivoter : sans doigt)
      regler:function(C,r,d,txt){var p0,m0;return {d:d,txt:txt,debut:function(){p0=C.P;m0=C.M},
        f:function(e){C.P=mixP(p0,REPOS,e);C.M=mixP(m0,[REPOS[0]+r,REPOS[1]],e);C.maj()}}},
      toucher:function(C,c,d,txt){var p0,m0;return {d:d,txt:txt,debut:function(){p0=C.P;m0=C.M},
        f:function(e){var k=lisse(Math.min(1,Math.max(0,(e-.25)/.6)));C.P=mixP(p0,c,k);C.M=V.add(C.P,V.sub(m0,p0));C.maj();S.doigt(e<.45?c:null)}}},
      pivoter:function(C,a,d,txt){var a0,r;return {d:d,txt:txt,debut:function(){a0=V.ang(V.sub(C.M,C.P));r=V.dist(C.P,C.M)},
        f:function(e){C.M=pol(C.P,r,a0+dAng(a0,a)*e);C.maj()}}},
      arc:function(C,a0,a1,d,txt){var r,c,p;return {d:d,txt:txt,debut:function(){c=C.P.slice();r=V.dist(C.P,C.M);p=el("path",{class:"gb-trait gb-vide"},S.gT)},
        f:function(e){var a=mix(a0,a1,e);p.setAttribute("d",arcD(c,r,a0,a-a0));C.M=pol(c,r,a);C.maj()}}},
      // petites étiquettes qui apparaissent puis disparaissent (par exemple le nom des prises du compas)
      etiquettes:function(dessin,d,txt){var g;return {d:d,txt:txt,debut:function(){g=el("g",{},S.gC);dessin(g);g.style.opacity=0},
        f:function(e){g.style.opacity=e<.15?e/.15:e>.85?(1-e)/.15:1;if(e>=1&&g.parentNode)g.parentNode.removeChild(g)}}},
      // tracer un trait au crayon de p à q (cls : "tu-aide" pour un trait de construction, plus discret)
      tracer:function(p,q,d,txt,cls){var l;return {d:d,txt:txt,debut:function(){l=el("line",{x1:f(p[0]),y1:f(p[1]),x2:f(p[0]),y2:f(p[1]),class:"gb-trait"+(cls?" "+cls:"")},S.gT)},
        f:function(e){var m=mixP(p,q,e);l.setAttribute("x2",f(m[0]));l.setAttribute("y2",f(m[1]));S.crayon(e<1?m:null)}}},
      // placer un point (il apparaît avec un cercle qui s'agrandit)
      point:function(nom,p,dec,d,txt){var g,o;return {d:d||.7,txt:txt,debut:function(){g=el("g",{},S.gP);S.croix(p,nom,dec,g,"tu-pt");
          o=el("circle",{cx:f(p[0]),cy:f(p[1]),r:.1,class:"tu-onde"},g);g.style.opacity=0},
        f:function(e){g.style.opacity=Math.min(1,e*3);o.setAttribute("r",f(.1+.6*e));o.style.opacity=1-e}}},
      // codages, longueurs, couleur de la figure… (dessinés par la fonction, ils apparaissent en fondu)
      codes:function(dessin,d,txt){var g;return {d:d||.5,txt:txt,debut:function(){g=el("g",{},S.gC);dessin(g);g.style.opacity=0},
        f:function(e){g.style.opacity=e}}},
      forme:function(pts,d,txt){var g;return {d:d||.5,txt:txt,debut:function(){g=el("g",{},S.gF);S.forme(g,pts);g.style.opacity=0},
        f:function(e){g.style.opacity=e}}},
      // plusieurs animations en même temps (même durée)
      ensemble:function(l,d,txt){return {d:d,txt:txt,debut:function(){l.forEach(function(x){if(x.debut)x.debut()})},
        f:function(e){l.forEach(function(x){if(x.f)x.f(e)})}}}
    };
    return K;
  }

  // ---------- LES TUTOS ----------
  // équerre : a = angle de rotation. Le côté gradué (6 cm) part de l'angle droit dans la direction a ;
  // l'autre côté (4 cm) dans la direction a − 90°.
  var REPOS=[.45,7.1];                                       // le compas au repos (comme dans l'atelier)
  function cote(x){return FLASH.outils.nb(x)+" cm"}
  var TUTOS={};

  TUTOS.perpendiculaire={titre:"Tracer une perpendiculaire",f:function(S,K){
    var p=[.5,5.2],q=[9.5,3.6],A=[4.6,2],u=V.unit(V.sub(q,p)),Hp=V.projete(A,p,q),n=V.unit(V.sub(A,Hp));
    S.droite(p,q,"(d)",[-.3,-.3]);S.croix(A,"A");
    var E=S.instrument("equerre"),a=V.ang(n),dep=V.add(Hp,V.mul(u,1.8));
    return [
      K.montrer(E,{x:7.4,y:6.9,a:-60}),
      K.aller(E,{x:dep[0],y:dep[1],a:a},2.2,"1. Pose l’équerre sur (d)"),
      K.attendre(.3),
      K.aller(E,{x:Hp[0],y:Hp[1],a:a},2,"2. Fais-la glisser jusqu’à A"),
      K.attendre(.3),
      K.tracer(Hp,V.add(Hp,V.mul(n,4.1)),2,"3. Trace le long de l’équerre"),
      K.cacher(E),
      K.codes(function(g){S.angleDroit(g,Hp,V.mul(u,-1),n)}),
      K.attendre(2.4,"✓ La perpendiculaire à (d) passant par A")
    ];
  }};

  TUTOS.parallele={titre:"Tracer une parallèle",f:function(S,K){
    var p=[.5,5.8],q=[9.5,5],A=[6.4,2.6],u=V.unit(V.sub(q,p)),Hp=V.projete(A,p,q),n=V.unit(V.sub(A,Hp));
    S.droite(p,q,"(d)",[-.3,-.3]);S.croix(A,"A",[.2,-.25]);
    var E=S.instrument("equerre"),a1=V.ang(n),a2=V.ang(V.mul(u,-1)),dep=V.add(Hp,V.mul(u,1.6)),fin=V.sub(A,V.mul(u,5.5));
    return [
      K.montrer(E,{x:8.2,y:7,a:-50}),
      K.aller(E,{x:dep[0],y:dep[1],a:a1},2,"1. Pose l’équerre sur (d)"),
      K.aller(E,{x:Hp[0],y:Hp[1],a:a1},1.6,"2. Fais-la glisser jusqu’à A"),
      K.tracer(Hp,V.add(Hp,V.mul(n,3.6)),1.4,"3. Trace la perpendiculaire","tu-aide"),
      K.attendre(.3),
      K.aller(E,{x:A[0],y:A[1],a:a2},2,"4. Équerre sur ce trait, angle droit en A"),
      K.attendre(.3),
      K.tracer(A,fin,1.6,"5. Trace le long de l’équerre"),
      K.cacher(E),
      K.codes(function(g){S.angleDroit(g,Hp,V.mul(u,-1),n);S.angleDroit(g,A,V.mul(u,-1),V.mul(n,-1));S.texte(g,V.add(fin,[.05,-.25]),"(d’)","tu-res")}),
      K.attendre(2.4,"✓ (d’) est parallèle à (d)")
    ];
  }};

  // rectangle ou carré : angle droit et longueur avec le côté gradué de l'équerre
  function rectangle(S,K,L,l,carre){
    var x0=carre?4.6:4.4,A=[x0,6.2],B=[x0+L,6.2],C=[x0+L,6.2-l],D=[x0,6.2-l];
    S.segment(A,B);S.croix(A,"A",[-.5,.45]);S.croix(B,"B",[.15,.45]);
    var E=S.instrument("equerre"),R=S.instrument("regle"),l1=[];
    if(carre)l1=[
      K.montrer(R,{x:A[0],y:7,a:0}),
      K.aller(R,{x:A[0],y:A[1],a:0},1.2,"1. Mesure AB : "+cote(L)),
      K.codes(function(g){S.texte(g,[(A[0]+B[0])/2,A[1]+.55],cote(L))}),
      K.attendre(.4),K.cacher(R)];
    var n=carre?1:0;
    return l1.concat([
      K.attendre(carre?0:1.2,carre?undefined:"AB = "+cote(L)+" et BC = "+cote(l)),
      K.montrer(E,{x:2.6,y:7.2,a:-30}),
      K.aller(E,{x:B[0],y:B[1],a:-90},2,(n+1)+". Équerre : angle droit en B"),
      K.attendre(.2),
      K.tracer(B,C,1.6,(n+2)+". Trace "+cote(l)+" le long de l’équerre"),
      K.point("C",C,[.18,-.15]),
      K.aller(E,{x:A[0],y:A[1],a:-90},1.8,(n+3)+". Pareil en A : "+cote(l)),
      K.tracer(A,D,1.4),
      K.point("D",D,[-.5,-.15]),
      K.cacher(E),
      K.montrer(R,{x:.15,y:D[1]+.9,a:0}),
      K.aller(R,{x:.15,y:D[1],a:0},.8,(n+4)+". Relie D et C à la règle"),
      K.tracer(D,C,1.3),
      K.cacher(R),
      K.forme([A,B,C,D]),
      K.codes(function(g){S.angleDroit(g,A,[1,0],[0,-1]);S.angleDroit(g,B,[-1,0],[0,-1]);S.angleDroit(g,C,[-1,0],[0,1]);S.angleDroit(g,D,[1,0],[0,1]);
        if(carre){S.egal(g,A,B,1);S.egal(g,B,C,1);S.egal(g,C,D,1);S.egal(g,D,A,1)}}),
      K.attendre(2.4,carre?"✓ ABCD est un carré":"✓ ABCD est un rectangle")
    ]);
  }
  TUTOS.rectangle={titre:"Construire un rectangle",f:function(S,K){return rectangle(S,K,4.5,3.5,false)}};
  TUTOS.carre={titre:"Construire un carré",f:function(S,K){return rectangle(S,K,4,4,true)}};

  TUTOS["losange-cotes"]={titre:"Losange : avec ses côtés (compas)",f:function(S,K){
    var c=3.5,A=[2.5,3.75],Cc=[7.5,3.75],h=Math.sqrt(c*c-6.25),B=[5,3.75+h],D=[5,3.75-h];
    S.segment(A,Cc);S.croix(A,"A",[-.5,.15]);S.croix(Cc,"C",[.2,.15]);
    var C=S.compas();
    return [
      K.attendre(1.2,"Les 4 côtés mesurent 3,5 cm"),
      K.montrer(C,{P:REPOS,M:[REPOS[0]+.6,REPOS[1]]}),
      K.regler(C,c,1.4,"1. Compas : règle l’écartement sur 3,5 cm"),
      K.toucher(C,A,1.2,"2. Touche A : le compas trace 2 arcs"),
      K.pivoter(C,22,.3),K.arc(C,22,66,.7),K.pivoter(C,-66,.4),K.arc(C,-66,-22,.7),
      K.toucher(C,Cc,1.2,"3. Touche C : 2 autres arcs"),
      K.pivoter(C,114,.3),K.arc(C,114,158,.7),K.pivoter(C,-158,.4),K.arc(C,-158,-114,.7),
      K.cacher(C),
      K.point("B",B,[.15,.5],.7,"4. B et D sont aux croisements"),
      K.point("D",D,[.15,-.2],.7),
      K.tracer(A,B,.5,"5. Trace les 4 côtés"),K.tracer(B,Cc,.5),K.tracer(Cc,D,.5),K.tracer(D,A,.5),
      K.forme([A,B,Cc,D]),
      K.codes(function(g){S.egal(g,A,B,1);S.egal(g,B,Cc,1);S.egal(g,Cc,D,1);S.egal(g,D,A,1)}),
      K.attendre(2.2,"✓ 4 côtés égaux : c’est un losange")
    ];
  }};

  TUTOS["losange-diagonales"]={titre:"Losange : avec ses diagonales",f:function(S,K){
    var A=[2.5,3.75],Cc=[7.5,3.75],O=[5,3.75],B=[5,5.75],D=[5,1.75];
    S.segment(A,Cc);S.croix(A,"A",[-.5,.15]);S.croix(Cc,"C",[.2,.15]);
    var R=S.instrument("regle"),E=S.instrument("equerre");
    return [
      K.attendre(1.3,"AC = 5 cm et BD = 4 cm"),
      K.montrer(R,{x:A[0],y:4.6,a:0}),
      K.aller(R,{x:A[0],y:A[1],a:0},1,"1. Milieu de [AC] : à 2,5 cm de A"),
      K.point("O",O,[.15,.5]),
      K.attendre(.2),K.cacher(R),
      K.montrer(E,{x:7.6,y:7.2,a:-40}),
      K.aller(E,{x:O[0],y:O[1],a:-90},1.8,"2. Équerre : angle droit en O"),
      K.tracer(O,D,1.2,"3. Trace 2 cm de chaque côté","tu-aide"),
      K.point("D",D,[.15,-.2],.5),
      K.aller(E,{x:O[0],y:O[1],a:90},1.2),
      K.tracer(O,B,1.2,undefined,"tu-aide"),
      K.point("B",B,[.15,.5],.5),
      K.cacher(E),
      K.tracer(A,B,.4,"4. Trace les 4 côtés"),K.tracer(B,Cc,.4),K.tracer(Cc,D,.4),K.tracer(D,A,.4),
      K.forme([A,B,Cc,D]),
      K.codes(function(g){S.angleDroit(g,O,[1,0],[0,-1]);S.egal(g,A,O,1);S.egal(g,O,Cc,1);S.egal(g,O,B,2);S.egal(g,O,D,2)}),
      K.attendre(2.2,"✓ Diagonales perpendiculaires, même milieu : losange")
    ];
  }};

  // triangle au compas : base [P1P2], deux arcs de rayons r1 (centre P1) et r2 (centre P2)
  function triangleCompas(S,K,o){
    var L=5,P1=[2.5,5.4],P2=[7.5,5.4],px=(o.r1*o.r1-o.r2*o.r2+L*L)/(2*L),py=Math.sqrt(o.r1*o.r1-px*px),X=[P1[0]+px,5.4-py];
    var n=o.noms,a1=V.ang(V.sub(X,P1)),a2=V.ang(V.sub(X,P2));
    S.segment(P1,P2);S.croix(P1,n[0],[-.5,.45]);S.croix(P2,n[1],[.15,.45]);
    var C=S.compas(),meme=o.r1===o.r2;
    return [
      K.attendre(1.4,o.donnees),
      K.montrer(C,{P:REPOS,M:[REPOS[0]+.6,REPOS[1]]}),
      K.regler(C,o.r1,1.3,"1. Compas : écartement "+cote(o.r1)),
      K.toucher(C,P1,1.1,"2. Touche "+n[0]+" : un arc"),
      K.pivoter(C,a1-22,.3),K.arc(C,a1-22,a1+22,.8),
      K.regler(C,o.r2,1.2,meme?"3. Même écartement : "+cote(o.r2):"3. Écartement "+cote(o.r2)),
      K.toucher(C,P2,1.1,"4. Touche "+n[1]+" : un autre arc"),
      K.pivoter(C,a2+22,.3),K.arc(C,a2+22,a2-22,.8),
      K.cacher(C),
      K.point(n[2],X,[.1,-.25],.8,"5. "+n[2]+" est au croisement"),
      K.tracer(X,P1,.7,"6. Relie "+n[2]+" à "+n[0]+" et à "+n[1]),K.tracer(X,P2,.7),
      K.forme([P1,P2,X]),
      K.codes(function(g){
        if(meme){S.egal(g,P1,X,1);S.egal(g,P2,X,1)}
        else{S.texte(g,V.add(V.mul(V.add(P1,X),.5),[-.75,0]),cote(o.r1));S.texte(g,V.add(V.mul(V.add(P2,X),.5),[.55,0]),cote(o.r2))}}),
      K.attendre(2.2,o.fin)
    ];
  }
  TUTOS["triangle-compas"]={titre:"Triangle : trois longueurs (compas)",f:function(S,K){
    return triangleCompas(S,K,{noms:["A","B","C"],r1:4,r2:3,donnees:"AB = 5 cm, AC = 4 cm, BC = 3 cm",fin:"✓ Le triangle ABC est construit"})}};
  TUTOS.isocele={titre:"Triangle isocèle (compas)",f:function(S,K){
    return triangleCompas(S,K,{noms:["B","C","A"],r1:4,r2:4,donnees:"Isocèle en A : AB = AC = 4 cm",fin:"✓ ABC est isocèle en A"})}};

  TUTOS["triangle-rectangle"]={titre:"Triangle rectangle (équerre)",f:function(S,K){
    var A=[4.4,5.6],B=[9,5.6],C=[4.4,2.6],u=V.unit(V.sub(B,C)),av=V.add(C,V.mul([-u[1],u[0]],.9));
    S.segment(A,B);S.croix(A,"A",[-.5,.45]);S.croix(B,"B",[.1,.45]);
    var E=S.instrument("equerre"),R=S.instrument("regle");
    return [
      K.attendre(1.3,"Rectangle en A, AC = 3 cm"),
      K.montrer(E,{x:2.4,y:7.2,a:-30}),
      K.aller(E,{x:A[0],y:A[1],a:-90},2,"1. Équerre : angle droit en A"),
      K.attendre(.2),
      K.tracer(A,C,1.5,"2. Trace 3 cm le long de l’équerre"),
      K.point("C",C,[-.5,-.15]),
      K.cacher(E),
      K.montrer(R,{x:av[0],y:av[1],a:V.ang(u)}),
      K.aller(R,{x:C[0],y:C[1],a:V.ang(u)},.8,"3. Relie C et B à la règle"),
      K.tracer(C,B,1.3),
      K.cacher(R),
      K.forme([A,B,C]),
      K.codes(function(g){S.angleDroit(g,A,[1,0],[0,-1])}),
      K.attendre(2.2,"✓ ABC est rectangle en A")
    ];
  }};

  TUTOS["triangle-angle"]={titre:"Triangle : avec un angle (rapporteur)",f:function(S,K){
    var A=[4.4,5.8],B=[9.2,5.8],dir=V.rot([1,0],-50),C=V.add(A,V.mul(dir,4)),Mk=V.add(A,V.mul(dir,4.6));
    S.segment(A,B);S.croix(A,"A",[-.5,.45]);S.croix(B,"B",[.1,.45]);
    var Ra=S.instrument("rapporteur"),R=S.instrument("regle"),av=V.add(A,V.mul(V.rot(dir,90),.9));
    return [
      K.attendre(1.3,"Angle BAC = 50° et AC = 4 cm"),
      K.montrer(Ra,{x:6.2,y:7.8,a:-15}),
      K.aller(Ra,{x:A[0],y:A[1],a:0},2,"1. Rapporteur : centre sur A, 0 sur [AB]"),
      K.attendre(.2),
      // l'arc qui « compte » les degrés est dessiné sur le rapporteur (il disparaît avec lui)
      (function(){var p;return {d:1.5,txt:"2. Compte jusqu’à 50° et marque un point",
        debut:function(){p=el("path",{class:"tu-compte"},Ra.g)},
        f:function(e){p.setAttribute("d",arcD([0,0],4.45,0,-50*e))}}})(),
      K.point("",Mk,null,.5),
      K.cacher(Ra),
      K.montrer(R,{x:av[0],y:av[1],a:-50}),
      K.aller(R,{x:A[0],y:A[1],a:-50},.8,"3. Trace de A jusqu’au point"),
      K.tracer(A,V.add(A,V.mul(dir,5.4)),1.4),
      K.point("C",C,[-.55,-.1],.8,"4. C est à 4 cm de A"),
      K.cacher(R),
      K.tracer(C,B,.8,"5. Relie C et B"),
      K.forme([A,B,C]),
      K.codes(function(g){S.arcAngle(g,A,.9,-50,0);S.texte(g,V.add(A,V.mul(V.rot([1,0],-25),1.45)),"50°","tu-res")}),
      K.attendre(2.2,"✓ Le triangle ABC est construit")
    ];
  }};

  TUTOS.compas={titre:"Le compas : comment ça marche",f:function(S,K){
    var O=[5.5,3.8],C=S.compas();
    S.croix(O,"O",[.15,-.2]);
    return [
      K.montrer(C,{P:REPOS,M:[REPOS[0]+1,REPOS[1]]}),
      K.attendre(1.4,"Touche « Compas » : il apparaît en bas"),
      K.regler(C,3,1.8,"1. Règle l’écartement : 3 cm (− , +)"),
      K.attendre(.3),
      K.toucher(C,O,1.5,"2. Touche le point O"),
      K.pivoter(C,-90,.3),
      K.arc(C,-90,270,2.4,"3. Le compas trace tout seul !"),
      K.cacher(C),
      K.attendre(2.2,"✓ Un cercle de centre O et de rayon 3 cm")
    ];
  }};

  TUTOS.cercle={titre:"Tracer un cercle (centre et rayon)",f:function(S,K){
    var O=[5,3.3],r=2.5,C=S.compas();
    S.croix(O,"O",[.15,-.2]);
    return [
      K.attendre(1.2,"Centre O, rayon 2,5 cm"),
      K.montrer(C,{P:REPOS,M:[REPOS[0]+.6,REPOS[1]]}),
      K.regler(C,r,1.6,"1. Compas : écartement 2,5 cm"),
      K.attendre(.3),
      K.toucher(C,O,1.4,"2. Touche le point O"),
      K.pivoter(C,-90,.3),
      K.arc(C,-90,270,2.4,"3. Le compas trace le cercle"),
      K.cacher(C),
      K.codes(function(g){var m=pol(O,r,-40);S.pointille(g,O,m);S.texte(g,V.add(pol(O,r/2,-40),[.25,.1]),"2,5 cm","tu-res")}),
      K.attendre(2.2,"✓ Cercle de centre O et de rayon 2,5 cm")
    ];
  }};

  TUTOS["cercle-diametre"]={titre:"Tracer le cercle de diamètre [AB]",f:function(S,K){
    var A=[2,4],B=[8,4],M=[5,4],R=S.instrument("regle"),C=S.compas();
    S.segment(A,B);S.croix(A,"A",[-.5,.15]);S.croix(B,"B",[.2,.15]);
    return [
      K.montrer(R,{x:A[0],y:4.9,a:0}),
      K.aller(R,{x:A[0],y:A[1],a:0},1.1,"1. Mesure AB : 6 cm"),
      K.attendre(.4),
      K.point("M",M,[.12,-.25],.8,"2. Le milieu M est à 3 cm de A"),
      K.cacher(R),
      K.montrer(C,{P:REPOS,M:[REPOS[0]+.6,REPOS[1]]}),
      K.regler(C,3,1.4,"3. Écartement : 3 cm, la moitié de AB"),
      K.toucher(C,M,1.2,"4. Touche M"),
      K.pivoter(C,-90,.3),
      K.arc(C,-90,270,2.4,"5. Le compas trace le cercle"),
      K.cacher(C),
      K.codes(function(g){S.egal(g,A,M,1);S.egal(g,M,B,1)}),
      K.attendre(2.2,"✓ Centre : le milieu de [AB]")
    ];
  }};

  TUTOS.symetrique={titre:"Construire le symétrique d’un point",f:function(S,K){
    var p=[6.2,0],q=[4.8,7.5],u=V.unit(V.sub(q,p)),Hp=V.add(p,V.mul(u,3.6)),n=[-u[1],u[0]];if(n[0]>0)n=V.mul(n,-1);
    var A=V.add(Hp,V.mul(n,3)),A2=V.sub(V.mul(Hp,2),A);
    S.droite(p,q,"(d)",[.15,-.15]);S.croix(A,"A",[-.2,-.25]);
    var E=S.instrument("equerre"),C=S.compas(),a1=V.ang(n),a2=V.ang(V.mul(n,-1)),dep=V.sub(Hp,V.mul(u,1.8));
    return [
      K.montrer(E,{x:3,y:7,a:-140}),
      K.aller(E,{x:dep[0],y:dep[1],a:a1},1.8,"1. Pose l’équerre sur (d)"),
      K.aller(E,{x:Hp[0],y:Hp[1],a:a1},1.4,"2. Fais-la glisser jusqu’à A"),
      K.tracer(Hp,V.add(Hp,V.mul(n,3.6)),1.2,"3. Trace la perpendiculaire","tu-aide"),
      K.aller(E,{x:Hp[0],y:Hp[1],a:a2},1.4,"4. Continue de l’autre côté de (d)"),
      K.tracer(Hp,V.sub(Hp,V.mul(n,3.6)),1,undefined,"tu-aide"),
      K.cacher(E),
      K.montrer(C,{P:REPOS,M:[REPOS[0]+.6,REPOS[1]]}),
      K.regler(C,3,1.3,"5. Mesure de A à (d) : 3 cm. Écartement 3 cm"),
      K.toucher(C,Hp,1.2,"6. Touche le croisement sur (d)"),
      K.pivoter(C,a2-22,.3),K.arc(C,a2-22,a2+22,.8,"Le compas trace un arc"),
      K.cacher(C),
      K.point("A’",A2,[.15,-.25],.8,"7. A’ est au croisement"),
      K.codes(function(g){S.angleDroit(g,Hp,u,n);S.egal(g,Hp,A,2);S.egal(g,Hp,A2,2)}),
      K.attendre(2.2,"✓ A’ est le symétrique de A")
    ];
  }};

  // ---------- LA FENÊTRE DU TUTO ----------
  function ouvrir(cle){
    var T=TUTOS[cle];if(!T)return;
    var fond=document.createElement("div");fond.className="tuto-fond";
    fond.innerHTML='<div class="tuto" role="dialog" aria-modal="true" aria-label="Tuto : '+T.titre+'">'+
      '<div class="tuto-tete"><span class="tuto-titre">🎬 '+T.titre+'</span><button type="button" class="sec petit tuto-x">Fermer</button></div>'+
      '<div class="tuto-legende" aria-live="polite"></div>'+
      '<div class="tuto-av"><i></i></div>'+
      '<div class="tuto-cmd"><button type="button" class="sec petit tuto-pause">⏸ Pause</button>'+
      '<button type="button" class="sec petit tuto-revoir">↺ Revoir</button>'+
      '<button type="button" class="sec petit tuto-lent">🐢 Plus lent</button></div></div>';
    var boite=fond.firstChild,leg=boite.querySelector(".tuto-legende"),av=boite.querySelector(".tuto-av i");
    var svg=el("svg",{viewBox:"0 0 "+W+" "+H,class:"gb-svg tuto-svg"});boite.insertBefore(svg,boite.querySelector(".tuto-av"));
    var bP=boite.querySelector(".tuto-pause"),bR=boite.querySelector(".tuto-revoir"),bL=boite.querySelector(".tuto-lent");
    var L,i,t,commence,total,fait,pause,vitesse=1,dernier=null,raf=null,ouvert=true;
    function demarrer(){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var S=scene(svg);L=T.f(S,etapes(S));
      total=L.reduce(function(s,x){return s+x.d},0);i=0;t=0;fait=0;commence=false;pause=false;
      leg.textContent="";bP.textContent="⏸ Pause";bP.disabled=false;bR.classList.remove("tuto-encore");
      dernier=null;if(!raf)raf=requestAnimationFrame(boucle);
    }
    function avancer(dt){
      t+=dt;
      while(i<L.length){
        var E=L[i];
        if(!commence){commence=true;if(E.txt){leg.textContent=E.txt;leg.classList.toggle("tuto-fin",E.txt.charAt(0)==="✓")}if(E.debut)E.debut()}
        if(t<E.d){if(E.f)E.f(lisse(t/E.d));break}
        if(E.f)E.f(1);t-=E.d;fait+=E.d;i++;commence=false;
      }
      av.style.width=Math.min(100,(fait+(i<L.length?t:0))/total*100)+"%";
    }
    function boucle(ts){
      raf=null;if(!ouvert)return;
      var dt=dernier===null?0:Math.min(.25,(ts-dernier)/1000);dernier=ts;
      if(!pause)avancer(dt*vitesse);
      if(i<L.length)raf=requestAnimationFrame(boucle);
      else{bP.disabled=true;bR.classList.add("tuto-encore")}
    }
    function fermer(){ouvert=false;if(raf)cancelAnimationFrame(raf);document.removeEventListener("keydown",touche,true);if(fond.parentNode)fond.parentNode.removeChild(fond)}
    function touche(e){
      e.stopPropagation();                         // (le chapitre ne doit pas réagir aux touches pendant le tuto)
      if(e.key==="Escape"){e.preventDefault();fermer()}
      else if(e.key===" "&&!bP.disabled){e.preventDefault();bP.click()}
    }
    fond.addEventListener("click",function(e){e.stopPropagation();if(e.target===fond)fermer()});
    boite.querySelector(".tuto-x").addEventListener("click",fermer);
    bP.addEventListener("click",function(){pause=!pause;bP.textContent=pause?"▶ Reprendre":"⏸ Pause"});
    bR.addEventListener("click",demarrer);
    bL.addEventListener("click",function(){vitesse=vitesse===1?.6:1;bL.classList.toggle("actif",vitesse<1)});
    document.addEventListener("keydown",touche,true);
    document.body.appendChild(fond);
    boite.querySelector(".tuto-x").focus({preventScroll:true});
    demarrer();
  }

  // boutons de tutos (sous une partie d'un chapitre)
  function boutons(cles){
    var d=document.createElement("div");d.className="tutos-partie";
    cles.forEach(function(k){if(!TUTOS[k])return;
      var b=document.createElement("button");b.type="button";b.className="tuto-b";b.innerHTML="🎬 "+TUTOS[k].titre;b.title="Voir le tuto";
      b.addEventListener("click",function(e){e.stopPropagation();ouvrir(k)});d.appendChild(b)});
    return d;
  }

  window.TUTO={ouvrir:ouvrir,boutons:boutons,existe:function(k){return !!TUTOS[k]},
    liste:Object.keys(TUTOS).reduce(function(o,k){o[k]=TUTOS[k].titre;return o},{}),
    duree:function(k){var svg=el("svg",{}),S=scene(svg);return TUTOS[k].f(S,etapes(S)).reduce(function(s,x){return s+x.d},0)}};
})();

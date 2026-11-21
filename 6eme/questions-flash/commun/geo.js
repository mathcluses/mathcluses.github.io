// ============================================================================
//  ATELIER DE GÉOMÉTRIE (6e) : RÈGLE, ÉQUERRE, COMPAS, RAPPORTEUR, POINTS
//  À charger après flash.js : <script src="../commun/geo.js"></script>
//
//  GEO.tache({...}) renvoie un « widget » pour une question du moteur :
//     { q: "Trace la perpendiculaire à (d) passant par A.", r: "…", widget: GEO.tache({...}) }
//  La figure est en centimètres (1 unité = 1 cm). L'élève prend les instruments qu'il veut (boutons en haut),
//  les déplace (glisser), les fait tourner (poignée ⟳), puis :
//   • près d'un bord de la règle ou de l'équerre : toucher = placer un point, rester appuyé ou glisser = tracer ;
//   • au compas : choisit l'écartement, touche un point, le compas trace (cercle ou arcs, selon T.compas) ;
//   • place un point (outil Point) : il s'accroche aux points et aux intersections proches.
//  Les instruments sont un peu « aimantés » : ils s'alignent sur les droites et passent par les points
//  quand ils en sont très près (comme quand on cale l'équerre à la main).
//
//  Description d'une tâche :
//   donnees : { points:{A:[x,y],…}, droites:[{nom:"(d)",p:[x,y],q:[x,y]}], segments:[["A","B"]], cercles:[{c:[x,y],r:2}] }
//   outils  : ["regle","equerre","compas","rapporteur","point"] (ceux que l'élève peut prendre)
//   placer  : ["C","D"] noms des points que l'élève doit placer (dans l'ordre)
//   verifier: function(e, G) → nombre d'« écarts » : ≤ 1 juste, ≤ 2 juste mais pas très précis, au-delà faux
//             (e : ce que l'élève a fait {traits, arcs, points} ; G : outils de calcul ci-dessous)
//   corrige : { points:{nom:[x,y]}, droites:[[p,q]], cercles:[[c,r]], segments:[[p,q]] } (dessiné en pointillés verts)
//   choix, r : (facultatif) l'élève répond en touchant une proposition (par exemple après avoir mesuré à la règle)
// ============================================================================
(function(){
  var NS="http://www.w3.org/2000/svg",W=10,Hh=7.5,TOL=.2,TOL_ANG=2;   // tolérances : 2 mm et 2°

  // ---------- Calcul ----------
  var V={
    add:function(a,b){return [a[0]+b[0],a[1]+b[1]]},sub:function(a,b){return [a[0]-b[0],a[1]-b[1]]},
    mul:function(a,k){return [a[0]*k,a[1]*k]},dot:function(a,b){return a[0]*b[0]+a[1]*b[1]},
    len:function(a){return Math.hypot(a[0],a[1])},dist:function(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])},
    unit:function(a){var l=Math.hypot(a[0],a[1])||1;return [a[0]/l,a[1]/l]},
    rot:function(a,deg){var t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t);return [a[0]*c-a[1]*s,a[0]*s+a[1]*c]},
    ang:function(a){return Math.atan2(a[1],a[0])*180/Math.PI},
    // distance d'un point à une droite (p, q)
    distDroite:function(m,p,q){var u=V.unit(V.sub(q,p));return Math.abs((m[0]-p[0])*u[1]-(m[1]-p[1])*u[0])},
    projete:function(m,p,q){var u=V.unit(V.sub(q,p));return V.add(p,V.mul(u,V.dot(V.sub(m,p),u)))},
    // écart d'angle entre deux directions (droites : modulo 180°)
    ecartAngle:function(u,v){var d=Math.abs(V.ang(u)-V.ang(v))%180;return Math.min(d,180-d)},
    symetrique:function(m,p,q){var h=V.projete(m,p,q);return V.sub(V.mul(h,2),m)}
  };
  // intersections : droites (traits prolongés ou non) et cercles
  function interDroites(a,b){
    var r=V.sub(a[1],a[0]),s=V.sub(b[1],b[0]),d=r[0]*s[1]-r[1]*s[0];if(Math.abs(d)<1e-9)return [];
    var t=((b[0][0]-a[0][0])*s[1]-(b[0][1]-a[0][1])*s[0])/d,u=((b[0][0]-a[0][0])*r[1]-(b[0][1]-a[0][1])*r[0])/d;
    if((a.segment&&(t<-.02||t>1.02))||(b.segment&&(u<-.02||u>1.02)))return [];
    return [V.add(a[0],V.mul(r,t))];
  }
  function interDroiteCercle(a,c){
    var d=V.unit(V.sub(a[1],a[0])),f=V.sub(a[0],c.c),B=V.dot(f,d),C=V.dot(f,f)-c.r*c.r,D=B*B-C;if(D<0)return [];
    return [-B-Math.sqrt(D),-B+Math.sqrt(D)].map(function(t){return V.add(a[0],V.mul(d,t))}).filter(function(p){return surArc(p,c)&&(!a.segment||surSegment(p,a))});
  }
  function interCercles(a,b){
    var d=V.dist(a.c,b.c);if(d<1e-9||d>a.r+b.r||d<Math.abs(a.r-b.r))return [];
    var x=(d*d+a.r*a.r-b.r*b.r)/(2*d),h=Math.sqrt(Math.max(0,a.r*a.r-x*x)),u=V.unit(V.sub(b.c,a.c)),m=V.add(a.c,V.mul(u,x)),n=[-u[1],u[0]];
    return [V.add(m,V.mul(n,h)),V.sub(m,V.mul(n,h))].filter(function(p){return surArc(p,a)&&surArc(p,b)});
  }
  function surSegment(p,s){var l=V.dist(s[0],s[1]);return V.dist(p,s[0])<=l+.05&&V.dist(p,s[1])<=l+.05}
  function surArc(p,c){                              // un arc : centre, rayon, angle de départ, balayage (degrés)
    if(c.plein||Math.abs(c.bal||360)>=359)return true;
    var a=(V.ang(V.sub(p,c.c))-c.a0)%360;if(a<0)a+=360;
    return c.bal>=0?a<=c.bal+3:(360-a)<=-c.bal+3||a<3;
  }

  function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
  function f(x){return (+x).toFixed(3)}
  function cm(x){return FLASH.outils.nb(Math.round(x*10)/10)+" cm"}

  // ---------- LES INSTRUMENTS ----------
  // Chaque instrument : position du pivot (x, y), angle (degrés), dessin local, bords pour tracer, poignée pour tourner.
  var INSTRUMENTS={
    regle:{ nom:"Règle", pivot:[.15,6.5], angle:0,
      dessin:function(g){
        el("rect",{x:-.3,y:0,width:10.6,height:1.2,rx:.08,class:"gi-corps"},g);
        for(var i=0;i<=100;i++){var x=i/10,h=i%10===0?.38:i%5===0?.26:.15;el("line",{x1:x,y1:0,x2:x,y2:h,class:"gi-grad"},g);
          if(i%10===0)el("text",{x:x,y:.68,class:"gi-num"},g).textContent=i/10}
      },
      bords:[{a:[-.3,0],b:[10.3,0],n:[0,-1],zero:.3}], poignees:[[9.6,.8],[.6,.8]] },   // zero : où est le 0 (les traits s’arrêtent au mm)
    equerre:{ nom:"Équerre", pivot:[2.8,6.2], angle:0,
      dessin:function(g){
        el("path",{d:"M0 0 L6 0 L0 -4 Z",class:"gi-corps"},g);
        el("path",{d:"M.9 -.6 L3.7 -.6 L.9 -2.45 Z",class:"gi-trou"},g);
        el("path",{d:"M0 -.45 L.45 -.45 L.45 0",class:"gi-angle"},g);
        for(var i=0;i<=55;i++){var x=i/10,h=i%10===0?.3:i%5===0?.2:.11;el("line",{x1:x,y1:0,x2:x,y2:-h,class:"gi-grad"},g);
          if(i%10===0&&i)el("text",{x:x,y:-.5,class:"gi-num gi-petit"},g).textContent=i/10}
      },
      bords:[{a:[0,0],b:[6,0],n:[0,1],zero:0},{a:[0,0],b:[0,-4],n:[-1,0]}], poignees:[[4,-.75],[.75,-2.6]] },
    rapporteur:{ nom:"Rapporteur", pivot:[5,7], angle:0,
      dessin:function(g){
        el("path",{d:"M-4.3 0 A4.3 4.3 0 0 1 4.3 0 Z",class:"gi-corps"},g);
        el("path",{d:"M-2.4 0 A2.4 2.4 0 0 1 2.4 0 Z",class:"gi-trou"},g);
        for(var d=0;d<=180;d++){var t=d*Math.PI/180,c=Math.cos(t),s=-Math.sin(t),h=d%10===0?.4:d%5===0?.25:.13;
          el("line",{x1:f(4.3*c),y1:f(4.3*s),x2:f((4.3-h)*c),y2:f((4.3-h)*s),class:"gi-grad"},g);
          if(d%10===0){el("text",{x:f(3.6*c),y:f(3.6*s+.1),class:"gi-num gi-petit"},g).textContent=d;
                       el("text",{x:f(3.05*c),y:f(3.05*s+.1),class:"gi-num gi-petit gi-int"},g).textContent=180-d}}
        el("line",{x1:-4.3,y1:0,x2:4.3,y2:0,class:"gi-grad"},g);
        el("path",{d:"M0 -.35 V.0 M-.25 0 H.25",class:"gi-angle"},g);
      },
      bords:[], poignees:[[-3.3,-.55],[3.3,-.55]] }
  };

  // ---------- LE WIDGET ----------
  function tache(T){
    GEO.derniere=T;                                  // (pour les vérifications automatiques des générateurs)
    return function(zone,termine){
      zone.innerHTML="";
      var outils=T.outils||[],aPlacer=(T.placer||[]).slice(),fait=false;
      var etat={traits:[],arcs:[],points:[]},histoire=[];
      var D=T.donnees||{},PTS=D.points||{};
      // ----- barre d'outils -----
      var barre=document.createElement("div");barre.className="gb-barre";zone.appendChild(barre);
      function bouton(txt,titre,fn){var b=document.createElement("button");b.type="button";b.className="gb-b";b.innerHTML=txt;b.title=titre;
        b.addEventListener("click",function(e){e.stopPropagation();if(!fait)fn(b)});barre.appendChild(b);return b}
      // ----- dessin -----
      var svg=el("svg",{viewBox:"0 0 "+W+" "+Hh,class:"gb-svg"});zone.appendChild(svg);
      el("rect",{x:0,y:0,width:W,height:Hh,class:"gb-fond"},svg);
      var gGrille=el("g",{},svg);for(var gx=1;gx<W;gx++)el("line",{x1:gx,y1:0,x2:gx,y2:Hh,class:"gb-grille"},gGrille);
      for(var gy=1;gy<Hh;gy++)el("line",{x1:0,y1:gy,x2:W,y2:gy,class:"gb-grille"},gGrille);
      // les tracés de l'élève sont AU-DESSUS des instruments (sinon le trait le long d'un bord est caché par l'instrument)
      var gDonnees=el("g",{},svg),gInstr=el("g",{},svg),gEleve=el("g",{class:"gb-eleve"},svg),gCorr=el("g",{class:"gb-corr"},svg),gHaut=el("g",{class:"gb-eleve"},svg);
      // le crayon : il apparaît au bout du trait pendant qu'on trace (pointe en (0, 0))
      var crayon=el("g",{class:"gb-crayon hide"},gHaut);
      el("path",{d:"M0 0 L.16 -.42 L.42 -.26 Z",class:"cr-bois"},crayon);el("path",{d:"M0 0 L.06 -.16 L.16 -.1 Z",class:"cr-mine"},crayon);
      el("path",{d:"M.16 -.42 L.86 -1.54 L1.12 -1.38 L.42 -.26 Z",class:"cr-corps"},crayon);el("path",{d:"M.86 -1.54 L.98 -1.73 L1.24 -1.57 L1.12 -1.38 Z",class:"cr-gomme"},crayon);
      function montrerCrayon(p){if(!p){crayon.classList.add("hide");return}crayon.classList.remove("hide");crayon.setAttribute("transform","translate("+f(p[0])+" "+f(p[1])+")")}
      // droites données (prolongées jusqu'au bord), segments, cercles, points
      var lignes=[];                                   // pour l'aimantation et les intersections : [p, q] (+ .segment)
      function long(p,q){var u=V.unit(V.sub(q,p));return [V.sub(p,V.mul(u,30)),V.add(p,V.mul(u,30))]}
      (D.droites||[]).forEach(function(d){
        var p=typeof d.p==="string"?PTS[d.p]:d.p,q=typeof d.q==="string"?PTS[d.q]:d.q,L=long(p,q);
        el("line",{x1:f(L[0][0]),y1:f(L[0][1]),x2:f(L[1][0]),y2:f(L[1][1]),class:"gb-donnee"},gDonnees);
        if(d.nom){var u=V.unit(V.sub(q,p)),t=V.add(q,V.add(V.mul(u,.6),V.mul([-u[1],u[0]],.35)));   // nom près de q, sans sortir du cadre
          t=[Math.max(.2,Math.min(W-.75,t[0])),Math.max(.45,Math.min(Hh-.2,t[1]))];
          el("text",{x:f(t[0]),y:f(t[1]),class:"gb-nom"},gDonnees).textContent=d.nom}
        lignes.push([p,q]);
      });
      (D.segments||[]).forEach(function(s){
        var p=PTS[s[0]],q=PTS[s[1]];el("line",{x1:f(p[0]),y1:f(p[1]),x2:f(q[0]),y2:f(q[1]),class:"gb-donnee"},gDonnees);
        var L=[p,q];L.segment=true;lignes.push(L);
      });
      var cerclesDonnes=(D.cercles||[]).map(function(c){el("circle",{cx:f(c.c[0]),cy:f(c.c[1]),r:f(c.r),class:"gb-donnee gb-vide"},gDonnees);return {c:c.c,r:c.r,plein:true}});
      Object.keys(PTS).forEach(function(n){croix(gDonnees,PTS[n],n,"gb-pt")});
      function croix(g,p,nom,cls){
        var s=.13;el("path",{d:"M"+f(p[0]-s)+" "+f(p[1]-s)+" L"+f(p[0]+s)+" "+f(p[1]+s)+" M"+f(p[0]-s)+" "+f(p[1]+s)+" L"+f(p[0]+s)+" "+f(p[1]-s),class:cls},g);
        if(nom)el("text",{x:f(p[0]+.18),y:f(p[1]-.18),class:"gb-nom"},g).textContent=nom;
      }

      // ----- ce que l'élève a fait -----
      function redessiner(){
        while(gEleve.firstChild)gEleve.removeChild(gEleve.firstChild);
        etat.traits.forEach(function(t){el("line",{x1:f(t[0][0]),y1:f(t[0][1]),x2:f(t[1][0]),y2:f(t[1][1]),class:"gb-trait"},gEleve)});
        etat.arcs.forEach(function(a){
          if(Math.abs(a.bal)>=359.5){el("circle",{cx:f(a.c[0]),cy:f(a.c[1]),r:f(a.r),class:"gb-trait gb-vide"},gEleve);return}
          var p0=V.add(a.c,V.mul(V.rot([1,0],a.a0),a.r)),p1=V.add(a.c,V.mul(V.rot([1,0],a.a0+a.bal),a.r));
          el("path",{d:"M"+f(p0[0])+" "+f(p0[1])+" A"+f(a.r)+" "+f(a.r)+" 0 "+(Math.abs(a.bal)>180?1:0)+" "+(a.bal>0?1:0)+" "+f(p1[0])+" "+f(p1[1]),class:"gb-trait gb-vide"},gEleve);
        });
        etat.points.forEach(function(p){croix(gEleve,p.p,p.nom,"gb-ptel")});
        majBarre();
      }
      // points d'accroche : points donnés, points placés, intersections de tout ce qui est tracé
      function accroches(){
        var l=Object.keys(PTS).map(function(n){return PTS[n]}).concat(etat.points.map(function(p){return p.p}));
        var dr=lignes.concat(etat.traits.map(function(t){var s=[t[0],t[1]];s.segment=true;return s}));
        var ce=cerclesDonnes.concat(etat.arcs);
        for(var i=0;i<dr.length;i++){for(var j=i+1;j<dr.length;j++)l=l.concat(interDroites(dr[i],dr[j]));ce.forEach(function(c){l=l.concat(interDroiteCercle(dr[i],c))})}
        for(var a=0;a<ce.length;a++)for(var b=a+1;b<ce.length;b++)l=l.concat(interCercles(ce[a],ce[b]));
        return l;
      }
      function milieux(){
        return lignes.filter(function(l){return l.segment}).concat(etat.traits).map(function(l){return V.mul(V.add(l[0],l[1]),.5)});
      }
      function accrochesPoint(){return accroches().concat(milieux())}
      function ajouterPoint(p){etat.points.push({p:p,nom:aPlacer[etat.points.length]||""});histoire.push("points");redessiner()}
      function plusProche(p,l,max){var best=null,d=max;l.forEach(function(q){var x=V.dist(p,q);if(x<d){d=x;best=q}});return best}

      // ----- position du doigt dans la figure (en cm) -----
      function pos(e){var pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;var m=svg.getScreenCTM().inverse(),r=pt.matrixTransform(m);return [r.x,r.y]}

      // ----- instruments -----
      // Comme le rapporteur des Angles (qui marche bien au doigt) :
      //  • glisser l'instrument le déplace ; rester appuyé dessus un instant (sans bouger) puis bouger le fait TOURNER ;
      //  • deux poignées ⟳ (une à chaque bout) le font tourner aussi ;
      //  • sur écran tactile, poignées et bandes de tracé sont plus grandes (un doigt est moins précis qu'une souris).
      var TACTILE=window.matchMedia&&matchMedia("(pointer:coarse)").matches;
      var R_POIGNEE=TACTILE?.6:.42,BANDE=TACTILE?.4:.22,EPAIS=TACTILE?.75:.42,APPUI=450;
      var instr={};
      outils.forEach(function(nom){
        if(!INSTRUMENTS[nom])return;
        var M=INSTRUMENTS[nom],I={nom:nom,x:M.pivot[0],y:M.pivot[1],angle:M.angle,visible:false};
        I.g=el("g",{class:"gi gi-"+nom+" hide"},gInstr);
        I.corps=el("g",{},I.g);M.dessin(I.corps);
        // bords pour tracer : une bande invisible juste à l'extérieur du bord (plus large au doigt)
        I.bords=M.bords.map(function(b){
          var n=b.n,a=V.add(b.a,V.mul(n,BANDE)),c=V.add(b.b,V.mul(n,BANDE));
          var z=el("line",{x1:a[0],y1:a[1],x2:c[0],y2:c[1],class:"gi-bord","stroke-width":EPAIS},I.g);
          z.addEventListener("pointerdown",function(e){if(fait)return;e.stopPropagation();e.preventDefault();appuiBord(I,b,e)});
          return {b:b,z:z};
        });
        M.poignees.forEach(function(pg){
          var h=el("g",{class:"gi-poignee"},I.g);el("circle",{cx:pg[0],cy:pg[1],r:R_POIGNEE},h);
          el("text",{x:pg[0],y:pg[1]+R_POIGNEE*.4,class:"gi-tourne","font-size":R_POIGNEE*1.2},h).textContent="⟳";
          h.addEventListener("pointerdown",function(e){if(fait)return;e.stopPropagation();e.preventDefault();glisser(e,function(p){
            I.angle=V.ang(V.sub(p,[I.x,I.y]))-V.ang(pg);aimanterAngle(I);placer(I);
          })});
        });
        I.corps.addEventListener("pointerdown",function(e){
          if(fait)return;e.stopPropagation();e.preventDefault();
          var p0=pos(e),x0=I.x,y0=I.y,mode="attente",a0=0,r0=0;
          var minuteur=setTimeout(function(){                // appui long sans bouger : on passe en rotation
            if(mode!=="attente")return;mode="tourner";a0=V.ang(V.sub(p0,[I.x,I.y]));r0=I.angle;I.g.classList.add("gi-rotation");
          },APPUI);
          glisser(e,function(p){
            if(mode==="attente"&&V.dist(p,p0)>.12){mode="glisser";clearTimeout(minuteur)}
            if(mode==="glisser"){I.x=x0+p[0]-p0[0];I.y=y0+p[1]-p0[1];aimanterPosition(I)}
            else if(mode==="tourner"){I.angle=r0+(((V.ang(V.sub(p,[I.x,I.y]))-a0)%360+540)%360-180);aimanterAngle(I)}
            placer(I);
          },function(){clearTimeout(minuteur);I.g.classList.remove("gi-rotation")});
        });
        instr[nom]=I;placer(I);
        bouton(M.nom,"Prendre ou ranger : "+M.nom,function(b){I.visible=!I.visible;I.g.classList.toggle("hide",!I.visible);b.classList.toggle("actif",I.visible)});
      });
      function placer(I){I.g.setAttribute("transform","translate("+f(I.x)+" "+f(I.y)+") rotate("+f(I.angle)+")")}
      function monde(I,p){return V.add([I.x,I.y],V.rot(p,I.angle))}
      function directions(){return lignes.concat(etat.traits).map(function(l){return V.sub(l[1],l[0])})}
      // l'instrument tourne « tout seul » de quelques degrés pour s'aligner sur une droite (ou lui être perpendiculaire)
      function aimanterAngle(I){
        var best=null,eMin=3;
        directions().forEach(function(d){var a=V.ang(d);[0,90,180,270].forEach(function(k){
          var x=((a+k-I.angle)%360+540)%360-180;if(Math.abs(x)<eMin){eMin=Math.abs(x);best=I.angle+x}})});
        if(best!==null)I.angle=best;
      }
      // … et se cale contre une droite ou un point tout proche (bord posé sur la droite, bord passant par le point)
      function aimanterPosition(I){
        var M=INSTRUMENTS[I.nom],pts=accroches();
        // le pivot (zéro de la règle, angle droit de l'équerre, centre du rapporteur) sur un point
        var q=plusProche([I.x,I.y],pts,.25);if(q){I.x=q[0];I.y=q[1];return}
        M.bords.forEach(function(b){
          var a=monde(I,b.a),c=monde(I,b.b),u=V.unit(V.sub(c,a)),n=[-u[1],u[0]];
          // bord sur une droite parallèle toute proche
          lignes.concat(etat.traits).forEach(function(l){
            if(V.ecartAngle(u,V.sub(l[1],l[0]))<.6){var d=V.dot(V.sub(l[0],a),n);if(Math.abs(d)<.22&&Math.abs(d)>1e-6){I.x+=n[0]*d;I.y+=n[1]*d}}
          });
          // bord passant par un point tout proche
          pts.forEach(function(p){var d=V.dot(V.sub(p,a),n),t=V.dot(V.sub(p,a),u);
            if(Math.abs(d)<.18&&Math.abs(d)>1e-6&&t>-.2&&t<V.dist(a,c)+.2){I.x+=n[0]*d;I.y+=n[1]*d}});
        });
      }
      // suivre le doigt (ou la souris) jusqu'à ce qu'il se lève, même s'il sort de la figure :
      // la figure entière « capture » le pointeur (comme le rapporteur)
      function glisser(e,bouge,fin){
        var id=e.pointerId;try{svg.setPointerCapture(id)}catch(_){}
        function mv(ev){if(ev.pointerId!==id)return;ev.preventDefault();bouge(pos(ev))}
        function up(ev){if(ev.pointerId!==id)return;window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);if(fin)fin()}
        window.addEventListener("pointermove",mv,{passive:false});window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
      }
      // appui près d'un bord de la règle ou de l'équerre :
      //  • un simple TOUCHER place un point sur le bord (au millimètre, ou sur un point / un milieu tout proche) ;
      //  • RESTER APPUYÉ (ou glisser le doigt le long du bord) TRACE : le crayon apparaît et suit le doigt.
      var APPUI_TRACE=350;
      function appuiBord(I,b,e){
        var a=monde(I,b.a),c=monde(I,b.b),u=V.unit(V.sub(c,a)),L=V.dist(a,c);
        // bord gradué : on s'arrête sur une graduation (au millimètre), comme quand on lit la règle
        var t=function(p){var x=Math.max(0,Math.min(L,V.dot(V.sub(p,a),u)));if(b.zero!=null)x=Math.max(0,Math.min(L,Math.round((x-b.zero)*10)/10+b.zero));return x};
        var p0=pos(e),trait=null,zb=I.bords.filter(function(x){return x.b===b})[0];
        function debuter(){
          if(trait)return;var t0=t(p0);trait=[V.add(a,V.mul(u,t0)),V.add(a,V.mul(u,t0))];
          etat.traits.push(trait);histoire.push("traits");if(zb)zb.z.classList.add("actif");montrerCrayon(trait[1]);redessiner();
        }
        var minuteur=setTimeout(debuter,APPUI_TRACE);
        glisser(e,function(p){
          if(!trait&&V.dist(p,p0)>.15)debuter();
          if(trait){trait[1]=V.add(a,V.mul(u,t(p)));montrerCrayon(trait[1]);redessiner()}
        },function(){
          clearTimeout(minuteur);
          if(!trait){                                  // simple toucher : un point sur le bord
            if(outils.indexOf("point")<0)return;
            var q=V.add(a,V.mul(u,t(p0)));ajouterPoint(plusProche(q,accrochesPoint(),.25)||q);return;
          }
          if(zb)zb.z.classList.remove("actif");montrerCrayon(null);
          if(V.dist(trait[0],trait[1])<.15){etat.traits.pop();histoire.pop()}
          redessiner();
        });
      }

      // ----- compas (version simple) : l'élève CHOISIT L'ÉCARTEMENT, puis TOUCHE UN POINT :
      //   le compas se pose sur ce point et trace tout seul.
      //   T.compas : {mode:"cercle"} (par défaut) : un cercle entier ;
      //              {mode:"arcs", vers:[points cherchés]} : des petits arcs vers ceux de ces points qui sont à peu près
      //              à la bonne distance (si l'écartement est faux, les arcs ne se croisent pas au bon endroit).
      var modeCompas=false,bCompas=null,reglage=null;
      if(outils.indexOf("compas")>=0){
        var CP=T.compas||{mode:"cercle"},ecart=CP.ecart||3,anime=false;
        // le compas dessiné (sans prise : il ne se manipule plus à la main)
        var C={g:el("g",{class:"gi gi-compas hide"},gHaut)};
        C.j=el("path",{class:"gi-jambes"},C.g);C.hp=el("circle",{r:.3,class:"gi-pointe"},C.g);C.hm=el("circle",{r:.32,class:"gi-mine"},C.g);
        C.ht=el("circle",{r:.3,class:"gi-tete"},C.g);C.et=el("text",{class:"gi-ouv"},C.g);
        var dessinerC=function(P,M){
          var m=V.mul(V.add(P,M),.5),d=V.dist(P,M),u=V.unit(V.sub(M,P)),n=[u[1],-u[0]];if(n[1]>0)n=V.mul(n,-1);
          var t=V.add(m,V.mul(n,Math.max(1.3,3.2-d*.25)));
          C.j.setAttribute("d","M"+f(P[0])+" "+f(P[1])+" L"+f(t[0])+" "+f(t[1])+" L"+f(M[0])+" "+f(M[1]));
          C.hp.setAttribute("cx",f(P[0]));C.hp.setAttribute("cy",f(P[1]));C.hm.setAttribute("cx",f(M[0]));C.hm.setAttribute("cy",f(M[1]));
          C.ht.setAttribute("cx",f(t[0]));C.ht.setAttribute("cy",f(t[1]));C.et.setAttribute("x",f(t[0]));C.et.setAttribute("y",f(t[1]-.45));C.et.textContent=cm(d);
        };
        var repos=function(){dessinerC([.45,7.1],[.45+ecart,7.1])};     // au repos : en bas à gauche, ouvert à l'écartement choisi
        repos();
        // réglage de l'écartement : − / curseur / +
        reglage=document.createElement("div");reglage.className="gb-reglage hide";
        reglage.innerHTML='<span class="gb-r-titre">Écartement</span><button type="button" class="gb-b gb-r-moins" aria-label="moins 1 mm">−</button>'+
          '<input type="range" min="0.5" max="8" step="0.1" aria-label="Écartement du compas"><button type="button" class="gb-b gb-r-plus" aria-label="plus 1 mm">+</button>'+
          '<b class="gb-r-val"></b><span class="gb-r-aide">puis touche un point : le compas trace.</span>';
        var curseur=reglage.querySelector("input"),val=reglage.querySelector(".gb-r-val");
        var majEcart=function(x){ecart=Math.max(.5,Math.min(8,Math.round(x*10)/10));curseur.value=ecart;val.textContent=cm(ecart);if(!anime)repos()};
        majEcart(ecart);
        reglage.addEventListener("click",function(e){e.stopPropagation()});
        reglage.addEventListener("keydown",function(e){e.stopPropagation()});
        curseur.addEventListener("input",function(){majEcart(+curseur.value)});
        reglage.querySelector(".gb-r-moins").addEventListener("click",function(){majEcart(ecart-.1)});
        reglage.querySelector(".gb-r-plus").addEventListener("click",function(){majEcart(ecart+.1)});
        barre.parentNode.insertBefore(reglage,barre.nextSibling);
        // les arcs à tracer depuis le centre c
        var arcsDepuis=function(c){
          if(CP.mode!=="arcs")return [{a0:-90,bal:360}];
          var l=(CP.vers||[]).filter(function(q){return V.dist(c,q)>.3}).map(function(q){return {q:q,e:Math.abs(V.dist(c,q)-ecart)}});
          if(!l.length)return [{a0:-90,bal:360}];
          var m=Math.min.apply(null,l.map(function(x){return x.e}));
          return l.filter(function(x){return x.e<1||x.e<m+.3}).map(function(x){return {a0:V.ang(V.sub(x.q,c))-22,bal:44}});
        };
        // le compas se pose sur c et trace (animation courte, arc après arc)
        var tracerAuto=function(c){
          var l=arcsDepuis(c),i=0,debut=null;anime=true;
          var arcs=l.map(function(x){return {c:c.slice(),r:ecart,a0:x.a0,bal:0,fin:x.bal}});
          function image(ts){
            if(debut===null)debut=ts;var A=arcs[i],dur=Math.abs(A.fin)>=360?1100:550,e=Math.min(1,(ts-debut)/dur);
            if(e>0&&etat.arcs.indexOf(A)<0)etat.arcs.push(A);
            A.bal=A.fin*e;dessinerC(c,V.add(c,V.mul(V.rot([1,0],A.a0+A.bal),ecart)));redessiner();
            if(e<1){requestAnimationFrame(image);return}
            i++;debut=null;
            if(i<arcs.length){requestAnimationFrame(image);return}
            arcs.forEach(function(x){delete x.fin});
            histoire.push({k:"arcs",n:arcs.length});anime=false;setTimeout(function(){if(!anime)repos()},350);
          }
          requestAnimationFrame(image);
        };
        // en mode compas, toucher la figure = piquer le compas sur le point le plus proche
        svg.addEventListener("pointerdown",function(e){
          if(fait||!modeCompas)return;
          e.preventDefault();e.stopPropagation();if(anime)return;
          var c=plusProche(pos(e),accrochesPoint(),TACTILE?.55:.4);
          if(!c){reglage.classList.remove("gb-r-flash");void reglage.offsetWidth;reglage.classList.add("gb-r-flash");return}   // pas de point ici
          tracerAuto(c);
        },true);
        bCompas=bouton("Compas","Prendre ou ranger le compas",function(b){
          modeCompas=!modeCompas;b.classList.toggle("actif",modeCompas);C.g.classList.toggle("hide",!modeCompas);reglage.classList.toggle("hide",!modeCompas);
          if(modeCompas&&modePoint&&bPoint){modePoint=false;bPoint.classList.remove("actif")}
        });
      }

      // ----- point -----
      var bPoint=null,modePoint=false;
      if(outils.indexOf("point")>=0){
        bPoint=bouton("✕ Point","Placer un point",function(b){modePoint=!modePoint;b.classList.toggle("actif",modePoint);
          if(modePoint&&modeCompas)bCompas.click()});
      }
      svg.addEventListener("pointerdown",function(e){
        if(fait||!modePoint||e.target.closest(".gi"))return;
        e.preventDefault();e.stopPropagation();
        var p=pos(e),q=plusProche(p,accrochesPoint(),.3);ajouterPoint(q||p);
      });
      bouton("↶ Effacer","Effacer le dernier tracé",function(){
        var k=histoire.pop();if(!k)return;
        if(typeof k==="string")etat[k].pop();else for(var i=0;i<k.n;i++)etat[k.k].pop();   // (le compas peut tracer plusieurs arcs d'un coup)
        redessiner()});
      function majBarre(){
        if(!bPoint)return;var n=aPlacer[etat.points.length];
        bPoint.innerHTML="✕ Point"+(n?" "+n:"");
      }
      majBarre();
      // tuto animé de cette construction (commun/tuto.js) : toujours accessible, même après la réponse
      function boutonTuto(cle,txt){
        var bt=document.createElement("button");bt.type="button";bt.className="gb-b gb-tuto";bt.innerHTML=txt;bt.title="Voir comment faire";
        bt.addEventListener("click",function(e){e.stopPropagation();TUTO.ouvrir(cle)});barre.appendChild(bt);
      }
      if(window.TUTO){
        if(T.tuto&&TUTO.existe(T.tuto))boutonTuto(T.tuto,"▶ Tuto");
        if(outils.indexOf("compas")>=0&&T.tuto!=="compas"&&TUTO.existe("compas"))boutonTuto("compas","▶ Le compas");   // comment marche le compas
      }
      if(T.aide){var pa=document.createElement("p");pa.className="gb-aide";pa.innerHTML=T.aide;zone.insertBefore(pa,barre)}

      // rappel des gestes (si l'élève a des instruments à manipuler)
      if(Object.keys(instr).length||outils.indexOf("compas")>=0){
        var mg=document.createElement("p");mg.className="gb-gestes";
        mg.innerHTML=(Object.keys(instr).length?"Glisse un instrument pour le déplacer. Pour le tourner : reste appuyé dessus puis tourne, ou utilise une poignée <b>⟳</b>. ":"")+
          (Object.keys(instr).some(function(k){return INSTRUMENTS[k].bords.length})?"<br><b>Le long d’un bord</b> : "+(outils.indexOf("point")>=0?"touche pour placer un point ; ":"")+"reste appuyé ou glisse pour tracer (le crayon apparaît). ":"")+
          (outils.indexOf("compas")>=0?"<br><b>Compas</b> : choisis l’écartement, puis touche un point : il trace tout seul.":"");
        zone.appendChild(mg);
      }

      // ----- valider (ou répondre par une proposition) -----
      var rang=document.createElement("div");rang.className="row gb-fin";zone.appendChild(rang);
      function corriger(){
        var c=T.corrige||{};
        (c.droites||[]).forEach(function(d){var L=long(d[0],d[1]);el("line",{x1:f(L[0][0]),y1:f(L[0][1]),x2:f(L[1][0]),y2:f(L[1][1])},gCorr)});
        (c.segments||[]).forEach(function(d){el("line",{x1:f(d[0][0]),y1:f(d[0][1]),x2:f(d[1][0]),y2:f(d[1][1])},gCorr)});
        (c.cercles||[]).forEach(function(d){el("circle",{cx:f(d[0][0]),cy:f(d[0][1]),r:f(d[1]),class:"gb-vide"},gCorr)});
        Object.keys(c.points||{}).forEach(function(n){croix(gCorr,c.points[n],n,"")});
        Object.keys(instr).forEach(function(k){instr[k].g.classList.add("gi-pale")});
      }
      if(T.choix){
        T.choix.forEach(function(ch){var b=document.createElement("button");b.type="button";b.className="gb-choix";b.innerHTML=ch;rang.appendChild(b);
          b.addEventListener("click",function(e){e.stopPropagation();if(fait)return;fait=true;var ok=ch===T.r;b.classList.add(ok?"bon":"faux");
            [].forEach.call(rang.children,function(x){if(x.innerHTML===T.r)x.classList.add("bon")});corriger();termine(ok,ch)})});
      }else{
        var bv=document.createElement("button");bv.type="button";bv.textContent="Valider";rang.appendChild(bv);
        bv.addEventListener("click",function(e){
          e.stopPropagation();if(fait)return;fait=true;rang.classList.add("hide");
          var ecart=T.verifier(etat,G);corriger();
          if(ecart<=1)termine(true,"construction juste");
          else if(ecart<=2)termine(true,"construction un peu imprécise",null,{verdict:"Bien, mais pas très précis.",montrer:true});
          else termine(false,"construction à revoir");
        });
      }
    };
  }

  // ---------- OUTILS POUR LES VÉRIFICATIONS (paramètre G de verifier) ----------
  var G={
    V:V,TOL:TOL,TOL_ANG:TOL_ANG,
    // meilleur écart (en tolérances) d'une liste : 0 = parfait, 1 = limite du juste
    min:function(l){return l.length?Math.min.apply(null,l):99},
    // un trait (assez long) sur la droite passant par p, de direction dir : écart
    droite:function(e,p,dir){
      return G.min(e.traits.filter(function(t){return V.dist(t[0],t[1])>1.5}).map(function(t){
        var u=V.sub(t[1],t[0]);return Math.max(V.distDroite(p,t[0],t[1])/TOL,V.ecartAngle(u,dir)/TOL_ANG);
      }));
    },
    // un trait qui va de p à q (dans un sens ou dans l'autre)
    segment:function(e,p,q){
      return G.min(e.traits.map(function(t){return Math.min(Math.max(V.dist(t[0],p),V.dist(t[1],q)),Math.max(V.dist(t[0],q),V.dist(t[1],p)))/TOL}));
    },
    // un point placé (de préférence avec ce nom) près de q
    point:function(e,q,nom){
      var l=e.points.filter(function(p){return !nom||p.nom===nom});if(!l.length)l=e.points;
      return G.min(l.map(function(p){return V.dist(p.p,q)/TOL}));
    },
    // un cercle (ou des arcs qui en font le tour) de centre c et de rayon r
    cercle:function(e,c,r){
      var a=e.arcs.filter(function(x){return V.dist(x.c,c)<2*TOL&&Math.abs(x.r-r)<2*TOL});
      var tour=a.reduce(function(s,x){return s+Math.abs(x.bal)},0);
      if(tour<300)return 99;
      return Math.max.apply(null,a.map(function(x){return Math.max(V.dist(x.c,c),Math.abs(x.r-r))/TOL}));
    }
  };

  // (INSTRUMENTS et el servent aussi aux tutos animés : commun/tuto.js)
  window.GEO={tache:tache,V:V,G:G,W:W,H:Hh,INSTRUMENTS:INSTRUMENTS,el:el};
})();

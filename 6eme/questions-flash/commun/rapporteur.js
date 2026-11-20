// ============================================================================
//  RAPPORTEUR (questions flash 6e) : dessin d'un rapporteur à double graduation,
//  et « atelier » interactif pour LIRE ou TRACER un angle, à 3 niveaux.
//  Utilisé par le chapitre Angles (6qf-angles/index.html) ; réutilisable ailleurs (figures de géométrie).
//
//  Conventions : les angles sont en degrés, mesurés dans le sens inverse des aiguilles d'une montre,
//  0° = vers la droite. Dans un dessin SVG l'axe des y descend, d'où les « −sin ».
//  Graduation EXTÉRIEURE (blanche) : 0 à droite → 180 à gauche ; INTÉRIEURE (rose) : 0 à gauche → 180 à droite.
// ============================================================================
(function(){
  var rad=function(d){return d*Math.PI/180}, f=function(x){return (+x).toFixed(1)};
  // point à la distance r du centre, dans la direction d
  function pt(r,d){return [r*Math.cos(rad(d)),-r*Math.sin(rad(d))]}
  // angle ramené entre −180 et 180
  function norme(d){return ((d+180)%360+360)%360-180}
  function hasard(a,b){return Math.floor(Math.random()*(b-a+1))+a}

  // Rapporteur de rayon R, centre en (0, 0), bord droit vers la droite, arc vers le haut.
  // fin : graduations de 1 en 1 (sinon de 5 en 5)
  function dessin(R,fin){
    var s=['<path class="rp-corps" d="M'+f(-R-6)+' 0 A'+(R+6)+' '+(R+6)+' 0 0 1 '+f(R+6)+' 0 Z"/>',
           '<path class="rp-trou" d="M'+f(-R*.42)+' 0 A'+f(R*.42)+' '+f(R*.42)+' 0 0 1 '+f(R*.42)+' 0"/>'];
    for(var d=0;d<=180;d++){
      var l=d%10===0?13:d%5===0?8:(fin?4.5:0);if(!l)continue;
      var a=pt(R,d),b=pt(R-l,d);
      s.push('<line class="rp-trait" x1="'+f(a[0])+'" y1="'+f(a[1])+'" x2="'+f(b[0])+'" y2="'+f(b[1])+'"/>');
      if(d%10===0){
        var e=pt(R-24,d),i=pt(R-41,d);
        s.push('<text class="rp-ext" x="'+f(e[0])+'" y="'+f(e[1]+4)+'">'+d+'</text>',
               '<text class="rp-int" x="'+f(i[0])+'" y="'+f(i[1]+3.5)+'">'+(180-d)+'</text>');
      }
    }
    s.push('<line class="rp-base" x1="'+(-R-6)+'" y1="0" x2="'+(R+6)+'" y2="0"/>',
           '<path class="rp-centre" d="M-8 0 H8 M0 -8 V4"/>');
    return s.join("");
  }

  // Propositions pour une mesure d'angle (multiple de 5) : la bonne, les pièges, puis des voisines ; 6 à 8, triées
  function choixMesures(a,pieges){
    var cand=(pieges||[]).concat([a+5,a-5,a+10,a-10,a+20,a-20,a+15,a-15,a+30,a-30].sort(function(){return Math.random()-.5})),vus={},res=[a];vus[a]=1;
    cand.forEach(function(x){if(x>0&&x<180&&!vus[x]){vus[x]=1;res.push(x)}});
    return res.slice(0,hasard(6,8)).sort(function(x,y){return x-y});
  }

  // Arc fléché de rayon r, de la direction d0 à la direction d1 (sens inverse des aiguilles), moins de 360°
  function arcFleche(r,d0,d1){
    var q1=pt(r,d0),q2=pt(r,d1),u=pt(1,d1+90),v=pt(1,d1+180),bx=q2[0]-u[0]*10,by=q2[1]-u[1]*10;
    return '<path class="rp-arc" d="M'+f(q1[0])+' '+f(q1[1])+' A'+r+' '+r+' 0 '+(d1-d0>180?1:0)+' 0 '+f(q2[0])+' '+f(q2[1])+'"/>'+
      '<path class="rp-arc-tete" d="M'+f(q2[0])+' '+f(q2[1])+' L'+f(bx+v[0]*6)+' '+f(by+v[1]*6)+' L'+f(bx-v[0]*6)+' '+f(by-v[1]*6)+' Z"/>';
  }
  // Petite figure d'angle (sans rapporteur), pour reconnaître sa nature.
  // Angle plat : flèche en demi-tour ; angle plein : flèche qui fait le tour complet (pour ne pas le confondre avec
  // l'angle nul, qui n'a qu'une demi-droite et pas d'arc).
  function figureAngle(a,dir){
    var L=110,p1=pt(L,dir),p2=pt(L,dir+a),s='<svg class="fig" viewBox="-130 -130 260 260" width="200" role="img" aria-label="un angle">';
    if(a>=360)s+=arcFleche(34,dir+8,dir+352);
    else if(a===180)s+=arcFleche(30,dir+4,dir+176);
    else if(a===90){var c1=pt(16,dir),c2=pt(16*Math.SQRT2,dir+45),c3=pt(16,dir+90);
      s+='<path class="rp-arc" d="M'+f(c1[0])+' '+f(c1[1])+' L'+f(c2[0])+' '+f(c2[1])+' L'+f(c3[0])+' '+f(c3[1])+'"/>'}
    else if(a>0){var q1=pt(24,dir),q2=pt(24,dir+a);
      s+='<path class="rp-arc" d="M'+f(q1[0])+' '+f(q1[1])+' A24 24 0 0 0 '+f(q2[0])+' '+f(q2[1])+'"/>'}
    s+='<line class="rp-rayon" x1="0" y1="0" x2="'+f(p1[0])+'" y2="'+f(p1[1])+'"/>';
    if(a>0&&a<360)s+='<line class="rp-rayon" x1="0" y1="0" x2="'+f(p2[0])+'" y2="'+f(p2[1])+'"/>';
    return s+'<circle class="rp-sommet" r="4"/></svg>';
  }

  // Médaille d'un titre : dessinée par le moteur commun (flash.js), pour pouvoir l'afficher sur toutes les pages
  function medaille(haut,bas){return FLASH.outils.medaille(haut,bas)}

  // Petite icône (bouton de partie) : rapporteur avec un angle ; trace : en pointillés (angle à tracer)
  function icone(a,trace){
    var p=pt(72,a||50);
    return '<svg class="fig" viewBox="-75 -80 150 86" width="150" aria-hidden="true">'+dessin(60,false).replace(/<text[^>]*>[^<]*<\/text>/g,"")+
      '<line class="rp-rayon" x1="0" y1="0" x2="72" y2="0"/><line class="'+(trace?"tr-trace":"rp-rayon")+'" x1="0" y1="0" x2="'+f(p[0])+'" y2="'+f(p[1])+'"/></svg>';
  }

  // ===== ATELIER INTERACTIF : LIRE OU TRACER UN ANGLE =====
  // o.mode   : "lire" (deux demi-droites, l'élève choisit la mesure) ou "tracer" (une demi-droite [Ox), l'élève place B)
  // o.cible  : la mesure de l'angle (en degrés)
  // o.niveau : 1 = rapporteur déjà posé sur le sommet O et aligné sur le 0 d'une demi-droite (rien à bouger)
  //            2 = rapporteur centré sur O, mais à tourner (le faire glisser, ou la poignée ⟳)
  //            3 = rapporteur à placer sur O (le faire glisser), puis à tourner (rester appuyé dessus, ou la poignée ⟳)
  // Aides : le rapporteur se colle au sommet quand on s'en approche, et sur une demi-droite quand il est presque aligné.
  // Tracer : juste à TOL_PARFAIT degrés près ; jusqu'à TOL_JUSTE degrés, compté juste mais « pas très précis ».
  // Après une erreur (ou un tracé peu précis), une animation montre la méthode : le rapporteur se place sur O,
  // s'aligne sur [Ox), puis une flèche part du 0 et monte jusqu'à la mesure.
  // o.debut (lire, niveau 1) : question « sans partir de 0 » : le rapporteur est posé droit, et les deux demi-droites
  //   passent par les graduations o.debut et o.debut + o.cible (par exemple 40 et 140 → 100°) : petit calcul de tête.
  var TOL_PARFAIT=2,TOL_JUSTE=5,W=400,APPUI_LONG=350;
  function atelier(o){
    return function(zone,termine){
      var lire=o.mode==="lire",cible=o.cible,niv=o.niveau,fini=false,debut=Date.now(),decale=lire&&o.debut!=null,pret=true;
      var R=niv===1?172:150;                        // niveau 1 : rien ne bouge, le rapporteur prend toute la largeur
      // Niveau 1 : figure « droite » ([Ox) horizontale, vers la droite ou vers la gauche), cadre bas ;
      // niveaux 2 et 3 : orientation au hasard, cadre carré (le rapporteur peut tourner tout autour du sommet)
      var t0,sens,A,HT;
      if(decale){t0=o.debut;sens=1;HT=222;A=[200,190]}
      else if(niv===1){t0=Math.random()<.5?0:180;sens=t0===0?1:-1;HT=222;A=[200,190]}   // un peu de place sous [Ox) pour la lettre O
      else{t0=hasard(0,359);sens=Math.random()<.5?1:-1;HT=niv===2?400:470;A=[hasard(190,210),hasard(185,205)]}
      // Rapporteur : niveau 1 posé et aligné ; 2 centré mais tourné de travers ; 3 en bas du cadre, droit
      var aligne=decale?0:sens>0?t0:t0+180,depart3=[200,HT-22];   // depart3 : assez haut pour voir toute la poignée
      var pos=niv<3?[A[0],A[1]]:depart3.slice();
      var rot=niv===1?aligne:niv===2?aligne+(Math.random()<.5?1:-1)*hasard(25,70):0;
      var B=null,L=niv===1?195:175;

      var tourner=niv===2?"Tourne le rapporteur en le faisant glisser (ou avec la poignée <span class=\"poignee-txt\">⟳</span>) pour l’aligner sur ":
                  "Fais glisser le rapporteur sur le point <b>O</b>. Pour le tourner, reste appuyé dessus puis tourne (ou utilise la poignée <span class=\"poignee-txt\">⟳</span>), et aligne-le sur ";
      var consigne=lire
        ?(niv===1?"Lis la mesure de l’angle sur le rapporteur.":tourner+"une demi-droite. Puis lis la mesure de l’angle.")
        :(niv===1?"Touche la graduation qui convient pour placer le point <b>B</b>.":tourner+"[Ox). Puis touche l’endroit où placer <b>B</b>.");
      zone.innerHTML='<p class="consigne-tracer">'+consigne+'</p>'+
        '<svg class="fig tracer'+(niv===1?" fixe":"")+'" viewBox="0 0 '+W+' '+HT+'" role="img" aria-label="'+(lire?"lire":"tracer")+' un angle au rapporteur">'+
          // les demi-droites données sont dessinées PAR-DESSUS le rapporteur (on les voit à travers, comme en vrai)
          '<g class="tr-correction"></g><g class="tr-eleve"></g>'+
          '<g class="tr-rapporteur">'+dessin(R,true)+
            // deux poignées de rotation, une de chaque côté du rapporteur
            (niv>1?'<g class="tr-poignee" data-cote="d"><line x1="'+(R+6)+'" y1="0" x2="'+(R+22)+'" y2="0"/><circle cx="'+(R+31)+'" cy="0" r="14"/><text x="'+(R+31)+'" y="5">⟳</text></g>'+
                   '<g class="tr-poignee" data-cote="g"><line x1="'+(-R-6)+'" y1="0" x2="'+(-R-22)+'" y2="0"/><circle cx="'+(-R-31)+'" cy="0" r="14"/><text x="'+(-R-31)+'" y="5">⟲</text></g>':'')+
            '<g class="tr-surligne"></g>'+
          '</g><g class="tr-donne"></g><g class="tr-fleche"></g><g class="tr-noms"></g></svg>'+
        (lire?'<div class="choix nombreux tr-choix"></div>'
             :'<div class="row tr-boutons"><button type="button" class="tr-valider" disabled>Valider</button>'+
              (niv>1?'<button type="button" class="sec tr-replacer">Replacer le rapporteur</button>':'')+'</div>');
      var svg=zone.querySelector("svg"),gR=zone.querySelector(".tr-rapporteur"),gE=zone.querySelector(".tr-eleve"),
          gC=zone.querySelector(".tr-correction"),gF=zone.querySelector(".tr-fleche"),gS=zone.querySelector(".tr-surligne");

      // Figure donnée : demi-droite [Ox), et pour lire la seconde demi-droite ; sommet O (lettre au-dessus du rapporteur)
      var x=pt(L,t0),s='<line class="rp-rayon" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+f(A[0]+x[0])+'" y2="'+f(A[1]+x[1])+'"/>';
      if(lire){var y=pt(L,t0+sens*cible);s+='<line class="rp-rayon" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+f(A[0]+y[0])+'" y2="'+f(A[1]+y[1])+'"/>'}
      zone.querySelector(".tr-donne").innerHTML=s+'<circle class="rp-sommet" cx="'+A[0]+'" cy="'+A[1]+'" r="5"/>';
      var nO=pt(24,t0+sens*(lire?cible/2:45)+180);   // la lettre O, du côté opposé à l'ouverture de l'angle
      zone.querySelector(".tr-noms").innerHTML='<text class="tr-nom" x="'+f(A[0]+nO[0])+'" y="'+f(A[1]+nO[1]+6)+'">O</text>'+
        (lire?'':'<text class="tr-nom" x="'+f(A[0]+x[0]*.93)+'" y="'+f(A[1]+x[1]*.93-12)+'">x</text>');

      function dessiner(){gR.setAttribute("transform","translate("+f(pos[0])+" "+f(pos[1])+") rotate("+f(-rot)+")")}
      // Tracer au niveau 1 : on voit d'abord [Ox) seule, puis le rapporteur arrive en glissant et se pose dessus
      if(niv===1&&!lire){
        pret=false;pos=[A[0],A[1]+R+60];
        animer(600,function(k){pos=[A[0],A[1]+(R+60)*(1-k)];dessiner()},function(){pret=true});   // tout de suite, sans attendre
      }
      dessiner();
      function point(e){var p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;p=p.matrixTransform(svg.getScreenCTM().inverse());return [p.x,p.y]}
      function angleDe(p){return Math.atan2(-(p[1]-pos[1]),p[0]-pos[0])*180/Math.PI}   // direction du point vu du centre du rapporteur
      function surRapporteur(p){                    // le point est-il sur le rapporteur (demi-disque) ?
        var dx=p[0]-pos[0],dy=p[1]-pos[1],r=rad(rot),haut=-dx*Math.sin(r)-dy*Math.cos(r);
        return Math.hypot(dx,dy)<=R+8&&haut>=-8;
      }
      function aimanter(){                          // se colle sur une demi-droite quand il est presque aligné
        var aimants=[t0,t0+180];if(lire)aimants.push(t0+sens*cible,t0+sens*cible+180);
        aimants.forEach(function(t){if(Math.abs(norme(rot-t))<4)rot=t});
      }

      // ----- Animation de correction : le rapporteur se place et s'aligne, puis la flèche monte du 0 à la mesure -----
      function animer(duree,etape,fin){
        var t1=null;
        function f1(t){
          if(!svg.isConnected)return;               // on est passé à la question suivante : on arrête
          if(t1===null)t1=t;var k=Math.min(1,(t-t1)/duree);etape(k*k*(3-2*k));
          if(k<1)requestAnimationFrame(f1);else if(fin)fin();
        }
        requestAnimationFrame(f1);
      }
      function fleche(sg,a,fini){                       // arc fléché de [Ox) jusqu'à a degrés, du côté sg (1 ou −1)
        var r=R+16,d0=t0,d1=t0+sg*a,p0=pt(r,d0),p1=pt(r,d1),tg=d1+sg*90,u=pt(1,tg),v=pt(1,tg+90);
        var bx=A[0]+p1[0]-u[0]*11,by=A[1]+p1[1]-u[1]*11,lb=pt(r+24,d1);
        // le nombre doit rester dans le cadre : s'il en sortirait (angle presque plat, bord du cadre),
        // on l'écrit à l'intérieur de l'angle, sur le rapporteur
        // (on décide d'après la mesure finale, pour que le nombre ne saute pas pendant que la flèche monte)
        var lf=pt(r+24,t0+sg*cible),demi=6+6*String(cible).length,lx=A[0]+lf[0],ly=A[1]+lf[1]+6;
        if(lx-demi<4||lx+demi>W-4||ly-20<2||ly+6>HT-2)lb=pt(R*.52,d1-sg*Math.min(14,a/2));
        return '<path class="fl-arc" d="M'+f(A[0]+p0[0])+' '+f(A[1]+p0[1])+' A'+r+' '+r+' 0 0 '+(sg>0?0:1)+' '+f(A[0]+p1[0])+' '+f(A[1]+p1[1])+'"/>'+
          (a>6?'<path class="fl-tete" d="M'+f(A[0]+p1[0])+' '+f(A[1]+p1[1])+' L'+f(bx+v[0]*6)+' '+f(by+v[1]*6)+' L'+f(bx-v[0]*6)+' '+f(by-v[1]*6)+' Z"/>':'')+
          '<circle class="fl-zero" cx="'+f(A[0]+p0[0])+'" cy="'+f(A[1]+p0[1])+'" r="5"/>'+
          (fini?pastille(A[0]+lb[0],A[1]+lb[1],Math.round(a)+"°",20)
               :'<text class="fl-txt" x="'+f(A[0]+lb[0])+'" y="'+f(A[1]+lb[1]+6)+'">'+Math.round(a)+'°</text>');
      }
      // Graduation lue mise en lumière (dans le repère du rapporteur) : ech = "ext" ou "int", de la valeur v1 à v2
      // pastille jaune (même style pour la mesure au bout de la flèche et pour la graduation d'arrivée)
      function pastille(x,y,txt,taille){
        var demi=taille*(.3*String(txt).length+.35),h=taille*1.3;
        return '<g class="pastille"><rect x="'+f(x-demi)+'" y="'+f(y-h/2)+'" width="'+f(2*demi)+'" height="'+f(h)+'" rx="'+f(h/2)+'"/>'+
          '<text x="'+f(x)+'" y="'+f(y+taille*.36)+'" style="font-size:'+taille+'px">'+txt+'</text></g>';
      }
      function surligner(ech,v1,v2,fini){
        var la=function(v){return ech==="ext"?v:180-v},lo=Math.min(la(v1),la(v2)),hi=Math.max(la(v1),la(v2)),r=R-6,p1=pt(r,lo),p2=pt(r,hi);
        var s='<path class="sl-arc" d="M'+f(p1[0])+' '+f(p1[1])+' A'+r+' '+r+' 0 0 0 '+f(p2[0])+' '+f(p2[1])+'"/>';
        for(var v=Math.ceil(v1/5)*5;v<=v2+1e-9;v+=5){
          var a=pt(R,la(v)),b=pt(R-(v%10?8:13),la(v));
          s+='<line class="sl-trait" x1="'+f(a[0])+'" y1="'+f(a[1])+'" x2="'+f(b[0])+'" y2="'+f(b[1])+'"/>';
          if(v%10===0&&!(fini&&Math.abs(v-v2)<1e-6)){var t=pt(ech==="ext"?R-24:R-41,la(v));s+='<text class="sl-txt'+(ech==="int"?" int":"")+'" x="'+f(t[0])+'" y="'+f(t[1]+4)+'">'+v+'</text>'}
        }
        return s;
      }
      // à la fin : la graduation d'arrivée (celle de la mesure) dans une pastille, comme la mesure écrite au bout de la flèche ;
      // dessinée au premier plan (par-dessus les demi-droites), à l'endroit où se trouve ce nombre sur le rapporteur posé
      function pastilleArrivee(ech,e){
        var q=pt(ech==="ext"?R-24:R-41,(ech==="ext"?e:180-e)+rot);
        return pastille(A[0]+q[0],A[1]+q[1],e,ech==="ext"?16:14);
      }
      // Correction : le rapporteur se place sur O et s'aligne (sauf question « sans partir de 0 », où il est déjà posé),
      // puis la flèche monte et la graduation lue s'allume, de la première demi-droite jusqu'à la seconde.
      function montrerCorrection(sg,apres){
        svg.classList.add("tr-corrige");
        var cibleRot=decale?rot:sg>0?t0:t0+180,ech=decale||sg>0?"ext":"int",v1=decale?o.debut:0;
        var p0=pos.slice(),r0=rot,dr=norme(cibleRot-r0);
        animer(900,function(k){pos=[p0[0]+(A[0]-p0[0])*k,p0[1]+(A[1]-p0[1])*k];rot=r0+dr*k;dessiner()},function(){
          animer(1100,function(k){gF.innerHTML=fleche(sg,cible*k,k>=1)+(k>=1?pastilleArrivee(ech,Math.round(v1+cible)):"");gS.innerHTML=surligner(ech,v1,v1+cible*k,k>=1)},apres);
        });
      }

      // ----- Lire : propositions sous la figure -----
      if(lire){
        var zc=zone.querySelector(".tr-choix");
        var pieges=decale?[o.debut+cible,o.debut,180-cible]:[180-cible];   // erreurs typiques : lire une seule graduation
        choixMesures(cible,pieges).forEach(function(v){
          var b=document.createElement("button");b.type="button";b.textContent=v+"°";
          b.addEventListener("click",function(e){
            e.stopPropagation();
            if(fini||Date.now()-debut<400)return;    // pas de réponse par accident juste après l'affichage
            fini=true;var ok=v===cible;
            zc.className+=" repondu";
            [].forEach.call(zc.children,function(c){if(c.textContent===cible+"°")c.className="bon";else if(c===b)c.className="faux"});
            svg.classList.add("tr-fini");
            var corr=decale
              ?"Les demi-droites passent par "+o.debut+" et "+(o.debut+cible)+" : l’angle mesure "+(o.debut+cible)+" − "+o.debut+" = "+cible+"°."
              :"L’angle mesure "+cible+"° : on part du 0 posé sur une demi-droite, jusqu’à l’autre.";
            if(!ok&&!decale&&v===180-cible)corr+=" Tu as lu la mauvaise graduation.";
            termine(ok,v+"°",corr);
            if(!ok)montrerCorrection(sens);
          });
          zc.appendChild(b);
        });
      }

      // ----- Tracer : placer le point B -----
      var bV=zone.querySelector(".tr-valider");
      function placerB(p){
        if(Math.hypot(p[0]-A[0],p[1]-A[1])<30)return;   // trop près de O
        B=p;var d=Math.atan2(-(p[1]-A[1]),p[0]-A[0])*180/Math.PI,z=pt(L,d);
        gE.innerHTML='<line class="tr-trace" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+f(A[0]+z[0])+'" y2="'+f(A[1]+z[1])+'"/>'+
          '<path class="tr-croix" d="M'+f(p[0]-6)+' '+f(p[1]-6)+' l12 12 M'+f(p[0]+6)+' '+f(p[1]-6)+' l-12 12"/>'+
          '<text class="tr-nom" x="'+f(p[0]+9)+'" y="'+f(p[1]-9)+'">B</text>';
        bV.disabled=false;
      }

      // ----- Manipulation du rapporteur -----
      // niveau 2 : le faire glisser le fait tourner (son centre reste sur O) ;
      // niveau 3 : glisser le déplace ; rester appuyé un instant puis bouger le fait tourner ; la poignée tourne toujours.
      // Un simple toucher (sans bouger) place le point B quand on trace.
      var mode=null,depart=null,bouge=false,decalage=null,appui=null,angle0=0,rot0=0,poigneeGauche=false;
      svg.addEventListener("pointerdown",function(e){
        if(fini||!pret)return;                       // pas pendant l'arrivée du rapporteur
        var p=point(e),pg=e.target.closest&&e.target.closest(".tr-poignee");depart=p;bouge=false;
        if(niv>1&&pg){mode="poignee";poigneeGauche=pg.getAttribute("data-cote")==="g"}
        else if(niv>1&&surRapporteur(p)){
          mode=niv===2?"tourner":"corps";angle0=angleDe(p);rot0=rot;decalage=[pos[0]-p[0],pos[1]-p[1]];
          if(niv===3)appui=setTimeout(function(){         // appui long sans bouger : mode rotation
            if(mode==="corps"&&!bouge){mode="tourner";angle0=angleDe(depart);rot0=rot;svg.classList.add("rotation")}
          },APPUI_LONG);
        }
        else mode="toucher";
        try{svg.setPointerCapture(e.pointerId)}catch(_){}   // suivre le doigt même s'il sort de la figure
        if(mode!=="toucher")e.preventDefault();
      });
      svg.addEventListener("pointermove",function(e){
        if(!mode||fini)return;
        var p=point(e);if(Math.hypot(p[0]-depart[0],p[1]-depart[1])>4)bouge=true;
        if(mode==="corps"&&bouge){clearTimeout(appui);mode="glisser"}
        if(mode==="glisser"){
          pos=[p[0]+decalage[0],p[1]+decalage[1]];
          if(Math.hypot(pos[0]-A[0],pos[1]-A[1])<14)pos=[A[0],A[1]];        // se colle au sommet
          dessiner();
        }else if(mode==="poignee"){rot=angleDe(p)-(poigneeGauche?180:0);aimanter();dessiner()}   // la poignée de gauche est à l'opposé
        else if(mode==="tourner"&&bouge){rot=rot0+norme(angleDe(p)-angle0);aimanter();dessiner()}
      });
      function lacher(e){
        clearTimeout(appui);svg.classList.remove("rotation");
        if(!mode||fini){mode=null;return}
        if(!lire&&!bouge&&mode!=="poignee"&&!(mode==="tourner"&&niv===3))placerB(point(e));   // un simple toucher place B
        mode=null;
      }
      svg.addEventListener("pointerup",lacher);
      svg.addEventListener("pointercancel",function(){clearTimeout(appui);svg.classList.remove("rotation");mode=null});
      var bRe=zone.querySelector(".tr-replacer");
      if(bRe)bRe.addEventListener("click",function(e){
        e.stopPropagation();if(fini)return;
        if(niv===3){pos=depart3.slice();rot=0}else rot=aligne+40;
        dessiner();
      });
      if(bV)bV.addEventListener("click",function(e){
        e.stopPropagation();                         // ce clic ne doit pas aussi faire passer à la question suivante
        if(fini||!B)return;fini=true;
        var tb=Math.atan2(-(B[1]-A[1]),B[0]-A[0])*180/Math.PI,ecart=norme(tb-t0),mesure=Math.abs(ecart),erreur=Math.abs(mesure-cible);
        // côté de la correction : celui où l'élève a tracé ; au niveau 1, toujours le côté visible (au-dessus de [Ox))
        var sg=niv===1?sens:(ecart>=0?1:-1),m=Math.round(mesure);
        zone.querySelector(".tr-boutons").className="hide";
        svg.classList.add("tr-fini");
        var bonne=pt(L,t0+sg*cible),vert='<line class="tr-bonne" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+f(A[0]+bonne[0])+'" y2="'+f(A[1]+bonne[1])+'"/>';
        if(erreur<=TOL_PARFAIT){termine(true,"ton angle : "+m+"°");return}
        if(erreur<=TOL_JUSTE){
          termine(true,"ton angle : "+m+"°","Ton angle mesure "+m+"° au lieu de "+cible+"°. Regarde la correction.",{verdict:"Bien, mais pas très précis.",montrer:true});
          montrerCorrection(sg,function(){gC.innerHTML=vert});return;
        }
        var corr="Ton angle mesure "+m+"°. Regarde la correction.";
        if(Math.abs(mesure-(180-cible))<=TOL_JUSTE)corr+=" Tu as lu la mauvaise graduation : pars du 0 qui est sur [Ox).";
        else if(Math.hypot(pos[0]-A[0],pos[1]-A[1])>3)corr+=" Le centre du rapporteur doit être exactement sur le point O.";
        termine(false,"ton angle : "+m+"°",corr);
        montrerCorrection(sg,function(){gC.innerHTML=vert});
      });
    };
  }

  window.RAPPORTEUR={dessin:dessin,choixMesures:choixMesures,figureAngle:figureAngle,icone:icone,medaille:medaille,atelier:atelier};
})();

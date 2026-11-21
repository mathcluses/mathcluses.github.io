// ============================================================================
//  FIGURES DES QUESTIONS (6e) : polygones, codages, cercles, quadrillages, cubes, graphiques
//  À charger après flash.js : <script src="../commun/figures.js"></script>
//
//  FIG.dessin(largeur, hauteur, elements, opts) → texte SVG (unités = « carreaux » ou cm, 1 unité ≈ 30 px)
//  elements : liste d'objets, par exemple
//    {poly:[[x,y],…]}            polygone fermé           {ligne:[[x,y],…]}       ligne brisée
//    {seg:[p,q]}  {droite:[p,q], nom:"(d)"}               {cercle:[c,r]} {disque:[c,r]}
//    {point:p, nom:"A", pos:"ne"}                         {cote:[p,q], t:"7 cm", centre:c}  longueur écrite le long
//    {droit:[S,A,B]}  angle droit en S                    {egal:[p,q], n:2}  traits de codage (côtés égaux)
//    {texte:[x,y], t:"…"}   {quadrillage:true}            {carre:[x,y], cls:"plein"}  case de quadrillage coloriée
//  opts : {grille:true} pour un quadrillage de fond ; {px:28} pour la taille d'une unité
// ============================================================================
(function(){
  function f(x){return (+x).toFixed(3)}
  function V(a,b){return [b[0]-a[0],b[1]-a[1]]}
  function L(v){return Math.hypot(v[0],v[1])||1}
  function dessin(W,H,els,o){
    o=o||{};var px=o.px||30,m=.6;
    var s='<svg class="fig figg" viewBox="'+f(-m)+' '+f(-m)+' '+f(W+2*m)+' '+f(H+2*m)+'" width="'+Math.round((W+2*m)*px)+'" role="img">';
    if(o.grille){for(var x=0;x<=W;x++)s+='<line class="fg-q" x1="'+x+'" y1="0" x2="'+x+'" y2="'+H+'"/>';for(var y=0;y<=H;y++)s+='<line class="fg-q" x1="0" y1="'+y+'" x2="'+W+'" y2="'+y+'"/>'}
    els.forEach(function(e){
      if(e.carre)s+='<rect class="fg-'+(e.cls||"plein")+'" x="'+e.carre[0]+'" y="'+e.carre[1]+'" width="1" height="1"/>';
      if(e.tri)s+='<path class="fg-'+(e.cls||"plein")+'" d="M'+e.tri.map(function(p){return f(p[0])+" "+f(p[1])}).join(" L")+' Z"/>';
      if(e.poly)s+='<path class="fg-trait'+(e.plein?" fg-rempli":"")+'" d="M'+e.poly.map(function(p){return f(p[0])+" "+f(p[1])}).join(" L")+' Z"/>';
      if(e.ligne)s+='<path class="fg-trait fg-vide'+(e.cls?" "+e.cls:"")+'" d="M'+e.ligne.map(function(p){return f(p[0])+" "+f(p[1])}).join(" L")+'"/>';
      if(e.seg)s+='<line class="fg-trait'+(e.cls?" "+e.cls:"")+'" x1="'+f(e.seg[0][0])+'" y1="'+f(e.seg[0][1])+'" x2="'+f(e.seg[1][0])+'" y2="'+f(e.seg[1][1])+'"/>';
      if(e.droite){var u=V(e.droite[0],e.droite[1]),l=L(u);u=[u[0]/l,u[1]/l];var a=[e.droite[0][0]-u[0]*30,e.droite[0][1]-u[1]*30],b=[e.droite[0][0]+u[0]*30,e.droite[0][1]+u[1]*30];
        s+='<line class="fg-trait'+(e.cls?" "+e.cls:"")+'" x1="'+f(a[0])+'" y1="'+f(a[1])+'" x2="'+f(b[0])+'" y2="'+f(b[1])+'"/>';
        if(e.nom){var t=e.posNom||[e.droite[1][0]+u[0]*.5-u[1]*.4,e.droite[1][1]+u[1]*.5+u[0]*.4];s+='<text class="fg-nom" x="'+f(t[0])+'" y="'+f(t[1])+'">'+e.nom+'</text>'}}
      if(e.cercle)s+='<circle class="fg-trait fg-vide" cx="'+f(e.cercle[0][0])+'" cy="'+f(e.cercle[0][1])+'" r="'+f(e.cercle[1])+'"/>';
      if(e.disque)s+='<circle class="fg-trait fg-rempli" cx="'+f(e.disque[0][0])+'" cy="'+f(e.disque[0][1])+'" r="'+f(e.disque[1])+'"/>';
      if(e.point){var p=e.point,d={ne:[.15,-.2],no:[-.55,-.2],se:[.15,.5],so:[-.55,.5],n:[-.15,-.3],s:[-.15,.6],e:[.2,.15],o:[-.6,.15]}[e.pos||"ne"];
        s+='<path class="fg-croix" d="M'+f(p[0]-.12)+' '+f(p[1]-.12)+' L'+f(p[0]+.12)+' '+f(p[1]+.12)+' M'+f(p[0]-.12)+' '+f(p[1]+.12)+' L'+f(p[0]+.12)+' '+f(p[1]-.12)+'"/>';
        if(e.nom)s+='<text class="fg-nom" x="'+f(p[0]+d[0])+'" y="'+f(p[1]+d[1])+'">'+e.nom+'</text>'}
      if(e.cote){var p0=e.cote[0],p1=e.cote[1],mi=[(p0[0]+p1[0])/2,(p0[1]+p1[1])/2],v=V(p0,p1),n=[v[1]/L(v),-v[0]/L(v)];
        if(e.centre&&(n[0]*(mi[0]-e.centre[0])+n[1]*(mi[1]-e.centre[1]))<0)n=[-n[0],-n[1]];
        s+='<text class="fg-cote" x="'+f(mi[0]+n[0]*.45)+'" y="'+f(mi[1]+n[1]*.45+.15)+'">'+e.t+'</text>'}
      if(e.droit){var S=e.droit[0],ua=V(S,e.droit[1]),ub=V(S,e.droit[2]),k=.32;ua=[ua[0]/L(ua)*k,ua[1]/L(ua)*k];ub=[ub[0]/L(ub)*k,ub[1]/L(ub)*k];
        s+='<path class="fg-code" d="M'+f(S[0]+ua[0])+' '+f(S[1]+ua[1])+' L'+f(S[0]+ua[0]+ub[0])+' '+f(S[1]+ua[1]+ub[1])+' L'+f(S[0]+ub[0])+' '+f(S[1]+ub[1])+'"/>'}
      if(e.egal){var q0=e.egal[0],q1=e.egal[1],c=[(q0[0]+q1[0])/2,(q0[1]+q1[1])/2],w=V(q0,q1),uu=[w[0]/L(w),w[1]/L(w)],nn=[-uu[1]*.18,uu[0]*.18],nb=e.n||1;
        for(var i=0;i<nb;i++){var o2=(i-(nb-1)/2)*.12,cc=[c[0]+uu[0]*o2,c[1]+uu[1]*o2];
          s+='<line class="fg-code" x1="'+f(cc[0]-nn[0])+'" y1="'+f(cc[1]-nn[1])+'" x2="'+f(cc[0]+nn[0])+'" y2="'+f(cc[1]+nn[1])+'"/>'}}
      if(e.texte)s+='<text class="fg-'+(e.cls||"cote")+'" x="'+f(e.texte[0])+'" y="'+f(e.texte[1])+'">'+e.t+'</text>';
    });
    return s+'</svg>';
  }
  // pavé de a × b × c petits cubes, en perspective cavalière (face avant a × c, dessus et côté droit)
  function cubes(a,b,c){
    var k=.5,dx=.55*k*1.6,dy=-.45*k*1.6,W=a+b*dx+.2,H=c-b*dy+.2,ox=.1,oy=-b*dy+.1,s=[];
    function P(x,y,z){return [ox+x+z*dx,oy+(c-y)+z*dy]}
    for(var i=0;i<a;i++)for(var j=0;j<c;j++)s.push({poly:[P(i,j,0),P(i+1,j,0),P(i+1,j+1,0),P(i,j+1,0)],plein:1});
    for(var i2=0;i2<a;i2++)for(var z=0;z<b;z++)s.push({poly:[P(i2,c,z),P(i2+1,c,z),P(i2+1,c,z+1),P(i2,c,z+1)],plein:1});
    for(var z2=0;z2<b;z2++)for(var j2=0;j2<c;j2++)s.push({poly:[P(a,j2,z2),P(a,j2,z2+1),P(a,j2+1,z2+1),P(a,j2+1,z2)],plein:1});
    return dessin(W,H,s,{px:30}).replace('class="fig figg"','class="fig figg fg-cubes"');
  }
  // Propositions « quel calcul ? » : la bonne + 5 fausses, sans doublon, et sans fausse qui donne par hasard le même
  // résultat (par exemple 4 × 4 pour le périmètre d'un carré de côté 4)
  function valeur(expr){
    try{return Function("return "+String(expr).replace(/×/g,"*").replace(/÷/g,"/").replace(/π/g,"Math.PI").replace(/(\d+)²/g,"($1*$1)").replace(/\s/g,""))()}catch(e){return NaN}
  }
  function qcm(h,bonne,bons,faux,combien){
    var v=valeur(bonne),vus={};bons.concat([bonne]).forEach(function(b){vus[b]=1});
    var f=h.melange(faux).filter(function(x){if(vus[x]||Math.abs(valeur(x)-v)<1e-9)return false;vus[x]=1;return true}).slice(0,combien||5);
    return h.melange([bonne].concat(f));
  }
  window.FIG={dessin:dessin,cubes:cubes,qcm:qcm,valeur:valeur};
})();

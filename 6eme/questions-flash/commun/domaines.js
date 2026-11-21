// ============================================================================
//  BADGES LÉGENDAIRES DES DOMAINES DE 6e
//  À charger après flash.js dans chaque chapitre d'un domaine : <script src="../commun/domaines.js"></script>
//  Le moteur ajoute alors tout seul le badge du domaine aux titres du chapitre (carte en haut de la page).
//  Un badge légendaire s'obtient quand on a TOUS les permis des chapitres du domaine. C'est un seul titre
//  (enregistré sous « Domaine … ») : il apparaît dans chaque chapitre du domaine, et il est donné (avec sa
//  célébration enflammée) dès que le dernier permis est obtenu, ou à l'ouverture d'un chapitre du domaine.
//  medaille : [texte du haut, texte de la bannière, symbole, "legende", teinte : "feu" | "plasma" | "emeraude"]
// ============================================================================
(function(){
  var DOMAINES=[
    { nom:"Légende des nombres", cle:"Domaine Nombres et calculs", medaille:["LÉGENDE","NOMBRES ET CALCULS","∑","legende","feu"],
      bravo:"Tu as tous les permis de Nombres et calculs !",
      permis:[["Nombres entiers","Permis entiers"],["Nombres décimaux","Permis décimaux"],["Comparer, ranger, encadrer","Permis comparer"],
              ["Addition et soustraction","Permis addition"],["Multiplication et division","Permis multiplication"],
              ["Multiplication et division","Permis division euclidienne"],["Multiplication et division","Permis division décimale"],
              ["Multiples et diviseurs","Permis diviseurs"],["Fractions","Permis fractions"],["Proportionnalité","Permis proportionnalité"],
              ["Pourcentages","Permis pourcentages"]] },
    { nom:"Légende de la géométrie", cle:"Domaine Géométrie", medaille:["LÉGENDE","GÉOMÉTRIE","△","legende","plasma"],
      bravo:"Tu as tous les permis de géométrie !",
      permis:[["Angles","Permis rapporteur"],["Droites, parallèles, perpendiculaires","Permis droites"],["Cercle","Permis cercle"],
              ["Triangles","Permis triangles"],["Quadrilatères","Permis quadrilatères"],["Symétrie axiale","Permis symétrie"]] },
    { nom:"Légende des mesures", cle:"Domaine Grandeurs et mesures", medaille:["LÉGENDE","GRANDEURS ET MESURES","m³","legende","emeraude"],
      bravo:"Tu as tous les permis de Grandeurs et mesures !",
      permis:[["Longueurs et périmètres","Permis longueurs"],["Aires","Permis aires"],["Volumes","Permis volumes"]] }
  ];
  function titresDe(chapitre){
    return DOMAINES.filter(function(d){return d.permis.some(function(p){return p[0]===chapitre})}).map(function(d){
      return { nom:d.nom, chapitre:d.cle, medaille:d.medaille, tampon:"Légendaire", bravo:d.bravo,
               condition:"Obtiens tous les permis du domaine ("+d.permis.length+") :",
               requiert:d.permis.map(function(p){return {chapitre:p[0],nom:p[1]}}) };
    });
  }
  window.DOMAINES_6E={liste:DOMAINES,titresDe:titresDe};
})();

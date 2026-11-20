// ============================================================================
//  QUESTIONS FLASH 6e : LISTE DES CHAPITRES
//  Le catalogue du site (index.html à la racine) lit ce fichier : quand on choisit le niveau 6eme,
//  chaque chapitre y apparaît sous forme de carte. (La page index.html de ce dossier le lit aussi.)
//   • dossier : nom du sous-dossier du chapitre (il contient son index.html)
//   • pret    : true quand le chapitre a des questions ; sinon la carte est grisée
//               « En préparation » (cliquable seulement avec ?brouillons dans l'adresse)
//   • themes  : (facultatif) thèmes du catalogue, déclarés dans SITE.themes de exercices.js
//  Pour changer l'ordre ou les domaines, il suffit de déplacer les lignes.
// ============================================================================
var CHAPITRES_6E = [
  { domaine: "Nombres et calculs", chapitres: [
    { titre: "Nombres entiers",                     dossier: "6qf-nombres-entiers",           pret: false },
    { titre: "Nombres décimaux",                    dossier: "6qf-nombres-decimaux",          pret: false },
    { titre: "Comparer, ranger, encadrer",          dossier: "6qf-comparer-ranger",           pret: false },
    { titre: "Addition et soustraction",            dossier: "6qf-addition-soustraction",     pret: false },
    { titre: "Multiplication",                      dossier: "6qf-multiplication",            pret: false },
    { titre: "Division euclidienne",                dossier: "6qf-division-euclidienne",      pret: false },
    { titre: "Division décimale",                   dossier: "6qf-division-decimale",         pret: false },
    { titre: "Multiples et diviseurs",              dossier: "6qf-multiples-diviseurs",       pret: false },
    { titre: "Fractions",                           dossier: "6qf-fractions",                 pret: true, themes: ["Fractions"] },
    { titre: "Proportionnalité",                    dossier: "6qf-proportionnalite",          pret: false },
    { titre: "Pourcentages",                        dossier: "6qf-pourcentages",              pret: false }
  ]},
  { domaine: "Espace et géométrie", chapitres: [
    { titre: "Droites, parallèles, perpendiculaires", dossier: "6qf-droites",                 pret: false },
    { titre: "Angles",                              dossier: "6qf-angles",                    pret: true, themes: ["Géométrie"] },
    { titre: "Cercle",                              dossier: "6qf-cercle",                    pret: false },
    { titre: "Triangles et quadrilatères",          dossier: "6qf-triangles-quadrilateres",   pret: false },
    { titre: "Symétrie axiale",                     dossier: "6qf-symetrie-axiale",           pret: false }
  ]},
  { domaine: "Grandeurs et mesures", chapitres: [
    { titre: "Longueurs et périmètres",             dossier: "6qf-longueurs-perimetres",      pret: false },
    { titre: "Aires",                               dossier: "6qf-aires",                     pret: false }
  ]},
  { domaine: "Organisation et gestion de données", chapitres: [
    { titre: "Tableaux et graphiques",              dossier: "6qf-tableaux-graphiques",       pret: false }
  ]}
];

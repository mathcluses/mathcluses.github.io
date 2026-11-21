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
    { titre: "Nombres entiers",                     dossier: "6qf-nombres-entiers",           pret: true },
    { titre: "Nombres décimaux",                    dossier: "6qf-nombres-decimaux",          pret: true },
    { titre: "Comparer, ranger, encadrer",          dossier: "6qf-comparer-ranger",           pret: true },
    // Les 4 opérations sont en 2 chapitres : Addition et soustraction ; Multiplication et division (multiplication,
    // division euclidienne, division décimale). Les dossiers 6qf-multiplication (modèle de mode d'emploi),
    // 6qf-division-euclidienne et 6qf-division-decimale ne sont plus dans le catalogue.
    { titre: "Addition et soustraction",            dossier: "6qf-addition-soustraction",     pret: true },
    { titre: "Multiplication et division",          dossier: "6qf-multiplication-division",   pret: true },
    { titre: "Multiples et diviseurs",              dossier: "6qf-multiples-diviseurs",       pret: true },
    { titre: "Fractions",                           dossier: "6qf-fractions",                 pret: true, themes: ["Fractions"] },
    { titre: "Proportionnalité",                    dossier: "6qf-proportionnalite",          pret: true },
    { titre: "Pourcentages",                        dossier: "6qf-pourcentages",              pret: true }
  ]},
  { domaine: "Espace et géométrie", chapitres: [
    { titre: "Droites, parallèles, perpendiculaires", dossier: "6qf-droites",                 pret: true, themes: ["Géométrie"] },
    { titre: "Angles",                              dossier: "6qf-angles",                    pret: true, themes: ["Géométrie"] },
    { titre: "Cercle",                              dossier: "6qf-cercle",                    pret: true, themes: ["Géométrie"] },
    // Triangles et quadrilatères sont deux chapitres (le dossier 6qf-triangles-quadrilateres n'est plus utilisé)
    { titre: "Triangles",                           dossier: "6qf-triangles",                 pret: true, themes: ["Géométrie"] },
    { titre: "Quadrilatères",                       dossier: "6qf-quadrilateres",             pret: true, themes: ["Géométrie"] },
    { titre: "Symétrie axiale",                     dossier: "6qf-symetrie-axiale",           pret: true, themes: ["Géométrie"] }
  ]},
  { domaine: "Grandeurs et mesures", chapitres: [
    { titre: "Longueurs et périmètres",             dossier: "6qf-longueurs-perimetres",      pret: true },
    { titre: "Aires",                               dossier: "6qf-aires",                     pret: true },
    { titre: "Volumes",                             dossier: "6qf-volumes",                   pret: true }
  ]},
  { domaine: "Organisation et gestion de données", chapitres: [
    { titre: "Tableaux et graphiques",              dossier: "6qf-tableaux-graphiques",       pret: true }
  ]}
];

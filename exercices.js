// ============================================================================
//  LISTE DES EXERCICES DU SITE
//  C'est le seul fichier à modifier pour ajouter, retirer ou classer un exercice.
//  La page d'accueil (index.html) lit ce fichier et construit le catalogue.
// ============================================================================
//
//  ATTENTION À LA SYNTAXE (une erreur ici fait disparaître tout le catalogue) :
//   • les textes sont entre guillemets droits "…" ; pour une apostrophe, écrire ’ (pas ')
//   • les listes sont entre crochets [ ] avec des virgules entre les éléments
//   • une virgule après chaque exercice { … }, sauf (au choix) après le dernier
//   • si le catalogue est vide ou affiche une erreur : touche F12 dans le navigateur
//     pour voir la ligne fautive
// ============================================================================


// ----- RÉGLAGES GÉNÉRAUX ----------------------------------------------------
var SITE = {
  titre: "Exercices de mathématiques",
  intro: "Choisis un niveau et un thème, puis un exercice.",

  // Ordre d'affichage des boutons de filtre. Seuls les niveaux et thèmes utilisés par
  // au moins un exercice sont affichés. Pour créer un nouveau niveau ou thème :
  // l'ajouter ici (à la place voulue), puis l'utiliser dans les exercices.
  niveaux: ["6eme", "5eme", "4eme", "3eme"],
  themes: [
    "Nombres relatifs",
    "Fractions",
    "Puissances",
    "Notation scientifique",
    "Géométrie"
  ]
};


// ----- LES EXERCICES --------------------------------------------------------
//  Modèle à copier-coller pour un nouvel exercice :
//
//  {
//    titre: "Titre de l’exercice",
//    description: "Une phrase qui dit ce qu’on y travaille.",   // facultatif (non affiché sur les cartes)
//    niveaux: ["4eme"],                    // un ou plusieurs niveaux (déclarés dans SITE.niveaux)
//    themes: ["Fractions"],              // un ou plusieurs thèmes (déclarés dans SITE.themes)
//    format: "Séries de 10 questions",   // facultatif (non affiché sur les cartes)
//    url: "4eme/exerciseurs/4exo-nom-du-dossier/index.html",   // chemin du fichier de l’exerciseur
//    brouillon: true                     // facultatif : masque l’exercice (visible avec ?brouillons dans l’adresse)
//  },
//
var EXERCICES = [

  {
    titre: "3eme Exerciseurs : relatifs, fractions, puissances",
    description: "Séries de 10 questions avec correction détaillée, ou parcours en 20 étapes où chaque type de calcul doit être réussi avant de passer au suivant.",
    niveaux: ["3eme"],
    themes: ["Fractions", "Puissances"],
    format: "Séries de 10 questions · Mode progression",
    url: "3eme/exerciseurs/3exo-relatifs-fractions-puissances/index.html"
  },

  {
    titre: "5eme Exerciseurs : additions et soustractions de relatifs",
    description: "Additions, soustractions et mélanges de 4 à 7 nombres relatifs, avec options écriture simplifiée et nombres décimaux.",
    niveaux: ["5eme"],
    themes: ["Nombres relatifs"],
    format: "Séries de 10 questions",
    url: "5eme/exerciseurs/5exo-relatifs-additions-soustractions/index.html"
  }

];

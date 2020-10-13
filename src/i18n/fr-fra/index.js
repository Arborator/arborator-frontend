export default {
  failed: "L'action a échoué",
  success: "Action réussie",
  oops: "Une erreur s'est produite : ",
  error403: "Halte ! Vous n'avez pas la permission pour cette action.",
  error401: "Halte ! Veuillez vous connecter pour effectuer de telles actions.",
  error404page: "Hum! Il n'y a rien ici...",
  welcomeback: "Re !",
  loginbtn: "Connecter",
  loginselector: "Se connecter via",
  settings: "Paramètres",
  admin: "Admin",
  fullscreen: "Plein écran",
  footer: ["Fait avec", "in", "at"], // reaaallllll basic one, not good enough but still buggy using span and html parse
  navhome: "Accueil",
  navprojects: "Projets",
  navsettings: "Paramètres",

  // first page (the index)
  homepage: {
    accessTreebankBtn: "Accéder aux corpus arborés",
    slogan: "L'annotation de Treebank à échelle humaine",
    features: [
      "Annotez et partagez vos corpus arborés",
      "Requêtez et recherchez en utilisant des grammaires à la pointe",
      "Libre et Open Source",
      "Gérez vos équipes et les accès à vos projets",
    ],
    scroll: "Plus d'infos en bas",
    arboheadline: "Annotation collaborative avec Arborator",
    grewheadline: "Grammaire de Graphes par Grew",
    descriptionCard: {
      title: "Un outil d'annotation collaboratif pour corpus arborés",
      subtitle:
        "Une interface graphique facile d'utilisation rendant l'annotation plus attrayante.",
      content: [
        "Tirez l'arc d'un mot vers un autre pour les lier par une relation de dépendance. Cliquez sur un mot pour changer ses caractéristiques. Choisissez les mots à transformer en token. Les jeux d'étiquettes de dépendance et de caractéristiques sont personnalisables. Une préconfiguration est déjà en place pour",
        "et",
      ],
      tooltipSud:
        "SUD: Le surface-syntactic, version distribuées des Universal Dependencies",
      tooltipUd:
        "Universal Dependencies:  amazing collaborative treebank annotation project providing 150 treebanks in 90 languages",
    },
    grewCard: {
      title: "Requêtez à l'aide d'une puissance grammaire de graphes",
      subtitle:
        "Modifiez les résultats de la recherche directement dans l'interface",
      content: [
        "A good treebank is a lot about curation, about finding the problems and correcting them coherently. With Arborator-Grew, there is no more back and forth between different websites or twisting your mind with complex greps in CoNLL files. Well, you got to learn the",
        "syntax, but that's a breeze with all the great examples and tutorials provided.",
      ],
      content: [
        "L'assainissement, les vérifications et la résolution de problèmes sont les ingrédients d'un bon corpus arboré. Avec Arborator-Grew il n'est plus nécessaire de jongler entre plusieurs outils pour constituer ou corriger un corpus arboré, tout est présent en un outil collaboratif qui accepte plusieurs formats de fichiers CoNLL ! Le moteur de recherche utilise la syntaxe",
        "simple à apprendre et à manipuler et qui a fait ses preuves grâce aux multiples tutoriels.",
      ],
      tooltipGrew: "La grammaire de graphes Grew.",
    },
    collaborativeCard: {
      title: "Together with others you can build beautiful treebanks",
      subtitle: "Social login makes Arborator-Grew a hazzle free tool",
      content: [
        "You control who accesses your annotation projetct, and no annotator can destroy other trees than their owns.",
        "Push the CoNLL data onto your GitHub project and share your beautiful trees from there.",
        "Essayez le dans le",
      ],
      playgroundBtn: "terrain de jeu",
    },
    sourceCard: {
      title: "Code source",
      content: [
        "Direction github",
        "pour parcourir le code.",
        "Aidez la science en nous donnant vos retours à partir de",
        "la page d'issues d'Arborator.",
        "Un guide d'installation et d'utilisation d'Arborator-Grew est à venir sous peu.",
      ],
      tooltipGit: "Notre page GitHub",
    },
    storyCard: {
      title: "Our story",
      subtitle:
        "Arborator-Grew combines the features of two preexisting tools: Arborator and Grew.",
      content: [
        "Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version,",
        ", where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks.",
      ],
    },
    citeCard: {
      title: "Citez-nous !",
    },
    toolsCard: {
      title: "Autres outils Arborator",
      content: [
        "Pour visualiser rapidement votre fichier CoNLL cliquez ici:",
        "Libre accès !",
        "Visualiseur de fichiers CoNLL",
        "Édition graphique rapide de fichiers CoNLL:",
        "Èditeur de fichiers CoNLL",
        "La version historique d'Arborator est toujours utilisable ici",
      ],
    },
  },

  // list of projects page
  projectHub: {
    tooltipCreaProject: "Créer un nouveau projet",
    tooltipChangeView: "Changer l'affichage",
    title: "Projets",
    samples: "échantillon(s)",
    rightClickSettings: "Paramètres",
    rightClickDelete: "Supprimer",
  },

  // page when you enter a project ( samples info, etc)
  projectView: {
    tooltipSettings: "Modifier les paramètres du projet",
    tooltipViewAdmin: "Voir les informations de l'administrateur",
    nodata: [
      "Oups! Il n'y a rien à afficher...",
      "Aucun n'échantillon n'est présent. Ce projet est vide, veuillez téléverser des fichiers conll.",
      "Demandez à l'administrateur du projet d'ajouter des fichiers",
    ],
    tooltipAddSample: "Ajouter un échantillon (fichier CoNLL)",
    tooltipExportSample: [
      "Sélectionnez les échantillons à exporter",
      "Exporter les échantillons sélectionnés",
    ],
    tooltipDeleteSample: [
      "Sélectionnez les échantillons à supprimer",
      "Supprimer les échantillons sélectionnés",
    ],
    tooltipGitPush: [
      "Pousser seulement mes arbres des échantillons sélectionnés",
      "Pousser mes plus récents arbres des échantillons sélectionnés",
      "Pousser les arbres les plus récents",
      "Pousser tous les abres des échantillons sélectionnés",
      "Sélectionner les échantillons à engager (commit) et à pousser sur GitHub",
      "Engager et pousser sur GitHub les échantillons sélectionnés",
    ],
    gitPullUser:
      "Replace my trees from the selected samples with the ones from GitHub",
    gitPullAll:
      "Replace all trees from the selected samples with the ones from GitHub",
    tooltipGitPullSelect: [
      "Select the samples you want to update from your GitHub folder",
      "Pull data from your GitHub folder onto the selected samples",
    ],
    tooltipSearch: "Search a sample",
    tooltipSelectVisible: "Select visible columns",
    tooltipFullscreen: "Fullscreen table",
    tooltipFabGrew: "Search with Grew in the whole project",
    tooltipFabGrewUser: "View only my trees",
    tooltipFabGrewUserRecent:
      "View my trees, filled up with the most recent trees",
    tooltipFabGrewRecent: "View most recent trees",
    tooltipFabGrewAll: "View all trees",
    tooltipRelationTable: "Get Relation Tables",
    tooltipWindows: ["Minimize", "Maximize", "Close"],
    uploadSelectDial: "Select one or multiple conll files",
    projectInfoDial: {
      title: "Project Information",
      ifAdmin:
        "Contact these project administrators if you need access or further information:",
      else:
        "Contact the project administrator if you need access or further information:",
    },
    tooltipExportLexicon: ['exporter en tsv', 'exporter en json'],
    tooltipRuleGrewLexicon : 'Obtenir les règles de Grew pour toutes les modifications apportées',
    tooltipValidatorLexicon: 'Importer le validateur pour comparer',
    tooltipSelectValidator: 'Selectionner un fichier au format tsv'
  },

  // dialog window which displays create project card
  createProjectCard: {
    exerciseMode: "Mode exercice",
  },

  // window which displays project settings
  projectSettings: {
    title: "Settings",
    windowClose: "Close",
    descriptionSave: "save description",
    togglePrivate: "Visibility",
    togglePrivateCaption:
      "Private projects restrain access and annotation, Visible projects restrain only annotation and Open projects allow anyone to view and contribute their annotation",
    toggleAllVisible: "All trees visible",
    toggleAllVisibleCaption:
      "If true, annotators will be able to see others' trees",
    toggleExerciseMode: "Exercise mode",
    toggleExerciseModeCaption:
      "if true, the project has exercise mode properties",
    toggleOpenProject: "Open project",
    toggleOpenProjectCaption: "If true, anyone can edit samples",
    defaultUserTreePanel: "Default User Tree",
    adminsPanel: "Admins",
    guestsPanel: "Guests",
    shownFeaturesPanel: "Shown Features",
    shownFeaturesTokens: "Choose the features to be shown under each token",
    shownFeaturesSentences:
      "Choose the features to be shown under each sentence",
    annotationSettingsInput: "Annotation settings",
    annotationSettingsSave: "save annotation settings",
    checkAnnotation: "This looks like reasonable Json",
  },
};

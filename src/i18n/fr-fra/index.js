export default {
  failed: "L'action a échoué",
  success: 'Action réussie',
  oops: "Une erreur s'est produite : ",
  error403: "Halte ! Vous n'avez pas la permission pour cette action.",
  error401: 'Halte ! Veuillez vous connecter pour effectuer de telles actions.',
  error404page: "Hum! Il n'y a rien ici...",
  welcomeback: 'Re !',
  loginbtn: 'Connecter',
  loginselector: 'Se connecter via',
  settings: 'Paramètres',
  admin: 'Admin',
  fullscreen: 'Plein écran',
  footer: ['Fait avec', 'in', 'at'], // reaaallllll basic one, not good enough but still buggy using span and html parse
  navhome: 'Accueil',
  navprojects: 'Projets',
  navsettings: 'Paramètres',

  // first page (the index)
  homepage: {
    accessTreebankBtn: 'Accéder aux corpus',
    slogan: 'Treebank Annotation for Human Beings',
    descriptionCard: {
      title: 'A collaborative annotation tool for treebank development',
      subtitle: "An easy to use graphic annotation interface makes it annotation the best part of a linguist's day.",
      content: [
        'Just drag a word on the other to make a dependency relation. Just click on a word to change its features. Just choose the words to make them tokens. The dependency set, the tagset, and the feature set are fully configurable. We provide ready-made configurations for',
        'and'
      ],
      tooltipSud: 'SUD: The surface-syntactic, distribution-based version of Universal Dependencies',
      tooltipUd: 'Universal Dependencies: The amazing collaborative treebank annotation project providing 150 treebanks in 90 languages'
    },
    grewCard: {
      title: 'Search with a powerful graph grammar',
      subtitle: 'Modify the search results directly in the Web interface',
      content: [
        "A good treebank is a lot about curation, about finding the problems and correcting them coherently. With Arborator-Grew, there is no more back and forth between different websites or twisting your mind with complex greps in CoNLL files. Well, you got to learn the",
        "syntax, but that's a breeze with all the great examples and tutorials provided."
      ],
      tooltipGrew: 'The grew graph grammar'
    },
    collaborativeCard: {
      title: 'Together with others you can build beautiful treebanks',
      subtitle: 'Social login makes Arborator-Grew a hazzle free tool',
      content: [
        'You control who accesses your annotation projetct, and no annotator can destroy other trees than their owns.',
        'Push the CoNLL data onto your GitHub project and share your beautiful trees from there.',
        'Try it all out on our'
      ],
      playgroundBtn: 'Playground'
    },
    sourceCard: {
      title: 'Source code and access to this Web page are completely free',
      subtitle: 'as in free beer and as in in free speech',
      content: [
        'Head over to', 
        'to have a look and grab the code.', 
        'Get involved give us feedback on the', 
        'issue page of this Arborator front-end', 
        'A guide to install Arborator-Grew on your own server will be provided here shortly...'
      ],
      tooltipGit: 'our GitHub page'
    },
    storyCard: {
      title: 'Our story',
      subtitle: 'Arborator-Grew combines the features of two preexisting tools: Arborator and Grew.',
      content: [
        "Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version,", 
        ", where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks."
      ]
    },
    citeCard: {
      title: 'Cite us if you use this',
      subtitle: 'And good things will happen'
    },
    toolsCard: {
      title: 'Some other tools',
      subtitle: 'in the Arborator series',
      content: [
        'If you just want to look at a CoNLL file quickly, check out this:',
        'No login!',
        'Fast CoNLL files viewer',
        'For quick graphical modification of a CoNLL file:',
        'CoNLL files graphical editor',
        'The legacy Arborator is still running here'
      ]
    }
  },

  // list of projects page
  projectHub: {
    tooltipCreaProject: 'Créer un nouveau projet',
    tooltipChangeView: "Changer l'affichage",
    title: 'Projets',
    samples: 'échantillon(s)',
    rightClickSettings: 'Paramètres',
    rightClickDelete: 'Supprimer'
  },

  // page when you enter a project ( samples info, etc)
  projectView: {
    tooltipSettings: 'Modifier les paramètres du projet',
    tooltipViewAdmin: "Voir les informations de l'administrateur",
    nodata: [
      "Oups! Il n'y a rien à afficher...",
      "Aucun n'échantillon n'est présent. Ce projet est vide, veuillez téléverser des fichiers conll.",
      "Demandez à l'administrateur du projet d'ajouter des fichiers"
    ],
    tooltipAddSample: "Ajouter un échantillon (fichier CoNLL)",
    tooltipExportSample: [
      'Sélectionnez les échantillons à exporter',
      'Exporter les échantillons sélectionnés'
    ],
    tooltipDeleteSample: [
      'Sélectionnez les échantillons à supprimer',
      'Supprimer les échantillons sélectionnés'
    ],
    tooltipGitPush: [
      'Pousser seulement mes arbres des échantillons sélectionnés',
      'Pousser mes plus récents arbres des échantillons sélectionnés',
      'Pousser les arbres les plus récents',
      'Pousser tous les abres des échantillons sélectionnés',
      'Sélectionner les échantillons à engager (commit) et à pousser sur GitHub',
      'Engager et pousser sur GitHub les échantillons sélectionnés'
    ],
    gitPullUser: 'Replace my trees from the selected samples with the ones from GitHub',
    gitPullAll: 'Replace all trees from the selected samples with the ones from GitHub',
    tooltipGitPullSelect: [
      'Select the samples you want to update from your GitHub folder',
      'Pull data from your GitHub folder onto the selected samples'
    ],
    tooltipSearch: 'Search a sample',
    tooltipSelectVisible: 'Select visible columns',
    tooltipFullscreen: 'Fullscreen table',
    tooltipFabGrew: 'Search with Grew in the whole project',
    tooltipFabGrewUser: 'View only my trees',
    tooltipFabGrewUserRecent: 'View my trees, filled up with the most recent trees',
    tooltipFabGrewRecent: 'View most recent trees',
    tooltipFabGrewAll: 'View all trees',
    tooltipRelationTable: 'Get Relation Tables',
    tooltipWindows: ['Minimize', 'Maximize', 'Close'],
    uploadSelectDial: 'Select one or multiple conll files',
    projectInfoDial: {
      title: 'Project Information',
      ifAdmin: 'Contact these project administrators if you need access or further information:',
      else: 'Contact the project administrator if you need access or further information:'
    }
  },

  // window which displays project settings
  projectSettings: {
    title: 'Settings',
    windowClose: 'Close',
    descriptionSave: 'save description',
    togglePrivate: 'Visibility',
    togglePrivateCaption: 'Private projects restrain access and annotation, Visible projects restrain only annotation and Open projects allow anyone to view and contribute their annotation' ,
    toggleAllVisible: 'All trees visible',
    toggleAllVisibleCaption: "If true, annotators will be able to see others' trees",
    toggleOpenProject: 'Open project',
    toggleOpenProjectCaption: 'If true, anyone can edit samples',
    defaultUserTreePanel: 'Default User Tree',
    adminsPanel: 'Admins',
    guestsPanel: 'Guests',
    shownFeaturesPanel: 'Shown Features', 
    shownFeaturesTokens: 'Choose the features to be shown under each token',
    shownFeaturesSentences: 'Choose the features to be shown under each sentence',
    annotationSettingsInput: 'Annotation settings',
    annotationSettingsSave: 'save annotation settings',
    checkAnnotation: 'This looks like reasonable Json'
  }

}

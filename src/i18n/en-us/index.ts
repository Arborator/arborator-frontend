// updated by https://github.com/emmettstr
export default {
  failed: 'Action failed',
  success: 'Action successful',
  oops: 'Something went wrong: ',
  error403: 'Hey you! You do not have the permissions for this action. Please contact the administrator.',
  error401: 'Hey you! Please log in to do any further actions of that type.',
  error404page: "Doh! There's nothing here...",
  welcomeback: 'Welcome back to Arborator!',
  loginbtn: 'Log in',
  loginselector: 'Connect via',
  settings: 'Settings',
  admin: 'Admin',
  fullscreen: 'Fullscreen',
  navhome: 'Home',
  navprojects: 'Projects',
  navsettings: 'Settings',
  navklang: 'Klang',

  // confirm action dialog
  confirmAction: {
    title: 'Are you sure?',
    message: 'You are about to perform an irrevocable action. Do you really want to proceed?'
  },

  // first page (the index)
  homepage: {
    accessTreebankBtn: 'Access Treebanks',
    slogan: 'Treebank Annotation for Human Beings',
    features: [
      'Annotate and Share your Treebanks',
      'Query and Search using State-of-the-art Grammars',
      'Free and Open Source',
      'Team up and Manage Access to your Projects',
    ],
    scroll: 'Scroll down to see more',
    arboheadline: "Arborator's Collaborative Annotation",
    grewheadline: "Grew's Graph Grammar",
    descriptionCard: {
      title: 'A collaborative annotation tool for treebank development',
      subtitle: "An easy to use graphic annotation interface makes it annotation the best part of a linguist's day.",
      content: [
        'Just drag a word on the other to make a dependency relation. Just click on a word to change its features. Just choose the words to make them tokens. The dependency set, the tagset, and the feature set are fully configurable. We provide ready-made configurations for',
        'and',
      ],
      tooltipSud: 'SUD: The surface-syntactic, distribution-based version of Universal Dependencies',
      tooltipUd: 'Universal Dependencies: The amazing collaborative treebank annotation project providing 150 treebanks in 90 languages',
    },
    grewCard: {
      title: 'Search with a powerful graph grammar',
      subtitle: 'Modify the search results directly in the Web interface',
      content: [
        'A good treebank is a lot about curation, about finding the problems and correcting them coherently. With Arborator-Grew, there is no more back and forth between different websites or twisting your mind with complex greps in CoNLL files. Well, you got to learn the',
        "syntax, but that's a breeze with all the great examples and tutorials provided.",
      ],
      tooltipGrew: 'The grew graph grammar',
    },
    collaborativeCard: {
      title: 'Together with others you can build beautiful treebanks',
      subtitle: 'Social login makes Arborator-Grew a hazzle free tool',
      content: [
        'You control who accesses your annotation projetct, and no annotator can destroy other trees than their owns.',
        'Push the CoNLL data onto your GitHub project and share your beautiful trees from there.',
        'Try it all out on our',
      ],
      playgroundBtn: 'Playground',
    },
    sourceCard: {
      title: 'Source code',
      content: [
        'Head over to',
        'to have a look and grab the code.',
        'Get involved and give us feedback on the',
        'issue page of this Arborator front-end',
        'A guide to install Arborator-Grew on your own server will be provided here shortly...',
      ],
      tooltipGit: 'our GitHub page',
    },
    storyCard: {
      title: 'Our story',
      subtitle: 'Arborator-Grew combines the features of two preexisting tools: Arborator and Grew.',
      content: [
        'Arborator is a widely used collaborative graphical online dependency treebank annotation tool. Grew is a tool for graph querying and rewriting specialized in structures needed in NLP, i.e. syntactic and semantic dependency trees and graphs. Grew also has an online version,',
        ", where all Universal Dependencies treebanks in their classical, deep and surface-syntactic flavors can be queried. Arborator-Grew is a complete redevelopment and modernization of Arborator, replacing its own internal database storage by a new Grew API, which adds a powerful query tool to Arborator's existing treebank creation and correction features. This includes complex access control for parallel expert and crowd-sourced annotation, tree comparison visualization, and various exercise modes for teaching and training of annotators. Arborator-Grew opens up new paths of collectively creating, updating, maintaining, and curating syntactic treebanks and semantic graph banks.",
      ],
    },
    citeCard: {
      title: 'Cite us',
    },
    toolsCard: {
      title: 'Other Arborator tools',
      content: [
        'If you just want to look at a CoNLL file quickly, check out this:',
        'No login!',
        'Fast CoNLL files viewer',
        'For quick graphical modification of a CoNLL file:',
        'CoNLL files graphical editor',
        'The legacy Arborator is still running here',
      ],
    },
    footertextmadewith: 'Made with',
    footertextin: 'in', // reaaallllll basic one, not good enough but still buggy using span and html parse
  },

  // list of projects page
  projectHub: {
    tooltipCreaProject: 'Create a new project',
    tooltipChangeView: 'Change view',
    tooltipRightClickDelete: 'Right click to delete',
    title: 'Projects',
    sample: 'sample',
    samples: 'samples',
    rightClickSettings: 'Settings',
    rightClickDelete: 'Delete',
    emptySearch: 'Search for project',
    myProjects: 'My Projects',
    myOldProjects: 'My Project Purgatory',
    myOldProjectInfo:
      'These old projects have not been used for a long time. We might delete them anytime. Use them or download the data and erase the project (right click).',
    otherProjects: 'Other Projects',
    otherOldProjects: 'The Project Purgatory',
    otherOldProjectInfo: 'These old projects have not been used for a long time. We may delete them at any time. Use them or notify the creators.',
    lastAccess: 'last access',
    lastWriteAccess: 'last modification',
    longtime: 'a long time ago',
  },

  // page when you enter a project ( samples info, etc)
  projectView: {
    tooltipSettings: 'Modify project settings',
    tooltipViewAdmin: 'View administrator information',
    nodata: [
      'Oops! No data to display...',
      'No sample yet. This project is empty, please upload some conll files.',
      'Ask an administrator to add files',
    ],
    tooltipAddSample: 'Add CoNLL files as new samples',
    tooltipExportSample: ['Select the samples you want to export', 'Export selected samples'],
    tooltipDeleteSample: ['Select the samples you want to delete', 'Delete selected samples'],
    tooltipParser: [
      'Select samples to train a parser',
      'train with the selected samples',
      'Click to set the parameters for parser',
      'Click to interrupt parsing',
    ],
    tooltipGitPush: [
      'Push only my trees of the selected samples',
      'Push my trees of the selected samples, filled up with the most recent trees',
      'Push the most recent trees',
      'Push all trees of the selected samples',
      'Select the samples you want to commit and push to GitHub',
      'Commit and push the selected samples to GitHub',
    ],
    gitPullUser: 'Replace my trees from the selected samples with the ones from GitHub',
    gitPullAll: 'Replace all trees from the selected samples with the ones from GitHub',
    tooltipGitPullSelect: [
      'Select the samples you want to update from your GitHub folder',
      'Pull data from your GitHub folder onto the selected samples',
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
      else: 'Contact the project administrator if you need access or further information:',
    },
    tooltipExportLexicon: ['export to tsv', 'export to json'],
    tooltipRuleGrewLexicon: 'get the rules grew for all modifications',
    tooltipValidatorLexicon: 'Import validator to compare',
    tooltipSelectValidator: 'Select a file in tsv format',
  },

  // dialog window which displays create project card
  createProjectCard: {
    exerciseMode: 'exercise mode',
  },

  // window which displays project settings
  projectSettings: {
    title: 'Settings',
    windowClose: 'Close',
    descriptionSave: 'save description',
    togglePrivate: 'Visibility',
    togglePrivateCaption:
      'Private projects restrain access and annotation, Visible projects restrain only annotation and Open projects allow anyone to view and contribute their annotation',
    toggleAllVisible: 'All trees visible',
    toggleAllVisibleCaption: "If true, annotators will be able to see others' trees",
    toggleExerciseMode: 'Exercise mode',
    toggleExerciseModeCaption: 'if true, the project has exercise mode properties',
    toggleDiffMode: 'Diff mode',
    toggleDiffModeCaption: 'if true, the project has diff mode properties',
    chooseUserDiff: 'Diff user',
    chooseUserDiffCaption: 'user that will be used as reference for the comparaison',
    toggleOpenProject: 'Open project',
    toggleOpenProjectCaption: 'If true, anyone can edit samples',
    defaultUserTreePanel: 'Default User Tree',
    adminsPanel: 'Admins',
    guestsPanel: 'Annotators and other guests',
    shownFeaturesPanel: 'Shown Features',
    shownFeaturesTokens: 'Choose the features to be shown under each token',
    shownFeaturesSentences: 'Choose the features to be shown under each sentence',
    annotationSettingsInput: 'Annotation settings',
    annotationSettingsSave: 'save annotation settings',
    checkAnnotation: 'This looks like reasonable Json',
  },
  // Klang
  Klang: {
    projects: 'Klang Projects',
  },
};

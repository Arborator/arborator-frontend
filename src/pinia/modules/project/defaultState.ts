import { annotationFeatures_t } from 'src/api/backend-types';

// default config state
import languages from '../../../assets/languoid.json';

interface configState {
  name: string;
  admins: string[];
  validators: string[];
  annotators: string[];
  guests: string[];
  visibility: number;
  description: string;
  image: string;
  imageTree: string;
  blindAnnotationMode: boolean;
  freezed: boolean;
  config: string;
  language: string;
  languageDetected: boolean;
  diffMode: boolean;
  diffUserId: string;
  collaborativeMode: boolean;
  reloadProjects: boolean;
  reloadSamples: boolean;
  shownFeatures: string[];
  shownMeta: string[];
  annotationFeatures: annotationFeatures_t;
  languagesList: { index: number; name: string }[];
  invalidProjectError: boolean,
  tab: string,
}

export default function defaultState(): configState {
  return {
    name: '',
    admins: [],
    validators: [],
    annotators: [],
    guests: [],
    visibility: 2,
    description: '',
    image: '',
    imageTree: '/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg',
    blindAnnotationMode: false,
    freezed: false,
    config: '',
    language: '',
    languageDetected: false,
    diffMode: false,
    diffUserId: '',
    collaborativeMode: true,
    reloadProjects: false,
    reloadSamples: false,
    shownFeatures: ['FORM', 'UPOS', 'LEMMA', 'MISC.Gloss'],
    shownMeta: ['text_en'],
    languagesList: languages,
    annotationFeatures: {} as annotationFeatures_t,
    invalidProjectError: false,
    tab: 'samples',
  };
}

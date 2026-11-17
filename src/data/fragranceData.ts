import { FragranceProduct, ReviewItem, SocialCard, JournalArticle } from '../types';

// Asset references matching generated Formula 1 toy car & diecast model images
export const IMAGES = {
  hero: '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg',
  heroArchitecturalOriginal: '/src/assets/images/hero_f1_diecast_studio_1794664768996.jpg',
  purePortionsBottle: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
  purePortionsIngredients: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
  products: {
    purePortions: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
    rose01: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
    vanilla01: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
    genesisLeo: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
    venena: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
    asdaafRaneen: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  },
  campaigns: {
    forHim: '/src/assets/images/campaign_f1_pro_118_1794664772367.jpg',
    forHer: '/src/assets/images/campaign_f1_display_143_1794664770809.jpg',
  },
  seasons: {
    autumnDune: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
    winterStreet: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
    summerRoses: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
    springForest: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  },
  studio: {
    travertine: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
    handDecant: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
    goldFlacon: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
    amberMist: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  },
  articles: {
    buyersGuide: '/src/assets/images/workshop_f1_pit_bench_1794664770942.jpg',
    perfumeRoses: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
    lilacPricing: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  },
};

// Live catalog comes from fetchPublicProducts(); kept empty so backend integration stays authoritative
export const NEW_ARRIVALS: FragranceProduct[] = [];

export const BRANDS_LIST = [
  { name: 'BBURAGO', isNew: true },
  { name: 'MINICHAMPS', isNew: false },
  { name: 'SPARK MODEL', isNew: true },
  { name: 'MAISTO TECH', isNew: false },
  { name: 'RASTAR RC', isNew: true },
  { name: 'SOLIDO', isNew: false },
  { name: 'AUTOART', isNew: false },
  { name: 'KYOSHO', isNew: false },
  { name: 'LOOKSMART', isNew: false },
  { name: 'AMALGAM', isNew: false },
  { name: 'GT SPIRIT', isNew: false },
];

export const REVIEWS_LIST: ReviewItem[] = [
  {
    id: 'rev-1',
    quote: 'The 1:18 alloy finish and Pirelli slicks look unreal on my desk.',
    content:
      'Picked up the 1:18 carbon edition and the front wing detail, suspension arms, and crisp sponsor decals exceeded expectations. Arrived foam-cradled with zero wing damage.',
    author: 'Tahmidur Rahman',
    rating: 5,
    verified: true,
  },
  {
    id: 'rev-2',
    quote: 'Best F1 toy & model shop in the city. Zero compromises.',
    content:
      'Ordered a pair of 1:43 display cars in acrylic cases plus a 2.4GHz RC F1 racer for my nephew. The alloy paintwork is flawless and the RC steering responds instantaneously.',
    author: 'Jubayer Islam Bhuiyan',
    rating: 5,
    verified: true,
  },
  {
    id: 'rev-3',
    quote: 'Incredible range of scales and team liveries.',
    content:
      'Everything from pocket 1:64 racers to heavyweight 1:18 diecast builds is authentic and cleanly packed. Customer support helped me pick matching Ferrari and Red Bull display sets.',
    author: 'Faiyaz Masud',
    rating: 5,
    verified: true,
  },
  {
    id: 'rev-4',
    quote: 'Bulletproof packaging for delicate front wings.',
    content:
      'Usually online toy sellers ship models loose, but Apex Paddock double-boxed my 1:18 car with corner guards. Straight onto my shelf in mint collector condition.',
    author: 'Samiul Masuk Dihan',
    rating: 5,
    verified: true,
  },
];

export const SOCIAL_CARDS: SocialCard[] = [
  {
    id: 'soc-1',
    handle: '@apexpaddock',
    image: '/src/assets/images/series_f1_night_aero_1794664771085.jpg',
    likes: 418,
    comments: 19,
    tag: 'NIGHT CIRCUIT SPEC',
  },
  {
    id: 'soc-2',
    handle: '@apexpaddock',
    image: '/src/assets/images/series_f1_classic_red_1794664772823.jpg',
    likes: 362,
    comments: 14,
    tag: '1990S HERITAGE RED',
  },
  {
    id: 'soc-3',
    handle: '@apexpaddock',
    image: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
    likes: 289,
    comments: 11,
    tag: '1:18 CARBON AERO',
  },
  {
    id: 'soc-4',
    handle: '@apexpaddock',
    image: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
    likes: 312,
    comments: 23,
    tag: '2.4GHZ RC SPRINT',
  },
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'art-1',
    date: 'FEB 01, 2026',
    publisher: 'APEX PADDOCK',
    title: '1:18 vs 1:43 Scale: Choosing Your First F1 Grid',
    description:
      'Read this before starting your diecast shelf. From 31cm centerpiece alloy builds with steerable wheels to compact acrylic-cased 1:43 grid lineups...',
    image: '/src/assets/images/workshop_f1_pit_bench_1794664770942.jpg',
  },
  {
    id: 'art-2',
    date: 'FEB 01, 2026',
    publisher: 'APEX PADDOCK',
    title: 'Diecast Alloy vs 2.4GHz RC: Display Or Track Speed?',
    description:
      'Static collector models prioritize microscopic aero winglets and tampo decals, while RC F1 toy cars feature impact-resilient polymers and proportional throttle.',
    image: '/src/assets/images/series_f1_carbon_stealth_1794664773109.jpg',
  },
  {
    id: 'art-3',
    date: 'FEB 01, 2026',
    publisher: 'APEX PADDOCK',
    title: 'Inside Every Box: Rubber Compounds, Wings & Tampos',
    description:
      'Why collector diecast pricing varies across tooling generations—comparing zinc alloy density, pad-printed liveries, and licensed Pirelli-style rubber compounds.',
    image: '/src/assets/images/series_f1_rc_sprint_1794664772832.jpg',
  },
];

export const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'What is the difference between 1:18, 1:43, and 1:64 scale F1 toy cars?',
    answer:
      '1:18 models measure roughly 30–31 cm long with heavy zinc-alloy bodies, steerable front wheels, and cockpit harness detail. 1:43 models (around 13 cm) come mounted on collector bases with clear acrylic covers, while 1:64 models (about 8 cm) are compact pocket racers ideal for desktop grids and kids.',
  },
  {
    id: 'faq-2',
    question: 'Are these models for display or active racing play?',
    answer:
      'We carry both. Our 2.4GHz RC F1 toy cars and 1:64 pull-back editions are built with crash-resilient ABS wings for high-speed floor racing, while our 1:18 and 1:43 diecast replicas are precision-cast for shelf display.',
  },
  {
    id: 'faq-3',
    question: 'Are the team liveries and race numbers officially licensed?',
    answer:
      'Yes. Every scale model and RC racer is sourced directly from authorized motorsport toy and diecast manufacturers including Bburago, Minichamps, Spark, Solido, and Rastar with authentic sponsor and driver markings.',
  },
  {
    id: 'faq-4',
    question: 'What is the shipping cost?',
    answer:
      'Standard door-to-door delivery inside Dhaka is BDT 70, and nationwide outside Dhaka is BDT 130. Orders above BDT 3,000 qualify for free wing-protected express shipping.',
  },
  {
    id: 'faq-5',
    question: 'How do you protect delicate front and rear wings in transit?',
    answer:
      'Every car is checked at our pit garage before dispatch and shipped inside multi-layer foam cradles and reinforced outer cartons. Delivery takes 1–2 days inside Dhaka and 2–4 days nationwide.',
  },
];

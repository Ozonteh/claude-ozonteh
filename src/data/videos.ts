// Video-urile BULL de pe canalul YouTube Ozonteh (filmate de echipa Ozonteh, în limba română).
// Se afișează înaintea clipurilor oficiale BULL din products.json. Când apar clipuri noi pe canal,
// adăugați-le aici (id YouTube, data publicării, durata ISO 8601) — VideoObject se generează automat.
import type { Lang } from '../i18n/routes';

export type ChannelVideo = {
  id: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  uploadDate: string;
  duration: string;
  format: 'video' | 'short';
  product?: string;
  poster?: string;
};

export const ozontehVideos: ChannelVideo[] = [
  {
    id: 'FtM1nI-YGjU',
    title: { ro: 'Ozonteh este dealer oficial BULL în Moldova', ru: 'Ozonteh — официальный дилер BULL в Молдове' },
    description: {
      ro: 'Buldoexcavatoare, încărcătoare multifuncționale, atașamente și piese de schimb BULL, cu service Ozonteh în Moldova.',
      ru: 'Экскаваторы-погрузчики, многофункциональные погрузчики, навесное оборудование и запчасти BULL с сервисом Ozonteh в Молдове.',
    },
    uploadDate: '2026-03-17',
    duration: 'PT1M31S',
    format: 'video',
    poster: 'video/video-ozonteh-dealer-oficial-bull-moldova.webp',
  },
  {
    id: 'tyFDVK73byY',
    title: { ro: 'Buldoexcavatorul BULL de 100 CP', ru: 'Экскаватор-погрузчик BULL 100 л.с.' },
    description: {
      ro: 'Buldoexcavatorul BULL de 100 CP cu motor Perkins, filmat de echipa Ozonteh.',
      ru: 'Экскаватор-погрузчик BULL 100 л.с. с двигателем Perkins, снятый командой Ozonteh.',
    },
    uploadDate: '2026-01-16',
    duration: 'PT1M31S',
    format: 'video',
    product: 'bull-hd-100',
    poster: 'video/video-buldoexcavator-bull-hd100-ozonteh.webp',
  },
  {
    id: 'HgDJ6PmjghU',
    title: { ro: 'Noul miniîncărcător BULL AV490', ru: 'Новый мини-погрузчик BULL AV490' },
    description: {
      ro: 'Miniîncărcătorul skid steer BULL AV490, disponibil prin Ozonteh în Moldova.',
      ru: 'Мини-погрузчик BULL AV490, доступный в Молдове через Ozonteh.',
    },
    uploadDate: '2026-01-15',
    duration: 'PT1M',
    format: 'video',
    product: 'bull-av490',
    poster: 'video/video-miniincarcator-bull-av490-ozonteh.webp',
  },
  {
    id: 'zIWOgi8mmsk',
    title: {
      ro: 'Reprezentanții BULL Machines în vizită la sediul Ozonteh',
      ru: 'Представители BULL Machines в гостях у Ozonteh',
    },
    description: {
      ro: 'Vizita delegației BULL Machines la sediul Ozonteh din Strășeni, 11 septembrie 2026.',
      ru: 'Визит делегации BULL Machines в офис Ozonteh в Страшенах, 11 сентября 2026 года.',
    },
    uploadDate: '2026-09-11',
    duration: 'PT28S',
    format: 'video',
    poster: 'video/video-vizita-bull-machines-ozonteh-straseni.webp',
  },
  {
    id: '63dShRAGAH4',
    title: { ro: 'BULL HD 100 în acțiune pe șantier', ru: 'BULL HD 100 в работе на объекте' },
    description: { ro: 'BULL HD 100 pe șantier (YouTube Shorts).', ru: 'BULL HD 100 на объекте (YouTube Shorts).' },
    uploadDate: '2026-08-07',
    duration: 'PT1M30S',
    format: 'short',
    product: 'bull-hd-100',
    poster: 'video/video-buldoexcavator-bull-hd100-short-santier.webp',
  },
  {
    id: 'ZSgCwa84b0c',
    title: { ro: 'BULL 100 CP: forță și dotări complete', ru: 'BULL 100 л.с.: мощность и полное оснащение' },
    description: { ro: 'Buldoexcavatorul BULL de 100 CP (YouTube Shorts).', ru: 'Экскаватор-погрузчик BULL 100 л.с. (YouTube Shorts).' },
    uploadDate: '2026-01-15',
    duration: 'PT1M29S',
    format: 'short',
    product: 'bull-hd-100',
    poster: 'video/video-buldoexcavator-bull-hd100-short-dotari.webp',
  },
  {
    id: 'gsxGqn3Y77s',
    title: { ro: 'Noul BULL AV490, acum oficial în Moldova', ru: 'Новый BULL AV490 — теперь официально в Молдове' },
    description: { ro: 'Miniîncărcătorul BULL AV490 (YouTube Shorts).', ru: 'Мини-погрузчик BULL AV490 (YouTube Shorts).' },
    uploadDate: '2026-01-14',
    duration: 'PT1M',
    format: 'short',
    product: 'bull-av490',
    poster: 'video/video-miniincarcator-bull-av490-short.webp',
  },
];

/** Clipurile afișate pe pagina Acasă (secțiunea „BULL în acțiune”). */
export const FEATURED_VIDEOS = ['FtM1nI-YGjU', 'tyFDVK73byY', 'HgDJ6PmjghU'];

export const getVideo = (id: string) => ozontehVideos.find((v) => v.id === id);
/** Clipurile Ozonteh pentru un model (primele afișate pe pagina de produs). */
export const videosForProduct = (productId: string) => ozontehVideos.filter((v) => v.product === productId);

/** Un clip afișat pe pagina de produs (Ozonteh sau BULL Machines), cu poster auto-găzduit. */
export type VideoItem = {
  id: string;
  title: string;
  description: string;
  poster: string;
  short: boolean;
  source: 'ozonteh' | 'bull';
  uploadDate: string | null;
  duration?: string;
};

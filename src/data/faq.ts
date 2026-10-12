// FAQ general (Anexa D). Întrebările marcate `draft` nu se afișează și nu intră în schema FAQPage
// până nu sunt completate de echipa Ozonteh.
import type { Lang } from '../i18n/routes';

type QA = { q: Record<Lang, string>; a: Record<Lang, string>; draft?: boolean };

export const generalFaq: QA[] = [
  {
    q: { ro: 'Ozonteh este distribuitor oficial BULL?', ru: 'Ozonteh — официальный дистрибьютор BULL?' },
    a: {
      ro: 'Da. Ozonteh Impex SRL este distribuitorul oficial BULL Machines în Republica Moldova. Utilajele vin direct de la producător, cu garanție și documente oficiale.',
      ru: 'Да. Ozonteh Impex SRL — официальный дистрибьютор BULL Machines в Республике Молдова. Техника поставляется напрямую от производителя, с гарантией и официальными документами.',
    },
  },
  {
    q: { ro: 'Asigurați service și piese de schimb?', ru: 'Вы обеспечиваете сервис и запчасти?' },
    a: {
      ro: 'Da, prin service-ul Ozonteh din Strășeni și filiala din Bălți, în garanție și post-garanție. Pentru piese de schimb sună la 069 898 822.',
      ru: 'Да, через сервис Ozonteh в Страшенах и филиал в Бельцах, на гарантии и после неё. По запчастям звоните: 069 898 822.',
    },
  },
  {
    q: { ro: 'Pot vedea utilajul în lucru înainte de cumpărare?', ru: 'Можно увидеть технику в работе до покупки?' },
    a: {
      ro: 'Da. Programează o demonstrație din formular (bifează „Vreau demonstrație”) sau sună la 069 898 307 și stabilim ziua.',
      ru: 'Да. Запишитесь на демонстрацию через форму (отметьте «Хочу демонстрацию») или позвоните по номеру 069 898 307, и мы согласуем день.',
    },
  },
  {
    q: { ro: 'Ce garanție oferiți?', ru: 'Какая гарантия?' },
    a: {
      ro: 'Garanție de 1 an pentru fiecare utilaj BULL, cu posibilitate de extindere până la 3 ani.',
      ru: 'Гарантия 1 год на каждую машину BULL с возможностью продления до 3 лет.',
    },
  },
  {
    // TODO Ozonteh: completați cu partenerii de leasing, apoi ștergeți `draft`.
    draft: true,
    q: { ro: 'Se poate cumpăra în leasing sau în rate?', ru: 'Можно купить в лизинг или в рассрочку?' },
    a: { ro: '[de completat cu partenerii de leasing]', ru: '[заполнить после согласования с лизинговыми партнёрами]' },
  },
  {
    q: { ro: 'Ce diferență este între un buldoexcavator și un skid steer?', ru: 'Чем экскаватор-погрузчик отличается от мини-погрузчика?' },
    a: {
      ro: 'Buldoexcavatorul sapă și încarcă: e potrivit pentru șanțuri, fundații și rețele. Skid steer-ul este compact și agil, potrivit pentru spații înguste, curățenie, manipulare și amenajări, și poate folosi multe atașamente.',
      ru: 'Экскаватор-погрузчик и копает, и грузит: подходит для траншей, фундаментов и инженерных сетей. Мини-погрузчик компактный и манёвренный: подходит для стеснённых мест, уборки, перевалки и благоустройства и работает с множеством навесных орудий.',
    },
  },
];

export const publishedFaq = (lang: Lang) =>
  generalFaq.filter((x) => !x.draft).map((x) => ({ q: x.q[lang], a: x.a[lang] }));

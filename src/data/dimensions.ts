// Denumirile cotelor din desenele tehnice BULL (products.json → drawing.views[].dims).
// Fiecare cotă: [literă din desen, tip, valoare, valoare cu braț extensibil?]. Unghiurile sunt în grade.
import type { Lang } from '../i18n/routes';

type L = Record<Lang, string>;

export const DIMENSIONS: Record<string, { label: L; angle?: boolean }> = {
  digDepth: { label: { ro: 'Adâncime maximă de săpare', ru: 'Макс. глубина копания' } },
  reachRearAxle: { label: { ro: 'Rază la sol, de la axul roților spate', ru: 'Вылет на уровне земли от оси задних колёс' } },
  reachSlew: { label: { ro: 'Rază la sol, de la axa de rotire', ru: 'Вылет на уровне земли от оси поворота' } },
  reachTop: { label: { ro: 'Rază la înălțime maximă', ru: 'Вылет на максимальной высоте' } },
  workHeight: { label: { ro: 'Înălțime maximă de lucru', ru: 'Макс. рабочая высота' } },
  loadOverExc: { label: { ro: 'Înălțime maximă de încărcare (excavator)', ru: 'Макс. высота погрузки (экскаватор)' } },
  bucketRotation: { label: { ro: 'Unghi de rotire a cupei', ru: 'Угол поворота ковша' }, angle: true },
  pinHeight: { label: { ro: 'Înălțimea bolțului cupei', ru: 'Высота шарнира ковша' } },
  dumpHeight: { label: { ro: 'Înălțime de descărcare', ru: 'Высота разгрузки' } },
  loadOver: { label: { ro: 'Înălțime de încărcare peste margine', ru: 'Высота погрузки через борт' } },
  reachGround: { label: { ro: 'Rază la sol (încărcător)', ru: 'Вылет на уровне земли (погрузчик)' } },
  rollback: { label: { ro: 'Unghi de închidere a cupei la sol', ru: 'Угол запрокидывания ковша у земли' }, angle: true },
  rollbackTop: { label: { ro: 'Unghi de închidere la înălțime maximă', ru: 'Угол запрокидывания на макс. высоте' }, angle: true },
  dumpAngle: { label: { ro: 'Unghi de descărcare', ru: 'Угол разгрузки' }, angle: true },
  dumpReach: { label: { ro: 'Rază de descărcare', ru: 'Вылет при разгрузке' } },
  digBelow: { label: { ro: 'Săpare sub nivelul solului (încărcător)', ru: 'Копание ниже уровня земли (погрузчик)' } },
  departure: { label: { ro: 'Unghi de degajare spate', ru: 'Задний угол съезда' }, angle: true },
  length: { label: { ro: 'Lungime totală', ru: 'Общая длина' } },
  lengthNoAtt: { label: { ro: 'Lungime fără atașament', ru: 'Длина без навесного оборудования' } },
  wheelbase: { label: { ro: 'Ampatament', ru: 'Колёсная база' } },
  totalHeight: { label: { ro: 'Înălțime totală', ru: 'Общая высота' } },
  cabHeight: { label: { ro: 'Înălțime până la cabină', ru: 'Высота по кабине' } },
  bonnetHeight: { label: { ro: 'Înălțime până la capotă', ru: 'Высота по капоту' } },
  heightToBucket: { label: { ro: 'Înălțime până la cupă', ru: 'Высота до ковша' } },
  groundClearance: { label: { ro: 'Gardă la sol', ru: 'Дорожный просвет' } },
  slewClearance: { label: { ro: 'Gardă la sol sub mecanismul de rotire', ru: 'Просвет под механизмом поворота' } },
  trackRear: { label: { ro: 'Ecartament spate', ru: 'Колея задних колёс' } },
  trackFront: { label: { ro: 'Ecartament față', ru: 'Колея передних колёс' } },
  track: { label: { ro: 'Ecartament', ru: 'Колея' } },
  bucketWidth: { label: { ro: 'Lățime peste cupă', ru: 'Ширина по ковшу' } },
  widthTyres: { label: { ro: 'Lățime peste anvelope', ru: 'Ширина по шинам' } },
  sideReach: { label: { ro: 'Rază laterală, de la axa utilajului', ru: 'Боковой вылет от оси машины' } },
  kingpost: { label: { ro: 'Deplasare laterală a coloanei excavatorului', ru: 'Боковое смещение колонны экскаватора' } },
  turnRadius: { label: { ro: 'Rază de întoarcere cu cupă', ru: 'Радиус разворота с ковшом' } },
};

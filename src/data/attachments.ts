// Cele 19 cupe și atașamente din Anexa B. `image` = fișier din src/assets/bull/atasamente/;
// `drawing` = desen schematic SVG (pentru atașamentele fără fotografie publică BULL).
import type { Lang } from '../i18n/routes';

export type Attachment = {
  id: string;
  image?: string;
  drawing?: 'ditch' | 'squarecut' | 'breaker' | 'ripper';
  for: ('backhoe' | 'loader' | 'skid')[];
  name: Record<Lang, string>;
  text: Record<Lang, string>;
};

export const attachments: Attachment[] = [
  {
    id: 'cupa-standard-gp',
    image: 'atasamente/cupa-standard-gp.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă standard GP', ru: 'Стандартный ковш GP' },
    text: {
      ro: 'Cupa de bază a încărcătorului pentru pământ, nisip, pietriș și alte materiale vrac.',
      ru: 'Базовый ковш погрузчика для грунта, песка, щебня и других сыпучих материалов.',
    },
  },
  {
    id: 'cupa-6-in-1',
    image: 'atasamente/cupa-6-in-1.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă 6 în 1', ru: 'Ковш 6 в 1' },
    text: {
      ro: 'Cupă cu falcă: încarcă, nivelează, apucă, împinge, sapă și descarcă. Șase funcții într-o singură cupă.',
      ru: 'Челюстной ковш: грузит, планирует, захватывает, толкает, копает и выгружает. Шесть функций в одном ковше.',
    },
  },
  {
    id: 'cupa-booster',
    image: 'atasamente/cupa-booster-descarcare-inalta.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă booster (descărcare înaltă)', ru: 'Ковш Booster (высокая выгрузка)' },
    text: {
      ro: 'Ridică punctul de descărcare la aproape 4 m, pentru camioane cu oblon înalt și buncăre.',
      ru: 'Поднимает точку выгрузки почти до 4 м: для высоких бортов самосвалов и бункеров.',
    },
  },
  {
    id: 'cupa-hd-hv',
    image: 'atasamente/cupa-hd-hv-volum-mare.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă HD/HV (volum mare)', ru: 'Ковш HD/HV (увеличенный объём)' },
    text: {
      ro: 'Construcție întărită și volum mărit, pentru încărcare rapidă a materialelor vrac ușoare.',
      ru: 'Усиленная конструкция и увеличенный объём для быстрой погрузки лёгких сыпучих материалов.',
    },
  },
  {
    id: 'cupa-hvg',
    image: 'atasamente/cupa-hvg-cu-gheara.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă HVG', ru: 'Ковш HVG' },
    text: {
      ro: 'Cupă de volum mare cu gheară hidraulică: prinde și transportă resturi vegetale, gunoi și materiale voluminoase.',
      ru: 'Ковш большого объёма с гидравлическим прижимом: захватывает растительные остатки, мусор и объёмные материалы.',
    },
  },
  {
    id: 'cupa-pentru-piatra',
    image: 'atasamente/cupa-pentru-piatra.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă pentru piatră', ru: 'Скальный ковш' },
    text: {
      ro: 'Cupă cu dinți tip grătar: separă pietrele de pământ și încarcă blocuri fără material fin.',
      ru: 'Ковш с решётчатыми зубьями: отделяет камни от грунта и грузит крупные блоки без мелочи.',
    },
  },
  {
    id: 'cupa-trapezoidala',
    image: 'atasamente/cupa-trapezoidala-sant.webp',
    for: ['backhoe'],
    name: { ro: 'Cupă trapezoidală (trench)', ru: 'Трапецеидальный ковш' },
    text: {
      ro: 'Sapă șanțuri cu profil trapezoidal pentru canale de irigație și drenaj, dintr-o singură trecere.',
      ru: 'Копает траншеи трапецеидального профиля для ирригационных и дренажных каналов за один проход.',
    },
  },
  {
    id: 'cupa-excavator',
    image: 'atasamente/cupa-excavator.webp',
    for: ['backhoe'],
    name: { ro: 'Cupă de excavator', ru: 'Ковш экскаватора' },
    text: {
      ro: 'Cupa brațului de săpare, în mai multe lățimi (0,10–0,31 m³), pentru șanțuri, fundații și rețele.',
      ru: 'Ковш экскаваторной стрелы разной ширины (0,10–0,31 м³) для траншей, фундаментов и сетей.',
    },
  },
  {
    id: 'cupa-curatare-santuri',
    drawing: 'ditch',
    for: ['backhoe'],
    name: { ro: 'Cupă pentru curățarea șanțurilor', ru: 'Ковш для очистки канав' },
    text: {
      ro: 'Cupă lată, fără dinți, pentru curățarea și profilarea șanțurilor și a rigolelor de pe marginea drumurilor.',
      ru: 'Широкий ковш без зубьев для очистки и профилирования канав и придорожных кюветов.',
    },
  },
  {
    id: 'cupa-square-cut',
    drawing: 'squarecut',
    for: ['backhoe'],
    name: { ro: 'Cupă pătrată (Square Cut)', ru: 'Ковш Square Cut' },
    text: {
      ro: 'Taie pereți drepți la 90° în gropi de fundație, bazine și fose septice, fără finisare manuală.',
      ru: 'Оставляет ровные стенки под 90° в котлованах, резервуарах и септиках без ручной доводки.',
    },
  },
  {
    id: 'furca-cu-gheara',
    image: 'atasamente/furca-cu-gheara.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Furcă cu gheară', ru: 'Вилы с прижимом' },
    text: {
      ro: 'Prinde și ține sarcini neregulate: crengi, resturi de demolare, baloți, bușteni.',
      ru: 'Захватывает и удерживает грузы неправильной формы: ветки, строительный мусор, тюки, брёвна.',
    },
  },
  {
    id: 'furca-pentru-bustean',
    image: 'atasamente/furca-pentru-bustean.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Furcă pentru buștean', ru: 'Захват для брёвен' },
    text: {
      ro: 'Manipulează bușteni și țevi; ghearele țin sarcina strâns în timpul transportului.',
      ru: 'Для брёвен и труб: прижимы надёжно удерживают груз при перемещении.',
    },
  },
  {
    id: 'furca-stivuitor',
    image: 'atasamente/furca-stivuitor.webp',
    for: ['backhoe', 'loader', 'skid'],
    name: { ro: 'Furcă stivuitor', ru: 'Вилочный захват' },
    text: {
      ro: 'Transformă încărcătorul în stivuitor pentru paleți, materiale de construcții și saci big-bag.',
      ru: 'Превращает погрузчик в штабелёр для поддонов, стройматериалов и биг-бэгов.',
    },
  },
  {
    id: 'gheara-pentru-baloti',
    image: 'atasamente/gheara-pentru-baloti.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Gheară pentru baloți', ru: 'Захват для тюков' },
    text: {
      ro: 'Prinde baloții rotunzi sau paralelipipedici fără să-i deterioreze. Util în ferme și complexe agricole.',
      ru: 'Захватывает круглые и прямоугольные тюки, не повреждая их. Для ферм и агрокомплексов.',
    },
  },
  {
    id: 'cupa-cu-tavalug',
    image: 'atasamente/cupa-cu-tavalug-compactor.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Cupă cu tăvălug compactor', ru: 'Ковш с катком-уплотнителем' },
    text: {
      ro: 'Compactează pământul și pietrișul în tranșee și pe platforme mici, unde nu încape un compactor separat.',
      ru: 'Уплотняет грунт и щебень в траншеях и на небольших площадках, куда не пройдёт отдельный каток.',
    },
  },
  {
    id: 'lama-dozer',
    image: 'atasamente/lama-dozer.webp',
    for: ['backhoe', 'loader'],
    name: { ro: 'Lamă (dozer)', ru: 'Отвал (бульдозерный)' },
    text: {
      ro: 'Nivelează, împinge pământul și curăță zăpada de pe drumuri și platforme.',
      ru: 'Планирует, перемещает грунт и убирает снег с дорог и площадок.',
    },
  },
  {
    id: 'ciocan-hidraulic',
    drawing: 'breaker',
    for: ['backhoe', 'skid'],
    name: { ro: 'Ciocan hidraulic', ru: 'Гидромолот' },
    text: {
      ro: 'Sparge beton, asfalt și rocă. Se montează pe brațul de săpare, pentru demolări și lucrări în cariere.',
      ru: 'Разрушает бетон, асфальт и скальную породу. Монтируется на стрелу для демонтажа и работ в карьерах.',
    },
  },
  {
    id: 'dinte-ripper',
    drawing: 'ripper',
    for: ['backhoe'],
    name: { ro: 'Dinte ripper', ru: 'Рыхлитель (клык)' },
    text: {
      ro: 'Afânează solul înghețat, compact sau stâncos înainte de săpare.',
      ru: 'Рыхлит мёрзлый, плотный или скальный грунт перед копанием.',
    },
  },
  {
    id: 'incarcator-trestie',
    image: 'atasamente/incarcator-trestie.webp',
    for: ['loader'],
    name: { ro: 'Încărcător de trestie', ru: 'Захват для тростника' },
    text: {
      ro: 'Gheară pentru plante cu tulpină lungă. În Moldova se folosește rar, pentru stuf sau biomasă.',
      ru: 'Захват для длинностебельных культур. В Молдове применяется редко: для камыша или биомассы.',
    },
  },
];

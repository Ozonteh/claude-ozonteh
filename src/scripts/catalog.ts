// Catalog și categorii: filtrare pe tip, putere, tracțiune și greutate (fără reîncărcare, cu parametri în URL)
// și selecția „Compară" (max. 3 modele, păstrată în sesiune), care duce la comparator.
const KEY = 'bull-compare';
const MAX = 3;

/* ---------- Compară ---------- */
const boxes = [...document.querySelectorAll<HTMLInputElement>('[data-compare-id]')];
const tray = document.querySelector<HTMLElement>('[data-compare-tray]');
const read = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '[]').filter((x: unknown) => typeof x === 'string').slice(0, MAX);
  } catch {
    return [];
  }
};
const write = (ids: string[]) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* sesiune indisponibilă: selecția rămâne doar pe pagină */
  }
};
let selected = read();
const names = new Map(boxes.map((b) => [b.dataset.compareId!, b.dataset.compareName!]));

function render(msg = '') {
  boxes.forEach((b) => (b.checked = selected.includes(b.dataset.compareId!)));
  if (!tray) return;
  tray.hidden = selected.length === 0;
  tray.querySelector('[data-compare-count]')!.textContent = String(selected.length);
  const list = tray.querySelector('[data-compare-list]')!;
  list.replaceChildren(
    ...selected.map((id) => {
      const li = document.createElement('li');
      li.textContent = names.get(id) ?? id;
      return li;
    })
  );
  const go = tray.querySelector<HTMLAnchorElement>('[data-compare-go]')!;
  const base = go.getAttribute('href')!.split('?')[0];
  go.href = `${base}?m=${selected.join(',')}`;
  go.toggleAttribute('aria-disabled', selected.length < 2);
  const m = tray.querySelector<HTMLElement>('[data-compare-msg]')!;
  m.textContent = msg || (selected.length < 2 ? m.dataset.hint ?? '' : '');
}

boxes.forEach((b) =>
  b.addEventListener('change', () => {
    const id = b.dataset.compareId!;
    let msg = '';
    if (b.checked) {
      if (selected.length >= MAX) {
        b.checked = false;
        msg = tray?.querySelector<HTMLElement>('[data-compare-msg]')?.dataset.max ?? '';
      } else selected = [...selected, id];
    } else selected = selected.filter((x) => x !== id);
    write(selected);
    render(msg);
  })
);
tray?.querySelector('[data-compare-clear]')?.addEventListener('click', () => {
  selected = [];
  write(selected);
  render();
});
render();

/* ---------- Filtre ---------- */
const form = document.querySelector<HTMLFormElement>('[data-filters]');
const items = [...document.querySelectorAll<HTMLElement>('[data-item]')];
const count = document.querySelector<HTMLElement>('[data-count]');
const empty = document.querySelector<HTMLElement>('[data-empty]');
const PARAMS = ['tip', 'cp', 'tr', 'g'] as const;

function matches(el: HTMLElement, f: Record<string, string>) {
  const d = el.dataset;
  const hp = Number(d.hp);
  const kg = Number(d.weight || 0);
  if (f.tip && d.type !== f.tip) return false;
  if (f.cp === 'low' && hp > 80) return false;
  if (f.cp === 'high' && hp <= 80) return false;
  if (f.tr && !(d.drive ?? '').split(' ').includes(f.tr)) return false;
  if (f.g) {
    if (!kg) return false;
    if (f.g === 'light' && kg >= 5000) return false;
    if (f.g === 'mid' && (kg < 5000 || kg > 9000)) return false;
    if (f.g === 'heavy' && kg <= 9000) return false;
  }
  return true;
}

function apply(push = true) {
  if (!form) return;
  const fd = new FormData(form);
  const f = Object.fromEntries(PARAMS.map((k) => [k, String(fd.get(k) ?? '')]));
  let n = 0;
  for (const el of items) {
    const ok = matches(el, f);
    el.hidden = !ok;
    if (ok) n++;
  }
  if (count) count.textContent = (n === 1 ? count.dataset.one : count.dataset.many)!.replace('{n}', String(n));
  if (empty) empty.hidden = n > 0;
  if (push) {
    const url = new URL(location.href);
    PARAMS.forEach((k) => (f[k] ? url.searchParams.set(k, f[k]) : url.searchParams.delete(k)));
    history.replaceState(null, '', url);
  }
}

if (form) {
  // Panoul de filtre: închis pe mobil (modelele rămân în primul ecran), deschis pe desktop, unde stă în coloana din stânga.
  const panel = form.querySelector<HTMLDetailsElement>('[data-filters-panel]');
  const wide = matchMedia('(min-width: 64rem)');
  const syncPanel = () => panel && (panel.open = wide.matches || PARAMS.some((k) => new URLSearchParams(location.search).get(k)));
  syncPanel();
  wide.addEventListener('change', syncPanel);
  // Filtrele din URL (link partajat sau înapoi din pagina de produs).
  const params = new URLSearchParams(location.search);
  PARAMS.forEach((k) => {
    const v = params.get(k);
    if (!v) return;
    const input = form.querySelector<HTMLInputElement>(`input[name="${k}"][value="${CSS.escape(v)}"]`);
    if (input) input.checked = true;
  });
  form.addEventListener('change', () => apply());
  form.addEventListener('reset', () => requestAnimationFrame(() => apply()));
  apply(false);
}

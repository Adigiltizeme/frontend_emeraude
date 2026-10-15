/**
 * Contrôle de la visite guidée (lancé par `npm run build`) : chaque étape a ses textes en français et en anglais.
 * Les étapes « administration » viennent du menu du back-office (src/config/adminMenu.tsx) : une rubrique ajoutée
 * sans texte de visite fait échouer le build, au lieu d'afficher une clé brute au compte qui découvre la plateforme.
 */
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const menu = read('src/config/adminMenu.tsx');
const tour = read('src/components/billing/GuidedTour.tsx');
const keys = new Set([
  ...[...menu.matchAll(/\bkey: '([\w-]+)'/g)].map((m) => m[1]),
  ...[...tour.matchAll(/\{ key: '([\w-]+)', section:/g)].map((m) => m[1]),
]);
const menuItems = [...menu.matchAll(/\bpath: '\/admin[^']*'/g)].length;
const declared = [...menu.matchAll(/tour: (\{|null)/g)].length;

const errors = [];
if (declared < menuItems) errors.push(`config/adminMenu.tsx : ${menuItems - declared} rubrique(s) sans propriété « tour ».`);
for (const lang of ['fr', 'en']) {
  const steps = JSON.parse(read(`src/locales/${lang}/translation.json`).replace(/^﻿/, '')).tour?.steps ?? {};
  for (const key of keys) {
    if (!steps[key]?.title || !steps[key]?.text) errors.push(`${lang} : texte manquant pour l'étape « tour.steps.${key} » (title, text).`);
  }
}
if (errors.length) {
  console.error(`Visite guidée incomplète :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Visite guidée : ${keys.size} étapes, textes FR et EN présents.`);

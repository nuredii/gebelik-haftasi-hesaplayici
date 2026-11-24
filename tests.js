#!/usr/bin/env node
/*
 * Gebelik Haftası ve TDT Hesaplayıcı — tarih hesabı testleri
 * Çalıştırma:  node tests.js
 *
 * index.html içindeki <script id="gh-core"> bloğunu doğrudan okuyup test eder
 * (yani tarayıcıdaki kodun aynısı test edilir). Ardından aynı testleri farklı
 * saat dilimlerinde (TZ) yeniden çalıştırarak saat dilimi kaynaklı kayma olmadığını doğrular.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = /<script id="gh-core">([\s\S]*?)<\/script>/.exec(html);
if (!m) { console.error('gh-core betiği index.html içinde bulunamadı'); process.exit(1); }
const ctx = vm.createContext({});
vm.runInContext(m[1], ctx);
const GH = ctx.GH;

let pass = 0, fail = 0;
const failures = [];
function eq(actual, expected, name) {
  if (actual === expected) { pass++; }
  else { fail++; failures.push(`✗ ${name}\n    beklenen: ${expected}\n    bulunan : ${actual}`); }
}
function section(t) { if (!process.env.GH_QUIET) console.log('• ' + t); }

const P = GH.parseDate, F = GH.formatDate;
const edd = (s) => F(GH.eddFromLMP(P(s)));
const nae = (s) => F(GH.naegele(P(s)).edd);
const ga = (lmp, ref) => GH.formatGA(GH.gaFromLMP(P(lmp), P(ref)));
const gd = (w, d) => w * 7 + d;

/* ---------------------------------------------------------------- */
section('Tarih ayrıştırma / biçimlendirme');
eq(F(P('29.02.2024')), '29.02.2024', '29.02.2024 (artık yıl) geçerli');
eq(P('29.02.2023'), null, '29.02.2023 (artık yıl değil) geçersiz');
eq(P('29.02.2100'), null, '29.02.2100 (100\'e bölünür, 400\'e bölünmez) geçersiz');
eq(F(P('29.02.2000')), '29.02.2000', '29.02.2000 (400\'e bölünür) geçerli');
eq(P('31.04.2026'), null, '31.04.2026 geçersiz');
eq(P('32.01.2026'), null, '32.01.2026 geçersiz');
eq(P('00.01.2026'), null, '00.01.2026 geçersiz');
eq(P('15.13.2026'), null, '15.13.2026 geçersiz');
eq(F(P('2026-03-05')), '05.03.2026', 'ISO girişi GG.AA.YYYY\'ye çevrilir');
eq(F(P('5.3.2026')), '05.03.2026', 'tek haneli gün/ay kabul edilir');
eq(P('abc'), null, 'anlamsız metin geçersiz');
eq(GH.weekdayName(P('24.11.2026')), 'Salı', '24.11.2026 Salı');
eq(GH.weekdayName(P('01.01.2000')), 'Cumartesi', '01.01.2000 Cumartesi');

/* ---------------------------------------------------------------- */
section('SAT + 280 gün');
eq(edd('29.02.2024'), '05.12.2024', 'SAT 29 Şubat (artık yıl)');
eq(edd('31.01.2024'), '06.11.2024', 'SAT 31 Ocak, artık yıl Şubat\'ı içerir');
eq(edd('31.01.2023'), '07.11.2023', 'SAT 31 Ocak, normal yıl Şubat\'ı içerir');
eq(edd('01.06.2027'), '07.03.2028', 'TDT aralığı 29.02.2028\'i içerir');
eq(edd('01.06.2026'), '08.03.2027', 'aynı tarih, artık olmayan yıl (1 gün fark)');
eq(edd('25.12.2025'), '01.10.2026', 'SAT yıl sonunda');
eq(edd('01.04.2025'), '06.01.2026', 'TDT yıl geçişinde');
eq(edd('31.12.2025'), '07.10.2026', 'SAT 31 Aralık');
eq(edd('24.05.2026'), '28.02.2027', 'TDT Şubat sonuna denk gelir');
eq(edd('10.03.2026'), '15.12.2026', 'genel vaka');
eq(edd('29.03.2026'), '03.01.2027', 'Türkiye yaz saati geçişi (29.03.2026) etrafında');
eq(edd('25.10.2026'), '01.08.2027', 'kış saati geçişi etrafında');

/* ---------------------------------------------------------------- */
section('Gebelik haftası (hafta+gün)');
eq(ga('01.01.2026', '01.01.2026'), '0+0', 'aynı gün = 0+0');
eq(ga('01.01.2026', '07.01.2026'), '0+6', '6 gün = 0+6');
eq(ga('01.01.2026', '08.01.2026'), '1+0', '7 gün = 1+0');
eq(ga('01.01.2026', '15.06.2026'), '23+4', '165 gün = 23+4');
eq(ga('15.01.2026', '01.05.2026'), '15+1', '106 gün');
eq(ga('20.11.2025', '03.03.2026'), '14+5', 'yıl geçişli sayım');
eq(ga('01.02.2024', '01.03.2024'), '4+1', 'artık Şubat: 29 gün');
eq(ga('01.02.2023', '01.03.2023'), '4+0', 'normal Şubat: 28 gün');
eq(ga('29.02.2024', '05.12.2024'), '40+0', 'TDT gününde 40+0');
eq(GH.formatGA(GH.parseGA('24+3')), '24+3', 'parseGA "24+3"');
eq(GH.parseGA('24+7'), null, 'parseGA gün 7 geçersiz');
eq(GH.trimester(gd(13, 6)), 1, '13+6 → 1. trimester');
eq(GH.trimester(gd(14, 0)), 2, '14+0 → 2. trimester');
eq(GH.trimester(gd(27, 6)), 2, '27+6 → 2. trimester');
eq(GH.trimester(gd(28, 0)), 3, '28+0 → 3. trimester');

/* ---------------------------------------------------------------- */
section('Naegele kuralı');
eq(nae('29.02.2024'), '07.12.2024', 'SAT 29 Şubat → 07.12.2024 (280 gün: 05.12.2024, 2 gün fark)');
eq(GH.naegele(P('29.02.2024')).diff, 2, '29.02.2024 Naegele−280 = 2 gün');
eq(nae('31.01.2024'), '07.11.2024', 'SAT 31 Ocak 2024 (ay sonu +7 → Şubat)');
eq(GH.naegele(P('31.01.2024')).diff, 1, '31.01.2024 fark 1 gün');
eq(nae('31.01.2023'), '07.11.2023', 'SAT 31 Ocak 2023');
eq(GH.naegele(P('31.01.2023')).diff, 0, '31.01.2023 fark 0 gün');
eq(nae('05.04.2026'), '12.01.2027', 'SAT 05.04.2026 (yıl geçişi)');
eq(GH.naegele(P('05.04.2026')).diff, 2, '05.04.2026 fark 2 gün');
eq(nae('28.12.2025'), '04.10.2026', 'SAT 28.12.2025: +7 gün yıl değiştirir');
eq(F(GH.naegele(P('28.12.2025')).minus3), '04.10.2025', 'ara adım −3 ay önceki yıla döner');
eq(nae('25.12.2025'), '01.10.2026', 'SAT 25.12.2025');
eq(nae('24.05.2026'), '28.02.2027', 'SAT+7 = 31.05 → Şubat\'ta 31 yok, ay sonuna sabitlenir');
eq(GH.naegele(P('24.05.2026')).clamped, true, 'ay sonu sabitleme işaretlenir');
eq(nae('22.05.2027'), '29.02.2028', 'SAT+7 = 29.05.2027 → 29.02.2028 (artık yıl, sabitleme yok)');

/* ---------------------------------------------------------------- */
section('Alıştırma vakalarının cevap anahtarı');
const KEY = {
  1: '17.12.2026', 2: '02.06.2027', 3: '27.08.2027', 4: '15+1', 5: '26+6',
  6: '11+2', 7: '04.10.2026', 8: '07.03.2028', 9: '2 gün', 10: '2. trimester'
};
const fmt = (s) => s.kind === 'date' ? F(s.value) : s.kind === 'ga' ? GH.formatGA(s.value)
  : s.kind === 'days' ? s.value + ' gün' : s.value + '. trimester';
const types = {};
for (const c of GH.PRACTICE) {
  types[c.cat] = (types[c.cat] || 0) + 1;
  eq(fmt(GH.solvePractice(c)), KEY[c.id], `Vaka ${c.id} cevabı`);
}
eq(GH.PRACTICE.length, 10, '10 vaka');
eq(types['Naegele ile TDT'], 3, '3 Naegele TDT vakası');
eq(types['Gebelik haftası'], 3, '3 gebelik haftası vakası');
eq(types['Yıl geçişi'], 1, '1 yıl geçişi vakası');
eq(types['Artık yıl / Şubat sonu'], 1, '1 artık yıl vakası');
eq(types['Naegele ve 280 gün farkı'], 1, '1 Naegele–280 fark vakası');
eq(types['Trimester'], 1, '1 trimester vakası');
eq(GH.PRACTICE.every(c => c.lmp !== undefined), true, 'tüm vakalar SAT tabanlı');
eq(typeof GH.eddFromART + typeof GH.decideUSG, 'undefinedundefined', 'YÜT ve ultrason modülleri kaldırıldı');
{
  const n7 = GH.naegele(GH.PRACTICE[6].lmp);
  eq(GH.toYMD(n7.plus7).y !== GH.toYMD(GH.PRACTICE[6].lmp).y, true, 'Vaka 7: SAT + 7 gün yılı değiştirir');
  const w8 = GH.walk(GH.PRACTICE[7].lmp, GH.eddFromLMP(GH.PRACTICE[7].lmp));
  eq(w8.some(x => F(x.to) === '29.02.2028'), true, 'Vaka 8: sayım 29.02.2028\'den geçer');
  eq(GH.naegele(GH.PRACTICE[8].lmp).diff !== 0, true, 'Vaka 9: iki yöntem farklı sonuç verir');
  eq(F(GH.PRACTICE[9].ref), '28.06.2026', 'Vaka 10 tarihi 28.06.2026');
  eq(GH.formatGA(GH.gaFromLMP(GH.PRACTICE[9].lmp, GH.PRACTICE[9].ref)), '17+0', 'Vaka 10: 17+0, sınırlardan uzak');
}

/* ---------------------------------------------------------------- */
section('Kapsamlı tarama 1990–2060 (bağımsız Julian gün numarası ile karşılaştırma)');
function jdn(y, mo, d) { // Fliegel–Van Flandern, Date nesnesi kullanmaz
  const a = Math.floor((14 - mo) / 12), yy = y + 4800 - a, mm = mo + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
const J0 = jdn(1970, 1, 1);
let scanFail = 0, scanCount = 0;
const naeDist = {};
let minNae = Infinity, maxNae = -Infinity;
for (let y = 1990; y <= 2060; y++) {
  for (let mo = 1; mo <= 12; mo++) {
    for (let d = 1; d <= GH.daysInMonth(y, mo); d++) {
      scanCount++;
      const n = GH.fromYMD(y, mo, d);
      if (n !== jdn(y, mo, d) - J0) scanFail++;
      const t = GH.toYMD(n);
      if (t.y !== y || t.m !== mo || t.d !== d) scanFail++;
      if (GH.parseDate(GH.formatDate(n)) !== n) scanFail++;
      const e = GH.eddFromLMP(n);
      if (e - n !== 280) scanFail++;
      const w = GH.walk(n, e);
      if (w[w.length - 1].total !== 280 || w.reduce((s, x) => s + x.add, 0) !== 280) scanFail++;
      if (y <= 2058) {
        const nd = GH.naegele(n).diff;
        naeDist[nd] = (naeDist[nd] || 0) + 1;
        if (nd < minNae) minNae = nd;
        if (nd > maxNae) maxNae = nd;
      }
    }
  }
}
eq(scanFail, 0, `${scanCount} günün tamamı: gün numarası, gidiş-dönüş biçim, +280, takvim yürüyüşü`);
eq(minNae >= 0 && maxNae <= 3, true, `Naegele − 280 gün farkı 0–3 aralığında (bulunan: ${minNae}–${maxNae})`);

/* ---------------------------------------------------------------- */
const tz = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
if (failures.length) console.log('\n' + failures.join('\n'));
console.log(`\n[TZ=${tz}] ${pass} başarılı, ${fail} başarısız` + (process.env.GH_QUIET ? '' : `  · Naegele−280 fark dağılımı (gün: adet): ${JSON.stringify(naeDist)}`));

let exitCode = fail ? 1 : 0;
if (!process.env.GH_CHILD) {
  console.log('\nFarklı saat dilimlerinde yeniden çalıştırılıyor…');
  for (const zone of ['Europe/Istanbul', 'America/Los_Angeles', 'America/St_Johns', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Australia/Lord_Howe', 'UTC']) {
    const r = spawnSync(process.execPath, [__filename], { env: { ...process.env, TZ: zone, GH_CHILD: '1', GH_QUIET: '1' }, encoding: 'utf8' });
    process.stdout.write(r.stdout.trim().split('\n').filter(l => l.startsWith('[TZ') || l.startsWith('✗') || l.startsWith('    ')).join('\n') + '\n');
    if (r.status !== 0) exitCode = 1;
  }
  console.log(exitCode ? '\nSONUÇ: BAŞARISIZ' : '\nSONUÇ: Tüm testler tüm saat dilimlerinde başarılı.');
}
process.exit(exitCode);

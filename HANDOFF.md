# KockaLand (Kockázzunk) — átadó (HANDOFF)

Egyoldalas HTML játék (vanilla JS/CSS, magyar felület): fa dobókockás sorsoló témákkal, szerkeszthető könyvtárral és animált polcdíszekkel. Barátnőnek készül ajándékba.

## Gyors indulás
```
cd /home/claude/kockazzunk
NODE_PATH=/opt/npm-tools/node_modules node build.js     # src/* → dist/index.html (CSS+JS beágyazva)
```
Publikálás: Artifact eszköz, `file_path` = `dist/index.html`, **`url` = https://claude.ai/artifact/NrfUS3HYq9NG5ietvtecjL** (új munkamenetben előbb `action:read`). A MjaWwfEnKYSitkmHXx4pKj artifact duplikátum, a user kérésére törölhető.
Tesztek (Playwright, Chromium): `NODE_PATH=/opt/npm-tools/node_modules node test/<név>.test.js <kimenet-előtag>`; a teljes csomag: engine, lint, faces, editor, shelf, misc, mobile, nostorage, library, decor, decor2, decor3 — mind zöld legyen publikálás előtt. 3D-hez még: `decor3d` (11 típus modellje + kattintás-sorozat + szivárgás + lassúság-őr + beállítás-kapcsoló; ~5 perc), `lib3d` (3D Könyvtár: hover, kattintás, húzás, 2D tartalék, mobil; ~5 perc). Szoftveres GL-ben (nincs GPU) egy képkocka 150–450 ms, ezért a 3D tesztek lassúak; a `window.__L3_LOWQ=true` seed kell, a three-t a `test/vendor/three.min.js`-ből szolgáljuk (route). Gyors rész: `ONLY=macska node test/decor3d.test.js`.

## GitHub és projekt-név
- A projekt neve **KockaLand** (az oldal címe: Kockázzunk). Repo: **Ufmanitu/KockaLand** (`main`), oldal: https://ufmanitu.github.io/KockaLand/ (GitHub Pages a repó gyökeréből).
- A repó gyökerében lévő `index.html` a user élő oldala: **felülírni csak a user kérésére**. Az aktuális fejlesztői build a `latest/index.html` (`dist/standalone.html` másolata; elérhető: .../KockaLand/latest/).
- Munkamenetben: `add_repo` (access: push) → `git clone --depth 1 https://github.com/Ufmanitu/kockaland /home/claude/kockaland` → forrás szinkron (src/, test/ [vendor nélkül], build.js, *.md) → commit → push. A `dist/` és `test/vendor/` nincs a repóban: a tesztekhez `test/vendor/three.min.js` kell (három r128: `npm pack three@0.128.0`, a csomagból `build/three.min.js`).
- Az Artifact (privát előnézet): https://claude.ai/artifact/NrfUS3HYq9NG5ietvtecjL — ugyanabból a `dist/index.html`-ből.

## Szerkezet
- `src/engine.js` — DSL-parser + kényszer-megoldó (OFF módban 0 szabálysértés), rollOne kaszkád, címke-szótár, `*N` súly
- `src/data-*.js` — témák (randi, utazás, kaja, főzés, mozi + data-films, kézműves, könyv, meghitt); `data-base.js` = migráció (LEGACY aláírások, NEW_IN_V2)
- `src/core.js` — segédek (h(), ikonok, modal, toast, hang, tárolás `kockazzunk.v1`, KZ1 export/import)
- `src/play.js` — Dobás nézet (3D kockák, zár, eredmények); `editor.js` — Szerkesztő; `shelf.js` — Könyvtár/Szerkesztés fül + import/export
- `src/library.js` + `library-ui.js` — polcok (S.shelves), gerincek, megjelenés-szerkesztő, pointer-alapú húzás, Shift+nyíl
- `src/decor.js` — díszek keretrendszere; `decor-*.js` — az egyes díszek; `css/decor.css`, `css/decor2.css`
- **3D Könyvtár** (Three.js r128, lusta betöltés jsdelivr-ről; 2D a tartalék: nincs WebGL / Kímélő mód / `S.settings.view3d===false` / script-hiba / context lost):
  `src/lib3d.js` (központ: színtér, szekrény, könyvek, fény-árnyék, fix viewport-canvas `#l3` scissorral, hover/kattintás/húzás raycast-tal, `.lb-sp` láthatatlan gombréteg billentyűzethez, `l3Anim`/`l3Seq` tween, `l3Idle`, lassúság-őr `l3Perf`/`l3PerfEval`), `lib3d-sdf.js` (SDF-szobrászat: `sdSph/sdEll/sdCone/smin/smax`, `sdfGeo` Surface Nets + csúcsszín, `l3Skin` pikkely/szemcse bump, `l3TubeGeo/Set`), `lib3d-kit.js` (kTex/kSvgPlane/kLight/kBead/kVinyl/kRoot/kLookVec…), díszek: `lib3d-dragon.js` (sárkány-fej+farok), `lib3d-lamps.js` (lámpás, 2 üvegablak), `lib3d-nook.js`, `lib3d-pets.js` (szellem, kis sárkány+felhő), `lib3d-pets2.js` (macska, bagoly, pozsgás).
- `src/misc.js` — napló, súgó, beállítások, túra; `src/app.js` — boot, router (#dobas|#szerkeszto|#polc|#naplo|#sugo)

## Díszek (S.decor)
- `S.decor=[{id:'d_…',type,link?,off?}]`; az id a polc `ids` tömbjében él a könyvekkel együtt (húzható, Shift+nyíl).
- `registerDecor({id,name,hint,ar,k,look?,svg(u),onClick(el,ev,A),idle?(el,A)})`; `registerSet({id,name,desc,tip,parts:[{type,at:'start'|'end'}]})`.
- `A = dcApi(el)`: `play(el,cls,ms)`, `linked`, `at`, `st` (bökés-számláló: `st.n = now-st.last<9000 ? st.n+1 : 1`), `toggle` (tartós `off`), `on`.
- Animáció: csak transform/opacity, egyszeri osztály-váltás (`dcPlay`), nincs blur/végtelen animáció; idle-tick `decorLifeStart` (Kímélő módban, rejtett fülön, szerkesztéskor, húzáskor nem fut; csak látható díszekre); szemkövetés `--ex/--ey` + `.d-look` (kell `data-look`).
- Katalógus (10 halmaz): sárkány-pár, olvasó szellem, gyertyás lámpás, üvegablak-rózsa, üvegablak-csillagos vár, kis sárkány+felhő, alvó macska, bagoly, pozsgás, book-nook. Kezdő készlet: `starterDecor()` (decor.js) — 7 dísz szétosztva a polcokon, csak első betöltéskor.
- Új dísz: új `src/decor-<név>.js` (+ build.js JS-lista), CSS `decor2.css`-ben (`.dc-<típus>` előtaggal), teszt `test/decor3.test.js` mintájára; közeli kép: `node test/decor-shot.js <előtag> <halmaz> <osztály>@<típus>@<ms>`.

## 3D díszek (registerDecor3)
- `registerDecor3({id, build(it)→{grp,parts,mats,d,ctl}, onClick(it,A,e,part)})`, az `id` megegyezik a 2D dísz típusával. `kRoot(it, vh)` skálázza a modell-egységeket (a 2D viewBox magassága `vh`) a polc-pixelekre; origó = a dísz alja középen, X jobbra, Y fel, Z a néző felé.
- Kattintható rész: a mesh `userData.part` (pl. 'nose','head','box','book','cloud'); láthatatlan találat-gömb: `kHit`. A `parts` tömb a raycast célpontja.
- `ctl`: `look(p)` (egér-követés, l3Hover hívja), `idle()` (l3Idle hívja), + saját animációk; állapot: `kState(init, apply)` + `l3Seq().to(S,{…},idő,ease).wait().call().play()`.
- Megosztott geometria: `drGeoOnce(kulcs, fn)` (L3.geo, `l3Clear` nem dobja el); textúra: `kTex(w,h,draw,kulcs)` / `kSvgPlane(…,{key})` gyorsítótárral — kulcs nélkül szivárog (decor3d.test.js ellenőrzi).
- Anyag: `kVinyl`, `l3Mat` (clear→Physical), `l3Skin` (bump). Csúcsszínes SDF-hez `vertexColors:true` és az SDF-nek colFn kell, különben fekete (szellem-karok tanulsága).
- Képsor: `node test/lib3d-gallery.js <png> <típusok|all>` (CLIP=x,y,w,h, DSF=2), `node test/lib3d-anim.js <előtag> <típus> <ms,ms> "<js: it=elem>" [x,y,w,h]`.
- Lassúság-őr: folyamatos animáció közben 45 képkockánként medián/p90; 2× lassú → csendben DPR 1 + 1024-es árnyék, újabb 2× → egyszeri toast a 2D-re (`S.settings.perf3dAsked`). A Beállítások „3D könyvtár” kapcsolója nullázza.

## Buktatók (tanulságok)
- Three r128: nincs `CapsuleGeometry`; az `onBeforeCompile`-os anyag (l3Skin) csak `clear`-nél kapjon clearcoat-ot (figyelmeztetés).
- A színes-csúcsú anyag minden hozzá tartozó geometriához kér `color` attribútumot.
- `localStorage` mindig try/catch; a teszt-seed `themes: []` újraindítja az állapotot → tartós állapothoz `persistNow()` + reload.
- DnD-összeg = könyvek + díszek (különben a drop elbukik). Polc-fejléc darabszám nem számolja a díszeket.
- `transform-box: view-box` az alap a díszeken; `fill-box` csak ahol kell; `<g transform>` gyerekein `transform-origin: 0 0`.
- Véletlen idle-animáció elrontja a képernyőképet → a teszt `clearTimeout(DecorLife.t)`.
- Az artifact-publikálás új munkamenetben külön artifactot hoz létre, ha nincs `url`.

## Nyitott
Lásd ROADMAP.md. GitHub-repó: a user még nem adott `owner/repo`-t (add_repo `access: push` kell).

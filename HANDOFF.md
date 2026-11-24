# KockaLand (Kockázzunk) — átadó (HANDOFF)

Egyoldalas HTML játék (vanilla JS/CSS, magyar felület): fa dobókockás sorsoló témákkal, szerkeszthető könyvtárral és animált polcdíszekkel. Barátnőnek készül ajándékba.

## Gyors indulás
```
cd /home/claude/kockazzunk
NODE_PATH=/opt/npm-tools/node_modules node build.js     # src/* → dist/index.html (CSS+JS beágyazva)
```
Publikálás: Artifact eszköz, `file_path` = `dist/index.html`, **`url` = https://claude.ai/artifact/NrfUS3HYq9NG5ietvtecjL** (új munkamenetben előbb `action:read`). A MjaWwfEnKYSitkmHXx4pKj artifact duplikátum, a user kérésére törölhető.
Tesztek (Playwright, Chromium; a 3D-sek szoftveres GL-en lassúak, sorban futtasd őket — `decor3d`, `lib3d`, `nookzoom`): `NODE_PATH=/opt/npm-tools/node_modules node test/<név>.test.js <kimenet-előtag>`; a teljes csomag: engine, lint, faces, editor, shelf, misc, mobile, nostorage, library, decor, decor2, decor3 — mind zöld legyen publikálás előtt. 3D-hez még: `decor3d` (11 típus modellje + kattintás-sorozat + szivárgás + lassúság-őr + beállítás-kapcsoló; ~5 perc), `lib3d` (3D Könyvtár: hover, kattintás, húzás, 2D tartalék, mobil; ~5 perc). Szoftveres GL-ben (nincs GPU) egy képkocka 150–450 ms, ezért a 3D tesztek lassúak; a `window.__L3_LOWQ=true` seed kell, a three-t a `test/vendor/three.min.js`-ből szolgáljuk (route). Gyors rész: `ONLY=macska node test/decor3d.test.js`.

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
- `src/spine.js` — gerinc-rajzoló (v12): `Dual` kettős vászon (A=szín S3-as, B=maszk 0,67×: R dombormű, G érdesség, B fémesség), `SPINE_PATS`, `FOILS`, `SP_PAT[]` minta-rajzolók, `spineDraw(b,L,F,w,h,S3,full)`; könyv-mezők: `color, style(0–7), pat(0–8), acc(hex a FOILS-ból), h, th` (hiányzónál az id-hash adja). A 2D háttér `--bgimg` data-URL (`SP_BG` gyorsítótár), a 3D `l3SpineTex` → {t,m} (map + roughness/metalness/bump egy maszk-textúrán).
- `src/library.js` + `library-ui.js` — polcok (S.shelves), gerincek, megjelenés-szerkesztő, pointer-alapú húzás, Shift+nyíl
- `src/decor.js` — díszek keretrendszere; `decor-*.js` — az egyes díszek; `css/decor.css`, `css/decor2.css`
- **3D Könyvtár** (Three.js r128, lusta betöltés jsdelivr-ről; 2D a tartalék: nincs WebGL / Kímélő mód / `S.settings.view3d===false` / script-hiba / context lost):
  `src/lib3d.js` (központ: színtér, szekrény, könyvek, fény-árnyék, fix viewport-canvas `#l3` scissorral, hover/kattintás/húzás raycast-tal, `.lb-sp` láthatatlan gombréteg billentyűzethez, `l3Anim`/`l3Seq` tween, `l3Idle`, lassúság-őr `l3Perf`/`l3PerfEval`), `lib3d-sdf.js` (SDF-szobrászat: `sdSph/sdEll/sdCone/smin/smax`, `sdfGeo` Surface Nets + csúcsszín, `l3Skin` pikkely/szemcse bump, `l3TubeGeo/Set`), `lib3d-kit.js` (kTex/kSvgPlane/kLight/kBead/kVinyl/kRoot/kLookVec…), díszek: `lib3d-dragon.js` (közös segédek: `drGeoOnce/drMerge/drCone/drMesh/drParticle`), `lib3d-dragons2.js` (**fekvő sárkány** vörös-fekete, 3 hosszú könyvön, farok a halmon; SDF test/fej/állkapocs, hártyás szárny `dgFan`), `lib3d-flyimg.js` (**repülő sárkány = 2D kép** rétegenként textúra-síkokon: `fiBuild`; a rajz a `decor-baby.js`-ben: `flyDefs/FLY_LAYERS/FLY_ORDER/flySvg`, a 2D DOM-nézet is ezt használja; szem/pupilla/szemhéj 3D primitív), `lib3d-lamps.js` (lámpás, 2 üvegablak), `lib3d-nook.js` (**book nook**: `nkRoom(mode)` = berendezett mini szoba: deszkapadló, csíkos tapéta, ívelt ablak holddal, beépített könyvespolc + földgömb, kandalló, fotel, alvó cica SDF-ből, lámpa/függőlámpa, fényfüzér; `nkAssemble` = keret + szoba, a polcon és a zoomban is ez), `lib3d-nookzoom.js` (**ráközelítés**: saját átlátszó WebGL-vászon, FLIP + dolly-zoom, körbenézés, tárgy-kattintások, bezáráskor teljes takarítás; a fő színtér közben `L3.hold`), `lib3d-pets.js` (szellem: `ghBodyGeo/ghArmGeo/ghHemGeo/ghBuild`, fehér harang + ovális szemlyuk-decal + fekete könyv, olvasó szem-pásztázás `turn`), `lib3d-pets2.js` (macska, bagoly, pozsgás).
- `src/misc.js` — napló, súgó, beállítások, túra; `src/app.js` — boot, router (#dobas|#szerkeszto|#polc|#naplo|#sugo)

## Díszek (S.decor)
- `S.decor=[{id:'d_…',type,link?,off?}]`; az id a polc `ids` tömbjében él a könyvekkel együtt (húzható, Shift+nyíl).
- `registerDecor({id,name,hint,ar,k,look?,svg(u),onClick(el,ev,A),idle?(el,A)})`; `registerSet({id,name,desc,tip,parts:[{type,at:'start'|'end'}]})`.
- `A = dcApi(el)`: `play(el,cls,ms)`, `linked`, `at`, `st` (bökés-számláló: `st.n = now-st.last<9000 ? st.n+1 : 1`), `toggle` (tartós `off`), `on`.
- Animáció: csak transform/opacity, egyszeri osztály-váltás (`dcPlay`), nincs blur/végtelen animáció; idle-tick `decorLifeStart` (Kímélő módban, rejtett fülön, szerkesztéskor, húzáskor nem fut; csak látható díszekre); szemkövetés `--ex/--ey` + `.d-look` (kell `data-look`).
- Katalógus (10 halmaz): fekvő sárkány (`sarkany-fekvo`; a régi `sarkany-fej`/`-farok` párt a `dragonMigrate` alakítja át), olvasó szellem, gyertyás lámpás, üvegablak-rózsa, üvegablak-csillagos vár, repülő sárkány + füstoszlop (`kis-sarkany`), alvó macska, bagoly, pozsgás, book-nook (3D: mini szoba + zoom; 2D tartalék: éjszakai sikátor). Kezdő készlet: `starterDecor()` (decor.js) — 6 dísz szétosztva a polcokon, csak első betöltéskor.
- Új dísz: új `src/decor-<név>.js` (+ build.js JS-lista), CSS `decor2.css`-ben (`.dc-<típus>` előtaggal), teszt `test/decor3.test.js` mintájára; közeli kép: `node test/decor-shot.js <előtag> <halmaz> <osztály>@<típus>@<ms>`.

## 3D díszek (registerDecor3)
- `registerDecor3({id, build(it)→{grp,parts,mats,d,ctl}, onClick(it,A,e,part)})`, az `id` megegyezik a 2D dísz típusával. `kRoot(it, vh)` skálázza a modell-egységeket (a 2D viewBox magassága `vh`) a polc-pixelekre; origó = a dísz alja középen, X jobbra, Y fel, Z a néző felé.
- Kattintható rész: a mesh `userData.part` (pl. 'nose','head','box','book','cloud'); láthatatlan találat-gömb: `kHit`. A `parts` tömb a raycast célpontja.
- `ctl`: `look(p)` (egér-követés, l3Hover hívja), `idle()` (l3Idle hívja), + saját animációk; állapot: `kState(init, apply)` + `l3Seq().to(S,{…},idő,ease).wait().call().play()`.
- Megosztott geometria: `drGeoOnce(kulcs, fn)` (L3.geo, `l3Clear` nem dobja el); textúra: `kTex(w,h,draw,kulcs)` / `kSvgPlane(…,{key})` gyorsítótárral — kulcs nélkül szivárog (decor3d.test.js ellenőrzi).
- Képalapú 3D dísz (kis-sarkany): `kSvgPlane` rétegek a SVG-ből (720×600 px, kulcs `fly:<réteg>`), MeshBasicMaterial (nincs világítás); a rétegek pivotja `dx/dy`-nal; előnézet: `node test/fly-preview.js <png> [rétegek]`. A `decor3d` teszt kivételt tesz (`IMG=['kis-sarkany']`, kevés háromszög).
- Anyag: `kVinyl`, `l3Mat` (clear→Physical), `l3Skin` (bump). Csúcsszínes SDF-hez `vertexColors:true` és az SDF-nek colFn kell, különben fekete (szellem-karok tanulsága).
- Képsor: `node test/lib3d-gallery.js <png> <típusok|all>` (CLIP=x,y,w,h, DSF=2), `node test/lib3d-anim.js <előtag> <típus> <ms,ms> "<js: it=elem>" [x,y,w,h]`.
- Lassúság-őr (`l3Perf`/`l3PerfEval`/`l3Quality`): minden folytonos képkockát lát (görgetést is), 30 képkockánként medián/p90; med > 20 ms vagy p90 > 42 ms kétszer → `L3.deg` 1 (1× felbontás, 1024-es árnyék), majd 2 (0,75×, 512, a díszek lapos SVG-síkra cserélve: `l3DecorBill`), harmadszor egyszeri toast a 2D-re (`S.settings.perf3dAsked`). Alap: felbontás ≤ 1,25×, 2048-as árnyék. Gyenge GPU (`l3WeakGPU()`: érintőképernyő vagy Mali/Adreno/PowerVR/Intel/szoftveres renderer; `window.__L3_WEAK` felülírja, webdriver alatt kikapcsolva) → `L3.weak`, `L3.deg` ≥ 1 már indulásnál, MSAA és egér-parallax nélkül. `S.settings.flatDecor` (Beállítások › „Díszek 3D modellként”) örökre lapos díszeket ad.
- Díszlimit (v12): `MAX_DECOR` = 1 (decor.js; `window.__MAX_DECOR` emeli a teszteknek, `window.__STARTER` kezdő díszeket kér), az `addDecorSet` a régit lecseréli; `settings.decor12` = a v12-es egyszeri díszlevétel jelzője; `settings.palV` = a paletta-átszínezés jelzője (`Seed.recolor`). A dísz mögötti fényfolt: `l3Sync` (additív sík `-DEPTH+7`-en, L3.glowTex). (Régi leírás: MAX_DECOR volt 8:) — `decorLeft()`, `addDecorSet()` false-t ad ha nem fér, `trimDecor()` a `syncShelves()` végén (tehát a `persist()` is levág: régi mentést csak közvetlen localStorage-írással lehet 8 fölé vinni, ld. `test/decor-limit.test.js`). A decor-modal számlál („Kint van: n / 8”).

## Buktatók (tanulságok)
- 3D teljesítmény: az árnyék-térkép NEM automatikus (`shadowMap.autoUpdate=false`); `l3Inv()` (alapértelmezés) és `l3Pose`/`l3Anim` jelzi (`L3.sd`), hogy újra kell rajzolni; görgetéshez/parallaxhoz `l3Inv('v')` (csak nézet). Új, a jelenetet mozgató kódnak `l3Inv()`-t kell hívnia, különben elavult árnyék marad. Árnyék: `VSMShadowMap` (radius ∝ térkép-méret, `blurSamples` 12/8; a szűrés csak árnyék-frissítéskor fut, képkockánként 1 mintavétel). A szekrény hátlapja fülkénként csúcspont-színezett (`L3Geo.shade`, olcsó AO). Clearcoat helyett `l3Phys` (MeshStandard); új dísz anyagai ne használjanak MeshPhysicalMaterialt. Mérés: szoftveres GL-ben a képkocka-idő a felbontással skálázik (`DPR 2 ≈ 2,9×`), a sárkány geometriája a vertex-költség nagy része.
- Three r128: nincs `CapsuleGeometry`; az `onBeforeCompile`-os anyag (l3Skin) csak `clear`-nél kapjon clearcoat-ot (figyelmeztetés).
- A színes-csúcsú anyag minden hozzá tartozó geometriához kér `color` attribútumot (primitíveknek külön, nem-vertexColors anyag kell, különben feketék: macska-fül, sárkány-ujj).
- Az `Object3D.position` csak olvasható property: `Object.assign(mesh, {position})` strict módban hibát dob; `mesh.position.set()` kell.
- Két WebGL-renderer között textúra/geometria megosztható, a PMREM környezet-térkép nem (a zoom saját `nkEnv`-et gyárt).
- Teszt-keret: a `sessionStorage` újratöltéskor néha elvész (file://), ezért a tesztek seed-jelzője `window.name`.
- A díszek `ar`/`k` értéke közös a 2D és 3D nézetre; a 2D SVG viewBox arányát igazítsd hozzá (book nook: `-24 0 178 170`, ar 1.04).
- `localStorage` mindig try/catch; a teszt-seed `themes: []` újraindítja az állapotot → tartós állapothoz `persistNow()` + reload.
- DnD-összeg = könyvek + díszek (különben a drop elbukik). Polc-fejléc darabszám nem számolja a díszeket.
- `transform-box: view-box` az alap a díszeken; `fill-box` csak ahol kell; `<g transform>` gyerekein `transform-origin: 0 0`.
- Véletlen idle-animáció elrontja a képernyőképet → a teszt `clearTimeout(DecorLife.t)`.
- Gyors tesztek egymás után futtatandók (szoftveres GL, párhuzamosan időtúllépés); a ghost/sárkány képsorban a pislogást `it.ctl.S.blink=0`-val kell kényszeríteni.
- Az artifact-publikálás új munkamenetben külön artifactot hoz létre, ha nincs `url`.

## Nyitott
Lásd ROADMAP.md. A GitHub-repó (Ufmanitu/KockaLand) csatolva; push: `git -c push.negotiate=true push origin main`.

# KockaLand

KockaLand, egy kis világ, ahol minden dobás egy új lehetőség!

https://ufmanitu.github.io/KockaLand/

## Fejlesztés

Egyoldalas HTML-játék (vanilla JS/CSS, magyar felület): témás kockadobó sorsoló, szerkeszthető Könyvtár valódi 3D polcokkal és animált díszekkel (Three.js): fekvő és repülő sárkány, ráközelíthető book nook mini szoba, macska, bagoly, lámpák.

- Forrás: `src/`, építés: `node build.js` → `dist/index.html` (Artifact-hoz) és `dist/standalone.html` (önálló oldal).
- Az aktuális fejlesztői build: `latest/index.html` (a gyökér `index.html` a közzétett oldal).
- Átadó / terv / változásnapló: [HANDOFF.md](HANDOFF.md), [ROADMAP.md](ROADMAP.md), [CHANGELOG.md](CHANGELOG.md).
- Tesztek (Playwright): `node test/<név>.test.js` (a 3D-khez `test/vendor/three.min.js` kell).

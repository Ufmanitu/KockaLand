/* ===== 3D szobrászat-eszközök: SDF (előjeles távolság-függvény) + Surface Nets háló, háromsíkú pikkely-bump, cső-építő =====
   A díszek formáit (sárkányfej, macska, bagoly…) sima egyesítésű (smooth-min) alakzatokból „szobrászom”, aztán hálóvá alakítom (csak egyszer, majd gyorsítótárból).
   Minden függvény sima számokkal dolgozik (nincs objektum-foglalás a belső ciklusban), hogy gyors legyen. */
'use strict';

/* ---------- alakzatok ---------- */
const sdSph = (x, y, z, r) => Math.sqrt(x * x + y * y + z * z) - r;
function sdEll(x, y, z, rx, ry, rz) {
  const a = x / rx, b = y / ry, c = z / rz, k0 = Math.sqrt(a * a + b * b + c * c), d = x / (rx * rx), e = y / (ry * ry), f = z / (rz * rz), k1 = Math.sqrt(d * d + e * e + f * f);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
}
function sdCone(x, y, z, ax, ay, az, bx, by, bz, ra, rb) {   // kúpos kapszula (két gömb között, sugár-átmenettel)
  const px = x - ax, py = y - ay, pz = z - az, ex = bx - ax, ey = by - ay, ez = bz - az, l2 = ex * ex + ey * ey + ez * ez;
  let t = l2 ? (px * ex + py * ey + pz * ez) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const dx = px - ex * t, dy = py - ey * t, dz = pz - ez * t; return Math.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t);
}
function sdBox(x, y, z, hx, hy, hz, r) {   // lekerekített doboz (középpont az origó)
  const qx = Math.abs(x) - hx + r, qy = Math.abs(y) - hy + r, qz = Math.abs(z) - hz + r;
  const mx = Math.max(qx, 0), my = Math.max(qy, 0), mz = Math.max(qz, 0);
  return Math.sqrt(mx * mx + my * my + mz * mz) + Math.min(Math.max(qx, qy, qz), 0) - r;
}
function sdTorus(x, y, z, R, r) { const q = Math.sqrt(x * x + z * z) - R; return Math.sqrt(q * q + y * y) - r; }
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
const rotY = (x, z, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c + z * s, -x * s + z * c]; };

/* ---------- Surface Nets: SDF → háromszöghálózat (normálok az SDF gradiensből) ---------- */
function sdfMesh(f, b0, b1, c, colFn) {
  const nx = Math.ceil((b1[0] - b0[0]) / c), ny = Math.ceil((b1[1] - b0[1]) / c), nz = Math.ceil((b1[2] - b0[2]) / c), sx = nx + 1, sy = ny + 1, sz = nz + 1;
  const val = new Float32Array(sx * sy * sz), I = (x, y, z) => x + sx * (y + sy * z), C = (x, y, z) => x + nx * (y + ny * z);
  for (let z = 0; z < sz; z++) for (let y = 0; y < sy; y++) for (let x = 0; x < sx; x++) val[I(x, y, z)] = f(b0[0] + x * c, b0[1] + y * c, b0[2] + z * c);
  const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]], cv = new Float32Array(8);
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    let mask = 0;
    for (let k = 0; k < 8; k++) { const v = val[I(x + (k & 1), y + ((k >> 1) & 1), z + (k >> 2))]; cv[k] = v; if (v < 0) mask |= 1 << k; }
    if (mask === 0 || mask === 255) continue;
    let ax = 0, ay = 0, az = 0, n = 0;
    for (let e = 0; e < 12; e++) {
      const i0 = E[e][0], i1 = E[e][1], v0 = cv[i0], v1 = cv[i1]; if ((v0 < 0) === (v1 < 0)) continue;
      const t = v0 / (v0 - v1);
      ax += (i0 & 1) + t * ((i1 & 1) - (i0 & 1)); ay += ((i0 >> 1) & 1) + t * (((i1 >> 1) & 1) - ((i0 >> 1) & 1)); az += (i0 >> 2) + t * ((i1 >> 2) - (i0 >> 2)); n++;
    }
    vid[C(x, y, z)] = P.length / 3; P.push(b0[0] + (x + ax / n) * c, b0[1] + (y + ay / n) * c, b0[2] + (z + az / n) * c);
  }
  const idx = [], quad = (a, b, d, e, flip) => { if (a < 0 || b < 0 || d < 0 || e < 0) return; if (flip) idx.push(a, d, b, a, e, d); else idx.push(a, b, d, a, d, e); };
  for (let z = 1; z < nz; z++) for (let y = 1; y < ny; y++) for (let x = 0; x < nx; x++) { const a = val[I(x, y, z)], b = val[I(x + 1, y, z)]; if ((a < 0) !== (b < 0)) quad(vid[C(x, y - 1, z - 1)], vid[C(x, y, z - 1)], vid[C(x, y, z)], vid[C(x, y - 1, z)], a < 0); }
  for (let z = 1; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 1; x < nx; x++) { const a = val[I(x, y, z)], b = val[I(x, y + 1, z)]; if ((a < 0) !== (b < 0)) quad(vid[C(x - 1, y, z - 1)], vid[C(x - 1, y, z)], vid[C(x, y, z)], vid[C(x, y, z - 1)], a < 0); }
  for (let z = 0; z < nz; z++) for (let y = 1; y < ny; y++) for (let x = 1; x < nx; x++) { const a = val[I(x, y, z)], b = val[I(x, y, z + 1)]; if ((a < 0) !== (b < 0)) quad(vid[C(x - 1, y - 1, z)], vid[C(x, y - 1, z)], vid[C(x, y, z)], vid[C(x - 1, y, z)], a < 0); }
  const nv = P.length / 3, N = new Float32Array(nv * 3), h = c * 0.5, col = colFn ? new Float32Array(nv * 3) : null;
  for (let i = 0; i < nv; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    let gx = f(x + h, y, z) - f(x - h, y, z), gy = f(x, y + h, z) - f(x, y - h, z), gz = f(x, y, z + h) - f(x, y, z - h); const l = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
    N[i * 3] = gx / l; N[i * 3 + 1] = gy / l; N[i * 3 + 2] = gz / l;
    if (col) { const k = colFn(x, y, z); col[i * 3] = k[0]; col[i * 3 + 1] = k[1]; col[i * 3 + 2] = k[2]; }
  }
  // a háromszögek körüljárását a gradienshez igazítjuk (biztos, ami biztos)
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, d = idx[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[d] - P[a], vy = P[d + 1] - P[a + 1], vz = P[d + 2] - P[a + 2];
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    if (fx * (N[a] + N[b] + N[d]) + fy * (N[a + 1] + N[b + 1] + N[d + 1]) + fz * (N[a + 2] + N[b + 2] + N[d + 2]) < 0) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  }
  return { p: new Float32Array(P), n: N, c: col, i: nv > 65535 ? new Uint32Array(idx) : new Uint16Array(idx) };
}
function sdfGeo(f, b0, b1, c, colFn) {
  const m = sdfMesh(f, b0, b1, c, colFn), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(m.p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(m.n, 3)); if (m.c) g.setAttribute('color', new THREE.BufferAttribute(m.c, 3));
  g.setIndex(new THREE.BufferAttribute(m.i, 1)); g.computeBoundingSphere(); g.userData.shared = true; return g;
}

/* ---------- pikkely/érdesség textúra + háromsíkú bump anyag ---------- */
function l3ScaleTex(kind) {
  L3.stex = L3.stex || {};
  if (L3.stex[kind]) return L3.stex[kind];
  const W = 256, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'), rng = dcRng(kind === 'fur' ? 5 : 3);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, W);
  if (kind === 'scale') {   // halpikkely-szerű, egymásra csúszó pikkelyek (magasság-térkép)
    const n = 8, s = W / n;
    for (let row = -1; row <= n; row++) for (let col = -1; col <= n; col++) {
      const cx = (col + (row & 1 ? 0.5 : 0)) * s + (rng() - 0.5) * 3, cy = row * s * 0.78 + s * 0.5;
      for (const ox of [0, -W, W]) for (const oy of [0, -W, W]) {
        const gr = g.createRadialGradient(cx + ox, cy + oy - s * 0.12, s * 0.06, cx + ox, cy + oy, s * 0.62);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(170,170,170,1)'); gr.addColorStop(1, 'rgba(30,30,30,1)');
        g.fillStyle = gr; g.beginPath(); g.ellipse(cx + ox, cy + oy, s * 0.58, s * 0.46, 0, 0, 6.283); g.fill();
      }
    }
  } else {   // finom szemcse (bőr, gyanta, kő)
    for (let i = 0; i < 9000; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.05 + rng() * 0.3).toFixed(2) + ')'; g.beginPath(); g.arc(rng() * W, rng() * W, 0.6 + rng() * 1.6, 0, 6.283); g.fill(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, L3.r.capabilities.getMaxAnisotropy()); return (L3.stex[kind] = t);
}
const PERTURB = 'vec3 perturbNormalArb2( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) { vec3 vSigmaX = dFdx( surf_pos ); vec3 vSigmaY = dFdy( surf_pos ); vec3 R1 = cross( vSigmaY, surf_norm ); vec3 R2 = cross( surf_norm, vSigmaX ); float fDet = dot( vSigmaX, R1 ); fDet *= ( float( gl_FrontFacing ) * 2.0 - 1.0 ); vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 ); return normalize( abs( fDet ) * surf_norm - vGrad ); }';
/* „fényes bevonat” olcsón: a MeshPhysicalMaterial clearcoat-ja drága (második tükröződési lebeny + újabb környezet-minta pixelenként; a mérésben a sárkány képkocka-költségének ~egynegyede),
   ezért MeshStandard, a bevonat mértékével csökkentett érdességgel (a csillogás megmarad, a fényes réteg nem külön lebeny). A clearcoat/clearcoatRoughness opciókat eldobja. */
function l3Phys(o) { const q = Object.assign({}, o), cc = q.clearcoat || 0; delete q.clearcoat; delete q.clearcoatRoughness; if (cc && q.roughness != null) q.roughness = Math.max(0.1, q.roughness - cc * 0.16); return new THREE.MeshStandardMaterial(q); }
function l3Skin(o) {   // háromsíkú (felület-ragadó) bump: o = {color, rough, metal, kind:'scale'|'grain', cell (px/pikkely), amt, vcol, clear, env, emissive}
  const T = THREE, tex = l3ScaleTex(o.kind || 'scale'), uni = { uTex: { value: tex }, uK: { value: 1 / (8 * (o.cell || 5)) }, uAmt: { value: o.amt != null ? o.amt : 1.4 } };
  const po = { color: o.color ? l3Col(o.color) : 0xffffff, roughness: o.rough != null ? o.rough : 0.5, metalness: o.metal || 0, vertexColors: !!o.vcol, envMapIntensity: o.env != null ? o.env : 0.9 }; if (o.clear) { po.clearcoat = o.clear; po.clearcoatRoughness = o.clearR != null ? o.clearR : 0.25; }
  const m = o.clear ? l3Phys(po) : new T.MeshStandardMaterial(po);
  if (o.emissive) { m.emissive = l3Col(o.emissive); m.emissiveIntensity = o.eInt || 1; }
  m.onBeforeCompile = sh => {
    sh.uniforms.uTex = uni.uTex; sh.uniforms.uK = uni.uK; sh.uniforms.uAmt = uni.uAmt;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position; vON = normal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP; varying vec3 vON; uniform sampler2D uTex; uniform float uK; uniform float uAmt;\n' + PERTURB +
      '\nfloat triH( vec3 p, vec3 n ) { vec3 w = pow( abs( n ), vec3( 4.0 ) ); w /= ( w.x + w.y + w.z ); return texture2D( uTex, p.yz * uK ).r * w.x + texture2D( uTex, p.xz * uK ).r * w.y + texture2D( uTex, p.xy * uK ).r * w.z; }')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n{ float hh = triH( vOP, normalize( vON ) ); normal = perturbNormalArb2( -vViewPosition, normal, vec2( dFdx( hh ), dFdy( hh ) ) * uAmt ); }');
  };
  m.userData.uni = uni; return m;
}
/* sima (nem pikkelyes) anyag gyors készítése */
const l3Mat = o => { const q = Object.assign({ roughness: 0.5, metalness: 0 }, o); const ph = !!q.clear; delete q.clear; if (q.color != null) q.color = l3Col(q.color); if (q.emissive != null) q.emissive = l3Col(q.emissive); return ph ? l3Phys(q) : new THREE.MeshStandardMaterial(q); };

/* ---------- cső egy görbe mentén (farok, nyak, ág): profil(t, szög) → sugár; UV: u = hossz, v = kerület ---------- */
function l3TubeGeo(n, m) {   // n gyűrű, m oldal; a pontokat l3TubeSet tölti
  const T = THREE, g = new T.BufferGeometry(), pos = new Float32Array((n + 1) * (m + 1) * 3), uv = new Float32Array((n + 1) * (m + 1) * 2), idx = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) { uv[(i * (m + 1) + j) * 2] = i / n; uv[(i * (m + 1) + j) * 2 + 1] = j / m; }
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const a = i * (m + 1) + j, b = a + 1, c = a + (m + 1), d = c + 1; idx.push(a, c, b, b, c, d); }
  g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setIndex(idx); g.userData.n = n; g.userData.m = m; return g;
}
function l3TubeSet(g, curve, rad, prof, upv) {   // curve(t) → [x,y,z], rad(t) → sugár, prof(t, a) → szorzó (pl. gerinc-tüskék), upv: a „hát” iránya
  const n = g.userData.n, m = g.userData.m, p = g.attributes.position.array, up = upv || [0, 0, 1];
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = curve(t), c2 = curve(Math.min(1, t + 0.01)), c1 = curve(Math.max(0, t - 0.01));
    let tx = c2[0] - c1[0], ty = c2[1] - c1[1], tz = c2[2] - c1[2]; const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
    // keret: a "fel" irány (z) merőleges része; ha párhuzamos, y
    const uu = typeof up === 'function' ? up(t, tx, ty, tz) : up; let ux = uu[0], uy = uu[1], uz = uu[2]; const d = ux * tx + uy * ty + uz * tz; ux -= tx * d; uy -= ty * d; uz -= tz * d; const ul = Math.hypot(ux, uy, uz); if (ul < 1e-3) { ux = 0; uy = 1; uz = 0; } else { ux /= ul; uy /= ul; uz /= ul; }
    const sx = ty * uz - tz * uy, sy = tz * ux - tx * uz, sz = tx * uy - ty * ux, r = rad(t);   // oldalirány
    for (let j = 0; j <= m; j++) {
      const a = j / m * 6.2832, ca = Math.cos(a), sa = Math.sin(a), k = (prof ? prof(t, a) : 1) * r, o = (i * (m + 1) + j) * 3;
      p[o] = c[0] + (ux * ca + sx * sa) * k; p[o + 1] = c[1] + (uy * ca + sy * sa) * k; p[o + 2] = c[2] + (uz * ca + sz * sa) * k;
    }
  }
  g.attributes.position.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
}
const l3CatmullPts = (pts) => { const cr = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5); return t => { const v = cr.getPoint(Math.max(0, Math.min(1, t))); return [v.x, v.y, v.z]; }; };

/* ===== 3D díszek: közös segédek a sárkányokhoz és másokhoz (gyorsítótárazott geometria, összefésülés, kúp, részecskék) =====
   A sárkányok maguk: lib3d-dragons2.js (fekvő sárkány a könyvhalmon + repülő, tüzet okádó sárkány). */
'use strict';

const drMix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function drGeoOnce(key, fn) { return L3.geo[key] || (L3.geo[key] = fn()); }


/* ---------- gyors geometria-összefésülés (fogak, karmok) ---------- */
function drMerge(list) {
  const T = THREE, P = [], N = [], I = [], v = new T.Vector3(), nm = new T.Matrix3(); let off = 0;
  list.forEach(e => {
    const g = e.g, m = e.m, p = g.attributes.position, n = g.attributes.normal; nm.getNormalMatrix(m);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); P.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z); }
    const ix = g.index.array; for (let k = 0; k < ix.length; k++) I.push(ix[k] + off); off += p.count;
  });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(N, 3)); geo.setIndex(I); geo.computeBoundingSphere(); geo.userData.shared = true; return geo;
}
function drCone(len, rad, pos, dir, seg) {   // kúp: a talpa pos-nál, a csúcsa pos + dir*len
  const T = THREE, g = new T.ConeGeometry(rad, len, seg || 6), q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(dir[0], dir[1], dir[2]).normalize());
  const c = new T.Vector3(dir[0], dir[1], dir[2]).normalize().multiplyScalar(len / 2).add(new T.Vector3(pos[0], pos[1], pos[2]));
  return { g: g, m: new T.Matrix4().compose(c, q, new T.Vector3(1, 1, 1)) };
}

function drMesh(geo, mat, parent, name) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); if (name) m.userData.part = name; return m; }

/* ---------- részecskék (füst, szikra, szív) ---------- */
function drParticle(parent, kind, pos, opt) {
  const T = THREE; opt = opt || {};
  const tex = kind === 'heart' ? l3HeartTex() : l3Glow(), col = kind === 'smoke' ? 0x8a8f9c : kind === 'spark' ? 0xffb347 : 0xffffff;
  const sp = l3Sprite(tex, col, kind === 'heart' ? 9 : kind === 'smoke' ? 7 : 3.2, 0); if (kind === 'spark') sp.material.blending = T.AdditiveBlending;
  sp.position.copy(pos); sp.renderOrder = 10; parent.add(sp);
  const vx = opt.vx || 0, vy = opt.vy || 0, vz = opt.vz || 0, life = opt.life || 1.4, big = opt.big || 1, x0 = pos.x, y0 = pos.y, z0 = pos.z, wob = Math.random() * 6;
  l3Anim(life, u => {
    const t = u * life;
    sp.position.set(x0 + vx * t + (kind === 'heart' ? Math.sin(t * 5 + wob) * 2.2 : 0), y0 + vy * t - (kind === 'spark' ? 28 * t * t : 0), z0 + vz * t);
    const fade = kind === 'smoke' ? Math.sin(u * Math.PI) * 0.62 : kind === 'spark' ? (1 - u) : Math.sin(Math.min(1, u * 1.15) * Math.PI) * 0.95;
    sp.material.opacity = Math.max(0, fade); const sc = (kind === 'smoke' ? 6 + u * 12 : kind === 'spark' ? 3.2 * (1 - u * 0.7) : 8 + u * 3) * big; sp.scale.set(sc, sc, 1);
  }, () => { parent.remove(sp); sp.material.dispose(); });
}

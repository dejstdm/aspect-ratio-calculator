// ============================================================================
// UTILITIES & HELPERS
// ============================================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
};
const fmt = n => Number.isFinite(n) ? n.toString() : '—';
const rounders = { round: Math.round, floor: Math.floor, ceil: Math.ceil };
const commonRatios = [
  [1, 1], [5, 4], [4, 3], [7, 5], [3, 2], [16, 10], [16, 9], [18, 9], [21, 9],
  [9, 16], [10, 16], [2, 3], [3, 4]
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let W = NaN, H = NaN; // current working width/height

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

function setWH(w, h) {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  W = w;
  H = h;
  $('#in-w').value = w;
  $('#in-h').value = h;
  updateStats();
}

function parsePaste(e) {
  const v = e.target.value.trim();
  const m = v.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (m) {
    setWH(+m[1], +m[2]);
  }
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

function updateStats() {
  if (!(W > 0 && H > 0)) return;

  const g = gcd(W, H);
  const sw = W / g, sh = H / g;
  const dec = (W / H);
  const orient = W === H ? 'Square' : (W > H ? 'Landscape' : 'Portrait');

  $('#kpi-simplified').textContent = `${sw}:${sh}`;
  $('#kpi-decimal').textContent = dec.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  $('#kpi-px').textContent = `${W} × ${H}`;
  $('#orient').textContent = orient;

  // closest common ratio
  let closest = null;
  let bestDiff = Infinity;
  let exact = false;
  for (const [a, b] of commonRatios) {
    const r = a / b;
    const diff = Math.abs(dec - r);
    if (diff < bestDiff) {
      bestDiff = diff;
      closest = [a, b];
    }
    if (sw === a && sh === b) {
      exact = true;
      closest = [a, b];
      bestDiff = 0;
      break;
    }
  }
  const pct = (bestDiff / (W / H)) * 100;
  $('#closest').innerHTML = closest
    ? `${closest[0]}:${closest[1]} ${bestDiff < 1e-9 ? '<span class="flag ratio-ok">exact</span>' : `<span class="flag ${pct < 0.5 ? 'ratio-ok' : 'ratio-bad'}">Δ ${(bestDiff).toFixed(6)}</span>`}`
    : '—';

  // recalc dependent tools
  calcTarget();
  calcBoxFit();
  calcScale();
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

function calcTarget(triggerField = null) {
  const r = W / H;
  if (!(r > 0)) return;
  const rounding = rounders[$('#rounding').value] || Math.round;
  const tw = +($('#tw').value || 0);
  const th = +($('#th').value || 0);
  let outW = NaN, outH = NaN, scale = NaN;
  
  // Determine which value to use based on trigger field
  if (triggerField === 'tw' && tw > 0) {
    // Width was edited - calculate height
    outW = tw;
    outH = rounding(tw / r);
    scale = tw / W;
  } else if (triggerField === 'th' && th > 0) {
    // Height was edited - calculate width
    outH = th;
    outW = rounding(th * r);
    scale = outW / W;
  } else if (triggerField === null) {
    // Fallback for rounding change or other triggers - use existing priority
    if (tw > 0) {
      outW = tw;
      outH = rounding(tw / r);
      scale = tw / W;
    } else if (th > 0) {
      outH = th;
      outW = rounding(th * r);
      scale = outW / W;
    }
  }
  
  $('#scale').textContent = Number.isFinite(scale) ? `${(scale * 100).toFixed(2)}%` : '—';
  
  // Only update the field that wasn't triggered
  // If triggerField is 'tw', only update 'th' (and vice versa)
  if (triggerField === 'tw') {
    // Width was edited, only update height
    if (Number.isFinite(outH)) {
      $('#th').setAttribute('data-out', '1');
      $('#th').value = outH;
      $('#th').removeAttribute('data-out');
    }
  } else if (triggerField === 'th') {
    // Height was edited, only update width
    if (Number.isFinite(outW)) {
      $('#tw').setAttribute('data-out', '1');
      $('#tw').value = outW;
      $('#tw').removeAttribute('data-out');
    }
  } else {
    // Fallback: update both fields (for rounding change)
    if (Number.isFinite(outW)) {
      $('#tw').setAttribute('data-out', '1');
      $('#tw').value = outW;
      $('#tw').removeAttribute('data-out');
    }
    if (Number.isFinite(outH)) {
      $('#th').setAttribute('data-out', '1');
      $('#th').value = outH;
      $('#th').removeAttribute('data-out');
    }
  }
}

function calcBoxFit() {
  const bw = +($('#box-w').value || 0), bh = +($('#box-h').value || 0);
  if (!(W > 0 && H > 0)) return;
  if (bw <= 0 || bh <= 0) {
    $('#box-out').textContent = '—';
    return;
  }
  const r = W / H; // width/height
  let ow = bw, oh = Math.floor(bw / r);
  if (oh > bh) {
    oh = bh;
    ow = Math.floor(bh * r);
  }
  $('#box-out').textContent = `${ow} × ${oh}`;
}

function calcScale() {
  const pct = +($('#scale-pct').value || 0);
  if (!(W > 0 && H > 0) || pct <= 0) {
    $('#scale-out').textContent = '—';
    return;
  }
  const f = pct / 100;
  const rw = Math.round(W * f), rh = Math.round(H * f);
  $('#scale-out').textContent = `${rw} × ${rh}`;
}

// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================

function activateTab(which) {
  const isDims = which === 'dims';
  $('#tab-dims').setAttribute('aria-selected', isDims);
  $('#tab-file').setAttribute('aria-selected', !isDims);
  $('#panel-dims').hidden = !isDims;
  $('#panel-file').hidden = isDims;
}

function handleFile(file) {
  if (!file) return;
  
  // Validate file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
  if (!validImageTypes.includes(file.type)) {
    const dz = $('#drop');
    dz.innerHTML = `<span class="muted" style="color:var(--err)">Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP, SVG, BMP, or TIFF).</span>`;
    $('#file-name').textContent = 'Invalid file type';
    return;
  }
  
  // Activate Upload tab immediately when file is selected
  activateTab('file');
  
  $('#file-name').textContent = `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const dz = $('#drop');
    dz.innerHTML = '';
    dz.appendChild(img);
    setWH(img.naturalWidth, img.naturalHeight);
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    const dz = $('#drop');
    dz.innerHTML = `<span class="muted" style="color:var(--err)">Could not load image. The file may be corrupted or not a valid image.</span>`;
    $('#file-name').textContent = 'Load error';
  };
  img.src = url;
}

function flash(btn) {
  const t = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = t, 900);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Dimension inputs
$('#in-w').addEventListener('input', e => {
  if ($('#in-w').hasAttribute('data-out')) return;
  const v = +e.target.value;
  if (v > 0) {
    W = v;
    if (!(H > 0)) H = NaN;
    updateStats();
  }
});

$('#in-h').addEventListener('input', e => {
  if ($('#in-h').hasAttribute('data-out')) return;
  const v = +e.target.value;
  if (v > 0) {
    H = v;
    if (!(W > 0)) W = NaN;
    updateStats();
  }
});

$('#in-w').addEventListener('paste', parsePaste);
$('#in-h').addEventListener('paste', parsePaste);

// Target resize inputs
$('#tw').addEventListener('input', e => {
  if ($('#tw').hasAttribute('data-out')) return;
  // Clear height field to reset state and ensure width takes priority
  if (e.target.value.trim() === '' || +e.target.value === 0) {
    // Field was cleared
    $('#th').value = '';
    $('#scale').textContent = '—';
  } else {
    // Clear opposite field, then calculate
    $('#th').value = '';
    calcTarget('tw');
  }
});

$('#th').addEventListener('input', e => {
  if ($('#th').hasAttribute('data-out')) return;
  // Clear width field to reset state and ensure height takes priority
  if (e.target.value.trim() === '' || +e.target.value === 0) {
    // Field was cleared
    $('#tw').value = '';
    $('#scale').textContent = '—';
  } else {
    // Clear opposite field, then calculate
    $('#tw').value = '';
    calcTarget('th');
  }
});

$('#rounding').addEventListener('change', calcTarget);

// Box fit inputs
$('#box-w').addEventListener('input', calcBoxFit);
$('#box-h').addEventListener('input', calcBoxFit);

// Scale percentage input
$('#scale-pct').addEventListener('input', calcScale);

// Action buttons
$('#copy-ratio').addEventListener('click', async () => {
  if (!(W > 0 && H > 0)) return;
  const g = gcd(W, H);
  await navigator.clipboard.writeText(`${W / g}:${H / g}`);
  flash($('#copy-ratio'));
});

$('#copy-px').addEventListener('click', async () => {
  if (!(W > 0 && H > 0)) return;
  await navigator.clipboard.writeText(`${W}x${H}`);
  flash($('#copy-px'));
});

$('#swap').addEventListener('click', () => {
  if (!(W > 0 && H > 0)) return;
  setWH(H, W);
});

$('#btn-reset').addEventListener('click', () => {
  location.reload();
});

// Tab navigation
$('#tab-dims').addEventListener('click', () => activateTab('dims'));
$('#tab-file').addEventListener('click', () => activateTab('file'));

// File handling + drag-drop
const dz = $('#drop');
$('#file').addEventListener('change', e => handleFile(e.target.files?.[0]));

['dragenter', 'dragover'].forEach(ev => {
  dz.addEventListener(ev, e => {
    e.preventDefault();
    dz.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(ev => {
  dz.addEventListener(ev, e => {
    e.preventDefault();
    dz.classList.remove('dragover');
  });
});

dz.addEventListener('drop', e => {
  const f = e.dataTransfer?.files?.[0];
  if (f) handleFile(f);
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Defaults for quick try
setWH(1920, 1080);


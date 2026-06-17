const GROUPS = {
  A: ["México","Sudáfrica","Corea del Sur","Chequia"],
  B: ["Canadá","Bosnia y Herzegovina","Catar","Suiza"],
  C: ["Brasil","Marruecos","Haití","Escocia"],
  D: ["Estados Unidos","Paraguay","Australia","Turquía"],
  E: ["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F: ["Países Bajos","Japón","Suecia","Túnez"],
  G: ["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H: ["España","Cabo Verde","Arabia Saudita","Uruguay"],
  I: ["Francia","Senegal","Irak","Noruega"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","RD del Congo","Uzbekistán","Colombia"],
  L: ["Inglaterra","Croacia","Ghana","Panamá"]
};

const FLAGS = {
  "México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Chequia":"🇨🇿",
  "Canadá":"🇨🇦","Bosnia y Herzegovina":"🇧🇦","Catar":"🇶🇦","Suiza":"🇨🇭",
  "Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷",
  "Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨",
  "Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳",
  "Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿",
  "España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudita":"🇸🇦","Uruguay":"🇺🇾",
  "Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴",
  "Portugal":"🇵🇹","RD del Congo":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴",
  "Inglaterra":"🇬🇧","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦"
};

const API_BASE_URL = "https://losurbinasbe.onrender.com/api";
const SECRET_WORD = "losUrbinas";

let players = [];
let currentPlayer = null;
let isSimulationMode = false;
let simulatedResults = {};

async function getJSON(key, shared, fallback){
  try{
    if(isSimulationMode && key === 'actual_results') {
      return simulatedResults;
    }
    if(key === 'players'){
      const res = await fetch(`${API_BASE_URL}/players`);
      if(res.ok) return await res.json();
    }
    if(key.startsWith('pred:')){
      const name = key.split(':')[1];
      const res = await fetch(`${API_BASE_URL}/players/${name}/predictions`);
      if(res.ok) return await res.json();
    }
    if(key === 'actual_results'){
      const res = await fetch(`${API_BASE_URL}/results`);
      if(res.ok) return await res.json();
    }
    if(key === 'me'){
      const localMe = localStorage.getItem('worldcup_me');
      return localMe ? localMe : fallback;
    }
    return fallback;
  }catch(e){
    console.error("Error al obtener datos:", e);
    return fallback;
  }
}

async function setJSON(key, value, shared){
  try{
    if(isSimulationMode && key === 'actual_results') {
      simulatedResults = value;
      localStorage.setItem('worldcup_sim_results', JSON.stringify(value));
      return true;
    }
    if(key.startsWith('pred:')){
      const name = key.split(':')[1];
      const res = await fetch(`${API_BASE_URL}/players/${name}/predictions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(value)
      });
      return res.ok;
    }
    if(key === 'actual_results'){
      const res = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(value)
      });
      return res.ok;
    }
    if(key === 'me'){
      if(value) localStorage.setItem('worldcup_me', value);
      else localStorage.removeItem('worldcup_me');
      return true;
    }
    return true;
  }catch(e){
    console.error("Error al guardar datos:", e);
    return false;
  }
}

function flag(team){ return FLAGS[team] ? FLAGS[team] + " " : ""; }

function teamOptions(teams, selected){
  let html = '<option value="">—</option>';
  teams.forEach(t=>{
    html += `<option value="${t}" ${t===selected?'selected':''}>${flag(t)}${t}</option>`;
  });
  return html;
}

function groupCard(group, prefix){
  const teams = GROUPS[group];
  return `
    <div class="g-card" data-group="${group}">
      <div class="g-head">
        <span class="g-letter">${group}</span>
      </div>
      <ul class="g-teamlist">
        ${teams.map(t=>`<li>${flag(t)}${t}</li>`).join('')}
      </ul>
      <div class="g-pick">
        <label>1º
          <select id="${prefix}-${group}-first">${teamOptions(teams, '')}</select>
        </label>
        <label>2º
          <select id="${prefix}-${group}-second">${teamOptions(teams, '')}</select>
        </label>
      </div>
    </div>`;
}

function buildGrid(containerId, prefix){
  const el = document.getElementById(containerId);
  el.innerHTML = Object.keys(GROUPS).map(g => groupCard(g, prefix)).join('');
}

function fillGrid(prefix, data){
  Object.keys(GROUPS).forEach(g=>{
    const d = (data && data[g]) || {};
    const f = document.getElementById(`${prefix}-${g}-first`);
    const s = document.getElementById(`${prefix}-${g}-second`);
    if(f) f.value = d.first || '';
    if(s) s.value = d.second || '';
  });
}

function readGrid(prefix){
  const out = {};
  Object.keys(GROUPS).forEach(g=>{
    const f = document.getElementById(`${prefix}-${g}-first`).value;
    const s = document.getElementById(`${prefix}-${g}-second`).value;
    if(f || s) out[g] = { first: f || null, second: s || null };
  });
  return out;
}

async function initPlayers(){
  players = await getJSON('players', true, []);
  currentPlayer = await getJSON('me', false, null);
  if(!currentPlayer || !players.includes(currentPlayer)){
    currentPlayer = players[0] || null;
  }
  renderPlayerSelect();
  renderChips();
}

function renderPlayerSelect(){
  const sel = document.getElementById('playerSelect');
  sel.innerHTML = players.map(p=>`<option value="${p}" ${p===currentPlayer?'selected':''}>${p}</option>`).join('');
}

function renderChips(){
  const wrap = document.getElementById('playerChips');
  wrap.innerHTML = players.map(p=>`<span class="chip">${p}</span>`).join('');
}

async function loadCurrentPlayerPredictions(){
  if(!currentPlayer){ fillGrid('p', {}); return; }
  const data = await getJSON(`pred:${currentPlayer}`, true, {});
  fillGrid('p', data);
}

function showTab(name){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active', p.id===name));
  
  document.getElementById('simAlert').style.display = isSimulationMode ? 'block' : 'none';
  if(name === 'marcador') renderLeaderboard();
}

function scoreFor(pred, actual){
  const detail = {};
  let pts = 0;
  Object.keys(GROUPS).forEach(g=>{
    const a = actual[g];
    if(!a || !a.first || !a.second){ detail[g] = 'pending'; return; }
    const p = pred[g];
    if(!p){ detail[g] = 'miss'; return; }
    
    const predFirst = (p.first || '').trim().toLowerCase();
    const predSecond = (p.second || '').trim().toLowerCase();
    const actualFirst = (a.first || '').trim().toLowerCase();
    const actualSecond = (a.second || '').trim().toLowerCase();

    let g_pts = 0;
    if(predFirst === actualFirst) g_pts += 3;
    if(predSecond === actualSecond) g_pts += 2;
    pts += g_pts;
    detail[g] = g_pts === 5 ? 'both' : g_pts === 3 ? 'first' : g_pts === 2 ? 'second' : 'miss';
  });
  return { pts, detail };
}

function animateNumber(el, to, duration){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    el.textContent = to; return;
  }
  const start = performance.now();
  function tick(now){
    const t = Math.min(1, (now - start) / duration);
    const val = Math.round(to * (1 - Math.pow(1 - t, 3)));
    el.textContent = val;
    if(t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function renderLeaderboard(){
  const box = document.getElementById('leaderboard');
  if(!players.length){
    box.innerHTML = `<div class="empty-state">Agrega amigos en la pestaña "Predicciones" para empezar.</div>`;
    return;
  }
  const actual = await getJSON('actual_results', true, {});
  const rows = [];
  for(const name of players){
    const pred = await getJSON(`pred:${name}`, true, {});
    const { pts, detail } = scoreFor(pred, actual);
    rows.push({ name, pts, detail });
  }
  rows.sort((a,b)=> b.pts - a.pts || a.name.localeCompare(b.name));
  const maxPts = 60;

  box.innerHTML = rows.map((r, i)=>`
    <div class="lb-row rank-${i+1}">
      <div class="lb-rank">${i+1}</div>
      <div class="lb-main">
        <div class="lb-top">
          <span class="lb-name">${r.name}</span>
          <span class="lb-pts" data-pts="${r.pts}">0<span>pts</span></span>
        </div>
        <div class="lb-bar-wrap"><div class="lb-bar" data-w="${(r.pts/maxPts*100).toFixed(1)}"></div></div>
        <div class="lb-dots">
          ${Object.keys(GROUPS).map(g=>`<span class="dot ${r.detail[g]}" title="Grupo ${g}: ${labelFor(r.detail[g])}">${g}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  requestAnimationFrame(()=>{
    box.querySelectorAll('.lb-bar').forEach(bar=>{ bar.style.width = bar.dataset.w + '%'; });
    box.querySelectorAll('.lb-pts').forEach(el=>{ animateNumber(el.firstChild ? el : el, parseInt(el.dataset.pts), 700); });
  });
}

function labelFor(status){
  return { both:'1º y 2º exactos', first:'1º correcto', second:'2º correcto', miss:'falló', pending:'pendiente' }[status] || status;
}

function setupValidation(containerId, prefix) {
  const container = document.getElementById(containerId);
  if(!container) return;
  container.addEventListener('change', (e) => {
    if (e.target.id && e.target.id.startsWith(`${prefix}-`) && e.target.id.endsWith('-first')) {
      const groupLetter = e.target.id.split('-')[1];
      const firstPlaceSelected = e.target.value;
      const secondSelect = document.getElementById(`${prefix}-${groupLetter}-second`);
      
      if (secondSelect) {
        const currentSecondValue = secondSelect.value;
        Array.from(secondSelect.options).forEach(option => {
          option.disabled = (firstPlaceSelected && option.value === firstPlaceSelected);
        });
        if (currentSecondValue === firstPlaceSelected) { secondSelect.value = ''; }
      }
    }
  });
}

async function init(){
  buildGrid('predGrid', 'p');
  buildGrid('resGrid', 'r');

  setupValidation('predGrid', 'p');
  setupValidation('resGrid', 'r');

  await initPlayers();
  await loadCurrentPlayerPredictions();

  const actual = await getJSON('actual_results', true, {});
  fillGrid('r', actual);

  document.querySelectorAll('.tab').forEach(t=>{ t.addEventListener('click', ()=> showTab(t.dataset.tab)); });

  document.getElementById('playerSelect').addEventListener('change', async (e)=>{
    currentPlayer = e.target.value;
    await setJSON('me', currentPlayer, false);
    await loadCurrentPlayerPredictions();
    document.getElementById('predStatus').textContent = '';
  });

  document.getElementById('addPlayerBtn').addEventListener('click', async () => {
    const input = document.getElementById('newPlayerInput');
    if(input.style.display === 'none'){
      input.style.display = 'inline-block'; input.focus(); return;
    }
    const name = input.value.trim();
    if(!name) return;
    
    if(!players.includes(name)){
      players.push(name);
      currentPlayer = name;
      await setJSON('me', currentPlayer, false);
      await setJSON(`pred:${name}`, {}, true); 
      renderPlayerSelect();
      renderChips();
      await loadCurrentPlayerPredictions();
    }
    input.value = ''; input.style.display = 'none';
  });

  document.getElementById('savePredBtn').addEventListener('click', async ()=>{
    if(e.target.hasAttribute('disabled')) {
      alert('Ya no puedes cambiar tus predicciones')
      return;
    }
    if(!currentPlayer){
      document.getElementById('predStatus').textContent = 'Primero elige o agrega tu nombre.'; return;
    }
    const data = readGrid('p');
    const ok = await setJSON(`pred:${currentPlayer}`, data, true);
    document.getElementById('predStatus').textContent = ok ? `Guardado ✓ (${currentPlayer})` : 'Error al guardar.';
  });

  // Manejo de guardado seguro con Contraseña para el Servidor Real
  document.getElementById('saveResBtn').addEventListener('click', async ()=>{
    const data = readGrid('r');
    if(isSimulationMode) {
      await setJSON('actual_results', data, false);
      document.getElementById('resStatus').textContent = 'Simulación actualizada en tu pantalla. ¡Ve a revisar el Marcador!';
    } else {
      // Petición de contraseña fija si se intenta alterar la base de datos real
      const pass = prompt("Introduce el santo y seña para modificar resultados oficiales:");
      if(pass !== SECRET_WORD) {
        alert("Contraseña incorrecta. No tienes permisos para alterar la base de datos real.");
        document.getElementById('resStatus').textContent = 'Acceso denegado. Intenta usando el Modo Simulador.';
        return;
      }
      
      const ok = await setJSON('actual_results', data, true);
      document.getElementById('resStatus').textContent = ok ? 'Resultados Oficiales Guardados en Servidor ✓' : 'Error al guardar en el servidor.';
    }
  });

  const simToggleBtn = document.getElementById('simToggleBtn');
  const simBadge = document.getElementById('simBadge');
  const simHint = document.getElementById('simHint');
  const saveResBtn = document.getElementById('saveResBtn');

  simToggleBtn.addEventListener('click', async () => {
    isSimulationMode = !isSimulationMode;
    
    if(isSimulationMode) {
      document.body.classList.add('sim-active');
      simBadge.textContent = "Modo: Simulador 🧪";
      simBadge.style.background = "var(--purple)";
      simHint.textContent = "Los cambios solo se guardan en tu teléfono. Libre acceso sin contraseña.";
      simToggleBtn.textContent = "Volver a Resultados Oficiales 🌍";
      simToggleBtn.classList.add('btn-sim-off');
      saveResBtn.textContent = "Aplicar simulación local";
      saveResBtn.style.background = "var(--purple)";
      saveResBtn.style.color = "white";

      const localSim = localStorage.getItem('worldcup_sim_results');
      if(localSim) {
        simulatedResults = JSON.parse(localSim);
      } else {
        simulatedResults = readGrid('r');
      }
      fillGrid('r', simulatedResults);
    } else {
      document.body.classList.remove('sim-active');
      simBadge.textContent = "Modo: Oficial 🔒";
      simBadge.style.background = "var(--purple)";
      simHint.textContent = "Viendo los resultados reales del servidor. Requiere contraseña para guardar.";
      simToggleBtn.textContent = "Activar Modo Simulador 🧪";
      simToggleBtn.classList.remove('btn-sim-off');
      saveResBtn.textContent = "Guardar resultados oficiales";
      saveResBtn.style.background = "var(--clr-miss)";
      saveResBtn.style.color = "#ffffff";

      isSimulationMode = false;
      const actualData = await getJSON('actual_results', true, {});
      fillGrid('r', actualData);
    }
    document.getElementById('resStatus').textContent = '';
  });

  document.getElementById('settingsToggle').addEventListener('click', ()=>{
    document.getElementById('settingsPanel').classList.toggle('hidden');
  });

  document.getElementById('resetBtn').addEventListener('click', async ()=>{
    const pass = prompt("Introduce el santo y seña para REINICIAR LA BASE DE DATOS:");
    if(pass !== SECRET_WORD) {
      alert("Acción cancelada. Contraseña incorrecta.");
      return;
    }
    if(!confirm('¿Borrar permanentemente todos los datos de la base de datos?')) return;
    try {
      await fetch(`${API_BASE_URL}/players`, { method: 'DELETE' });
      await fetch(`${API_BASE_URL}/results`, { method: 'DELETE' });
      await setJSON('me', null, false);
      localStorage.removeItem('worldcup_sim_results');
      location.reload();
    } catch(e) { console.error(e); }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW registrado', reg.scope))
      .catch(err => console.error('Error SW', err));
  });
}

init();
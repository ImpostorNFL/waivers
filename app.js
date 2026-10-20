'use strict';

// Cambiá solamente este valor si querés usar otra liga.
const LEAGUE_ID = '1388976988894543872';
const API = 'https://api.sleeper.app/v1';
const PAGE_SIZE = 50;
const CACHE_KEY = 'lfa-waivers-players-v1';
const CACHE_AGE_MS = 24 * 60 * 60 * 1000;
const POSITIONS = ['QB', 'RB', 'WR', 'TE'];
const $ = (id) => document.getElementById(id);
let available = [];
let position = 'ALL';
let limit = PAGE_SIZE;
let busy = false;

async function getJSON(path) {
  const response = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Sleeper respondió HTTP ${response.status}`);
  return response.json();
}

async function getPlayers() {
  // Sleeper recomienda no descargar el catálogo completo más de una vez al día.
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.timestamp < CACHE_AGE_MS && cached.data) return cached.data;
  } catch (_) { /* El navegador puede bloquear localStorage. */ }
  // API con filtro activo para reducir descarga; se conserva información de jugadores lesionados activos.
  const data = await getJSON('/players/nfl?active=true');
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data })); } catch (_) { /* Opcional */ }
  return data;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function primaryPosition(player) {
  const all = [player.position, ...(player.fantasy_positions || [])];
  return POSITIONS.find(p => all.includes(p)) || null;
}
function showNotice(text, error = false) {
  $('notice').textContent = text;
  $('notice').classList.toggle('error', error);
}
function render() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const sort = $('sort').value;
  let rows = available.filter(p =>
    (position === 'ALL' || p._position === position) &&
    `${p.full_name || ''} ${p.team || ''} ${p._position}`.toLocaleLowerCase().includes(query)
  );
  rows.sort((a, b) => {
    if (sort === 'popular') return (b._adds - a._adds) || a.full_name.localeCompare(b.full_name, 'es');
    if (sort === 'team') return (a.team || 'ZZZ').localeCompare(b.team || 'ZZZ') || a.full_name.localeCompare(b.full_name, 'es');
    return a.full_name.localeCompare(b.full_name, 'es');
  });
  $('count').textContent = rows.length.toLocaleString('es-AR');
  $('shown').textContent = `Mostrando ${Math.min(rows.length, limit).toLocaleString('es-AR')} de ${rows.length.toLocaleString('es-AR')} jugadores`;
  $('more').hidden = limit >= rows.length;
  const shown = rows.slice(0, limit);
  $('players').innerHTML = shown.length ? shown.map(p => {
    const id = encodeURIComponent(p.player_id);
    const fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="#e9f1f4"/><text x="24" y="32" fill="#587f96" font-size="20" text-anchor="middle">?</text></svg>');
    return `<tr><td><div class="player"><img class="avatar" src="https://sleepercdn.com/content/nfl/players/${id}.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'"><div class="person"><strong>${escapeHTML(p.full_name)}</strong><small>${escapeHTML(p.college || 'NFL')}</small></div></div></td><td><span class="pos">${p._position}</span></td><td>${escapeHTML(p.team || 'FA')}</td><td>${p._adds ? `<span class="trend">↗ ${p._adds.toLocaleString('es-AR')}</span>` : '<span class="muted">—</span>'}</td><td>${p.injury_status ? `<span class="injury">${escapeHTML(p.injury_status)}</span>` : '<span class="muted">—</span>'}</td></tr>`;
  }).join('') : `<tr><td colspan="5" class="empty">No encontramos jugadores con esos filtros.</td></tr>`;
}

async function load() {
  if (busy) return;
  busy = true;
  $('refresh').disabled = true;
  showNotice('Consultando la liga, sus rosters y el catálogo de jugadores...');
  try {
    const [league, rosters, players, trending] = await Promise.all([
      getJSON(`/league/${LEAGUE_ID}`),
      getJSON(`/league/${LEAGUE_ID}/rosters`),
      getPlayers(),
      getJSON('/players/nfl/trending/add?lookback_hours=24&limit=200').catch(() => [])
    ]);
    if (!league || !Array.isArray(rosters) || !players || typeof players !== 'object') throw new Error('No se pudo interpretar la información de la liga.');
    const occupied = new Set(rosters.flatMap(r => r.players || []).map(String));
    const adds = new Map((Array.isArray(trending) ? trending : []).map(p => [String(p.player_id), Number(p.count) || 0]));
    available = Object.entries(players).map(([id, p]) => ({ ...p, player_id: String(p.player_id || id) }))
      .filter(p => !occupied.has(p.player_id))
      .map(p => ({ ...p, _position: primaryPosition(p), _adds: adds.get(p.player_id) || 0 }))
      .filter(p => p._position && p.full_name && p.team);
    $('leagueName').textContent = league.name || 'Liga de Sleeper';
    $('season').textContent = league.season || 'Temporada';
    $('teams').textContent = String(rosters.length);
    $('updated').textContent = `Actualizado ${new Date().toLocaleString('es-AR', { day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit' })}`;
    limit = PAGE_SIZE;
    showNotice('');
    render();
  } catch (error) {
    showNotice(`No se pudieron cargar los datos. ${error.message}. Verificá la conexión e intentá «Actualizar».`, true);
    $('players').innerHTML = '<tr><td colspan="5" class="empty">No se pudo establecer conexión con la API de Sleeper.</td></tr>';
    $('shown').textContent = 'Sin datos';
    $('count').textContent = '—';
    $('more').hidden = true;
  } finally { busy = false; $('refresh').disabled = false; }
}

document.querySelectorAll('.chip').forEach(button => button.addEventListener('click', () => {
  position = button.dataset.position;
  document.querySelectorAll('.chip').forEach(chip => {
    const selected = chip === button;
    chip.classList.toggle('active', selected);
    chip.setAttribute('aria-pressed', String(selected));
  });
  limit = PAGE_SIZE;
  render();
}));
$('search').addEventListener('input', () => { limit = PAGE_SIZE; render(); });
$('sort').addEventListener('change', () => { limit = PAGE_SIZE; render(); });
$('more').addEventListener('click', () => { limit += PAGE_SIZE; render(); });
$('refresh').addEventListener('click', load);
load();

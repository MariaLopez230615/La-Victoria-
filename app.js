
const fmt = n => new Intl.NumberFormat('es-AR').format(n);
const state = {
  balance: Number(localStorage.getItem('lv_balance') || 125600),
  favorites: JSON.parse(localStorage.getItem('lv_favorites') || '[]'),
  bonusClaimed: localStorage.getItem('lv_daily_bonus') === '1'
};

const games = [
  {id:'joker',title:'Joker Fiesta',emoji:'🃏',studio:'Victoria Originals',cat:['tragamonedas','nuevo'],art:'art-joker',badge:'NUEVO',desc:'Risas, luces y combinaciones de la suerte.'},
  {id:'mouse',title:'Ratón de la Fortuna',emoji:'🐭',studio:'Casa Dorada',cat:['tragamonedas','nuevo'],art:'art-mouse',badge:'NUEVO',desc:'Monedas doradas y premios sorpresa.'},
  {id:'thunder',title:'Reino del Trueno',emoji:'⚡',studio:'Nova Play',cat:['tragamonedas','jackpot'],art:'art-thunder',badge:'JACKPOT',desc:'Rayos, truenos y desafíos épicos.'},
  {id:'ruby',title:'Ruby Diamonds',emoji:'💎',studio:'Victoria Originals',cat:['tragamonedas','nuevo'],art:'art-ruby',badge:'NUEVO',desc:'Gemas brillantes y líneas premiadas.'},
  {id:'egypt',title:'Secreto de Cleopatra',emoji:'𓂀',studio:'Casa Dorada',cat:['tragamonedas','egipcio'],art:'art-egypt',badge:'',desc:'Tesoros del antiguo Egipto.'},
  {id:'fruit',title:'Frutas Clásicas',emoji:'🍒',studio:'Victoria Originals',cat:['tragamonedas','frutas'],art:'art-fruit',badge:'',desc:'Una versión moderna del clásico frutal.'},
  {id:'wolf',title:'Lobo de Oro',emoji:'🐺',studio:'Nova Play',cat:['tragamonedas','jackpot'],art:'art-wolf',badge:'JACKPOT',desc:'Bosques nocturnos y multiplicadores.'},
  {id:'dragon',title:'Dragón Infernal',emoji:'🐉',studio:'Casa Dorada',cat:['tragamonedas','nuevo'],art:'art-dragon',badge:'NUEVO',desc:'Fuego, dragones y cofres legendarios.'},
  {id:'candy',title:'Dulce Premio',emoji:'🍭',studio:'Nova Play',cat:['tragamonedas','nuevo'],art:'art-candy',badge:'NUEVO',desc:'Caramelos, colores y combos.'},
  {id:'buffalo',title:'Buffalo Power',emoji:'🦬',studio:'Victoria Originals',cat:['tragamonedas','jackpot'],art:'art-buffalo',badge:'JACKPOT',desc:'La fuerza de la pradera en cada giro.'}
];

let currentCategory = 'todos';
const grid = document.querySelector('#gamesGrid');
const modal = document.querySelector('#modal');
const content = document.querySelector('#modalContent');

function save(){
  localStorage.setItem('lv_balance',state.balance);
  localStorage.setItem('lv_favorites',JSON.stringify(state.favorites));
}
function updateBalance(){
  document.querySelector('#balanceTop').textContent = fmt(state.balance);
  document.querySelector('#balanceSide').textContent = fmt(state.balance);
}
function openModal(html){content.innerHTML=html;modal.showModal()}
document.querySelector('#modalClose').onclick=()=>modal.close();

function renderGames(){
  const q = document.querySelector('#searchInput').value.trim().toLowerCase();
  const provider = document.querySelector('#providerSelect').value;
  let list = games.filter(g=>{
    const categoryOk = currentCategory==='todos' || (currentCategory==='favorito' ? state.favorites.includes(g.id) : g.cat.includes(currentCategory));
    const queryOk = !q || g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
    const providerOk = provider==='todos' || g.studio===provider;
    return categoryOk && queryOk && providerOk;
  });
  grid.innerHTML = list.map(g=>`
    <article class="game-card" data-id="${g.id}">
      ${g.badge?`<span class="badge ${g.badge==='JACKPOT'?'jackpot':''}">${g.badge}</span>`:''}
      <button class="heart ${state.favorites.includes(g.id)?'active':''}" data-fav="${g.id}">♥</button>
      <div class="game-art ${g.art}"><span>${g.emoji}</span></div>
      <h3>${g.title}</h3><p>${g.studio}</p>
    </article>`).join('') || `<p style="color:#aaa">No encontramos juegos con esos filtros.</p>`;
  document.querySelectorAll('[data-fav]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const id=btn.dataset.fav;
    state.favorites = state.favorites.includes(id) ? state.favorites.filter(x=>x!==id) : [...state.favorites,id];
    save(); renderGames();
  });
  document.querySelectorAll('.game-card').forEach(card=>card.onclick=()=>launchGame(card.dataset.id));
}

function launchGame(id){
  const g=games.find(x=>x.id===id);
  openModal(`
    <h2 class="modal-title">${g.emoji} ${g.title}</h2>
    <p>${g.desc}</p>
    <div class="modal-grid">
      <div class="modal-box"><small>ESTUDIO</small><br><b>${g.studio}</b></div>
      <div class="modal-box"><small>APUESTA DEMO</small><br><b>100 fichas virtuales</b></div>
    </div>
    <p style="color:#aeb4c4">Esta demo usa únicamente fichas virtuales sin valor monetario.</p>
    <button class="primary" id="spinDemo">GIRAR DEMO 🎰</button>
    <div id="spinResult" style="margin-top:14px;font-size:20px"></div>`);
  document.querySelector('#spinDemo').onclick=()=>{
    if(state.balance<100){document.querySelector('#spinResult').textContent='No tenés suficientes fichas virtuales.';return}
    state.balance-=100;
    const won=Math.random()<.42;
    const prize=won?[150,200,350,500][Math.floor(Math.random()*4)]:0;
    state.balance+=prize; save(); updateBalance();
    document.querySelector('#spinResult').innerHTML = won ? `✨ ¡Ganaste <b>${fmt(prize)}</b> fichas!` : '🎲 Esta vez no hubo premio. Probá otra vez.';
  };
}

document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
document.querySelectorAll('.category').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.category').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); currentCategory=b.dataset.category; renderGames();
});
document.querySelector('#searchInput').oninput=renderGames;
document.querySelector('#providerSelect').onchange=renderGames;

document.querySelector('#dailyBonus').onclick=()=>{
  if(state.bonusClaimed){openModal('<h2 class="modal-title">Bono diario</h2><p>Ya reclamaste tu bono de hoy. Volvé mañana.</p>');return}
  state.balance+=2500; state.bonusClaimed=true; localStorage.setItem('lv_daily_bonus','1');save();updateBalance();
  openModal('<h2 class="modal-title">⭐ ¡Bono reclamado!</h2><p>Sumaste <b>2.500 fichas virtuales</b> a tu saldo.</p>');
};
document.querySelector('#welcomeBonus').onclick=()=>openModal('<h2 class="modal-title">Bono de bienvenida</h2><p>La demo puede asignar bonos internos de fichas virtuales a perfiles nuevos. Las fichas no se compran ni se canjean por dinero.</p>');
document.querySelector('#howButton').onclick=()=>openModal('<h2 class="modal-title">¿Cómo funciona?</h2><p>Cada integrante puede tener su perfil, saldo de fichas virtuales, favoritos y nivel. Los juegos demo descuentan y otorgan únicamente puntos internos sin valor monetario.</p>');
document.querySelector('#balanceButton').onclick=document.querySelector('#cashierButton').onclick=()=>openModal(`<h2 class="modal-title">Mis fichas</h2><p>Saldo actual: <b>${fmt(state.balance)} fichas virtuales</b>.</p><p>Estas fichas son puntos internos y no pueden comprarse, venderse, depositarse ni retirarse.</p>`);
document.querySelector('#openProfile').onclick=document.querySelector('#profileButton').onclick=()=>openModal(`<h2 class="modal-title">Mi perfil</h2><div class="modal-grid"><div class="modal-box"><b>Sol Rolón</b><br>Nivel 8</div><div class="modal-box"><b>${fmt(state.balance)}</b><br>fichas virtuales</div><div class="modal-box"><b>${state.favorites.length}</b><br>favoritos</div><div class="modal-box"><b>2.150 XP</b><br>experiencia</div></div>`);
document.querySelector('#tournamentButton').onclick=()=>openModal('<h2 class="modal-title">🏆 Torneos</h2><p><b>Desafío relámpago:</b> acumulá 5.000 puntos en juegos demo.</p><p><b>Reto familiar:</b> completá 10 partidas esta semana.</p>');
document.querySelector('#jackpotInfo').onclick=()=>openModal('<h2 class="modal-title">💎 Jackpot familiar</h2><p>El pozo semanal es un contador virtual para desafíos internos. No representa dinero ni un premio monetario.</p>');
document.querySelector('#inviteButton').onclick=()=>openModal('<h2 class="modal-title">Invitar familia</h2><p>Copiá el enlace de La Victoria y compartilo con quienes quieras que entren a la demo.</p><button class="primary" id="copyLink">COPIAR ENLACE</button>');
document.addEventListener('click',e=>{if(e.target?.id==='copyLink'){navigator.clipboard?.writeText(location.href);e.target.textContent='¡COPIADO!'}});

function support(){
  openModal(`<h2 class="modal-title">🎧 Soporte en línea</h2><p><span class="online-dot"></span> Canal de soporte de demostración.</p><div class="support-chat"><textarea id="supportText" placeholder="Escribí tu consulta..."></textarea><button class="purple-button" id="sendSupport">ENVIAR MENSAJE</button><div id="supportReply" style="margin-top:10px;color:#aeb4c4"></div></div>`);
}
document.querySelector('#supportButton').onclick=support;
document.querySelector('#supportNav').onclick=support;
document.addEventListener('click',e=>{if(e.target?.id==='sendSupport'){document.querySelector('#supportReply').textContent='Mensaje guardado localmente en esta demo. Para soporte real habría que conectar un servicio de chat o backend.'}});
document.querySelector('#bonusButton').onclick=()=>document.querySelector('#promos').scrollIntoView({behavior:'smooth'});
document.querySelector('#notifyButton').onclick=()=>openModal('<h2 class="modal-title">🔔 Notificaciones</h2><p>No tenés notificaciones nuevas.</p>');
document.querySelector('#menuButton').onclick=()=>openModal('<h2 class="modal-title">Menú</h2><p>Inicio · Juegos · Promociones · Perfil · Soporte</p>');
document.querySelector('#allCategories').onclick=()=>openModal('<h2 class="modal-title">Categorías disponibles</h2><p>Tragamonedas · Jackpots · Nuevos · Favoritos · Frutas · Egipcios.</p>');

updateBalance(); renderGames();

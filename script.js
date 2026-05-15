const moneyEl = document.getElementById('money');
const waveEl = document.getElementById('wave');
const dpsEl = document.getElementById('dps');
const wallNameEl = document.getElementById('wall-name');
const wallHealthEl = document.getElementById('wall-health');
const wallHpText = document.getElementById('wall-hp-text');
const nextWallText = document.getElementById('next-wall-text');
const healthBarEl = document.getElementById('health-bar');
const wallEl = document.getElementById('wall');
const attackBtn = document.getElementById('attack-button');
const clickDamageEl = document.getElementById('click-damage');
const destroyBonusEl = document.getElementById('destroy-bonus');
const unitShopEl = document.getElementById('unit-shop');

const unitTemplates = [
  {
    name: '소형 전초기',
    description: '벽에 작은 빔을 자동으로 발사합니다.',
    baseCost: 25,
    damage: 1,
    increase: 10,
  },
  {
    name: '중형 로봇',
    description: '자동 데미지가 높아집니다.',
    baseCost: 120,
    damage: 6,
    increase: 15,
  },
  {
    name: '대형 포탑',
    description: '강력한 자동 공격을 가합니다.',
    baseCost: 520,
    damage: 28,
    increase: 20,
  },
  {
    name: '외계 기술',
    description: '초고속 자동 데미지를 제공합니다.',
    baseCost: 2200,
    damage: 120,
    increase: 25,
  },
];

const wallTemplates = [
  { name: '초급 벽', color: ['#34d399', '#15803d'], baseHp: 100, reward: 20 },
  { name: '단단한 벽', color: ['#38bdf8', '#0ea5e9'], baseHp: 220, reward: 45 },
  { name: '강철 벽', color: ['#a78bfa', '#6d28d9'], baseHp: 520, reward: 110 },
  { name: '에너지 벽', color: ['#f97316', '#ea580c'], baseHp: 960, reward: 220 },
  { name: '외계 유물', color: ['#fb7185', '#be123c'], baseHp: 1600, reward: 420 },
];

const state = {
  money: 0,
  wave: 1,
  clickDamage: 1,
  destroyBonus: 20,
  units: unitTemplates.map((unit) => ({ ...unit, count: 0 })),
  wall: null,
  lastTick: performance.now(),
};

function createWall() {
  const template = wallTemplates[(state.wave - 1) % wallTemplates.length];
  const multiplier = 1 + (state.wave - 1) * 0.22;
  const hp = Math.round(template.baseHp * multiplier);
  state.wall = {
    name: `${template.name} ${state.wave}`,
    maxHp: hp,
    hp,
    color: template.color,
    reward: Math.round(template.reward * multiplier),
  };
  wallEl.style.background = `linear-gradient(180deg, ${template.color[0]}, ${template.color[1]})`;
  updateWallUI();
}

function updateMoney(value) {
  state.money = Math.max(0, state.money + value);
  moneyEl.textContent = state.money.toLocaleString();
}

function getDPS() {
  return state.units.reduce((sum, unit) => sum + unit.damage * unit.count, 0);
}

function updateUI() {
  waveEl.textContent = state.wave;
  dpsEl.textContent = getDPS();
  clickDamageEl.textContent = state.clickDamage;
  destroyBonusEl.textContent = state.destroyBonus;
  updateWallUI();
  renderShop();
}

function updateWallUI() {
  const wall = state.wall;
  if (!wall) return;
  wallNameEl.textContent = wall.name;
  wallHealthEl.textContent = `${Math.max(wall.hp, 0)} / ${wall.maxHp}`;
  wallHpText.textContent = `체력 ${wall.hp} / ${wall.maxHp}`;
  nextWallText.textContent = `벽을 부수면 ${wall.reward.toLocaleString()}원 획득`;
  const ratio = Math.max(0, wall.hp / wall.maxHp);
  healthBarEl.style.width = `${ratio * 100}%`;
}

function attackWall() {
  if (!state.wall) return;
  state.wall.hp -= state.clickDamage;
  updateMoney(1);
  checkWallDestroyed();
  updateUI();
}

function checkWallDestroyed() {
  if (!state.wall || state.wall.hp > 0) return;
  updateMoney(state.wall.reward + 5);
  state.wave += 1;
  state.destroyBonus = state.wall.reward;
  createWall();
}

function buyUnit(index) {
  const unit = state.units[index];
  const cost = getUnitCost(unit);
  if (state.money < cost) return;
  state.money -= cost;
  unit.count += 1;
  updateUI();
}

function getUnitCost(unit) {
  return Math.round(unit.baseCost * Math.pow(1.18, unit.count));
}

function renderShop() {
  unitShopEl.innerHTML = '';
  state.units.forEach((unit, index) => {
    const card = document.createElement('div');
    card.className = 'unit-card';
    card.innerHTML = `
      <h3>${unit.name}</h3>
      <p>${unit.description}</p>
      <p>데미지: ${unit.damage} /초</p>
      <p>보유: ${unit.count}</p>
      <p>구매가: ${getUnitCost(unit).toLocaleString()}원</p>
      <button ${state.money < getUnitCost(unit) ? 'disabled' : ''}>구매</button>
    `;
    const button = card.querySelector('button');
    button.addEventListener('click', () => buyUnit(index));
    unitShopEl.appendChild(card);
  });
}

function tick(timestamp) {
  const delta = Math.min(500, timestamp - state.lastTick);
  state.lastTick = timestamp;
  const dps = getDPS();
  if (dps > 0 && state.wall) {
    const damage = (dps * delta) / 1000;
    state.wall.hp -= damage;
    updateMoney(Math.floor(damage * 0.2));
    checkWallDestroyed();
  }
  updateUI();
  requestAnimationFrame(tick);
}

attackBtn.addEventListener('click', attackWall);
createWall();
updateUI();
requestAnimationFrame(tick);

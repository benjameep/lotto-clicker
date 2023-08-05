let winnings = 0;
let ticketsBought = 0;

const lotto = [
  {
    name: '5 Star Draw',
    cost: 1,
    cumulative: false,
    chances: [
      {odds: 6, winnings: 5},
      {odds: 78, winnings: 20},
      {odds: 3054, winnings: 1000},
      {odds: 610880, winnings: 250000},
    ]
  },
  {
    name: 'Blackout Big Bingo',
    cost: 5,
    cumulative: false,
    chances: [
      {odds: 7, winnings: 5},
      {odds: 13, winnings: 10},
      {odds: 50, winnings: 15},
      {odds: 38, winnings: 20},
      {odds: 137, winnings: 30},
      {odds: 144, winnings: 50},
      {odds: 1097, winnings: 100},
      {odds: 3254, winnings: 500},
      {odds: 92188, winnings: 1_000},
      {odds: 276563, winnings: 50_000},
    ]
  }
][1]

const failure_messages = ['nope', 'whoops', 'darn', 'sorry']

const $pointer = document.getElementById('pointer');
const $winnings = document.getElementById('winnings');
const $tippy = [...document.querySelectorAll('.tippy-box,.tippy-arrow')]
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
if (!lotto) throw new Error('lotto not found')

let cx = 0;
let cy = 0;

function drawCircle(x, y, radius, color){
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  // ctx.strokeStyle = '#333';
  // ctx.stroke();
  ctx.closePath();
}

function calcAreas(pool){
  var inner = 0
  var areas = []
  for(let i = lotto.chances.length-1; i >= 0; i--) {
      let chance = lotto.chances[i]
      let area = pool / chance.odds
      if (!lotto.cumulative) {
        area += inner
        inner = area
      }
      areas.unshift(area)
  }
  return areas
}

function draw(){
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  cx = width *  0.5;
  cy = height * 0.4;
  const colors = d3.quantize(d3.interpolateHslLong("#b0d5ff", "black"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHslLong("#ad99ff", "black"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHslLong("#ffba8f", "#420600"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHsl("#961F08", "#B217E3"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHcl("#f4e153", "#362142"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHslLong("blue", "red"), lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateViridis, lotto.chances.length)
  // const colors = d3.quantize(d3.interpolateHcl("#a9a9b4", "#d66000"), lotto.chances.length)
  // const colors = d3.schemeSpectral[lotto.chances.length]
  lotto.chances.sort((a, b) => a.odds - b.odds)

  const pool = width * height
  const areas = calcAreas(pool)
  for (var i = 0; i < lotto.chances.length; i++) {
    let chance = lotto.chances[i];
    // chance.area = pool / chance.odds;
    chance.area = areas[i]
    chance.radius = Math.sqrt(chance.area / Math.PI)
    drawCircle(cx, cy, chance.radius, colors[i])
  }
}

function buyLotto(){
  ticketsBought++;
  winnings -= lotto.cost;
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const dx = x - cx;
  const dy = y - cy;
  const won = lotto.chances.findLast(chance => Math.sqrt(dx * dx + dy * dy) < chance.radius)

  if (won) {
    won.count = won.count || 0;
    won.count++;
    winnings += won.winnings;
  }
  return [x, y, won];
}

function showLottoResults(x, y, won) {
  flag.show()
  $pointer.style.left = x + 'px';
  $pointer.style.top = y + 'px';
  if (!won) {
    flag.setContent(failure_messages[Math.floor(Math.random() * failure_messages.length)])
    flag.popper.classList.remove('won')
  } else {
    flag.setContent('$' + won.winnings)
    flag.popper.classList.add('won')
  }
  
  if(winnings < 0) {
    $winnings.textContent = '-$' + Math.abs(winnings);
    $winnings.classList.add('negative')
  } else {
    $winnings.textContent = '$' + winnings;
    $winnings.classList.remove('negative')
  }
}

window.onresize = draw;
window.onload = draw;
window.onclick = () => {
  const [px, py, won] = buyLotto()
  showLottoResults(px, py, won)
};

const [flag] = tippy('#pointer', {
  hideOnClick: false,
})

// lotto.chances.reduce((sum, chance) =>  sum + chance.winnings * chance.count, 0) - ticketsBought * lotto.cost

function simulate(rounds) {
  for(var i = 0; i <= rounds; i++) {
    buyLotto()
    if (ticketsBought % 100000 === 0) console.log(winnings, ticketsBought, lotto.chances.map(d => d.count))
  }
  console.table(lotto.chances)
}

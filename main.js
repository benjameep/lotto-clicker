let spent = 0;
let won = 0;
let ticketsBought = 0;

const lotto = [
  {
    name: '5 Star Draw',
    cost: 5,
    cumulative: true,
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
const $net = document.getElementById('net');
const $spent = document.getElementById('spent');
const $won = document.getElementById('won');
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
  spent += lotto.cost;
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const dx = x - cx;
  const dy = y - cy;
  const prize = lotto.chances.findLast(chance => Math.sqrt(dx * dx + dy * dy) < chance.radius)

  if (prize) {
    prize.count = prize.count || 0;
    prize.count++;
    won += prize.winnings;
  }
  return [x, y, prize?.winnings];
}

function showLottoResults(x, y, amount) {
  flag.show()
  $pointer.style.left = x + 'px';
  $pointer.style.top = y + 'px';
  if (amount) {
    flag.setContent('$' + amount)
    flag.popper.classList.add('won')
  } else {
    flag.setContent(failure_messages[Math.floor(Math.random() * failure_messages.length)])
    flag.popper.classList.remove('won')
  }
  
  const net = won - spent;
  $spent.textContent = '$' + spent;
  $won.textContent = '$' + won;
  if(net < 0) {
    $net.textContent = '-$' + Math.abs(net);
    $net.classList.remove('positive')
    $net.classList.add('negative')
  } else if (net > 0) {
    $net.textContent = '$' + net;
    $net.classList.remove('negative')
    $net.classList.add('positive')
  } else {
    $net.textContent = '$' + net;
    $net.classList.remove('negative')
    $net.classList.remove('positive')
  }
}

window.onresize = draw;
window.onload = draw;
window.onclick = () => {
  const [x, y, amount] = buyLotto()
  showLottoResults(x, y, amount)
};

const [flag] = tippy('#pointer', {
  hideOnClick: false,
})

// lotto.chances.reduce((sum, chance) =>  sum + chance.winnings * chance.count, 0) - ticketsBought * lotto.cost

function simulate(rounds) {
  for(var i = 0; i <= rounds; i++) {
    buyLotto()
    if (ticketsBought % 100000 === 0) console.log(net, ticketsBought, lotto.chances.map(d => d.count))
  }
  console.table(lotto.chances)
}

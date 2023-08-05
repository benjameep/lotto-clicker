
const cost = 1;
function loadData() {
  const chances = [
    {odds: 6, winnings: 5},
    {odds: 78, winnings: 20},
    {odds: 3054, winnings: 1000},
    {odds: 610880, winnings: 250000},
  ]
  const colors = d3.quantize(d3.interpolateHcl("#b0d5ff", "black"), chances.length)
  for (var i = 0; i < chances.length; i++) {
    let chance = chances[i];
    chance.radius = Math.sqrt(chance.area / Math.PI)
    chance.color = colors[i]
  }
  return chances
}

const $pointer = document.getElementById('pointer');
const $winnings = document.getElementById('winnings');
let winnings = 0;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const data = loadData();

function drawCircle(x, y, radius, color){
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function draw(){
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  ctx.translate(width / 2, height / 2);

  const pool = width * height;
  for (var i = 0; i < data.length; i++) {
    let chance = data[i];
    chance.area = pool / chance.odds;
    chance.radius = Math.sqrt(chance.area / Math.PI)
    drawCircle(0, 0, chance.radius, chance.color)
  }
}

window.onresize = draw;
window.onload = draw;

const [flag] = tippy('#pointer', {
  content: 'nope',
  hideOnClick: false,
})

window.onclick = function(e){
  winnings -= cost;
  const px = Math.random();
  const py = Math.random();
  const x = px * canvas.width - canvas.width / 2;
  const y = py * canvas.height - canvas.height / 2;
  const chance = data.findLast(chance => {
    const dx = x - 0;
    const dy = y - 0;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < chance.radius
  })
  flag.show()
  $pointer.style.left = (px*100) + '%';
  $pointer.style.top = (py*100) + '%';
  if (!chance) {
    flag.setContent('nope')
  } else {
    flag.setContent('$' + chance.winnings)
    winnings += chance.winnings;
  }
  
  if(winnings < 0) {
    $winnings.textContent = '-$' + Math.abs(winnings);
    $winnings.classList.add('negative')
  } else {
    $winnings.textContent = '$' + winnings;
    $winnings.classList.remove('negative')
  }
}

// flag.show()

// d3.interpolateHslLong("red", "blue")(0.5)
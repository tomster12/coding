// Input parameters to the cinematic
const start_pos = { x: 200, y: 400 };
const end_pos = { x: 600, y: 700 };
let max_speed = 5.0;

// Internal variables to the cinematic
let move_dir = { x: 0, y: 0 };
let total_dist = 0;
let current_pos = { x: start_pos.x, y: start_pos.y };
let current_speed = 0;

function setup() {
  createCanvas(800, 800);

  // Start of the cinematic: calculate initial parameters
  total_dist = get_distance(start_pos, end_pos);
  move_dir.x = (end_pos.x - start_pos.x) / total_dist;
  move_dir.y = (end_pos.y - start_pos.y) / total_dist;
}

function draw() {
  background(0);

  // Each frame in the cinematic:
  // - Calculate progress towards target
  let current_dist = get_distance(current_pos, end_pos);
  let t = 1 - current_dist / total_dist;
  // - Move towards target by lerped speed
  const current_speed = max_speed * piecewiseEase(t, 0.2, 0.8, 0.2, 1, 0);
  current_pos.x += move_dir.x * current_speed;
  current_pos.y += move_dir.y * current_speed;
  // - Stop once reached target
  if (current_dist < 1) {
    current_pos.x = end_pos.x;
    current_pos.y = end_pos.y;
  }

  fill(255);
  noStroke();
  ellipse(current_pos.x, current_pos.y, 60, 60);
}

function piecewiseEase(t, easeStart, easeEnd, startPct, midPct, endPct) {
  if (t < easeStart) {
    return map(easeOutQuad(map(t, 0, easeStart, 0, 1)), 0, 1, startPct, midPct);
  }
  if (t > easeEnd) {
    return map(easeInQuad(map(t, easeEnd, 1, 0, 1)), 0, 1, midPct, endPct);
  }
  return midPct;
}

function easeInQuad(t) {
  return t * t;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function get_distance(a, b) {
  return sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

function keyPressed() {
  if (keyCode === ENTER) {
    current_pos = { x: start_pos.x, y: start_pos.y };
  }
}

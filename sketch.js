let ps;
let attractors = [];
let repeller;
let pileHeights = [];
let glassWidth = 300;
let neckWidth = 20;

let glassBoundaries = []; // Store max width for each Y

function setup() {
  createCanvas(800, 600);

  // Initialize Particle System
  ps = new ParticleSystem(createVector(width / 2, 50));

  // Create forces (Attractors represent life goals/passions, Repeller represents hardships)
  attractors.push(new Attractor(width / 2 - 80, height - 100, 15)); // Career?
  attractors.push(new Attractor(width / 2 + 80, height - 100, 15)); // Family?

  // A Repeller that moves with mouse or stays static
  repeller = new Repeller(width / 2, height - 150);

  // Calculate Glass Boundaries
  // We need to map the bezier curves to an array of widths
  // Since bezierPoint is tricky to inverse, we will simulate the curve drawing logic to fill the array
  // Or simpler: use the same bezier logic but iterate t from 0 to 1

  for (let i = 0; i < height; i++) glassBoundaries[i] = 0; // Init

  let cx = width / 2;
  let topY = 50;
  let bottomY = height - 50;
  let midY = height / 2;
  let w = glassWidth / 2;
  let nw = neckWidth / 2;

  // Top Curve
  for (let t = 0; t <= 1; t += 0.001) {
    let x = bezierPoint(cx - w, cx - w, cx - nw, cx - nw, t);
    let y = bezierPoint(topY, topY + 100, midY - 20, midY, t);
    if (y >= 0 && y < height) {
      glassBoundaries[floor(y)] = cx - x; // Store half-width
    }
  }

  // Bottom Curve
  for (let t = 0; t <= 1; t += 0.001) {
    let x = bezierPoint(cx - nw, cx - nw, cx - w, cx - w, t);
    let y = bezierPoint(midY + 20, midY + 50, bottomY - 100, bottomY, t);
    if (y >= 0 && y < height) {
      glassBoundaries[floor(y)] = x - cx; // Store half-width
    }
  }

  // Fill in the neck gap (midY to midY+20)
  for (let y = floor(midY); y <= floor(midY + 20); y++) {
    glassBoundaries[y] = nw;
  }

  // Initialize pile height map (simulating the ground/glass bottom)
  for (let i = 0; i < width; i++) {
    // Calculate the curve of the bottom glass
    let distFromCenter = abs(i - width / 2);
    // Use our calculated boundaries for the bottom
    // Find the Y where width matches this x
    // This is inverse, hard. Let's keep the simple bowl shape for the pile bottom for now,
    // but limit it to the glass width.
    if (distFromCenter < glassWidth / 2) {
      // Simple bowl shape equation
      let bowlY = height - 50 - Math.pow(distFromCenter / (glassWidth / 2), 2) * 50;
      pileHeights[i] = height - 50; // Start at flat bottom for simplicity of stacking visual
    } else {
      pileHeights[i] = height;
    }
  }
}

function draw() {
  background(30, 30, 35);

  // Update Repeller position (Interactive Life Obstacle)
  if (mouseIsPressed && mouseY > height / 2) {
    repeller.setPos(mouseX, mouseY);
  } else {
    // Idle movement
    repeller.setPos(width / 2 + sin(frameCount * 0.02) * 50, height - 150);
  }

  // Draw Hourglass Container
  drawHourglass();

  // Draw Forces
  for (let a of attractors) {
    a.display();
  }
  repeller.display();

  // Particle System Logic
  // Spawn rate based on time (life flows continuously)
  // Limit total particles to prevent lag and simulate finite time
  if (ps.particles.length < 2000) {
    for (let i = 0; i < 2; i++) {
      ps.addParticle();
    }
  }

  // Apply forces
  ps.applyGravity();
  ps.applyRepeller(repeller);
  for (let a of attractors) {
    ps.applyAttractor(a);
  }

  ps.run();

  // Instructions
  fill(150);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  text("LIFE IN AN HOURGLASS", 20, 20);
  text("Attractors (Goals) pull the sand.", 20, 40);
  text("Repeller (Hardship) pushes it away.", 20, 60);
  text("Click and drag mouse in bottom half to move the Obstacle.", 20, 80);
}

function drawHourglass() {
  noFill();
  stroke(200, 50);
  strokeWeight(4);

  let cx = width / 2;
  let topY = 50;
  let bottomY = height - 50;
  let midY = height / 2;
  let w = glassWidth / 2;
  let nw = neckWidth / 2;

  beginShape();
  vertex(cx - w, topY);
  bezierVertex(cx - w, topY + 100, cx - nw, midY - 20, cx - nw, midY); // Top Left curve
  vertex(cx - nw, midY + 20); // Neck
  bezierVertex(cx - nw, midY + 50, cx - w, bottomY - 100, cx - w, bottomY); // Bottom Left
  vertex(cx + w, bottomY);
  bezierVertex(cx + w, bottomY - 100, cx + nw, midY + 50, cx + nw, midY + 20); // Bottom Right
  vertex(cx + nw, midY); // Neck
  bezierVertex(cx + nw, midY - 20, cx + w, topY + 100, cx + w, topY); // Top Right
  endShape(CLOSE);

  // Glass reflections
  stroke(255, 30);
  strokeWeight(2);
  line(cx - w + 20, topY + 20, cx - w + 20, topY + 80);
  line(cx + w - 20, bottomY - 80, cx + w - 20, bottomY - 20);
}

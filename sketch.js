let ps;
let attractors = [];
let repeller;
let pileHeights = [];
let glassWidth = 300;
let neckWidth = 20;

function setup() {
  createCanvas(800, 600);

  // Initialize Particle System
  ps = new ParticleSystem(createVector(width / 2, 50));

  // Create forces (Attractors represent life goals/passions, Repeller represents hardships)
  attractors.push(new Attractor(width / 2 - 80, height - 100, 15)); // Career?
  attractors.push(new Attractor(width / 2 + 80, height - 100, 15)); // Family?

  // A Repeller that moves with mouse or stays static
  repeller = new Repeller(width / 2, height - 150);

  // Initialize pile height map (simulating the ground/glass bottom)
  for (let i = 0; i < width; i++) {
    // Calculate the curve of the bottom glass
    let distFromCenter = abs(i - width / 2);
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

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
    let distFromCenter = abs(i - width/2);
    if (distFromCenter < glassWidth/2) {
       // Simple bowl shape equation
       let bowlY = height - 50 - Math.pow(distFromCenter / (glassWidth/2), 2) * 50; 
       pileHeights[i] = height - 50; // Start at flat bottom for simplicity of stacking visual
    } else {
       pileHeights[i] = height;
    }
  }
}

function draw() {
  background(30, 30, 35);
  
  // Update Repeller position (Interactive Life Obstacle)
  if (mouseIsPressed && mouseY > height/2) {
    repeller.setPos(mouseX, mouseY);
  } else {
    // Idle movement
    repeller.setPos(width/2 + sin(frameCount * 0.02) * 50, height - 150);
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
  for(let i = 0; i < 2; i++){
    ps.addParticle();
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

// --- Particle System Classes ---

class ParticleSystem {
  constructor(position) {
    this.origin = position.copy();
    this.particles = [];
  }

  addParticle() {
    this.particles.push(new Particle(this.origin));
  }

  applyGravity() {
    let gravity = createVector(0, 0.05);
    for (let p of this.particles) {
      if (!p.isLocked) {
        p.applyForce(gravity);
      }
    }
  }

  applyAttractor(a) {
    for (let p of this.particles) {
      if (!p.isLocked && p.pos.y > height / 2) { // Only affect in bottom bulb
        let force = a.calculateForce(p);
        p.applyForce(force);
      }
    }
  }

  applyRepeller(r) {
    for (let p of this.particles) {
      if (!p.isLocked && p.pos.y > height / 2) {
        let force = r.calculateForce(p);
        p.applyForce(force);
      }
    }
  }

  run() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.run();
      
      // Funneling logic for the top bulb
      if (p.pos.y < height / 2) {
        p.constrainToGlassTop();
      } else {
        p.constrainToGlassBottom();
      }

      // Check stacking collision
      if (!p.isLocked && p.pos.y > height/2) {
          p.checkPileCollision();
      }
      
      // Cleanup visual clutter (optional, but keeping them piles up)
      // We don't remove particles to show the "Life" accumulation
    }
  }
}

class Particle {
  constructor(l) {
    // Start somewhat randomly in the top container
    let startX = random(l.x - glassWidth/2 + 20, l.x + glassWidth/2 - 20);
    let startY = random(l.y, l.y + 50);
    
    this.pos = createVector(startX, startY);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.mass = random(0.8, 1.5);
    this.isLocked = false; // Has it landed?
    
    // Color evolves from Blue (Youth) to Gold (Age)
    this.col = color(100, 200, 255); 
  }

  applyForce(force) {
    let f = force.copy();
    f.div(this.mass);
    this.acc.add(f);
  }

  run() {
    this.update();
    this.display();
  }

  update() {
    if (!this.isLocked) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      
      // Air resistance
      this.vel.mult(0.99);
      
      // Color transition based on Y position (Life stages)
      let t = map(this.pos.y, 50, height-50, 0, 1);
      this.col = lerpColor(color(100, 255, 255), color(255, 200, 50), t);
    }
  }

  constrainToGlassTop() {
    let cx = width / 2;
    let dx = abs(this.pos.x - cx);
    
    // Simple funnel walls
    // As Y increases towards Height/2, max width decreases
    let progress = map(this.pos.y, 50, height/2, 0, 1);
    let maxWidth = map(progress, 0, 1, glassWidth/2 - 5, neckWidth/2 - 2);
    
    if (dx > maxWidth) {
      // Push back towards center
      let force = createVector(cx - this.pos.x, 0);
      force.normalize();
      force.mult(0.2); // Gentle nudging wall
      this.applyForce(force);
      
      // Dampen velocity to prevent shooting out
      this.vel.x *= 0.5;
    }
  }
  
  constrainToGlassBottom() {
      // Just keep them roughly inside the glass width
      let cx = width/2;
      let dx = abs(this.pos.x - cx);
      if(dx > glassWidth/2 - 5) {
          this.vel.x *= -0.5;
          this.pos.x = constrain(this.pos.x, cx - glassWidth/2 + 6, cx + glassWidth/2 - 6);
      }
  }

  checkPileCollision() {
    let ix = floor(this.pos.x);
    // Boundary check for array access
    if (ix >= 0 && ix < width) {
        let groundY = pileHeights[ix];
        
        // If particle hits the "ground" or the top of the pile
        if (this.pos.y >= groundY) {
            this.pos.y = groundY;
            this.isLocked = true;
            this.vel.mult(0);
            
            // Update the pile height at this x location
            // We spread the pile height slightly to simulate sand angle of repose
            for(let k = -2; k <= 2; k++) {
                if(ix + k >= 0 && ix + k < width) {
                   pileHeights[ix + k] -= (1.5 - abs(k)*0.4); 
                }
            }
        }
    }
  }

  display() {
    noStroke();
    fill(this.col);
    if(this.isLocked) {
       // Slightly darker when settled
       fill(red(this.col), green(this.col), blue(this.col), 200);
    }
    ellipse(this.pos.x, this.pos.y, 4, 4);
  }
}

// --- Force Classes ---

class Attractor {
  constructor(x, y, strength) {
    this.pos = createVector(x, y);
    this.strength = strength; // G
  }

  calculateForce(p) {
    let dir = p5.Vector.sub(this.pos, p.pos);
    let d = dir.mag();
    d = constrain(d, 5, 100); // Constraint distance to avoid extreme forces
    dir.normalize();
    let force = (this.strength * 1 * p.mass) / (d * d); // G * m1 * m2 / d^2
    dir.mult(force * 50); // Scale up for visibility
    return dir;
  }

  display() {
    noStroke();
    fill(100, 255, 100, 50); // Green glow for attraction
    ellipse(this.pos.x, this.pos.y, 40, 40);
    fill(100, 255, 100);
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
}

class Repeller {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.strength = -30; // Negative strength for repulsion
  }
  
  setPos(x, y) {
      this.pos.set(x, y);
  }

  calculateForce(p) {
    let dir = p5.Vector.sub(this.pos, p.pos);
    let d = dir.mag();
    d = constrain(d, 5, 100);
    dir.normalize();
    let force = (this.strength * 1 * p.mass) / (d * d);
    dir.mult(force * 50);
    return dir;
  }

  display() {
    noStroke();
    fill(255, 50, 50, 50); // Red glow for repulsion
    ellipse(this.pos.x, this.pos.y, 50, 50);
    fill(255, 50, 50);
    ellipse(this.pos.x, this.pos.y, 15, 15);
  }
}
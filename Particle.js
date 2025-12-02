class Particle {
    constructor(l) {
        // Start somewhat randomly in the top container
        let startX = random(l.x - glassWidth / 2 + 20, l.x + glassWidth / 2 - 20);
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
            let t = map(this.pos.y, 50, height - 50, 0, 1);
            this.col = lerpColor(color(100, 255, 255), color(255, 200, 50), t);
        }
    }

    constrainToGlassTop() {
        let cx = width / 2;
        let dx = abs(this.pos.x - cx);

        // Simple funnel walls
        // As Y increases towards Height/2, max width decreases
        let progress = map(this.pos.y, 50, height / 2, 0, 1);
        let maxWidth = map(progress, 0, 1, glassWidth / 2 - 5, neckWidth / 2 - 2);

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
        let cx = width / 2;
        let dx = abs(this.pos.x - cx);
        if (dx > glassWidth / 2 - 5) {
            this.vel.x *= -0.5;
            this.pos.x = constrain(this.pos.x, cx - glassWidth / 2 + 6, cx + glassWidth / 2 - 6);
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
                for (let k = -2; k <= 2; k++) {
                    if (ix + k >= 0 && ix + k < width) {
                        pileHeights[ix + k] -= (1.5 - abs(k) * 0.4);
                    }
                }
            }
        }
    }

    display() {
        noStroke();
        fill(this.col);
        if (this.isLocked) {
            // Slightly darker when settled
            fill(red(this.col), green(this.col), blue(this.col), 200);
        }
        ellipse(this.pos.x, this.pos.y, 4, 4);
    }
}

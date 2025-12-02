class Particle {
    constructor(l) {
        this.spawnOrigin = l.copy();
        this.reset();
    }

    reset() {
        // Start somewhat randomly in the top container
        let startX = random(this.spawnOrigin.x - glassWidth / 2 + 20, this.spawnOrigin.x + glassWidth / 2 - 20);
        let startY = random(this.spawnOrigin.y, this.spawnOrigin.y + 50);

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

            // Safety check: if fell off screen
            if (this.pos.y > height + 10) {
                this.reset();
            }
        }
    }

    constrainToGlass() {
        let cx = width / 2;
        let dx = abs(this.pos.x - cx);
        let yIndex = floor(this.pos.y);

        if (yIndex >= 0 && yIndex < height) {
            let maxWidth = glassBoundaries[yIndex];

            // If outside the glass boundary
            if (maxWidth > 0 && dx > maxWidth - 4) { // -4 padding for particle radius
                // Push back towards center
                if (this.pos.x > cx) {
                    this.pos.x = cx + maxWidth - 4;
                    this.vel.x *= -0.3; // Bounce with damping
                } else {
                    this.pos.x = cx - maxWidth + 4;
                    this.vel.x *= -0.3;
                }
            }
        }
    }

    checkPileCollision() {
        let ix = floor(this.pos.x);

        // Boundary check
        if (ix >= 0 && ix < width) {
            let groundY = pileHeights[ix];

            // Check if we are outside the glass (hitting the floor)
            // If groundY is effectively height (or close to it), it means we are outside the bowl
            if (groundY >= height - 1) {
                this.reset();
                return;
            }

            // If particle is near the "ground"
            if (this.pos.y >= groundY - 2) {

                // Check neighbors to see if we can slide
                let leftH = (ix > 0) ? pileHeights[ix - 1] : height;
                let rightH = (ix < width - 1) ? pileHeights[ix + 1] : height;

                // If we are significantly higher than neighbors, slide down
                // The threshold (e.g., 2 or 3) determines the angle of repose
                if (groundY < leftH - 3 && groundY < rightH - 3) {
                    // Peak, slide randomly
                    this.vel.x += random(-1, 1);
                } else if (groundY < leftH - 3) {
                    // Slide left (left is lower/deeper, so pileHeights value is larger)
                    // Wait, pileHeights is Y coordinate. Larger Y means lower on screen.
                    // So if groundY (current) < leftH (neighbor), current is HIGHER (visually) than neighbor.
                    // We want to slide to the neighbor.
                    this.vel.x -= 0.5;
                } else if (groundY < rightH - 3) {
                    // Slide right
                    this.vel.x += 0.5;
                } else {
                    // Stable enough to rest
                    this.pos.y = groundY;
                    this.isLocked = true;
                    this.vel.mult(0);

                    // Update the pile height at this x location
                    // We raise the ground (decrease Y)
                    pileHeights[ix] -= 1;

                    // Also slightly affect neighbors to smooth spikes? 
                    // Maybe not needed if sliding works well.
                }

                // Damping when touching ground to simulate friction
                this.vel.mult(0.5);
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

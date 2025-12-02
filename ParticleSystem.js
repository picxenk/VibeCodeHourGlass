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
            if (!p.isLocked && p.pos.y > height / 2) {
                p.checkPileCollision();
            }

            // Cleanup visual clutter (optional, but keeping them piles up)
            // We don't remove particles to show the "Life" accumulation
        }
    }
}

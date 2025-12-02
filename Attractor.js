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

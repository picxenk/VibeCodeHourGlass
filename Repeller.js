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

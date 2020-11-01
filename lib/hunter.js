class Hunter{
    constructor(x, y){
        this.pos = createVector(x, y);
        this.vel = createVector(random(-2, 2), random(-2, 2));
        this.acc = createVector(0, 0, 0);
        this.vision = 100;
        this.hunger = 1;
        this.maxSpeed = 5;
        this.maxSteering = 0.3;
        this.energy = 1;
        this.huntingSpeed = 10;
        this.hunting = false;
    }

    seek(target) {
        var desired = target.copy()
        desired.sub(this.pos) // A vector pointing from the position to the target
        // Scale to maximum speed
        desired.setMag(this.hunting && this.energy > -1 ? this.huntingSpeed : this.maxSpeed);
        
        // Steering = Desired minus Velocity
        var steer = desired.copy()
        steer.sub(this.vel);
        steer.limit(this.maxSteering); // Limit to maximum steering force
        return steer;
    }

    applyForce(force) {
        this.acc.add(force)
    }
    handleEnergy(){
        if(this.hunting){
            this.energy -= 0.05
        }

        if(this.hunger>-1 && this.energy <=0.8){
            this.hunger -= 0.05;
            this.energy += 0.3;
        }else{
            this.hunger -= 0.01
        }
        if(this.hunger<-1){
            this.hunger = -1;
        }
        if(this.energy < -1){
            this.energy = -1;
        }
        if(this.hunger > 1){
            this.hunger = 1
        }
        if(this.energy > 1){
            this.energy = 1;
        }

    }
    hunt(boids){
        if(this.hunger >= 0){
            this.hunting = false;
            return;
        }
        var result = createVector(0, 0)
        var foodDist = this.vision;
        var target = createVector(0, 0); // Start with empty vector to accumulate all positions
        var count = 0;
        var nearbyfood = []
        for (let i = 0; i< boids.length; i++) {
            var f = boids[i];
            if(!f.alive){
                continue;
            }
            var d = this.pos.dist(f.pos);
            nearbyfood.push([f, d])
        }
        if(nearbyfood.length == 0){
            return result
        }
        nearbyfood.sort((a, b) => {
            return a[1] - b[1];
        })
        var f = nearbyfood[0][0];
        var d = this.pos.dist(f.pos);
        if (d < foodDist) {
            target = f.pos.copy();
            count++;
        }
        if (count > 0) {
            result = this.seek(target); // Steer towards the position
            this.hunting = true;
        }
        result.mult(1.5)
        this.applyForce(result);
    }
    eat(boids){
        if(this.hunger >= 0){
            this.hunting = false;
            return;
        }
        for (let i = 0; i< boids.length; i++) {
            var f = boids[i];
            var d = this.pos.dist(f.pos);
            if (d < 12 && f.alive) {
                this.hunger += 0.34
                f.alive = false;
                f.bodyDecay = 0.7;
            }
        }
        if(this.hunger>1){
            this.hunger = 1;
        }
    }
    update(boids){
        this.hunt(boids);
        if(this.acc.mag() == 0){
            this.hunting = false;
            this.acc = createVector(random(-this.maxSpeed, this.maxSpeed), random(-this.maxSpeed, this.maxSpeed))
            this.acc.limit(this.maxSteering)
        }
        this.vel.add(this.acc)
        this.vel.limit(this.hunting && this.energy > -1 ? this.huntingSpeed : this.maxSpeed)
        this.pos.add(this.vel)
        this.acc.mult(0)
        this.eat(boids)
        this.handleEnergy()
    }
    render() {
        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading())
        fill("red");
        triangle(0, 7, 0, -7, 21, 0)
        pop()
    }

}
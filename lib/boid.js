class Boid {
    constructor(x, y, mutationRate, dna=undefined) {
        this.id = uuid()
        this.mutationRate = mutationRate;
        this.dna = dna != undefined ? dna : random(0.0, 1.0)<=1-mutationRate? new DNA() : DNA.Random();
        this.pos = createVector(x, y);
        this.vel = createVector(random(-2, 2), random(-2, 2));
        this.acc = createVector(0, 0, 0);
        this.fear = 0;
        this.energy = 1;
        this.hunger = 1;
        this.bodyDecay = 0;
        this.log = true;
        this.alive = true;
        this.age = 0;
        this.children = 0;
        this.score = 0;
        this.lastReproduced = millis();
        this.reproductionCooldown = 10;
        this.childCost = 0.5
    }
    static RandomBoid(w, h, mutationRate){
        return new Boid(random(0, w), random(0, h), mutationRate, DNA.Random())
    }
    energyBurn(){
        if(this.fear > this.dna.predThreshold){
            return ((this.vel.mag() /200) + ((this.dna.vision/200)/100))/20;
        } 
        else{
            return ((this.vel.mag()/100)+ ((this.dna.vision/200)/100))/20;
        }
    }
    
    logg(data){
        if(this.log){
            console.log(data)
        }
        this.log = false
    }

    applyForce(force) {
        this.acc.add(force)
    }

    seek(target) {
        var desired = target.copy()
        desired.sub(this.pos) // A vector pointing from the position to the target
        // Scale to maximum speed
        desired.setMag(this.speed());
        
        // Steering = Desired minus Velocity
        var steer = desired.copy()
        steer.sub(this.vel);
        steer.limit(this.steering()); // Limit to maximum steering force
        return steer;
    }
    // Separation
    // Method checks for nearby boids and steers away
    separate(boids) {
        var desiredseparation = this.dna.vision/7;
        var steer = createVector(0, 0, 0);
        var count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i< boids.length; i++) {
            var other = boids[i];
            if(other.id == this.id){
                continue;
            }
            var d = this.pos.dist(other.pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                var diff = this.pos.copy()
                diff.sub(other.pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff)
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }
        
        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            steer.setMag(this.speed());
            // Implement Reynolds: Steering = Desired - Velocity
            steer.sub(this.vel);
            steer.limit(this.steering());
        }
        return steer;
    }

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    align(boids) {
        var neighbordist = this.dna.vision;
        var sum = createVector(0, 0);
        var count = 0;
        for (let i = 0; i< boids.length; i++) {
            var other = boids[i];
            if(other.id == this.id){
                continue;
            }
            var d = this.pos.dist(other.pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(other.vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            // Implement Reynolds: Steering = Desired - Velocity
            sum.setMag(this.speed());
            var steer = sum.copy()
            steer.sub(this.vel);
            steer.limit(this.steering());
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    speed(){
        return this.fear < this.dna.predThreshold ? this.dna.maxSpeed: this.dna.maxFearSpeed;
    }
    steering(){
        return this.fear < this.dna.predThreshold ? this.dna.maxSteering: this.dna.maxFearSteering
    }

    // Cohesion
    // For the average position (i.e. center) of all nearby boids, calculate steering vector towards that position
    cohesion(boids) {
        var neighbordist = this.dna.vision;
        var sum = createVector(0, 0); // Start with empty vector to accumulate all positions
        var count = 0;
        for (let i = 0; i< boids.length; i++) {
            var other = boids[i];
            if(other.id == this.id){
                continue;
            }
            var d = this.pos.dist(other.pos);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(other.pos); // Add position
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum); // Steer towards the position
        } else {
            return createVector(0, 0);
        }
    }

    flock(boids) {
        var sep = this.separate(boids); // Separation
        var ali = this.align(boids); // Alignment
        var coh = this.cohesion(boids); // Cohesion
        // Arbitrarily weight these forces
        sep.mult(this.fear < this.predThreshold ? this.dna.sepWeight: this.dna.fearSep);
        ali.mult(this.fear < this.predThreshold ? this.dna.aliWeight: this.dna.fearAli);
        coh.mult(this.fear < this.predThreshold ? this.dna.cohWeight: this.dna.fearCoh);
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    foodSearch(food){
        if(this.fear > this.dna.predThreshold){
            return;
        }
        if(this.hunger > 0){
            return;
        }
        var result = createVector(0, 0)
        var foodDist = this.dna.vision;
        var target = createVector(0, 0); // Start with empty vector to accumulate all positions
        var count = 0;
        var nearbyfood = []
        for (let i = 0; i< food.length; i++) {
            var f = food[i];
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
        }
        result.mult(this.dna.foodWeight)
        this.applyForce(result);
    }

    eat(food){
        if(this.hunger >= 0){
            return;
        }
        for (let i = 0; i< food.length; i++) {
            var f = food[i];
            var d = this.pos.dist(f.pos);
            if (d < 1) {
                this.hunger += 1
                f.hp -= 0.2
            }
        }
        if(this.hunger>1){
            this.hunger = 1;
        }
    }

    reproduce(boids){
        var now = millis()
        if(now < (this.lastReproduced + (this.reproductionCooldown*1000))){
            return;
        }
        if(this.energy < -1+this.childCost){
            return;
        }
        var reproDist = 25;
        var nearbyOthers = [];
        for (let i = 0; i< boids.length; i++) {
            var other = boids[i];
            if(other.id == this.id){
                continue;
            }
            var d = this.pos.dist(other.pos);
            if ((d > 0) && (d < reproDist) && other.energy >= (-1 + this.childCost) && now > (other.lastReproduced + (other.reproductionCooldown*1000)) ) {
                nearbyOthers.push([other,d])
            }
        }
        if(nearbyOthers.length == 0){
            return;
        }
        nearbyOthers.sort((a,b) => {
            return a[1]-b[1];
        })
        var nearest = nearbyOthers[0][0];
        this.lastReproduced = millis();
        nearest.lastReproduced = millis();
        this.energy -= this.childCost
        nearest.energy -= nearest.childCost
        var child = Boid.Breed(this, nearest, this.mutationRate)
        this.children ++;
        nearest.chilren++; 
        return child;
    }

    avoidPreditors(preds){
        var desiredseparation = this.dna.vision;
        var steer = createVector(0, 0, 0);
        var count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i< preds.length; i++) {
            var pred = preds[i];
            var d = this.pos.dist(pred.pos);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d <= desiredseparation)) {
                // Calculate vector pointing away from neighbor
                var diff = this.pos.copy()
                diff.sub(pred.pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff)
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            this.fear = 1;
            steer.div(count);
        }else{
            this.fear -= this.dna.fearDecay
        }
        
        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            steer.setMag(this.speed());
            // Implement Reynolds: Steering = Desired - Velocity
            steer.sub(this.vel);
            steer.limit(this.steering());
        }
        steer.mult(this.dna.predWeight)
        this.applyForce(steer);

    }

    static Breed(a, b, mutationRate){
        var childDNA = DNA.FromParents(a, b, a.mutationRate)
        var childX = (a.pos.x + b.pos.x)/2
        var childY = (a.pos.y + b.pos.y)/2
        var child = new Boid(childX, childY, mutationRate, childDNA);
        return child
    }

    update(boids, food, preds) {
        if(!this.alive){
            this.bodyDecay += (1/100);
            return
        }
        if(this.energy <= -1){
            this.alive = false;
            return;
        }
        this.age ++;
        this.avoidPreditors(preds)
        this.flock(boids)
        this.foodSearch(food);
        if(this.acc.mag() == 0){
            this.acc = createVector(random(-1, 1), random(-1, 1))
            this.acc.limit(this.steering())
        }
        this.vel.add(this.acc)
        this.vel.limit(this.speed());
        this.pos.add(this.vel)
        this.acc.mult(0)
        this.eat(food)
        this.energy -= this.energyBurn()
        if(this.hunger>-1 && this.energy <=0.997){
            this.hunger -= 0.001;
            this.energy += 0.003;
        }else{
            this.hunger = -1;
        }
        this.score = (this.age/1000) + (this.children * 100)
        return this.reproduce(boids)
    }

    render() {
        var rgb = this.dna.rgb();
        var alpha = 255*(1-this.bodyDecay)
        push()
        if(this.fear <= this.dna.predThreshold && this.alive){
            stroke('white')
            strokeWeight(1)
        }else if(this.alive){
            stroke('red')
            strokeWeight(1)
        }else{
            noStroke();
        }
        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading())
        fill(rgb.r, rgb.g, rgb.b, alpha);
        triangle(0, 5, 0, -5, 15, 0)
        pop()
    }
}
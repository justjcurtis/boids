class Population{
    constructor(a, f, x, w, h, mutationRate){
        this.a = a;
        this.x = x;
        this.w = w;
        this.h = h;
        this.f = f;
        this.mutationRate = mutationRate;
        this.boids = this.newBoids(a);
        this.hunters = this.spawnHunters(x);
        this.food = this.spawnFood(f);
        this.lastFoodSpawn = millis();
        this.foodSpwanDelay = 3;
        this.maxFood = 10
        this.dead = []
        this.gen = 0;
        this.isReseting = false;
        this.genStart = millis()
        this.genLength = undefined;
        this.cap == 300;
    }
    static FromPretrained(a, f, x, w, h, mutationRate){
        var b = []
        var p = new Population(0, f, x, w, h, mutationRate)
        for(var i = 0; i< a; i++){
            if(i >= pretrained.length){
                var a = new Boid(random(0, w), random(0, h), mutationRate, DNA.FromJson(pretrained[random(0, 10)]));
                var b = new Boid(random(0, w), random(0, h), mutationRate, DNA.FromJson(pretrained[random(0, 10)]));
                this.boids.push(Boid.Breed(a, b, mutationRate))
            }
            if(random(0, 1)<0.1){
                b.push(new Boid(random(0, w), random(0, h), mutationRate, DNA.FromJson(best[floor(random(0, 2.99))])))
            }
            b.push(new Boid(random(0, w), random(0, h), mutationRate, DNA.FromJson(pretrained[i])))
        }
        p.boids = b;
        p.a = a;
        return p;
    }
    newGen(){
        this.isReseting = true;
        this.genLength = millis()-this.genStart;
        if(this.dead.length < this.a){
            return;
        }
        this.food = this.spawnFood(this.f);
        this.dead.sort((a,b)=>{
            return b.score-a.score
        })
        // Add random boids
        for(let i = 0; i < this.a; i++){
            if(i < ceil(this.a*this.mutationRate)){
                var boid = Boid.RandomBoid(this.w, this.h, this.mutationRate)
                if(this.boids.length < this.cap){
                    this.boids.push(boid)
                }
            }
            break;
        }
        // Add boids from gene pool
        var i = 0;
        while(this.boids.length < this.a){
            if(i == 0){
                // Champion lives on
                this.boids.push(new Boid(random(0,this.w), random(0, this.h), this.mutationRate, this.dead[i].dna));
                continue;
            }
            //champion breeds with all;
            this.boids.push(Boid.Breed(this.dead[0], this.dead[i], this.mutationRate))
        }
        this.dead = [];
        this.gen ++;
        this.genStart = millis()
        this.isReseting = false;
    }
    update(){
        if(this.isReseting){
            return;
        }
        if(this.boids.length == 0){
            this.newGen()
        }
        this.food = this.food.filter(f => {
            return f.hp > 0;
        })
        if(this.food.length < this.maxFood && millis() > (this.lastFoodSpawn + (this.foodSpwanDelay*1000))){
            this.lastFoodSpawn = millis()
            this.food = this.food.concat(this.spawnFood(1));
        }
        this.boids = this.boids.filter(boid => {
            var alive =  boid.bodyDecay < 1;
            if(!alive){
                this.dead.push(boid)
            }
            return alive;
        })
        this.boids.forEach(boid => {
            var others = this.boids.filter(other => {
                return other.id != boid.id && other.alive;
            });
            var child = boid.update(others, this.food, this.hunters);
            this.wrapBorders(boid);
            if(child != undefined){
                this.wrapBorders(child)
                this.boids.push(child)
            }
        });
        this.hunters.forEach(hunter => {
            this.wrapBorders(hunter)
            hunter.update(this.boids);
        });
    }

    wrapBorders(boid){
        if(boid.pos.x > w+2){
            boid.pos.x = 0;
        }
        if(boid.pos.x < -2){
            boid.pos.x = w;
        }
        if(boid.pos.y > h+2){
            boid.pos.y = 0;
        }
        if(boid.pos.y < -2){
            boid.pos.y = h;
        }
    }
    spawnHunters(x){
        var hunters = []
        for(let i = 0; i< x; i++){
            hunters.push(new Hunter(random(0, this.w),random(0, this.h)))
        }
        return hunters
    }
    newBoids(a){
        var b = []
        for(let i = 0; i< a; i++){
            b.push(new Boid(random(0, this.w),random(0, this.h), this.mutationRate))
        }
        return b
    }
    spawnFood(f){
        var food = []
        for(let i = 0; i< f; i++){
            food.push(new Food(random(10, this.w-10),random(10, this.h-10), random(0.001, 1.0), random(0.001, 1.0)))
        }
        return food;
    }
    render(){
        if(this.isReseting){
            return;
        }
        this.food.forEach(food => {
            food.render();
        })
        this.boids.forEach(boid => {
            boid.render();
        });
        this.hunters.forEach(hunter => {
            hunter.render();
        });
    }
}
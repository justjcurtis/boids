class DNA{
    constructor(){
        this.vision = 50
        this.maxSteering = 0.2
        this.maxSpeed = 3
        this.maxFearSpeed = 10
        this.maxFearSteering = 0.4
        this.fearSep = 0.75
        this.fearAli = 0.5
        this.fearCoh = 0.5
        this.fearDecay = 0.1
        this.predWeight = 2.0
        this.predThreshold = 0.5
        this.foodWeight = 1.0
        this.sepWeight = 1.5
        this.aliWeight = 1.0
        this.cohWeight = 1.0
        this._rgb;
    }

    rgb(){
        if(this._rgb == undefined){
            var r = (((this.fearSep/(this.sepWeight*2))+(this.fearAli/(this.aliWeight*2))+(this.fearCoh/(this.cohWeight*2))+(this.sepWeight/3)+(this.aliWeight/3)+(this.cohWeight/3))/6)*255;
            var g = (((this.maxSteering/0.3)+(this.maxSpeed/10)+(this.maxFearSpeed/(this.maxSpeed*2))+(this.maxFearSteering/(this.maxSteering*2)))/4)*255;
            var b = ((((this.vision-30)/(200.0-30))+this.predThreshold+(this.predWeight/3)+this.fearDecay+(this.foodWeight/3))/5)*255;
            r = isNaN(r) ? 0 : r >255 ? 255: r;
            g = isNaN(g) ? 0 : g >255 ? 255: g;
            b = isNaN(b) ? 0 : b >255 ? 255: b;
            this._rgb = {r,g,b};
        }
        return this._rgb
    }

    static Random(){
        var dna = new DNA();
        dna.vision = random(30.0, 200.0)
        dna.maxSteering = random(0.1, 0.3)
        dna.maxSpeed = random(1.0, 5.0)
        dna.sepWeight = random(0.0, 3.0)
        dna.aliWeight = random(0.0, 3.0)
        dna.cohWeight = random(0.0, 3.0)
        dna.maxFearSpeed = random(dna.maxSpeed, dna.maxSpeed*2)
        dna.maxFearSteering = random(dna.maxSteering, dna.maxSteering)
        dna.fearSep = random(0, dna.sepWeight*2)
        dna.fearAli = random(0, dna.aliWeight*2)
        dna.fearCoh = random(0, dna.cohWeight*2)
        dna.fearDecay = random(0.01, 1)
        dna.predWeight = random(0.0, 3.0)
        dna.predThreshold = random(0.0, 1.0)
        dna.foodWeight = random(0.0, 3.0)
        return dna;
    }
    static toJson(dna){
        return {
            vision : dna.vision,
            maxSteering : dna.maxSteering,
            maxSpeed : dna.maxSpeed,
            maxFearSpeed : dna.maxFearSpeed,
            maxFearSteering : dna.maxFearSteering,
            fearSep : dna.fearSep,
            fearAli : dna.fearAli,
            fearCoh : dna.fearCoh,
            fearDecay : dna.fearDecay,
            predWeight : dna.predWeight,
            predThreshold : dna.predThreshold,
            foodWeight : dna.foodWeight,
            sepWeight : dna.sepWeight,
            aliWeight : dna.aliWeight,
            cohWeight : dna.cohWeight,
        }
    }
    static FromJson(json){
        var dna = new DNA();
        dna.vision = json.vision;
        dna.maxSteering = json.maxSteering;
        dna.maxSpeed = json.maxSpeed;
        dna.maxFearSpeed = json.maxFearSpeed;
        dna.maxFearSteering = json.maxFearSteering;
        dna.fearSep = json.fearSep;
        dna.fearAli = json.fearAli;
        dna.fearCoh = json.fearCoh;
        dna.fearDecay = json.fearDecay;
        dna.predWeight = json.predWeight;
        dna.predThreshold = json.predThreshold;
        dna.foodWeight = json.foodWeight;
        dna.sepWeight = json.sepWeight;
        dna.aliWeight = json.aliWeight;
        dna.cohWeight = json.cohWeight;

        return dna;
    }
    static FromParents(a, b, mutationRate){
        var childJson = DNA.toJson(DNA.Random());
        var keys = Object.keys(childJson);
        // Set Traits
        for(var key in keys){
            var choice = random(0, 1)
            var mutate = choice > (1-mutationRate)
            if(mutate){
                continue;
            }
            var useA = choice <= ((1-mutationRate)/2)
            childJson[key] = useA? a[key] : b[key];
        }

        var child = DNA.FromJson(childJson);
        return child;
    }
}
class Food{
    constructor(x, y, value, hp){
        this.value = value;
        this.hp = hp
        this.pos = createVector(x, y)
        this.color = color(125, hp*255, value*255, 255)
    }

    render(){
        if(this.hp <= 0){
            return;
        }
        push()
        stroke('white')
        strokeWeight(1)
        translate(this.pos.x, this.pos.y)
        fill(this.color);
        ellipse(0, 0, (this.hp*20)+5)
        pop()
    }
}
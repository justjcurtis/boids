var population;
var highLength = 0;
function setup() {
  w = windowWidth-5;
  h = windowHeight-5;
  createCanvas(w, h)
  background(51)
  // population = new Population(100, 10, 3 ,w,h, 0.1)
  population = Population.FromPretrained(100, 10, 3 ,w,h, 0.1)
}
function renderHud(){
  push()
  fill("white")
  text(`pop: ${population.boids.length}`, 10, 10, 100, 100)
  text(`gen: ${population.gen}`, 10, 25, 100, 100)
  text(`this gen: ${round((millis() - population.genStart)/1000)}s`, 10, 40, 1000, 100)
  if(population.gen > 0){
    text(`last gen: ${round(population.genLength/1000)}s`, 10, 55, 1000, 100)
  }
  if(population.gen > 0){
    highLength = max(highLength, round(population.genLength/1000), round((millis() - population.genStart)/1000));
    text(`best gen: ${highLength}s`, 10, 70, 1000, 100)
  }
  pop()
}
function draw() {
  population.update()
  background(51)
  population.render()
  renderHud()
}
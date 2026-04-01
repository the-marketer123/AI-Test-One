let population;
let showBestOnly = false;

function setup() {
    let lesserBound = windowWidth-windowHeight>0?windowHeight:windowWidth;
    createCanvas(lesserBound, lesserBound);
    frameRate(60);

    population = new Population(500);
}

function windowResized() {
  let lesserBound = windowWidth-windowHeight>0?windowHeight:windowWidth;
  createCanvas(lesserBound, lesserBound);
}

function draw() {
    background(30);

    population.update();

    // DRAW SNAKES
    if (showBestOnly && population.bestSnake) {
        population.bestSnake.draw();
    } else {
        for (let s of population.snakes) {
            if (!s.dead) {
                s.draw();
            }
        }
    }

    drawOverlay();

    if (population.allDead()) {
        population.nextGeneration();
    }
}

function drawOverlay() {
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);

    let alive = population.snakes.filter(s => !s.dead).length;
    let best = population.bestSnake;
    let bestFitness = best ? best.fitness : 0;
    let bestScore = best ? best.score : 0;
    let starvation = best ? best.stepsSinceFood : 0;
    let minFood = best ? best.maxStepsWithoutFood : 0;

    text("Generation: " + population.generation, 10, 10);
    text("Alive: " + alive, 10, 30);
    text("Best Fitness: " + floor(bestFitness), 10, 50);
    text("Best Apples: " + bestScore, 10, 70);
    text("Show Best Only (B): " + (showBestOnly ? "ON" : "OFF"), 10, 90);
    text("Hunger: " + starvation + " / " + minFood, 10, 110);
}

function keyPressed() {
    if (key === 'b' || key === 'B') {
        showBestOnly = !showBestOnly;
    }  
}

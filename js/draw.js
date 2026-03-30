let population;
let showBestOnly = false;

function setup() {
    let lesserBound = windowWidth-windowHeight>0?windowHeight:windowWidth;
    createCanvas(lesserBound, lesserBound);
    frameRate(144);

    population = new Population(50);
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
    let bestFitness = population.bestSnake ? population.bestSnake.fitness : 0;

    let best = population.bestSnake;
    let starvation = best ? best.stepsSinceFood : 0;
    let minFood = best ? best.maxStepsWithoutFood : 0;

    text("Hunger: " + starvation, 10, 90);
    text("Hunger Limit: " + minFood, 10, 110);
    text("Generation: " + population.generation, 10, 10);
    text("Alive: " + alive, 10, 30);
    text("Best Fitness: " + floor(bestFitness), 10, 50);
    text("Show Best Only (B): " + (showBestOnly ? "ON" : "OFF"), 10, 70);
}

// 🔥 Toggle key
function keyPressed() {
    if (key === 'b' || key === 'B') {
        showBestOnly = !showBestOnly;
    }
}

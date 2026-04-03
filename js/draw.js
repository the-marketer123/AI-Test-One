let population;
let showBestOnly = false;

function setup() {
    //self explanatory, sets it up
    let lesserBound = windowWidth-windowHeight>0?windowHeight:windowWidth;
    createCanvas(lesserBound, lesserBound);
    frameRate(30);

    population = new Population(500);
    
    // Try to load saved best neural network
    population.loadBest();
}

function windowResized() {
    //fix the size to display correctly
  let lesserBound = windowWidth-windowHeight>0?windowHeight:windowWidth;
  createCanvas(lesserBound, lesserBound);
}

function draw() {
    background(30);

    population.update();

    // draw everything
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
    // draw ui
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
    text("Save Best (S) | Load Best (L)", 10, 130);
}

function keyPressed() {
    //check for keys being pressed
    if (key === 'b' || key === 'B') {
        showBestOnly = !showBestOnly;
    } else if (key === 's' || key === 'S') {
        population.saveBest();
    } else if (key === 'l' || key === 'L') {
        population.loadBest();
    }
}

class NeuralNetwork {
    constructor(input = 29, hidden = 20, output = 4) {
        this.input = input;
        this.hidden = hidden;
        this.output = output;

        this.w1 = this.randomMatrix(this.hidden, this.input);
        this.w2 = this.randomMatrix(this.output, this.hidden);
        this.b1 = Array.from({ length: this.hidden }, () => random(-1, 1));
        this.b2 = Array.from({ length: this.output }, () => random(-1, 1));
    }

    randomMatrix(rows, cols) {
        let m = [];
        for (let i = 0; i < rows; i++) {
            m[i] = [];
            for (let j = 0; j < cols; j++) {
                m[i][j] = random(-1, 1);
            }
        }
        return m;
    }

    copy() {
        let nn = new NeuralNetwork(this.input, this.hidden, this.output);
        nn.w1 = JSON.parse(JSON.stringify(this.w1));
        nn.w2 = JSON.parse(JSON.stringify(this.w2));
        nn.b1 = [...this.b1];
        nn.b2 = [...this.b2];
        return nn;
    }

    mutate(rate = 0.12) {
        function mutateVal(val) {
            if (random(1) < rate) {
                return val + randomGaussian() * 0.2;
            }
            return val;
        }

        this.w1 = this.w1.map(row => row.map(mutateVal));
        this.w2 = this.w2.map(row => row.map(mutateVal));
        this.b1 = this.b1.map(mutateVal);
        this.b2 = this.b2.map(mutateVal);
    }

    activate(x) {
        return Math.tanh(x);
    }

    predict(inputs) {
        let hidden = [];
        for (let i = 0; i < this.hidden; i++) {
            let sum = this.b1[i];
            for (let j = 0; j < this.input; j++) {
                sum += this.w1[i][j] * inputs[j];
            }
            hidden[i] = this.activate(sum);
        }

        let output = [];
        for (let i = 0; i < this.output; i++) {
            let sum = this.b2[i];
            for (let j = 0; j < this.hidden; j++) {
                sum += this.w2[i][j] * hidden[j];
            }
            output[i] = sum;
        }

        return output;
    }
}

class SnakeAI {
    constructor() {
        this.stepsSinceFood = 0;
        this.score = 0;
        this.pos = createVector(10, 10);
        this.vel = createVector(1, 0);

        this.tail = [
            createVector(9, 10),
            createVector(8, 10),
            createVector(7, 10),
        ];
        this.maxStepsWithoutFood = 80 + this.tail.length * 25;

        this.brain = new NeuralNetwork();
        this.dead = false;
        this.fitness = 0;

        this.food = this.spawnFood();
    }

    update() {
        if (this.dead) return;

        let previousDistance = this.getFoodDistance();
        let inputs = this.getInputs();
        let output = this.brain.predict(inputs);

        let maxIndex = output.indexOf(Math.max(...output));
        this.applyAction(maxIndex);
        this.move();

        this.stepsSinceFood++;
        let ateFood = this.checkFood();
        this.checkDeath();

        if (this.dead) {
            this.fitness -= 25;
            return;
        }

        if (ateFood) {
            this.fitness += 150 + this.tail.length * 20;
        } else {
            let newDistance = this.getFoodDistance();

            if (newDistance < previousDistance) {
                this.fitness += 1.5;
            } else if (newDistance > previousDistance) {
                this.fitness -= 1.5;
            } else {
                this.fitness -= 0.4;
            }
        }

        this.fitness -= 0.05;
        this.fitness -= 0.75 * this.getHungerRatio();
    }

    applyAction(action) {
        let directions = [
            createVector(0, -1),
            createVector(0, 1),
            createVector(-1, 0),
            createVector(1, 0)
        ];

        let nextVel = directions[action];

        if (this.tail.length > 0 && nextVel.x === -this.vel.x && nextVel.y === -this.vel.y) {
            return;
        }

        this.vel = nextVel.copy();
    }

    checkFood() {
        if (this.pos.x === this.food.x && this.pos.y === this.food.y) {
            let growthSegment = this.tail.length > 0
                ? this.tail[this.tail.length - 1].copy()
                : this.pos.copy();

            this.tail.push(growthSegment);
            this.score++;
            this.stepsSinceFood = 0;
            this.maxStepsWithoutFood = 80 + this.tail.length * 25;
            this.food = this.spawnFood();
            return true;
        }

        return false;
    }

    move() {
        this.tail.unshift(this.pos.copy());
        this.tail.pop();
        this.pos.add(this.vel);
    }

    checkDeath() {
        if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= 20 || this.pos.y >= 20) {
            this.dead = true;
        }

        for (let t of this.tail) {
            if (t.x === this.pos.x && t.y === this.pos.y) {
                this.dead = true;
            }
        }

        if (this.stepsSinceFood > this.maxStepsWithoutFood) {
            this.dead = true;
        }
    }

    spawnFood() {
        let food;
        let valid = false;

        while (!valid) {
            food = createVector(floor(random(20)), floor(random(20)));
            valid = !(food.x === this.pos.x && food.y === this.pos.y);

            if (valid) {
                for (let t of this.tail) {
                    if (t.x === food.x && t.y === food.y) {
                        valid = false;
                        break;
                    }
                }
            }
        }

        return food;
    }

    getFoodDistance() {
        return abs(this.food.x - this.pos.x) + abs(this.food.y - this.pos.y);
    }

    getHungerRatio() {
        return constrain(this.stepsSinceFood / this.maxStepsWithoutFood, 0, 1);
    }

    // 🔥 29 INPUT SYSTEM
    getInputs() {
        let dirs = [
            createVector(1, 0), createVector(-1, 0),
            createVector(0, 1), createVector(0, -1),
            createVector(1, 1), createVector(-1, -1),
            createVector(-1, 1), createVector(1, -1)
        ];

        let inputs = [];

        for (let d of dirs) {
            inputs.push(this.lookFor(this.food, d));
            inputs.push(this.lookTail(d));
            inputs.push(this.lookWall(d));
        }

        inputs.push((this.food.x - this.pos.x) / 19);
        inputs.push((this.food.y - this.pos.y) / 19);
        inputs.push(this.vel.x);
        inputs.push(this.vel.y);
        inputs.push(1 - this.getHungerRatio());

        return inputs;
    }

    lookFor(target, dir) {
        let pos = this.pos.copy();
        let dist = 0;

        while (pos.x >= 0 && pos.y >= 0 && pos.x < 20 && pos.y < 20) {
            pos.add(dir);
            dist++;

            if (pos.x === target.x && pos.y === target.y) {
                return 1 / dist;
            }
        }
        return 0;
    }

    lookTail(dir) {
        let pos = this.pos.copy();
        let dist = 0;

        while (pos.x >= 0 && pos.y >= 0 && pos.x < 20 && pos.y < 20) {
            pos.add(dir);
            dist++;

            for (let t of this.tail) {
                if (t.x === pos.x && t.y === pos.y) {
                    return 1 / dist;
                }
            }
        }
        return 0;
    }

    lookWall(dir) {
        let pos = this.pos.copy();
        let dist = 0;

        while (pos.x >= 0 && pos.y >= 0 && pos.x < 20 && pos.y < 20) {
            pos.add(dir);
            dist++;
        }

        return 1 / dist;
    }

    draw() {
        let lesserBound = windowWidth - windowHeight > 0 ? windowHeight : windowWidth;
        let length = lesserBound / 20;
        fill(0, 255, 0);
        rect(this.pos.x * length, this.pos.y * length, length, length);

        fill(0, 200, 0);
        for (let t of this.tail) {
            rect(t.x * length, t.y * length, length, length);
        }

        fill(255, 0, 0);
        rect(this.food.x * length, this.food.y * length, length, length);
    }
}

class Population {
    constructor(size = 50) {
        this.snakes = [];
        this.size = size;
        this.generation = 1;
        this.bestSnake = null;

        for (let i = 0; i < size; i++) {
            this.snakes.push(new SnakeAI());
        }
    }

    update() {
        for (let s of this.snakes) {
            if (!s.dead) {
                s.update();
            }
        }

        this.bestSnake = this.snakes.reduce((best, s) => {
            return (!best || s.fitness > best.fitness) ? s : best;
        }, null);
    }

    allDead() {
        return this.snakes.every(s => s.dead);
    }

    pickParent(pool) {
        let totalRank = (pool.length * (pool.length + 1)) / 2;
        let choice = random(totalRank);

        for (let i = 0; i < pool.length; i++) {
            choice -= (pool.length - i);
            if (choice <= 0) {
                return pool[i];
            }
        }

        return pool[0];
    }

    nextGeneration() {
        let newSnakes = [];

        this.snakes.sort((a, b) => b.fitness - a.fitness);

        let parentCount = Math.max(5, floor(this.size * 0.2));
        let parents = this.snakes.slice(0, parentCount);
        let elite = parents[0];

        let champion = new SnakeAI();
        champion.brain = elite.brain.copy();
        newSnakes.push(champion);

        while (newSnakes.length < this.size) {
            let parent = this.pickParent(parents);
            let child = new SnakeAI();
            child.brain = parent.brain.copy();
            child.brain.mutate(newSnakes.length < this.size * 0.3 ? 0.08 : 0.18);
            newSnakes.push(child);
        }

        this.snakes = newSnakes;
        this.bestSnake = this.snakes[0];
        this.generation++;
    }
}

let population;
let showBestOnly = false;

function setup() {
    let lesserBound = windowWidth - windowHeight > 0 ? windowHeight : windowWidth;
    createCanvas(lesserBound, lesserBound);
    frameRate(30);

    population = new Population(50);
}

function windowResized() {
    let lesserBound = windowWidth - windowHeight > 0 ? windowHeight : windowWidth;
    createCanvas(lesserBound, lesserBound);
}

function draw() {
    background(30);

    population.update();

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

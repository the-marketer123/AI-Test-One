class SnakeAI {
    constructor() {
        this.stepsSinceFood = 0;
        this.maxStepsWithoutFood = 50 + this.tail.length * 20;        
        this.pos = createVector(10, 10);
        this.vel = createVector(1, 0);

        this.tail = [
            createVector(9,10),
            createVector(8,10),
            createVector(7,10),
        ];

        this.brain = new NeuralNetwork();
        this.dead = false;
        this.fitness = 0;

        this.food = createVector(floor(random(20)), floor(random(20)));
    }

    update() {
        let inputs = this.getInputs();
        let output = this.brain.predict(inputs);

        let maxIndex = output.indexOf(Math.max(...output));

        if (maxIndex === 0) this.vel = createVector(0, -1);
        if (maxIndex === 1) this.vel = createVector(0, 1);
        if (maxIndex === 2) this.vel = createVector(-1, 0);
        if (maxIndex === 3) this.vel = createVector(1, 0);

        this.move();

        this.stepsSinceFood++; // ⏱️ increment timer

        this.checkFood();      // 👈 NEW
        this.checkDeath();
        this.fitness++;
        //this.fitness += floor(5 * (this.stepsSinceFood / this.maxStepsWithoutFood);
    }
    checkFood() {
        if (this.pos.x === this.food.x && this.pos.y === this.food.y) {
            // grow
            this.tail.push(this.tail[this.tail.length - 1].copy());

            // reset timer
            this.stepsSinceFood = 0;

            // reward fitness
            this.fitness += 50;

            // new food
            this.food = createVector(floor(random(20)), floor(random(20)));
        }
    }
    move() {
        this.tail.unshift(this.pos.copy());
        this.tail.pop();
        this.pos.add(this.vel);
    }

    checkDeath() {
        // wall
        if (this.pos.x < 0 || this.pos.y < 0 || this.pos.x >= 20 || this.pos.y >= 20) {
            this.dead = true;
        }

        // self
        for (let t of this.tail) {
            if (t.x === this.pos.x && t.y === this.pos.y) {
                this.dead = true;
            }
        }

        // ⏱️ starvation
        if (this.stepsSinceFood > this.maxStepsWithoutFood) {
            this.dead = true;
        }
    }

    // 🔥 24 INPUT SYSTEM
    getInputs() {
        let dirs = [
            createVector(1,0), createVector(-1,0),
            createVector(0,1), createVector(0,-1),
            createVector(1,1), createVector(-1,-1),
            createVector(-1,1), createVector(1,-1)
        ];

        let inputs = [];

        for (let d of dirs) {
            inputs.push(this.lookFor(this.food, d)); // food
            inputs.push(this.lookTail(d));           // self
            inputs.push(this.lookWall(d));           // wall
        }

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
        fill(0,255,0);
        rect(this.pos.x * 20, this.pos.y * 20, 20, 20);

        fill(0,200,0);
        for (let t of this.tail) {
            rect(t.x * 20, t.y * 20, 20, 20);
        }

        fill(255,0,0);
        rect(this.food.x * 20, this.food.y * 20, 20, 20);
    }
}

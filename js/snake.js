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
        // self explanatory, updates everything
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
        //use nerual networks decision to move
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
        //check for if eaten food
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
        //move tails
        this.tail.unshift(this.pos.copy());
        this.tail.pop();
        this.pos.add(this.vel);
    }

    checkDeath() {
        //check if its dead
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
        //create new food
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
        //check for the distance to the food currently
        return abs(this.food.x - this.pos.x) + abs(this.food.y - this.pos.y);
    }

    getHungerRatio() {
        //how starved it is
        return constrain(this.stepsSinceFood / this.maxStepsWithoutFood, 0, 1);
    }

    // 🔥 29 INPUT SYSTEM
    getInputs() {
        //record the 29 inputs
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
        //check for stuff in the direction given
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
        //look for the tails in the direction
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
        //look for walls in a driection
        let pos = this.pos.copy();
        let dist = 0;

        while (pos.x >= 0 && pos.y >= 0 && pos.x < 20 && pos.y < 20) {
            pos.add(dir);
            dist++;
        }

        return 1 / dist;
    }

    draw() {
        //draw everything
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

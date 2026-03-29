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

        // Track best snake (alive or dead)
        this.bestSnake = this.snakes.reduce((best, s) => {
            return (!best || s.fitness > best.fitness) ? s : best;
        }, null);
    }

    allDead() {
        return this.snakes.every(s => s.dead);
    }

    nextGeneration() {
        let newSnakes = [];

        // Sort by fitness
        this.snakes.sort((a, b) => b.fitness - a.fitness);

        let elite = this.snakes[0];

        for (let i = 0; i < this.size; i++) {
            let child = new SnakeAI();
            child.brain = elite.brain.copy();
            child.brain.mutate(0.1);
            newSnakes.push(child);
        }

        this.snakes = newSnakes;
        this.generation++;
    }
}
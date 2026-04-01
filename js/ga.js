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
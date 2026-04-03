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
        //ignore the dead
        for (let s of this.snakes) {
            if (!s.dead) {
                s.update();
            }
        }

        // choose the best
        this.bestSnake = this.snakes.reduce((best, s) => {
            return (!best || s.fitness > best.fitness) ? s : best;
        }, null);
    }

    allDead() {
        // check for all dead
        return this.snakes.every(s => s.dead);
    }

    pickParent(pool) {
        // pick top 20%
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
        // start next generation
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

    saveBest() {
        //save best neural netowrk to browser
        if (this.bestSnake) {
            let data = this.bestSnake.brain.toJSON();
            localStorage.setItem('bestNeuralNetwork', JSON.stringify(data));
            console.log('Best neural network saved!');
        }
    }

    loadBest() {
        // load best neural network from browser
        let data = localStorage.getItem('bestNeuralNetwork');
        if (data) {
            let json = JSON.parse(data);
            let brain = NeuralNetwork.fromJSON(json);
            
            // Replace the brain of the first snake with the loaded one
            this.snakes[0].brain = brain;
            this.bestSnake = this.snakes[0];
            console.log('Best neural network loaded!');
            return true;
        }
        return false;
    }
}
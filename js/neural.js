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
class NeuralNetwork {
    constructor(input = 24, hidden = 16, output = 4) {
        this.input = input;
        this.hidden = hidden;
        this.output = output;

        this.w1 = this.randomMatrix(this.hidden, this.input);
        this.w2 = this.randomMatrix(this.output, this.hidden);
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
        return nn;
    }

    mutate(rate = 0.1) {
        function mutateVal(val) {
            if (random(1) < rate) {
                return val + randomGaussian() * 0.2;
            }
            return val;
        }

        this.w1 = this.w1.map(row => row.map(mutateVal));
        this.w2 = this.w2.map(row => row.map(mutateVal));
    }

    activate(x) {
        return Math.tanh(x);
    }

    predict(inputs) {
        // hidden layer
        let hidden = [];
        for (let i = 0; i < this.hidden; i++) {
            let sum = 0;
            for (let j = 0; j < this.input; j++) {
                sum += this.w1[i][j] * inputs[j];
            }
            hidden[i] = this.activate(sum);
        }

        // output layer
        let output = [];
        for (let i = 0; i < this.output; i++) {
            let sum = 0;
            for (let j = 0; j < this.hidden; j++) {
                sum += this.w2[i][j] * hidden[j];
            }
            output[i] = sum;
        }

        return output;
    }
}
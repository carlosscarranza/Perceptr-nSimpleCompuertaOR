import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var counter = 0;

var gweight1 = 0;
var gweight2 = 0;
var gerror = 0;

app.post('/calculate', async function (req, res) {
    counter = 0;
    gweight1 = req.body.weight1;
    gweight2 = req.body.weight2;
    gerror = req.body.error;

    calculate(gerror, req.body.learning_factor, gweight1, gweight2);

    res.send({
        w1: gweight1,
        w2: gweight2,
        error: gerror,
        counterAdjust: counter
    })
})

app.get('/validate', function (req, res) {

    let number =  Math.tanh( ((req.body.x1 * req.body.weight1) + (req.body.x2 * req.body.weight2))   - (req.body.error))
    res.send({number});
})

const calculate = (error, learning_factor, weight1, weight2) => {

    let y1 = validate(1, weight1, 1, weight2, error, 1);
    if(y1 === false){ 
        adjust(weight1, weight2, error, learning_factor, 1, 1, 1)
        calculate(gerror, learning_factor, gweight1, gweight2);
    }
    
    let y2 = validate(1, weight1, -1, weight2, error, 1);
    if(y2 === false){ 
        adjust(weight1, weight2, error, learning_factor, 1, 1, -1)
        calculate(gerror, learning_factor, gweight1, gweight2);
    }
    
    let y3 = validate(-1, weight1, 1, weight2, error, 1);
    if(y3 === false){ 
        adjust(weight1, weight2, error, learning_factor, 1, -1, 1)
        calculate(gerror, learning_factor, gweight1, gweight2);
    }
    
    let y4 = validate(-1, weight1, -1, weight2, error, -1);
    if(y4 === false){ 
        adjust(weight1, weight2, error, learning_factor, -1, -1, -1)
        calculate(gerror, learning_factor, gweight1, gweight2);
    }
}

const validate = (x1, weight1, x2, weight2, error, expected) => {

    let y = Math.tanh( ((x1 * weight1) + (x2 * weight2))  - (error))
    return expected == 1 ? y >= 0 : y <= 0
}

const adjust = (weight1, weight2, error, learning_factor, y, x1, x2) => {

    gweight1 = weight1 + (2 * learning_factor * y  * x1);
    gweight2 = weight2 + (2 * learning_factor * y  * x2);
    gerror   = error   + (2 * learning_factor * y  * (-1));
    counter++;
}

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
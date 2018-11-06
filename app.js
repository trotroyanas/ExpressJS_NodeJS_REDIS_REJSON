const Joi = require('joi');
const express = require('express');

//redis
var redis = require('redis');
var rejson = require('redis-rejson');

const app = express();

//Init Redis
rejson(redis);
var client = redis.createClient(6379, '192.168.56.101');

app.use(express.json());

//JSON.set 
app.post('/api/courses', (req, res) => {

    var nam = req.body.name;
    var path = req.body.path;
    var val = JSON.stringify(req.body.val);

    client.json_set(nam, path, val, function (err) {
        if (err) {
            throw err;
        }
        /*
        client.json_get(nam, ".", function (err, value) {
            if (err) {
                throw err;
            }
            console.log('Json_get -> ' + nam + ' ' + '.' + ' ' + value);
            res.send('Json_get -> ' + nam + ' ' + '.' + ' ' + value);
        });
        */
        res.send('Json_get -> ' + nam + ' ' + path + ' ' + val);
    });
});


// /api/courses/id
app.get('/api/courses/:id', (req, res) => {
    var nam = req.params.id;
    console.log(nam);

    client.json_get(nam, ".", function (err, value) {
        if (err) {
            throw err;
        }
        console.log('Json_get -> ' + nam + ' ' + '.' + ' ' + value);
        res.send('Json_get -> ' + nam + ' ' + '.' + ' ' + value);
        //client.quit();
    });


});


function ValidateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(course, schema);
}




//Port
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`));
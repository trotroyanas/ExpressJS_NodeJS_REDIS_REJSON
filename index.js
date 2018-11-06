const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

const courses = [{
        id: 1,
        name: 'course1'
    },
    {
        id: 2,
        name: 'course2'
    },
    {
        id: 3,
        name: 'course3'
    },
]

app.get('/', (req, res) => {
    res.send('Hello World !!!');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});


app.post('/api/courses', (req, res) => {
    const {
        error
    } = ValidateCourse(req.body);
    if (error) {
        //400 Bad Request
        return res.status(400).send(error.details[0].message);
    };
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('the course with the given Id was not found.');

    const {
        error
    } = ValidateCourse(req.body);
    if (error) {
        //400 Bad Request
        return res.status(400).send(error.details[0].message);
    };

    //Update Course
    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('the course with the given Id was not found.');

    //Delete 
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    //Return
    res.send(course);
});

function ValidateCourse(course) {
    const schema = {
        name: Joi.string().min(3).required()
    }
    return Joi.validate(course, schema);
}

// /api/courses/1
app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send('the course with the given Id was not found.');
    res.send(course);
});

app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
});

//Port
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`));
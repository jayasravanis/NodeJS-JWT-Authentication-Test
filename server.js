const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const path = require('path');

const PORT = 3000;
const secretKey = 'My secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

let users = [
    {
        id: 1,
        username: 'sravani',
        password: '1234'
    },
    {
        id: 2,
        username: 'jaya',
        password: '5678'
    }
]

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let userFound = false;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
            userFound = true;
            return res.json({
                success: true,
                err: null,
                token
            });
        }
    }

    if (!userFound) {
        return res.status(401).json({
            success: false,
            err: 'Username or password is incorrect',
            token: null
        });
    }
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'You can view these Settings only after logged in.'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(function(err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            err: 'Username or password is incorrect 2',
            officialErr: err
        });
    }
    else
        next(err);
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
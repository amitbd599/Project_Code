// CONSTANTS

const express = require("express");
const path = require('path'); 
const app = express(); 
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const morgan = require('morgan');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/expressError');
const { commentSchema } = require('./joiSchemas.js');
const session = require('express-session');
const flash = require('connect-flash');

const https = require('https');
const http = require('http');
const fs = require('fs');

const httpPort = 80;
const httpsPort = 443;

const httpServer = http.createServer(app);
const httpsServer = https.createServer(https_options, app);


// APP SETS AND USES
app.set('view engine', 'ejs'); // setting ejs as the view engine
app.set('views', path.join(__dirname, '/views')); // setting the current dir to be where 'views' is stored
app.use(express.static(path.join(__dirname, '/public'))); // for using the 'public' directory for static assets
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(flash());




// for mongoose...
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project', { useNewUrlParser: true, useUnifiedTopology: true }) // defines where to look for the db the name of the db to use
    .then(() => {
        console.log("Mongoose connection Open!");
    })
    .catch(err => {
        console.log(`Mongoose connection Error: ${err}`);
    })

// get models...
const Comment = require('./models/comment');

// for session...
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // one week
        maxAge: 1000 * 60 * 60 * 24 * 7 // one week
    }
}
app.use(session(sessionConfig));



app.use((req, res, next) => {
    if (req.protocol === 'http') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
        next();
    }
});



// ROUTING -------------------------------------
app.get('/', (req, res) => { // root route
	res.render('home.ejs'); 
})







// SERVER START

httpServer.listen(httpPort, '0.0.0.0', () => {
    console.log(`Now listening on port ${httpPort}`);
});
httpsServer.listen(httpsPort, '0.0.0.0', () => {
    console.log(`Now listening on ${httpsPort}`);
});



// error handler (this is where every .next() leads to)
app.use((err, req, res, next) => {
    const { status = 500, message = 'Error' } = err; // destructuring error object (sets default values)
    // res.status(status).send(message); // without using error template
    res.status(status).render('error', { err, status}); // using error template
});

//testing

// app.use((req, res) => { // app.use is also used to send reponses to unknown paths, instead of the .get(*) above
//     // res.status(404).send('NOT FOUND'); // using the custom error below
//     throw new expressError('NOT FOUND', 404);
// })

// app.listen(3002, () => { // listen for requests - and callback added
// 	console.log("Now listening on port 3002");
// });

// app.get('/flash', (req, res) => {
//     req.flash('success', `You've been successfully redirected to the Message route!`)
//     res.redirect('/message')
// })
 
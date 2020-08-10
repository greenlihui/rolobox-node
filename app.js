const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const config = require('./app-config');


/********** Common Modules **********/
const app = express();
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.SECRET_KEY));
app.use(express.static(path.join(__dirname, 'public')));


/********** DATABASE CONNECTION **********/
const connectDB = require('./middleware/db-connect');
connectDB();


/********** LOGGING **********/
const logFolder = './logs';
if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder, {recursive: true});
}
const date = (new Date(Date.now())).toLocaleDateString().replace(/\//g, '-');
const logFilename = './logs/' + date + '.log';
const accessLogStream = fs.createWriteStream(path.join(__dirname, logFilename), {flags: 'a'});
app.use(logger('combined', {stream: accessLogStream}));
app.use(logger('dev'));


const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
server.listen(80);
app.io = io; // todo delete this
require('./middleware/socketio')(io);


/********** Create Multer File Upload and Face Thumbnail Folders **********/
const LOCAL_IMAGES_FOLDER = config.LOCAL_IMAGES_FOLDER;
const LOCAL_FACES_FOLDER = config.LOCAL_FACES_FOLDER;
const LOCAL_COMPRESSED_FOLDER = config.LOCAL_COMPRESSED_FOLDER;
if (!fs.existsSync(LOCAL_IMAGES_FOLDER)) {
    fs.mkdirSync(LOCAL_IMAGES_FOLDER, {recursive: true});
}
if (!fs.existsSync(LOCAL_FACES_FOLDER)) {
    fs.mkdirSync(LOCAL_FACES_FOLDER, {recursive: true});
}
if (!fs.existsSync(LOCAL_COMPRESSED_FOLDER)) {
    fs.mkdirSync(LOCAL_COMPRESSED_FOLDER, {recursive: true});
}


/********** User Session Support **********/
const session = require('express-session');
const passport = require('./middleware/passport');
app.use(session({
    name: 'SESSION-ID',
    secret: config.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());


/********** CSRF Support **********/
const csrf = require('csurf');
app.use(csrf({
    value: function (req) {
        return req.headers['x-xsrf-token'];
    }
}));

app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});


/********** Sub Routers **********/
const API_PREFIX = config.API_PREFIX;
app.use(API_PREFIX, [
    require('./routes/auth'),
    require('./routes/group'),
    require('./routes/face'),
    require('./routes/image'),
    require('./routes/contact'),
    require('./routes/friendship'),
    require('./routes/test'),
    require('./routes/message')
]);


/********** Angular Page Refreshing Supporting **********/
const angularRoutes = ['/', '/list', '/gallery', '/detection'];
app.get(angularRoutes, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

/********** Error Handling **********/
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Internal Error');
});

module.exports = app;

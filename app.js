const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');

const emailRoutes = require('./api/controllers/emailNotifications');
const senderRoutes = require('./api/controllers/emailSender');

/* Database */
mongoose.connect('mongodb://localhost:27017/neotic', {
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

const app = express();

/* Render views */
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

/* Static imports */
app.use(express.static(__dirname + '/api/public/'));
app.set('views', path.join(__dirname, 'api/views'));

/* Middlewares */
app.use(morgan('dev'));
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/* Mainpage */
app.get('/', (req, res) => {
    res.render('index')
})

/* Routes */
app.use('/emails', emailRoutes);
app.use('/sender', senderRoutes);

app.listen(3000, () => {
    console.log('Server is up!');
});
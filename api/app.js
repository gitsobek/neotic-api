const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');

const emailRoutes = require('./controllers/emailNotifications');
const senderRoutes = require('./controllers/emailSender');

import songs from './routes/songs';

import dbConfig from './config/database';
import { notFound, catchErrors } from './middlewares/errors';

/* Database */
mongoose.connect(dbConfig.mongoUrl, {
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
app.use(express.static(__dirname + '/public/'));
app.set('views', path.join(__dirname, 'views'));

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
app.use('/songs', songs());

/* Error handling */
app.use(notFound);
app.use(catchErrors);

app.listen(3000, () => {
    console.log('Server is up!');
});
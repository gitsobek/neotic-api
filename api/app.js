const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const passport = require('passport');
const MongoClient = require('mongodb').MongoClient;

const emailRoutes = require('./controllers/emailNotifications');
const senderRoutes = require('./controllers/emailSender');
const authRoutes = require('./routes/auth');

import songs from './routes/songs';
import tracks from './routes/tracks';

import dbConfig from './config/database';
import { notFound, catchErrors } from './middlewares/errors';

/* Database #1 */
let db;
MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, database) => {
  if (err) {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
  }
  db = database.db('streams');
});

/* Database #2 */
mongoose.connect(dbConfig.mongoUrl, {
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

export { db };
const app = express();

require('./config/passport');

/* Render views */
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

/* Static imports */
app.use(express.static(__dirname + '/public/'));
app.set('views', path.join(__dirname, 'views'));

/* Middlewares */
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());

/* Mainpage */
app.get('/', (req, res) => {
    res.render('index')
})

/* Routes */
app.use('/emails', emailRoutes);
app.use('/sender', senderRoutes);
app.use('/auth', authRoutes);
app.use('/songs', songs());
app.use('/tracks', tracks());

/* Error handling */
app.use(notFound);
app.use(catchErrors);

app.listen(3000, () => {
    console.log('Server is up!');
});
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const emailRoutes = require('./api/controllers/emailNotifications');

mongoose.connect('mongodb://localhost:27017/neotic');
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

const app = express();

app.use(morgan('dev'));
app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/emails', emailRoutes);

app.listen(3000, () => {
    console.log('Server is up!');
});
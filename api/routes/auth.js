var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

var ctrlAuth = require('../controllers/authController');

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.get('/me', ctrlAuth.me);

module.exports = router;
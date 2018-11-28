var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

const User = require('../models/user');

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        User.findOne({ email: username}, function (err, user) {
            if (err) return done(err);
            if (!user) {
                return done(null, false, {
                    message: 'Nie znaleziono użytkownika o takiej nazwie!'
                });
            }
            if(!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Niepoprawne hasło!'
                });
            }
            return done(null, user);
        });
    }
));
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy
var mongoose = require('mongoose');

const keys = require('./keys');
const User = require('../models/user');

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        User.findOne({ email: username }, function (err, user) {
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

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
  var userId = mongoose.Types.ObjectId(id);
  User.findById(userId).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: '/auth/google/callback',
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const user = await new User({
          email: profile.emails[0].value,
          name: profile.displayName,
          googleId: profile.id,
        }).save();
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
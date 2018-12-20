const passport = require('passport')
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = app => {
    // app.get('/auth/google/callback', function(req, res) {
    //     passport.authenticate('google', function (err, profile, info) {
    //         res.redirect('/')
    //         var token;

    //         if (err) {
    //             res.status(404).json(err);
    //             return;
    //         }

    //         if (profile) {
    //             token = profile.generateJwt();
    //             res.status(200);
    //             res.json({
    //                 "token" : token,
    //                 user: profile
    //             });
    //         } else {
    //             res.status(401).json(info);
    //         }
            
    //     })(req, res);
    // });

    app.get('/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            res.redirect('/');
        }
    )

    app.get('/auth/google/start',
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })
    )

    app.get('/auth/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/api/current_user', (req, res) => {
        res.send(req.user)
    })
}
var passport = require('passport');
var mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.register = function(req, res) {
    User.find({
        $or: [
            { email: req.body.email },
            { name: req.body.name }
        ]})
        .then(user => {
        if (user.length >= 1) {
            if(user[0].email == req.body.email) {
                res.status(409).json({
                    message: "Podany e-mail już istnieje!"
                });
            } else if(user[0].name == req.body.name) {
                res.status(409).json({
                    message: "Podana nazwa użytkownika już istnieje!"
                });
            }
        } else {
            var user = new User({
                name: req.body.name,
                email: req.body.email
            })
            user.setPassword(req.body.password);
            user.save()
            .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "Zostałeś zarejestrowany!"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
            });
        }
    })
}

module.exports.login = function(req, res) {
    passport.authenticate('local', function(err, user, info) {
        var token;

        if (err) {
            res.status(404).json(err);
            return;
        }

        if (user) {
            token = user.generateJwt();

            res.status(200);
            res.json({
                "token" : token,
                user: user
            });
        } else {
            res.status(401).json(info);
        }
    })(req, res);
};

module.exports.me = async function(req, res) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({
            message: 'Brak dostępu.'
        })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, "MY_SECRET", function(err, decoded) {
        if (err) {
            res.status(500).send({
                message: "Błąd serwera."
            })
        }
        User.findById(decoded._id, function(err, user) {
            if (err) return res.status(500).send({ message: "Błąd serwera."});
            if (!user) return res.status(404).send({ message: "Użytkownik nie został znaleziony."});

            res.status(200).send(user);
        })
    })
}
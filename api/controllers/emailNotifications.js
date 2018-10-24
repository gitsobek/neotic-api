const express = require('express');
const router = express.Router();

const Mail = require('../models/mail');

router.post('/', (req, res, next) => {
    const mail = new Mail({
        email: req.body.email
    })
    mail.save().then(result => {
        res.status(201).json({
            message: "Mail został zapisany."
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
      });
    });
})

module.exports = router;
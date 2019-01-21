const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Mail = require('../models/mail');

router.get('/', (req, res) => {
    res.render('email')
})

router.post('/', async (req, res) => {
    var title = req.body.title;
    var names = [];

    await Mail.find({}, { _id:0, email:1 }, function (err, docs) {
        names = docs.map(function(item) {
            return item['email'];
        });
    });

    const output = `
        <h1 style="font-weight:normal"><b>Neotic</b>:info</h1>
        <h3 style="font-weight:normal">${req.body.message}</h3>
        <p>Jeśli chcesz zakończyć subskrypcję - wyślij wiadomość 'NEOTIC-OFF'</p>
    `;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'service.neotic@gmail.com',
            pass: 'neotic123'
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    let mailOptions = {
        from: '"Neotic Information&Support Service" <service.neotic@email.com>',
        to: names,
        subject: title,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('email', {msg:'Email has been sent'});
    });
});

module.exports = router;
const mongoose = require('mongoose');

const MailSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    }
});

const Mail = mongoose.model('Mail', MailSchema);

module.exports = Mail;
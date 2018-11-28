const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function toLower(str) {
    return str.toLowerCase();
}

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        set: toLower
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    role: Number,
    hash: String,
    salt: String,
    token: String
}, {
    timestamps: true
});

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000),
      }, "MY_SECRET");
}

UserSchema.methods.saveToken = function(token) {
    User.token = token
}

const User = mongoose.model('User', UserSchema);
module.exports = User;
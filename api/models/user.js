const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const roles = ['admin', 'user', 'banned'];
const ranks = ['Zwykły słuchacz', 'Producent', 'Artysta'];

const SongSchema = require('./song');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    googleId: String,
    role: { type: String, enum: roles, default: 'user' },
    rank: { type: String, enum: ranks, default: 'Zwykły słuchacz'},
    avatarUrl: { type: String, default: 'http://localhost:3000/img/avatars/empty-avatar.png' },
    uploaded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    warns: [
        {
            message: String,
            receivedWhen: Date
        }
    ],
    banReason: String,
    isOnline: { type: Boolean, default: false},
    lastTimeOnline: String,
    nextUpload: Number,
    hash: String,
    salt: String
}, {
    timestamps: true
});

UserSchema.index({ name: 'text' });

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

const User = mongoose.model('User', UserSchema);
module.exports = User;
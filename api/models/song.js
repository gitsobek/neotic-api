const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
require('mongoose-type-url');

var Url = mongoose.SchemaTypes.Url;
const genres = ['pop', 'rock', 'rap', 'edm', 'trance', 'chill', 'classic', 'funk'];

const Song = new mongoose.Schema({
    title: String,
    artist: String,
    desc: String,
    genre: { type: String, enum: genres },
    imageUrl: Url,
    duration: Number,
    likes: { type: Number, default: 0},
    _user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

Song.index({ title: 'text' });

Song.plugin(URLSlugs('title', { field: 'slug', update: true }));

export default mongoose.model('Song', Song);
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
require('mongoose-type-url');

var Url = mongoose.SchemaTypes.Url;
const genres = ['pop', 'rock', 'rap', 'edm', 'trance', 'chill']

const Song = new mongoose.Schema({
    title: String,
    artist: String,
    genre: { type: String, enum: genres },
    imageUrl: Url,
    duration: Number,
}, {
    timestamps: true
});

Song.index({ title: 'text' });

Song.plugin(URLSlugs('title', { field: 'slug', update: true }));

export default mongoose.model('Song', Song);
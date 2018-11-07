const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const Song = new mongoose.Schema({
    title: String
}, {
    timestamps: true
});

Song.plugin(URLSlugs('title', { field: 'slug', update: true }));

export default mongoose.model('Song', Song);
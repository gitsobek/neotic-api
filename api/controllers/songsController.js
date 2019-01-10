import Song from '../models/song';
import User from '../models/user';
const mongoose = require('mongoose');

const multer = require('multer');
var slug = require('slug');
var mkdirp = require('mkdirp');

import _ from 'lodash';
import song from '../models/song';

function isDirectoryExists(directory) {
    try {
        fs.statSync(directory);
        return true;
    } catch(e) {
        return false;
    }
}

var uploadWithDynamicDest = function(dest, title){
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            if (!isDirectoryExists('./api/public/img/songs/' + dest + '/')) {
                mkdirp.sync('./api/public/img/songs/' + dest + '/');
                mkdirp.sync('./dist/public/img/songs/' + dest + '/');
            }

            cb(null, './api/public/img/songs/' + dest + '/');
            cb(null, './dist/public/img/songs/' + dest + '/');
        },
        filename: function(req, file, cb) {
            cb(null, title + '.' + file.originalname.split('.')[1]);
        }
    })

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5
        }
    }).single('image');

    return upload;
}

export default {
    async findOne(req, res, next) {
        const song = await Song.findOne({ slug: req.params.slug });
        if(!song) return next();
        return res.status(200).send({ data: song });
    },

    async findAll(req, res) {
        const sort_by = {};
        sort_by[req.query.sort_by || 'createdAt'] = req.query.order_by || 'desc';
        const offset = parseInt(req.query.offset) || 0;
        const per_page = parseInt(req.query.per_page) || 4;
        const songsPromise =
            Song.find(req.filters, { score: { $meta: 'textScore' }})
                .skip(offset)
                .limit(per_page)
                .sort(sort_by);
        const countPromise = Song.count(req.filters);
        const [songs, count] = await Promise.all([songsPromise, countPromise]);
        return res.status(200).send({ data: songs, count });
    },

    async findByPreferences(req, res) {

        const user = await User.findOne({ _id: req.params.userId });

        var filteredSongs = {};
        const sort_by = {};
        sort_by['likes'] = 'desc';

        const songs = await Song.find({_id: { $nin: user.playlist }})
            .populate('_user')
            .sort(sort_by);

        if (req.body.time == 'short') {
            filteredSongs = songs.filter(song => song.duration < 240)
        } else if (req.body.time == 'long') {
            filteredSongs = songs.filter(song => song.duration > 240)
        } else {
            res.status(400).send({ message: 'Brak wyników'});
            return;
        }

        if (req.body.type == 'instrumental') {
            filteredSongs = filteredSongs.filter(
                song => song.genre == 'chill'
                    || song.genre == 'classic'
                    || song.genre == 'funk'
            )
        } else if (req.body.type == 'dance') {
            filteredSongs = filteredSongs.filter(
                song => song.genre == 'edm' || song.genre == 'trance')
        } else if (req.body.type == 'guitar') {
            filteredSongs = filteredSongs.filter(song => song.genre == 'rock')
        } else if (req.body.type == 'party') {
            filteredSongs = filteredSongs.filter(
                song => song.genre == 'pop' || song.genre == 'rap'
            )
        } else {
            res.status(400).send({ message: 'Brak wyników'});
        }

        filteredSongs.forEach(function (song) {
            console.log(song.title + '-> tempo: ' + song.tempo + ' srednia amp: ' + song.avgBeat);
            if (req.body.mood == 'relax') {
                filteredSongs = filteredSongs.filter(song => song.tempo > 0 && song.tempo <= 120)
            } else if (req.body.mood == 'easy') {
                filteredSongs = filteredSongs.filter(song => song.tempo > 120 && song.tempo <= 138)
            } else if (req.body.mood == 'energy') {
                filteredSongs = filteredSongs.filter(song => song.tempo > 138 && song.tempo <= 200)
            }
        });

        return res.status(200).send({ data: filteredSongs });

    },

    async create(req, res) {
        const song = await new Song({
            title: req.body.title,
            artist: req.body.artist,
            genre: req.body.genre,
            imageUrl: req.body.imageUrl,
            duration: req.body.duration
        }).save();

        return res.status(201).send({ data: song, message: 'Song added.'});
    },

    async createByUser(req, res) {
        await User.findOne({ _id: req.params.userId }, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user.rank === 'Zwykły słuchacz') {
                        if (!user.nextUpload || user.nextUpload < Date.now() / 1000) {
                            var expiry = new Date();
                            expiry.setDate(expiry.getDate() + 2);

                            user.nextUpload = parseInt(expiry.getTime() / 1000)
                            user.save();

                            const song = new Song({
                                title: req.body.title,
                                artist: req.body.artist,
                                desc: req.body.description,
                                genre: req.body.genre,
                                _user: req.params.userId
                            }).save()
                            .then(result => {
                                res.status(201).send({ data: result, message: 'Informacje zapisane..'});
                            });
                        } else {
                            res.status(478).send({ exp: user.nextUpload, message: 'Nie możesz dodać kolejnego utworu!'})
                        }
                    } else {
                        const song = new Song({
                            title: req.body.title,
                            artist: req.body.artist,
                            desc: req.body.description,
                            genre: req.body.genre,
                            _user: req.params.userId
                        }).save()
                        .then(result => {
                            res.status(201).send({ data: result, message: 'Informacje zapisane..'});
                        });
                    }
                }
            })
    },

    async addSongToPlaylist(req, res) {
        const user = await User.findOneAndUpdate({ _id: req.params.userId },
            { $push: { playlist: req.params.songId }});
        if (!user) return next();

        return res.status(200).send({ message: 'Playlista zaktualizowana.' });
    },

    async removeSongFromPlaylist(req, res) {
        const user = await User.findOneAndUpdate({ _id: req.params.userId },
            { $pull: { playlist: req.params.songId }});
        if (!user) return next();

        return res.status(200).send({ message: 'Playlista zaktualizowana.' });
    },

    async addSongToLiked(req, res) {
        const user = await User.findOneAndUpdate({ _id: req.params.userId },
            { $push: { liked: req.params.songId }});
        if (!user) return next();

        const song = await Song.findOneAndUpdate({ _id: req.params.songId },
            { $inc: { likes: 1 }})
        if (!song) return next();

        return res.status(200).send({ message: 'Lista ulubionych zaktualizowana.' });
    },

    async removeSongFromLiked(req, res) {
        const user = await User.findOneAndUpdate({ _id: req.params.userId },
            { $pull: { liked: req.params.songId }});
        if (!user) return next();

        const song = await Song.findOneAndUpdate({ _id: req.params.songId },
            { $inc: { likes: -1 }})
        if (!song) return next();

        return res.status(200).send({ message: 'Lista ulubionych zaktualizowana.' });
    },

    async addToUploaded(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.userId },
            { $push: { uploaded: req.params.songId }});
        if (!user) return next();

        return res.status(200).send({ message: 'Lista uploadów zaktualizowana..' });
    },

    async uploadImage(req, res) {
        const urlEndpointForImages = 'http://localhost:3000/img/songs/';

        var artistName, titleName;

        await Song.findOne({ _id: req.params.id }, function(err, song) {
            artistName = song.artist
            titleName = song.slug;
        });

        var upload2 = uploadWithDynamicDest(slug(artistName.toLowerCase()), titleName);
        upload2(req, res, (err) => {
            if (err) {
                console.log(err);
                res.status(400).send({ message: 'Błąd podczas uploadu.'})
            } else {
                Song.findOneAndUpdate({ _id: req.params.id }, { $set: { imageUrl: urlEndpointForImages + slug(artistName.toLowerCase()) + '/' + titleName + '.' + req.file.filename.split('.')[1] }})
                .exec()
                .then(result => res.status(200).send({ message: 'Obrazek dodany..' }))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: err })
                });
            }
        })
    },

    async update(req, res) {
        const song = await Song.findOne({ slug: req.params.slug });
        if(!song) return next();

        song.title = req.body.title;
        await song.save();

        return res.status(200).send({ data: song, message: 'Song updated.'});
    },

    async remove(req, res) {
        await Song.findOneAndRemove({ _id: req.params.id }, async function(err, result) {
            if (err) console.log(err);
            await User.updateMany({},
                { $pull: {
                    playlist: req.params.id,
                    liked: req.params.id,
                    uploaded: req.params.id
                }
            })
            .then(result => res.status(200).send({ message: 'Song removed.' }))
            .catch(err => res.status(500).json({ message: err }))
        })
    }
}
import Song from '../models/song';
import User from '../models/user';

const multer = require('multer');
var slug = require('slug');
var mkdirp = require('mkdirp');

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

    async uploadImage(req, res) {
        const urlEndpointForImages = 'http://localhost:3000/img/songs/';

        var artistName, titleName;

        await Song.findOne({ _id: req.params.id }, function(err, song) {
            artistName = song.artist
            titleName = song.slug;
        });

        var upload2 = uploadWithDynamicDest(slug(artistName), titleName);
        upload2(req, res, (err) => {
            if (err) {
                console.log(err);
                res.status(400).send({ message: 'Błąd podczas uploadu.'})
            } else {
                Song.findOneAndUpdate({ _id: req.params.id }, { $set: { imageUrl: urlEndpointForImages + slug(artistName) + '/' + titleName + '.' + req.file.filename.split('.')[1] }})
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
        const song = await Song.findOne({ slug: req.params.slug });
        if(!song) return next();
        await song.remove();

        return res.status(200).send({ message: 'Song removed.'});
    }
}
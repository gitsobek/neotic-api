import Song from '../models/song';

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
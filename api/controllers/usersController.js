const multer = require('multer');

import User from '../models/user';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './api/public/img/avatars');
        cb(null, './dist/public/img/avatars')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
}).single('image');

export default {
    async findOne(req, res, next) {
        const user = await User.findOne({ _id: req.params.id })
            .populate('uploaded playlist liked');
        if (!user) return next();
        return res.status(200).send({ data: user });
    },

    async findAll(req, res) {
        const sort_by = {};
        sort_by[req.query.sort_by || 'createdAt'] = req.query.order_by || 'desc';
        const filter = req.query.filter || '';
        const offset = parseInt(req.query.offset) || 0;
        const per_page = parseInt(req.query.per_page) || 10;
        const usersPromise =
            User.find(
                { name: { $regex: "^" + filter, $options: 'i' }},
                { score: { $meta: 'textScore' }},
                req.filters)
                .populate('uploaded playlist liked')
                .skip(offset)
                .limit(per_page)
                .sort(sort_by)
        const countPromise = User.count(req.filters);
        const [users, count] = await Promise.all([usersPromise, countPromise]);
        return res.status(200).send({ data: users, count });
    },

    async create(req, res) {
        const user = await new User({
            email: req.body.email,
            name: req.body.name,
            role: req.body.role,
            avatarUrl: req.body.avatarUrl
        }).save();

        return res.status(201).send({ data: user, message: 'User added.' });
    },

    async update(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id },
            { $set: { role: req.body.role }});
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async updateRank(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id },
            { $set: { rank: req.body.rank }});
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async addWarn(req, res, next) {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            { $push: {
                warns: {
                    message: req.body.message,
                    receivedWhen: new Date()
                }
            }}
        );
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async addBan(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id },
            { $set: { role: 'banned', banReason: req.body.message }}
        );
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async unbanUser(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id },
            { $set: { role: 'user', warns: [] }},
            { $unset: { banReason: "" }}
        );
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async uploadAvatar(req, res, next) {
        const urlEndpointForAvatars = 'http://localhost:3000/img/avatars/';
        upload(req, res, (err) => {
            if (err) {
                res.status(400).send({ message: 'Błąd podczas uploadu.'})
            } else {
                User.findOneAndUpdate({ _id: req.params.id }, { $set: { avatarUrl: urlEndpointForAvatars + req.file.filename }})
                .exec()
                .then(result => res.status(200).send({ message: 'User updated.' }))
                .catch(err => res.status(500).json({
                    message: err
                }));
            }
        })
    },

    async logoutUser(req, res, next) {
        const user = await User.findOneAndUpdate({ _id: req.params.id },
            { $set: { isOnline: false }},
        );
        if (!user) return next();

        return res.status(200).send({ message: 'User updated.' });
    },

    async remove(req, res) {
        const user = await User.findOne({ _id: req.params._id });
        if(!user) return next();
        await user.remove();

        return res.status(200).send({ message: 'User removed.'});
    }
}
import User from '../models/user';

export default {
    async findOne(req, res, next) {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return next();
        return res.status(200).send({ data: user });
    },

    async findAll(req, res) {

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

    async remove(req, res) {
        const user = await User.findOne({ _id: req.params._id });
        if(!user) return next();
        await user.remove();

        return res.status(200).send({ message: 'User removed.'});
    }
}
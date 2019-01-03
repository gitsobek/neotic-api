const multer = require('multer');
const mongodb = require('mongodb');
const { Readable } = require('stream');

import { db } from '../app'

export default {
    async findOne(req, res) {
        try {
            var filename = req.params.filename;
        } catch(err) {
            return res.status(400).json({ message: "Invalid trackID in URL parameter!" });
        }
        console.log(filename);
        res.set('Content-Type', 'audio/mp3');
        res.set('Accept-Ranges', 'bytes');

        let bucket = new mongodb.GridFSBucket(db, {
            bucketName: 'tracks'
        });

        let downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', () => {
            res.sendStatus(404);
        });

        downloadStream.on('end', () => {
            res.end();
        });
    },

    async createByUser(req, res) {
        console.log(req.body.image);
        // const storage = multer.memoryStorage()
        // const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }});
        // upload.single('track')(req, res, (err) => {
        //     if (err) {
        //         return res.status(400).json({ message: "Upload request failed!" });
        //     }

        //     let trackName = req.file.originalname.split('.')[0];

        //     const readableTrackStream = new Readable();
        //     readableTrackStream.push(req.file.buffer);
        //     readableTrackStream.push(null);

        //     let bucket = new mongodb.GridFSBucket(db, {
        //         bucketName: 'tracks'
        //     });

        //     let uploadStream = bucket.openUploadStream(trackName);
        //     let id = uploadStream.id;
        //     readableTrackStream.pipe(uploadStream);

        //     uploadStream.on('error', () => {
        //         return res.status(500).json({ message: "Error uploading file!" });
        //     });

        //     uploadStream.on('finish', () => {
        //         return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
        //     });
        // });
    },

    async create(req, res) {
        const storage = multer.memoryStorage()
        const upload = multer({ storage: storage, limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }});
        upload.single('track')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: "Upload request failed!" });
            }

            let trackName = req.file.originalname.split('.')[0];

            const readableTrackStream = new Readable();
            readableTrackStream.push(req.file.buffer);
            readableTrackStream.push(null);

            let bucket = new mongodb.GridFSBucket(db, {
                bucketName: 'tracks'
            });

            let uploadStream = bucket.openUploadStream(trackName);
            let id = uploadStream.id;
            readableTrackStream.pipe(uploadStream);

            uploadStream.on('error', () => {
                return res.status(500).json({ message: "Error uploading file!" });
            });

            uploadStream.on('finish', () => {
                return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
            });
        });
    }
}
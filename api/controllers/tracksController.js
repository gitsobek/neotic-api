var fs = require('fs');
const util = require('util')
const multer = require('multer');
const mongodb = require('mongodb');
const { Readable } = require('stream');
var rawMetadata = require('music-metadata');
var AudioContext = require("web-audio-api").AudioContext;
var MusicTempo = require("music-tempo");
import _ from 'lodash';

import { db } from '../app'
import Song from '../models/song';
import { resolve } from 'path';

var uploadMusicWithDynamicDest = function(title) {
    const musicStorage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './api/public/music');
            cb(null, './dist/public/music')
        },
        filename: function(req, file, cb) {
            cb(null, title + '.' + file.originalname.substring(file.originalname.lastIndexOf('.') + 1));
        }
    })

    const uploadMusic = multer({ storage: musicStorage }).single('track');

    return uploadMusic;
}

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
    },

    async analyseSong(req, res) {

        var songFileName;

        await Song.findOne({ _id: req.params.songId }, function(err, song) {
            songFileName = song.slug;
        });

        var uploadTrack = uploadMusicWithDynamicDest(songFileName);

        uploadTrack(req, res, (err) => {
            if (err) {
                console.log(err);
                res.status(400).send({ message: 'Błąd podczas uploadu.'})
            } else {
                rawMetadata.parseFile('./api/public/music/' + songFileName + '.' + req.file.filename.substring(req.file.filename.lastIndexOf('.') + 1), { duration: true })
                    .then(async (metadata) => {
                        var data = fs.readFileSync('./api/public/music/' + songFileName + '.' + req.file.filename.substring(req.file.filename.lastIndexOf('.') + 1));
                        var ctx = new AudioContext();

                        let getSoundData = () => {
                            return new Promise(
                                (resolve, reject) => {
                                    ctx.decodeAudioData(data, async function(buffer) {
                                        var audioData = [];

                                        if (buffer.numberOfChannels == 2) {
                                            var channel1Data = buffer.getChannelData(0);
                                            var channel2Data = buffer.getChannelData(1);
                                            var length = channel1Data.length;
                                            for (var i = 0; i < length; i++) {
                                                audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
                                            }
                                        } else {
                                            audioData = buffer.getChannelData(0);
                                        }

                                        var mt = await new MusicTempo(audioData);
                                        resolve(mt);
                                    });
                                }
                            );
                        }

                        getSoundData().then(async (data) => {
                            var durationPromise = Math.round(metadata['format'].duration);
                            var tempoPromise = Math.round(data.tempo);
                            var maxBeatPromise = Math.round(Math.max.apply(Math, data.beats));
                            var minBeatPromise = Math.round(Math.min.apply(Math, data.beats));
                            var avgBeatPromise = Math.round(_.reduce(data.beats, (a, b) => a + b, 0) / (data.beats.length || 1));

                            const [tempo, duration, maxBeat, minBeat, avgBeat] = await Promise.all([tempoPromise, durationPromise, maxBeatPromise, minBeatPromise, avgBeatPromise]);

                            await Song.findOneAndUpdate({ _id: req.params.songId },
                                { $set:
                                    { duration: duration, maxBeat: maxBeat, minBeat: minBeat, avgBeat: avgBeat, tempo: tempo }
                                })
                                .exec()
                                .then(result => res.status(200).send({ message: 'Analiza zakończona!' }))
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({ message: err })
                                });
                        }).catch(err => {
                            console.log(err);
                        })
                    })
                    .catch((err) => {
                        console.error(err.message);
                    });
            }
        });
    }
}
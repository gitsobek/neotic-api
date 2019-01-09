import { Router } from 'express';
import songsController from '../controllers/songsController';
import { catchAsync } from '../middlewares/errors';
import getFilters from '../middlewares/filters/songs';

export default () => {
    const api = Router();

    api.get('/:id', catchAsync(songsController.findOne));

    api.get('/', getFilters, catchAsync(songsController.findAll));

    api.post('/findpreference/:userId', catchAsync(songsController.findByPreferences));

    api.post('/:songId/addplaylist/:userId', catchAsync(songsController.addSongToPlaylist));

    api.post('/:songId/removeplaylist/:userId', catchAsync(songsController.removeSongFromPlaylist));

    api.post('/:songId/addliked/:userId', catchAsync(songsController.addSongToLiked));

    api.post('/:songId/removeliked/:userId', catchAsync(songsController.removeSongFromLiked));

    api.post('/:songId/adduploaded/:userId', catchAsync(songsController.addToUploaded));

    api.post('/', catchAsync(songsController.create));

    api.post('/:userId', catchAsync(songsController.createByUser));

    api.post('/uploadimage/:id', catchAsync(songsController.uploadImage));

    api.put('/:id', catchAsync(songsController.update));

    api.delete('/:id', catchAsync(songsController.remove));

    return api;
}
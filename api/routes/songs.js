import { Router } from 'express';
import songsController from '../controllers/songsController';
import { catchAsync } from '../middlewares/errors';
import getFilters from '../middlewares/filters/songs';

export default () => {
    const api = Router();

    api.get('/:id', catchAsync(songsController.findOne));

    api.get('/', getFilters, catchAsync(songsController.findAll));

    api.post('/', catchAsync(songsController.create));

    api.put('/:id', catchAsync(songsController.update));

    api.delete('/:id', catchAsync(songsController.remove));

    return api;
}
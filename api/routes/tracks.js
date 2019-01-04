import { Router } from 'express';
import tracksController from '../controllers/tracksController';
import { catchAsync } from '../middlewares/errors';

export default () => {
    const api = Router();

    api.get('/:filename', catchAsync(tracksController.findOne));

    api.post('/', catchAsync(tracksController.create));

    api.post('/analysis/:songId', catchAsync(tracksController.analyseSong))

    return api;
}
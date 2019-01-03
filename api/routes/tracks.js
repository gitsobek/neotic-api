import { Router } from 'express';
import tracksController from '../controllers/tracksController';
import { catchAsync } from '../middlewares/errors';

export default () => {
    const api = Router();

    api.get('/:filename', catchAsync(tracksController.findOne));

    api.post('/:id', catchAsync(tracksController.createByUser));

    api.post('/', catchAsync(tracksController.create));

    return api;
}
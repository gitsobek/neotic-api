import { Router } from 'express';
import usersController from '../controllers/usersController';
import { catchAsync } from '../middlewares/errors';

export default () => {
    const api = Router();

    api.get('/:id', catchAsync(usersController.findOne));

    api.get('/', catchAsync(usersController.findAll));

    api.post('/', catchAsync(usersController.create));

    api.put('/:id', catchAsync(usersController.update));

    api.delete('/:id', catchAsync(usersController.remove));

    return api;
}
import { Router } from 'express';
import usersController from '../controllers/usersController';
import { catchAsync } from '../middlewares/errors';
import getFilters from '../middlewares/filters/users';

export default () => {
    const api = Router();

    api.get('/:id', catchAsync(usersController.findOne));

    api.get('/', getFilters, catchAsync(usersController.findAll));

    api.post('/', catchAsync(usersController.create));

    api.put('/:id', catchAsync(usersController.update));

    api.put('/:id/rank', catchAsync(usersController.updateRank));

    api.put('/:id/warn', catchAsync(usersController.addWarn));

    api.put('/:id/ban', catchAsync(usersController.addBan));

    api.delete('/:id/unban', catchAsync(usersController.unbanUser));

    api.post('/:id/uploadavatar', catchAsync(usersController.uploadAvatar));

    api.put('/:id/logout', catchAsync(usersController.logoutUser));

    api.delete('/:id', catchAsync(usersController.remove));

    return api;
}
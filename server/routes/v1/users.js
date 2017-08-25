import express from 'express';
import users from '../../controllers/users';
import {
  isAuthenticated,
  isUserOwn,
  isAdminOrUserOwn,
  isAdmin
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/')
  .get([isAuthenticated, isAdmin], users.viewUser)
  .post(users.createUser);

Router.route('/:id')
  .get([isAuthenticated, isAdminOrUserOwn], users.getUserById)
  .put([isAuthenticated, isUserOwn], users.updateUser)
  .delete([isAuthenticated, isAdminOrUserOwn], users.deleteUser);

Router.route('/:id/documents')
  .get([isAuthenticated, isAdminOrUserOwn], users.getUserDocuments);

Router.route('/login')
  .post(users.loginUser);

export default Router;

import express from 'express';
import users from '../../controllers/users';
import {
  isAuthenticated,
  isUserOwn,
  isAdminOrUserOwn
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/')
  .get([isAuthenticated], users.viewUser)
  .post(users.createUser);

Router.route('/:id')
  .get([isAuthenticated], users.getUserById)
  .put([isAuthenticated, isUserOwn], users.updateUser)
  .delete([isAuthenticated, isAdminOrUserOwn], users.deleteUser);

Router.route('/:id/documents')
  .get([isAuthenticated], users.getUserDocuments);

Router.route('/login')
  .post(users.loginUser);

export default Router;

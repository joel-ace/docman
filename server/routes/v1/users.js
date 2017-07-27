import express from 'express';
import Users from '../../controllers/users';
import {
  isAuthenticated,
  isUserOwn,
  isAdminOrUserOwn
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/')
  .get([isAuthenticated], Users.viewUser)
  .post(Users.createUser);

Router.route('/:id')
  .get([isAuthenticated], Users.getUserById)
  .put([isAuthenticated, isUserOwn], Users.updateUser)
  .delete([isAuthenticated, isAdminOrUserOwn], Users.deleteUser);

Router.route('/:id/documents')
  .get([isAuthenticated], Users.getUserDocuments);

Router.route('/login')
  .post(Users.loginUser);

export default Router;

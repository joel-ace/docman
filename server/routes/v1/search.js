import express from 'express';
import search from '../../controllers/search';
import {
  isAuthenticated,
  isAdmin
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/users').get([isAuthenticated, isAdmin], search.searchUser);
Router.route('/documents').get([isAuthenticated, isAdmin], search.searchDocument);

export default Router;

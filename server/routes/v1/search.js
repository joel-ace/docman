import express from 'express';
import search from '../../controllers/search';
import {
  isAuthenticated,
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/users')
  .get([isAuthenticated], search.searchUser);
Router.route('/documents')
  .get([isAuthenticated], search.searchDocument);

export default Router;

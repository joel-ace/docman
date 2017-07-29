import express from 'express';
import Search from '../../controllers/search';
import {
  isAuthenticated,
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/users').get([isAuthenticated], Search.searchUser);
Router.route('/documents').get([isAuthenticated], Search.searchDocument);

export default Router;

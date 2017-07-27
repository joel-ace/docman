import express from 'express';
import Documents from '../../controllers/documents';
import {
  isAuthenticated,
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/')
  .post([isAuthenticated], Documents.createDocument)
  .get([isAuthenticated], Documents.viewDocument);

Router.route('/:id')
  .get([isAuthenticated], Documents.getDocumentById);

export default Router;

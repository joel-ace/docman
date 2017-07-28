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
  .get([isAuthenticated], Documents.getDocumentById)
  .put([isAuthenticated], Documents.updateDocument)
  .delete([isAuthenticated], Documents.deleteDocument);

export default Router;

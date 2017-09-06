import express from 'express';
import documents from '../../controllers/documents';
import {
  isAuthenticated,
} from '../../helpers/utils';

const Router = express.Router();

Router.route('/')
  .post([isAuthenticated], documents.createDocument)
  .get([isAuthenticated], documents.viewDocuments);

Router.route('/:id')
  .get([isAuthenticated], documents.getDocumentById)
  .put([isAuthenticated], documents.updateDocument)
  .delete([isAuthenticated], documents.deleteDocument);

export default Router;

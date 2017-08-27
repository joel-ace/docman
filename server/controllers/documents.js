import { Documents, Users } from '../models';
import {
  catchError,
  returnValidationErrors,
  isAllowedDocumentAccess,
  pagination,
  offsetAndLimitHandler,
} from '../helpers/utils';


/**
 * @description creates a document
 * @function createDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const createDocument = (req, res) => {
  req.checkBody('title', 'title cannot be empty').notEmpty();
  req.checkBody('content', 'content cannot be empty').notEmpty();
  req.checkBody('access', 'access cannot be empty').notEmpty();
  req.checkBody('access', 'public, private and role are the only allowed access types')
    .isIn(['public', 'private', 'role']);

  returnValidationErrors(req, res);

  Documents.create({
    title: req.body.title,
    content: req.body.content,
    access: req.body.access,
    userId: req.decoded.userId,
  })
  .then(
    document => res.status(201).send({
      document,
    })
  )
  .catch(() => catchError(res));
};

/**
 * @description view all documents
 * @function viewDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const viewDocument = (req, res) => {
  const offsetAndLimitObject = offsetAndLimitHandler(req);
  returnValidationErrors(req, res);

  Documents.findAndCount({
    offset: offsetAndLimitObject.offset,
    limit: offsetAndLimitObject.limit,
    attributes: { exclude: ['content'] },
  })
  .then((documents) => {
    if (documents.rows.length < 1) {
      return res.status(404).send({
        message: 'No document found',
      });
    }

    return res.status(200).send({
      pagination: pagination(
        offsetAndLimitObject.limit,
        offsetAndLimitObject.offset,
        documents.count
      ),
      documents: documents.rows,
    });
  })
  .catch(() => catchError(res));
};

/**
 * @description view a document using its id
 * @function getDocumentById
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const getDocumentById = (req, res) => {
  req.checkParams('id', 'No document id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as document id').isInt();

  returnValidationErrors(req, res);

  Documents.findOne({
    where: { documentId: req.params.id },
    include: [
      {
        model: Users,
        required: true,
        attributes: ['userId', 'fullName', 'roleId'],
      }
    ],
  })
  .then((returnedDocument) => {
    const document = returnedDocument.get({ plain: true });
    if (!document) {
      return res.status(404).send({
        message: 'This document does not exist or has been previously deleted',
      });
    }
    if (isAllowedDocumentAccess(document, req)) {
      const { User, ...documentObjectWithoutUserDetails } = document;
      return res.status(200).send({
        document: documentObjectWithoutUserDetails,
      });
    }
    return res.status(403).send({
      message: 'You are not allowed to view this document',
    });
  })
  .catch(() => catchError(res));
};

/**
 * @description updates a document
 * @function updateDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const updateDocument = (req, res) => {
  req.checkParams('id', 'No document id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as document id').isInt();
  req.checkBody('title', 'title cannot be empty').notEmpty();
  req.checkBody('content', 'content cannot be empty').notEmpty();
  req.checkBody('access', 'access cannot be empty').notEmpty();
  req.checkBody('access', 'public, private and role are the only allowed access types')
    .isIn(['public', 'private', 'role']);

  returnValidationErrors(req, res);

  Documents.findOne({
    where: { documentId: req.params.id },
  })
  .then((document) => {
    if (!document) {
      return res.status(404).send({
        message: 'This document does not exist or has been previously deleted',
      });
    }
    /** allow updating if the decoded userId is same with the userId on the document */
    if (req.decoded.userId === document.userId) {
      return document.update({
        title: req.body.title || document.title,
        content: req.body.content || document.content,
        access: req.body.access || document.access,
      });
    }
    return res.status(403).send({
      message: 'Only the document owner can update a document',
    });
  })
  .then(updatedDocument => res.status(200).send({
    document: updatedDocument,
  }))
  .catch(() => catchError(res));
};

/**
 * @description deletes a document
 * @function deleteDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const deleteDocument = (req, res) => {
  req.checkParams('id', 'No document id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as document id').isInt();

  returnValidationErrors(req, res);

  Documents.findOne({
    where: { documentId: req.params.id },
  })
  .then((document) => {
    if (!document) {
      return res.status(404).send({
        message: 'This document does not exist or has been previously deleted',
      });
    }

    /** allow deleting if the user is the document owner or the admin */
    if (req.decoded.userId === document.userId || req.decoded.role === 1) {
      return document.destroy();
    }
    return res.status(403).send({
      message: 'Only the document owner or admin can delete a document',
    });
  })
  .then(() => res.status(200).send({
    message: 'Document successfully deleted',
  }))
  .catch(() => catchError(res));
};

export default {
  createDocument,
  viewDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
};

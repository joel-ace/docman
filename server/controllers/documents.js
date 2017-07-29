import { Users, Documents } from '../models';
import {
  catchError,
  returnValidationErrors,
} from '../helpers/utils';


/**
 * @description creates a document
 * @function createDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const createDocument = (req, res) => {
  req.checkBody('title', 'fullname cannot be empty').notEmpty();
  req.checkBody('content', 'content cannot be empty').notEmpty();
  req.checkBody('access', 'access cannot be empty').notEmpty();
  req.checkBody('access', 'public, private and role are the only allowed acces types')
    .isIn(['public', 'private', 'role']);
  req.checkBody('access', 'only letters of the alphabets are allowed as access').isAlpha();

  returnValidationErrors(req, res);

  Documents.create({
    title: req.body.title,
    content: req.body.content,
    access: req.body.access,
    userId: req.decoded.userId,
  })
  .then(
    document => res.status(201).send({
      status: 'ok',
      document,
      message: 'document was successfully created',
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
  let offset = 0, limit = 20;
  if (req.query.limit || req.query.offset) {
    req.checkQuery('limit', 'Limit must be an integer').isInt();
    req.checkQuery('offset', 'Offset must be an integer').isInt();

    returnValidationErrors(req, res);

    /** convert limit and offset to number in base 10 */
    limit = parseInt(req.query.limit, 10);
    offset = parseInt(req.query.offset, 10);
  }

  Documents.findAll({
    include: [
      {
        model: Users,
        required: true,
        attributes: ['userId', 'fullname'],
      }
    ],
    offset,
    limit,
    attributes: { exclude: ['content', 'userId'] },
  })
  .then((documents) => {
    if (documents.length < 1) {
      return res.status(200).send({
        status: 'ok',
        message: 'No document found',
      });
    }

    return res.status(200).send({
      status: 'ok',
      documents,
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
    attributes: { exclude: ['userId'] },
    include: [
      {
        model: Users,
        required: true,
        attributes: ['userId', 'fullname', 'roleId'],
        plain: true,
      }
    ],
  })
  .then((document) => {
    if (!document) {
      return res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted',
      });
    }

    if (
      document.access === 'public' ||
      req.decoded.role === 1 ||
      document.User.userId === req.decoded.userId ||
      (document.access === 'role' && document.User.roleId === req.decoded.role)
    ) {
      return res.status(200).send({
        status: 'ok',
        document,
      });
    }

    return res.status(401).send({
      status: 'error',
      message: 'You are not authorized to view this document',
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

  returnValidationErrors(req, res);

  Documents.findOne({
    where: { documentId: req.params.id },
  })
  .then((document) => {
    if (!document) {
      return res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted',
      });
    }

    /** allow updating if the decoded userId is same with the userId on the document */
    if (req.decoded.userId === document.userId) {
      document.update({
        title: req.body.title || document.title,
        content: req.body.content || document.content,
        access: req.body.access || document.access,
      })
      .then(updatedDocument => res.status(200).send({
        status: 'ok',
        document: updatedDocument,
      }))
      .catch(() => catchError(res));
    } else {
      return res.status(401).send({
        status: 'error',
        message: 'Only the document owner can update a document',
      });
    }
  })
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
        status: 'error',
        message: 'This document does not exist or has been previously deleted',
      });
    }

    /** allow deleting if the its the user is the document owner on the admin */
    if (req.decoded.userId === document.userId || req.decoded.role === 1) {
      document.destroy()
      .then(() => res.status(200).send({
        status: 'ok',
        message: 'Document successfully deleted',
      }))
      .catch(() => catchError(res));
    } else {
      return res.status(401).send({
        status: 'error',
        message: 'Only the document owner or admin can delete a document',
      });
    }
  })
  .catch(() => catchError(res));
};


export default {
  createDocument,
  viewDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
};

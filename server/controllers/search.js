import { Users, Documents } from '../models';
import {
  returnValidationErrors,
  catchError,
  pagination,
  offsetAndLimitHandler
} from '../helpers/utils';

/**
 * @description searches for a user
 * @function searchUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const searchUser = (req, res) => {
  const offsetAndLimitObject = offsetAndLimitHandler(req);
  req.checkQuery('q', 'an email or name is required').notEmpty();
  returnValidationErrors(req, res);

  Users.findAndCount({
    offset: offsetAndLimitObject.offset,
    limit: offsetAndLimitObject.limit,
    where: {
      $or: [
        {
          email: { $iLike: `%${req.query.q}%` }
        },
        {
          fullName: { $iLike: `%${req.query.q}%` }
        }
      ]
    },
    attributes: { exclude: ['password', 'updatedAt'] },
  })
  .then((users) => {
    if (users.length === 0) {
      return res.status(404).send({
        message: 'no user found for your search query',
      });
    }
    return res.status(200).send({
      pagination: pagination(
        offsetAndLimitObject.limit,
        offsetAndLimitObject.offset,
        users.count
      ),
      users: users.rows,
    });
  })
  .catch(() => catchError(res));
};

/**
 * @description searches for a document using title
 * @function searchUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const searchDocument = (req, res) => {
  const offsetAndLimitObject = offsetAndLimitHandler(req);
  req.checkQuery('q', 'a document title is required').notEmpty();

  returnValidationErrors(req, res);

  Documents.findAndCount({
    offset: offsetAndLimitObject.offset,
    limit: offsetAndLimitObject.limit,
    where: {
      title: {
        $iLike: `%${req.query.q}%`,
      }
    },
    attributes: { exclude: ['content', 'userId'] },
  })
  .then((documents) => {
    if (documents.rows.length === 0) {
      return res.status(404).send({
        message: 'No documents found for your search query',
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

export default {
  searchDocument,
  searchUser,
};

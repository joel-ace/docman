import { Users, Roles, Documents } from '../models';
import { returnValidationErrors, catchError } from '../helpers/utils';

/**
 * @description searches for a user
 * @function searchUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const searchUser = (req, res) => {
  req.checkQuery('q', 'an email or name is required').notEmpty();
  returnValidationErrors(req, res);

  Users.findAll({
    where: {
      $or: [
        {
          email: { $iLike: `%${req.query.q}%` }
        },
        {
          fullname: { $iLike: `%${req.query.q}%` }
        }
      ]
    },
    include: [
      {
        model: Roles,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    ],
    attributes: { exclude: ['password', 'updatedAt'] },
  })
  .then((users) => {
    if (users.length === 0) {
      return res.status(200).send({
        message: 'no user found for your search query',
      });
    }
    return res.status(200).send({
      users,
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
  req.checkQuery('q', 'a document title is required').notEmpty();

  returnValidationErrors(req, res);

  Documents.findAll({
    where: {
      title: {
        $iLike: `%${req.query.q}%`,
      }
    },
    include: [
      {
        model: Users,
        attributes: ['fullname', 'userId'],
      }
    ],
    attributes: { exclude: ['content', 'userId'] },
  })
  .then((documents) => {
    if (documents.length === 0) {
      return res.status(200).send({
        message: 'No documents found for your search query',
      });
    }
    return res.status(200).send({
      documents,
    });
  })
  .catch(() => catchError(res));
};

export default {
  searchDocument,
  searchUser,
};

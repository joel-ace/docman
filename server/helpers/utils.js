import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Users } from '../models';

/**
 * @description hash user password using bcrypt
 * @function passwordHash
 * @param {string} password user supplied password
 * @returns {string} hashed user password
 */
export const passwordHash = password => bcrypt.hashSync(password, 10);

/**
 * @description authenticates user by comparing passwords
 * @function authenticateUser
 * @param {string} userPassword user supplied password
 * @param {object} userObject user object
 * @returns {string} jwt token
 */
export const authenticateUser = (userPassword, userObject) => {
  if (bcrypt.compareSync(userPassword, userObject.password)) {
    const token = jwt.sign({
      userId: userObject.userId,
      role: userObject.roleId,
    }, process.env.JWT_SECRET,
    { expiresIn: 60 * 60 * 24 }
    );
    return token;
  }
  return false;
};

/**
 * @description authenticates user by comparing passwords
 * @function isAuthenticated
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization || req.header['x-access-token'];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        res.status(401).send({
          status: 'error',
          message: 'You are not authorized to access this resource',
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(400).send({
      status: 'error',
      message: 'Invalid request. You need a valid token to be authenticated',
    });
  }
};

/**
 * @description checks if user role is admin
 * @function isAdmin
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAdmin = (req, res, next) => {
  if (req.decoded.role === 1) {
    next();
  } else {
    res.status(401).send({
      status: 'error',
      message: 'Only admins are authorized to access this resource',
    });
  }
};

/**
 * @description checks if resource belongs to owner
 * @function isUserOwn
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isUserOwn = (req, res, next) => {
  if (req.decoded.userId === parseInt(req.params.id, 10)) {
    next();
  } else {
    res.status(401).send({
      status: 'error',
      message: 'Only the owner can access this resource',
    });
  }
};

/**
 * @description checks if user is an admin or is the owner of resource
 * @function isAdminOrUserOwn
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAdminOrUserOwn = (req, res, next) => {
  if (req.decoded.userId === parseInt(req.params.id, 10) || req.decoded.role === 1) {
    next();
  } else {
    res.status(401).send({
      status: 'error',
      message: 'Only the owner or an admin can access this resource',
    });
  }
};

export const isSameRole = (req, res, next) => {
  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (user) {
      if (req.decoded.role === user.roleId) {
        return next();
      }
    }

    return res.status(401).send({
      status: 'error',
      message: 'Only the owner can access this resource',
    });
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};

export const returnValidationErrors = (req, res) => {
  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }
};

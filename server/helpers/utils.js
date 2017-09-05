import jsonwebtoken from 'jsonwebtoken';
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
 * @description hash user password using bcrypt
 * @function isRegisteredUser
 * @param {int} userIdentifier attribute to identify user
 * @param {string} type field we are using to query
 * @returns {boolean} boolean of registered user status
 */
export const isRegisteredUser = (userIdentifier, type = 'id') => {
  const queryWhere = (type === 'id')
    ? { userId: userIdentifier }
    : { email: userIdentifier };
  return Users.findOne({
    where: queryWhere,
    plain: true,
  })
  .then((returnedUser) => {
    const user = returnedUser.get({ plain: true });
    if (user) {
      return user;
    }
    return false;
  })
  .catch(() => false);
};

/**
 * @description signs and generates a JWT
 * @function generateToken
 * @param {int} userId user Id
 * @param {int} roleId user role id
 * @returns {string} JWT string
 */
export const generateToken = (userId, roleId) => jsonwebtoken.sign(
  {
    userId,
    role: roleId,
  }, process.env.JWT_SECRET,
  { expiresIn: 60 * 60 * 24 }
);

/**
 * @description checks if user supplied password is same as password in database
 * @function verifyPassword
 * @param {string} suppliedPassword user supplied password
 * @param {object} databasePassword password in database
 * @returns {bolean} password verification state
 */
export const verifyPassword = (suppliedPassword, databasePassword) => {
  if (bcrypt.compareSync(suppliedPassword, databasePassword)) {
    return true;
  }
  return false;
};

/**
 * @description authenticates user by comparing passwords
 * @function authenticateUser
 * @param {string} userPassword user supplied password
 * @param {object} userObject user object
 * @returns {string} jwt token
 */
export const authenticateUser = (userPassword, userObject) => {
  if (verifyPassword(userPassword, userObject.password)) {
    const token = generateToken(userObject.userId, userObject.roleId);
    return token;
  }
  return false;
};

/**
 * @description returns validation errors
 * @function returnValidationErrors
 * @param {string} req request object
 * @param {object} res response object
 * @returns {object} response containing validation errors
 */
export const returnValidationErrors = (req, res) => {
  const errors = req.validationErrors();

  if (errors) {
    const errorObject = errors.map(error => error.msg);
    if (errorObject.length === 1) {
      return res.status(400).send({
        errors: errorObject[0],
      });
    }
    return res.status(400).send({
      errors: errorObject,
    });
  }
};

/**
 * @description returns .catch error message
 * @function catchError
 * @param {object} res response object
 * @returns {object} response containing error message
 */
export const catchError = res => res.status(500).send({
  message: 'We encountered an error. Please try again later',
});

/**
 * @description middleware that authenticates user by comparing passwords
 * @function isAuthenticated
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization || req.header['x-access-token'];
  if (token) {
    /** verify if token sent is a valid token */
    jsonwebtoken.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        res.status(401).send({
          message: 'You are not authorized to access this resource',
        });
      } else {
        /** check if the decoded userId exists in the user database */
        isRegisteredUser(decoded.userId)
        .then((registeredUser) => {
          if (registeredUser) {
            req.decoded = decoded;
            return next();
          }
          return res.status(401).send({
            message: 'user making this request cannot be authenticated',
          });
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'Invalid request. You need a valid token to be authenticated',
    });
  }
};

/**
 * @description handles limit and offset for pagination
 * @function offsetAndLimitHandler
 * @param {string} req request object
 * @returns {object} limit and offset
 */
export const offsetAndLimitHandler = (req) => {
  let offset = 0;
  let limit = 20;
  if (req.query.limit) {
    req.checkQuery(
      'limit',
      'Limit must be an integer and greater than 0'
    ).isInt({ gt: 0 });
    limit = parseInt(req.query.limit, 10);
  }
  if (req.query.offset) {
    req.checkQuery(
      'offset',
      'Offset must be an integer greater or equal to 0'
    ).isInt({ gt: -1 });
    offset = parseInt(req.query.offset, 10);
  }
  return { limit, offset };
};

/**
 * @description middleware that checks if resource belongs to owner
 * @function isUserOwn
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isUserOwn = (req, res, next) => {
  isRegisteredUser(req.params.id)
  .then((validUser) => {
    if (!validUser) {
      return res.status(404).send({
        message: 'user does not exist or has been previously deleted',
      });
    }
    if (req.decoded.userId === parseInt(req.params.id, 10)) {
      return next();
    }
    return res.status(403).send({
      message: 'Only the owner can access this resource',
    });
  });
};

/**
 * @description middleware that checks if user role is admin
 * @function isAdmin
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAdmin = (req, res, next) => {
  if (req.decoded.role === 1) {
    return next();
  }
  res.status(403).send({
    message: 'Only admins are allowed to access this resource',
  });
};

/**
 * @description middleware that checks if user is admin or owner of resource
 * @function isAdminOrUserOwn
 * @param {string} req request object
 * @param {object} res response object
 * @param {callback} next callback for next matching route
 * @returns {void}
 */
export const isAdminOrUserOwn = (req, res, next) => {
  isRegisteredUser(req.params.id)
  .then((validUser) => {
    if (!validUser) {
      return res.status(404).send({
        message: 'user does not exist or has been previously deleted',
      });
    }
    if (
      req.decoded.userId === parseInt(req.params.id, 10)
      || req.decoded.role === 1
    ) {
      return next();
    }
    return res.status(403).send({
      message: 'Only the owner or an admin can access this resource',
    });
  });
};

/**
 * @description checks if user can access a document
 * @function isAllowedDocumentAccess
 * @param {object} document document object
 * @param {object} req request object
 * @returns {boolean} true if user has access, false if not
 */
export const isAllowedDocumentAccess = (document, req) => {
  if (
    document.access === 'public' ||
    req.decoded.role === 1 ||
    document.User.userId === req.decoded.userId ||
    (document.access === 'role' && document.User.roleId === req.decoded.role)
  ) {
    return true;
  }
  return false;
};

/**
 * @description creates a pagination object
 * @function pagination
 * @param {object} limit the query limit
 * @param {object} offset offset
 * @param {object} count query count
 * @returns {object} pagination object
 */
export const pagination = (limit, offset, count) => {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(count / limit);
  const pageSize = (count - offset) > limit ? limit : (count - offset);
  return {
    page,
    pageCount,
    pageSize,
    totalCount: count,
  };
};

export const handleEmptyQueryResult = (
  queryResult,
  res,
  statusCode,
message) => {
  if (!queryResult || queryResult.length === 0) {
    return res.status(statusCode).send({
      message,
    });
  }
};

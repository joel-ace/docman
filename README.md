[![Code Climate](https://codeclimate.com/github/joel-ace/docman/badges/gpa.svg)](https://codeclimate.com/github/joel-ace/docman)
[![Coverage Status](https://coveralls.io/repos/github/joel-ace/docman/badge.svg?branch=staging)](https://coveralls.io/github/joel-ace/docman?branch=staging)
[![Build Status](https://travis-ci.org/joel-ace/docman.svg?branch=staging)](https://travis-ci.org/joel-ace/docman)

## DocMan
DocMan is a Document Management System built using JavaScript. DocMan is a RESTful API for creating and managing documents based on user roles. DocMan gives you the flexibility of choosing what documents you want to be private and available to you only or accessible by other members in the same user role you belong to. 

## API Documentation
The API has routes, each dedicated to a single task that uses HTTP response codes to indicate API status and errors. View full API documentation [here](https://joel-docman.herokuapp.com/)

#### API Features
The following features make up the DocMan's API:

###### Authentication
- It uses JSON Web Token (JWT) for authentication
- It generates a token on successful login and returns it to the user
- It verifies the token to ensure a user is authenticated to access protected endpoints

###### Users
- It allows users to be created  
- It allows users to login and obtain a unique token which is valid for 24hours
- It allows authenticated users to retrieve and update their information 
- It allows users to retrieve documents based on userId
- It allows the admin to manage users

###### Documents
- It allows creation of new documents by authenticated users 
- It ensures all documents are accessible based on access priviledges 
- It allows admin users to create, retrieve, and delete documents
- It ensures users can retrieve, edit and delete documents that they own
- It allows users to retrieve all public documents
- It allows users on the same role to retrieve role-based documents

###### Search
- It allows admin to retrieve all documents that matches search string
- It allows admin to search users based on a specified search term
- It allows users to search public documents for a specified search term
- It allows users to search for users through name or email address
- It allows users on the same role to search through role-based documents 

## Technologies Used
- **[JavaScript ES6](http://es6-features.org/)** - Codes were written in javascript ES6.
- **[NodeJS](https://nodejs.org/)** - Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.
- **[ExpressJS](https://expressjs.com/)** - Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. I used this framework for routing.
- **[PostgreSQL](https://www.postgresql.org/)** - Postgres is an object-relational database management system (ORDBMS) with an emphasis on extensibility and standards compliance.
- **[Sequelize](http://docs.sequelizejs.com/)** - Sequelize is a promise-based ORM for Node.js which supports the dialects of PostgreSQL and features solid transaction support, relations, read replication and more.

### **Installation Steps**
* Ensure you have `node` installed or install [Node](https://nodejs.org/en/download/)
* Clone the project repository from your terminal `git clone https://github.com/joel-ace/docman.git`
* Change directory `cd docman` into docman directory
* Run `npm install` to install the dependencies in the `package.json` file
* Set your environment variables as described in the `.env.sample` file in DocMan root directory
* Run `npm start` to start the project
* Run `npm test` to run integration tests
* Use [Postman](https://www.getpostman.com/) or any tool of your choice to access the endpoints

### **Endpoints**
**N/B:** For all endpoints that require authentication, use \
`Authorization: <token>`

#### Limitations:
The limitations of **DocMan** are as follows:
* Users can only create plain textual documents and retrieve same when needed 
* Users cannot share documents but can make document `public` for other users to view, or set document access type to `role` so only users in the same role can view their documents
* Users login and obtain a token which is verified on every request, but users cannot logout (nullify the token), however tokens become invalid when it expires (24 hours)
* There is no endpoint to create, update or delete user roles

### How to Contribute
Contributors are welcome to further enhance the features of this API by contributing to its development. The following guidelines should guide you in contributing to this project:

1. Fork the repository.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request describing the feature(s) you have added

Ensure your codes follow the [AirBnB Javascript Styles Guide](https://github.com/airbnb/javascript)

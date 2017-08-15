import chai from 'chai';
import chaiHTTP from 'chai-http';
import app from '../../../app';
import { Users, Roles, Documents } from '../../models';
import { passwordHash } from '../../helpers/utils';

const expect = chai.expect;
chai.use(chaiHTTP);

let adminToken;
let secondUserToken;

describe('Documents', () => {
  before((done) => {
    Users.sync({ force: true })
    .then(() => Roles.bulkCreate(
      [
        {
          roleId: 1,
          name: 'Admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleId: 2,
          name: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]
    ))
    .then(() => Users.create(
      {
        fullname: 'Admin Account',
        password: passwordHash('qwerty'),
        email: 'admin@docman.com',
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ))
    .then(() => Documents.bulkCreate(
      [
        {
          title: 'Admin document',
          content: 'This is content for admin document',
          access: 'public',
          userId: '1',
        },
        {
          title: 'User document',
          content: 'This is content for user document',
          access: 'public',
          userId: '2',
        },
      ]
    ))
    .then(() => {
      chai.request(app)
          .post('/api/v1/users/login')
          .send({
            password: 'qwerty',
            email: 'admin@docman.com',
          })
          .end((err, res) => {
            adminToken = res.body.accessToken;
          });
      chai.request(app)
          .post('/api/v1/users')
          .send({
            password: 'password',
            email: 'ola@haruna.com',
            fullname: 'Olalekan Haruna',
          })
          .end((err, res) => {
            secondUserToken = res.body.accessToken;
          });
      done();
    });
  });

  describe('route accessed without authentication', () => {
    it('should get a status code of 404', (done) => {
      chai.request(app)
        .get('/api/v1/documents')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.equal('Invalid request. You need a valid token to be authenticated');
          done();
        });
    });
  });
  describe('/POST requests', () => {
    it('should return a status code of 201 if successful', (done) => {
      chai.request(app)
        .post('/api/v1/documents')
        .set({ Authorization: adminToken })
        .send(
        {
          title: 'Added new document',
          content: 'Content from the newly added document during testing',
          access: 'public',
        }
        )
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.document.documentId).to.equal(3);
          expect(res.body.document.title).to.equal('Added new document');
          expect(res.body.document.content).to.equal('Content from the newly added document during testing');
          expect(res.body.document.access).to.equal('public');
          done();
        });
    });
    it('should return a status code of 400 if access is neither of public, role or private', (done) => {
      chai.request(app)
        .post('/api/v1/documents')
        .set({ Authorization: adminToken })
        .send(
        {
          title: 'Wrong access',
          content: 'Document with wrong access',
          access: 'something',
        }
        )
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors[0]).to.equal('public, private and role are the only allowed access types');
          done();
        });
    });
  });
  describe('/GET requests', () => {
    it('should get a status code of 200 if successful', (done) => {
      chai.request(app)
        .get('/api/v1/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should receive an array of document objects', (done) => {
      chai.request(app)
        .get('/api/v1/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body.documents));
          expect(res.body.pagination.pageSize).to.equal(3);
          expect(res.body.documents[0].title).to.equal('Admin document');
          expect(res.body.documents[0].access).to.equal('public');
          expect(res.body.documents[2].title).to.equal('Added new document');
          expect(res.body.documents[2].access).to.equal('public');
          done();
        });
    });
    it('should get and paginate all documents when limit and offset are supplied', (done) => {
      chai.request(app)
        .get('/api/v1/documents/?limit=2&offset=0')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.body).to.have.keys(['documents', 'pagination']);
          expect(res.body.documents.length).to.equal(2);
          expect(res.body.pagination.pageSize).to.equal(2);
          expect(res.body.documents[0].title).to.equal('Admin document');
          expect(res.body.documents[0].access).to.equal('public');
          expect(res.body.documents[1].title).to.equal('User document');
          expect(res.body.documents[1].access).to.equal('public');
          done();
        });
    });
  });
  describe('requested for using user id', () => {
    it('should get a status code of 404 if document does not exist', (done) => {
      chai.request(app)
        .get('/api/v1/documents/5')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This document does not exist or has been previously deleted');
          done();
        });
    });
    it('should receive a status of 200 and document object', (done) => {
      chai.request(app)
        .get('/api/v1/documents/1')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.document).to.be.an('object');
          expect(res.body.document.title).to.equal('Admin document');
          expect(res.body.document.content).to.equal('This is content for admin document');
          done();
        });
    });
  });
  describe('search', () => {
    it('should return a status code of 200 if search query matches document title', (done) => {
      chai.request(app)
        .get('/api/v1/search/documents?q=document')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.documents[0].title).to.equal('Admin document');
          expect(res.body.documents[0].access).to.equal('public');
          expect(res.body.documents[2].title).to.equal('Added new document');
          expect(res.body.documents[2].access).to.equal('public');
          done();
        });
    });
    it('should receive a status of 200 and message if no user was found', (done) => {
      chai.request(app)
        .get('/api/v1/search/documents?q=unnamedDoc')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('No documents found for your search query');
          done();
        });
    });
  });
  describe('update request', () => {
    before((done) => {
      chai.request(app)
          .post('/api/v1/users/login')
          .send({
            password: 'password',
            email: 'ola@haruna.com',
          })
          .end((err, res) => {
            secondUserToken = res.body.accessToken;
            done();
          });
    });
    it('should return a status code of 403 if user requesting to update details is not account owner', (done) => {
      chai.request(app)
        .put('/api/v1/documents/1')
        .set({ Authorization: secondUserToken })
        .send({
          title: 'tsljalkja',
          content: 'his is DocMan User Second article',
          access: 'public',
        })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Only the document owner can update a document');
          done();
        });
    });
    it('should return a status of 200 if document is successfully updated', (done) => {
      chai.request(app)
        .put('/api/v1/documents/1')
        .send({
          title: 'A new title',
          content: 'This is the new content',
          access: 'role',
        })
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.document.documentId).to.equal(1);
          expect(res.body.document.content).to.equal('This is the new content');
          expect(res.body.document.access).to.equal('role');
          expect(res.body.document.title).to.equal('A new title');
          done();
        });
    });
    it('should return a status of 404 if document to be updated does not exist', (done) => {
      chai.request(app)
        .put('/api/v1/documents/10')
        .send({
          title: 'A new title',
          content: 'this is the new content',
          access: 'role',
        })
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This document does not exist or has been previously deleted');
          done();
        });
    });
  });
  describe('delete request', () => {
    it('should return a status code of 403 if user is not admin or document owner', (done) => {
      chai.request(app)
        .delete('/api/v1/documents/3')
        .set({ Authorization: secondUserToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Only the document owner or admin can delete a document');
          done();
        });
    });
    it('should return a status of 200 if document is successfully deleted', (done) => {
      chai.request(app)
        .delete('/api/v1/documents/3')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Document successfully deleted');
          done();
        });
    });
    it('should return a status of 404 if document does not exist in database', (done) => {
      chai.request(app)
        .delete('/api/v1/documents/7')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This document does not exist or has been previously deleted');
          done();
        });
    });
  });
});

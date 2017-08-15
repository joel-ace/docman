import chai from 'chai';
import chaiHTTP from 'chai-http';
import app from '../../../app';

const expect = chai.expect;
chai.use(chaiHTTP);

describe('Undeclared Route', () => {
  it('should return an error message and status code of 404', (done) => {
    chai.request(app)
      .get('/api/v1/noendpoint')
      .end((err, res) => {
        expect(res.status).to.equal(404);
        expect(res.body).to.have.keys(['message']);
        expect(res.body.message).to.equal('this resource does not exist or has been previously deleted');
        done();
      });
  });
});

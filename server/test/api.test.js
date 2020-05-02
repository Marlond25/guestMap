const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏'
      }, done);
  });
});

describe('POST /api/v1/messages', () => {
  it('responds with a json message', (done) => {
    const requestObj = {
      name: 'Marlon',
      message: 'Glad im make in it true',
      latitude: -85,
      longitude: 142
    };
    const responseObj = {
      ...requestObj,
      _id: '5eacc19b5bf1043e28140b00',
      date: '2020-05-02T00:40:59.490Z'
    };
    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body._id = '5eacc19b5bf1043e28140b00';
        res.body.date = '2020-05-02T00:40:59.490Z';
      })
      .expect(200, responseObj, done);
    /* .then((response) => {
        console.log(response);
        done();
      }); */
  });
  it(('can signup with a name containing diacritics'), (done) => {
    const requestObj = {
      name: 'Ÿööhöö!',
      message: 'Glad im make in it true',
      latitude: -85,
      longitude: 142
    };
    const responseObj = {
      ...requestObj,
      _id: '5eacc19b5bf1043e28140b00',
      date: '2020-05-02T00:40:59.490Z'
    };
    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect((res) => {
        res.body._id = '5eacc19b5bf1043e28140b00';
        res.body.date = '2020-05-02T00:40:59.490Z';
      })
      .expect(200, responseObj, done);
  });
});

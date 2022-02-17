import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@HasPermission decorator', () => {
  after(() => {
    server.close()
  })

  it('should return a 204 if a @HasPermission is met', (done: Function) => {    
    chai
      .request(server)
      .get('/secrets?scope=get')
      .end((err, res) => {
        expect(res).to.have.status(204)
        done()
      })
  })

  it('should return a 403 if a @HasPermission is not met', (done: Function) => {    
    chai
      .request(server)
      .get('/secrets?scope=none')
      .end((err, res) => {
        expect(res).to.have.status(403)
        done()
      })
  })

  it('should be able to access Koa context in an @HasPermission policy', (done: Function) => {    
    chai
      .request(server)
      .post('/secrets')
      .set('key', 'abc123')
      .end((err, res) => {
        expect(res).to.have.status(204)
        done()
      })
  })

  it('should merge in data from PolicyDenials and use the correct status code', (done: Function) => {    
    chai
      .request(server)
      .put('/secrets/1')
      .end((err, res) => {
        expect(res).to.have.status(405)
        expect(res.text).to.equal('Method not implemented yet. Come back later')
        done()
      })
  })
})

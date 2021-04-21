import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@HasPermission hook', () => {
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
      .send({ key: 'abc123' })
      .end((err, res) => {
        expect(res).to.have.status(204)
        done()
      })
  })
})

import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('Implicit routes', () => {
  after(() => {
    server.close()
  })

  it('should handle an implicit POST route', (done: Function) => {
    chai
      .request(server)
      .post('/users')
      .type('json')
      .send(JSON.stringify({ name: 'Bob' }))
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
  })

  it('should handle an implicit index GET route', (done: Function) => {
    chai
      .request(server)
      .get('/users')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('users').with.lengthOf(1)
        done()
      })
  })

  it('should handle an implicit single GET route', (done: Function) => {
    chai
      .request(server)
      .get('/users/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('user')
        done()
      })
  })
})

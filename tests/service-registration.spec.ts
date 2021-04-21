import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('Service registration', () => {
  after(() => {
    server.close()
  })

  it('should correctly register services', (done: Function) => {
    chai
    .request(server)
    .get('/meta')
    .end((err, res) => {
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('services').with.keys(['users', 'comments', 'albums', 'meta'])
      done()
    })
  })
})


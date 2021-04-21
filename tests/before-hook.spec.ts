import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@Before hook', () => {
  after(() => {
    server.close()
  })

  it('should handle the @Before timestamps hook on POST', (done: Function) => {    
    chai
      .request(server)
      .post('/users')
      .type('json')
      .send(JSON.stringify({ name: 'Bob' }))
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('user').with.property('name', 'Bob')
        expect(res.body).to.have.property('user').with.property('createdAt')
        done()
      })
  })
})

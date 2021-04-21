import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@After hook', () => {
  after(() => {
    server.close()
  })

  it('should handle the @After metadata hook on GET', (done: Function) => {    
    chai
      .request(server)
      .get('/users/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('metadata').with.property('timestamp')
        done()
      })
  })

  it('should not modify the response if @After has no return value', (done: Function) => {    
    chai
      .request(server)
      .get('/comments')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.not.have.property('metadata')
        done()
      })
  })
})

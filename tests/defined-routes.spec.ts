import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('Defined routes', () => {
  after(() => {
    server.close()
  })

  it('should handle a defined POST route', (done: Function) => {
    chai
      .request(server)
      .post('/comments')
      .type('json')
      .send(JSON.stringify({ title: 'Hello world', text: 'This is my comment' }))
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('comment')
        done()
      })
  })
  
  it('should handle a defined GET route', (done: Function) => {
    chai
      .request(server)
      .get('/comments')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('comments')
        done()
      })
  })

  it('should use the correct default path for the method if no path is specified', (done: Function) => {
    chai
      .request(server)
      .delete('/comments/123')
      .end((err, res) => {
        expect(res).to.not.have.status(404)
        done()
      })
  })

  it('should not handle an undefined route method', (done: Function) => {
    chai
      .request(server)
      .patch('/comments/123')
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
  })
})

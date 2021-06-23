import chai from 'chai'
import http from 'chai-http'
import server from './fixtures/index'
const expect = chai.expect

chai.use(http)

describe('@Validate hook', () => {
  after(() => {
    server.close()
  })

  it('should handle an @Validate schema with a missing body key', (done: Function) => {    
    chai
      .request(server)
      .post('/users')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Needs a name')
        done()
      })
  })

  it('should handle an @Validate schema with a missing query param', (done: Function) => {    
    chai
      .request(server)
      .get('/albums')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Count not specified')
        done()
      })
  })

  it('should handle an @Validate schema provided with an array of keys', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/title')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Missing query key: id')
        done()
      })
  })

  it('should handle an @Validate schema provided with a boolean', (done: Function) => {    
    chai
      .request(server)
      .get('/search')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Missing query key: search')
        done()
      })
  })

  it('should handle an @Validate schema provided with a string', (done: Function) => {    
    chai
      .request(server)
      .get('/search?search=text')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Bad start date')
        done()
      })
  })

  it('should handle an @Validate schema provided with a function that throws an error', (done: Function) => {    
    chai
      .request(server)
      .get('/search?search=text&startDate=213123&endDate=null')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Bad end date')
        done()
      })
  })

  it('should handle an @Validate schema provided with a function that returns a boolean', (done: Function) => {    
    chai
      .request(server)
      .get('/search?search=text&startDate=213123&endDate=3123123123&itemsPerPage=abc123')
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Missing query key: itemsPerPage')
        done()
      })
  })

  it('should handle an @Validate schema provided with all the validatable types', (done: Function) => {    
    chai
      .request(server)
      .get(`/search?search=text&startDate=213123&endDate=3123123123&itemsPerPage=30`)
      .end((err, res) => {
        expect(res).to.have.status(204)
        done()
      })
  })
})

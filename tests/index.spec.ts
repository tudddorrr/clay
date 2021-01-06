import chai from 'chai'
import http from 'chai-http'
import server from './index'
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

describe('Request parsing', () => {
  after(() => {
    server.close()
  })

  it('should correctly parse query strings', (done: Function) => {
    chai
    .request(server)
    .get('/albums?count=2')
    .end((err, res) => {
      expect(res).to.have.status(200)
      expect(res.body).to.have.property('albums').with.lengthOf(2)
      done()
    })
  })

  it('should correctly parse a route param', (done: Function) => {
    chai
      .request(server)
      .get('/albums/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('album').with.property('title', 'McCartney II')
        done()
      })
  })

  it('should correctly parse many route params', (done: Function) => {
    chai
      .request(server)
      .get('/albums/2/personnel/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('album').with.property('title', 'McCartney III')
        expect(res.body).to.have.property('personnel').with.property('name', 'Greg Kurstin')
        done()
      })
  })
})

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

  it('should handle an implicit GET route', (done: Function) => {
    chai
      .request(server)
      .get('/users')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('users').with.lengthOf(1)
        done()
      })
  })
})

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
})

describe('Hooks', () => {
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

  it('should return an EntityResource[] if @Resource specified on an array', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/titles')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body.albums).to.have.deep.members([
          { id: 0, title: 'McCartney I' },
          { id: 1, title: 'McCartney II' },
          { id: 2, title: 'McCartney III' }
        ])
        done()
      })
  })

  it('should return an EntityResource if @Resource specified on an object', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/title?id=1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body.album).to.eql({
          id: 1,
          title: 'McCartney II'
        })
        done()
      })
  })

  it('should not crash if @Resource specified on missing key', (done: Function) => {    
    chai
      .request(server)
      .get('/albums/title?id=5')
      .end((err, res) => {
        expect(res).to.have.status(204)
        done()
      })
  })
})

describe('Handler functions', () => {
  after(() => {
    server.close()
  })

  it('should handle a route handler defined as an anonymous function', (done: Function) => {
    chai
      .request(server)
      .post('/albums/2/reviews')
      .type('json')
      .send(JSON.stringify({ title: 'Bad album', text: 'That\'s just my opinion' }))
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('review')
        done()
      })
  })
  
  it('should handle a route handler that calls a function from the service', (done: Function) => {
    chai
      .request(server)
      .put('/albums/2/reviews/1')
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('updatedAt')
        done()
      })
  })
})

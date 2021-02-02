import Koa from 'koa'
import { service } from '../lib'
import bodyParser from 'koa-bodyparser'
import UserService from './services/users'
import CommentService, { routes as commentRoutes } from './services/comments'
import AlbumService, { routes as albumRoutes } from './services/albums'
import MetaService from './services/meta'
import SecretsService from './services/secrets'

const app = new Koa()
app.use(bodyParser())

app.use(service('users', new UserService(), {
  basePath: '/users'
}))

app.use(service('comments', new CommentService(), {
  routes: commentRoutes
}))

app.use(service('albums', new AlbumService(), {
  routes: albumRoutes
}))

app.use(service('meta', new MetaService(), {
  basePath: '/meta'
}))

app.use(service('secrets', new SecretsService(), {
  basePath: '/secrets'
}))

const server = app.listen(3003, () => console.log('Listening...'))
export default server

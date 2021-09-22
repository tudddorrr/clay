import Koa from 'koa'
import { service } from '../../lib'
import bodyParser from 'koa-bodyparser'
import UserService from './services/users'
import CommentService from './services/comments'
import AlbumService from './services/albums'
import MetaService from './services/meta'
import SecretsService from './services/secrets'
import SearchService from './services/search'

const app = new Koa()
app.use(bodyParser())

app.use(service('/users', new UserService()))
app.use(service('/api/users', new UserService()))

app.use(service('/comments', new CommentService()))
app.use(service('/api/comments', new CommentService()))

app.use(service('/albums', new AlbumService()))

app.use(service('/meta', new MetaService()))

app.use(service('/secrets', new SecretsService()))

app.use(service('/search', new SearchService()))

const server = app.listen(3003, () => console.log('Listening...'))
export default server

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
// const consign = require('consign')
const config = require('./config/config')

const app = express()
app.set('json spaces', 2)
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('uploads'))

app.use(async (req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	)
	next()
})

/* consign()
  .include('./src/routes')
  .into(app) */
require('./routes')(app)

app.listen(config.port, config.host, () => {
	console.log(`Сервер запущен по адресу: ${config.host}, порт: ${config.port}`)
})

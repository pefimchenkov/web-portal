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

/* consign()
  .include('./src/routes')
  .into(app) */
require('./routes')(app)

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту: ${config.port}`)
})

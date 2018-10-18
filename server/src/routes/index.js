const db = require('../db')

module.exports = app => {
  app.get('/zip', async (req, res) => {
    let data = []
    try {
      data = await db.query('SELECT `name` FROM Test')
      res.json({
        success: true,
        data: data
      })
    } catch (error) {
      console.log(error)
      res.json({
        success: false,
        error: error
      })
    }
  })
  app.get('/clients', async (req, res) => {
    let data = []
    try {
      data = await db.query(
        'SELECT `NAME` FROM CLIENTS WHERE `NAME` LIKE "%ЭР%"'
      )
      res.json({
        success: true,
        data: data
      })
    } catch (error) {
      console.log(error)
      res.json({
        success: false,
        error: error
      })
    }
  })
}

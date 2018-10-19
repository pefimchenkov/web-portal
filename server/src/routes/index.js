const db = require('../db')

module.exports = app => {
  app.get('/clients', async (req, res) => {
    let data = []
    try {
      data = await db.query(
        'SELECT ID, NAME, LEGPERS, PROJECT, MANAGER FROM CLIENTS'
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
  app.get('/zip', async (req, res) => {
    let data = []
    try {
      data = await db.query(
        'SELECT JIRA_ID AS ID, pc.`name` AS CLASS, CONCAT(pt.`name`, " ",  pm.`NAME`) AS `NAME` FROM Products_Main pm LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID LEFT JOIN Products_Class pc ON pc.id=pm.Class_ID ORDER BY 3'
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

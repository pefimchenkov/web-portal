const db = require('../db')
module.exports = app => {
	app.get('/conditions', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT id, name_ru FROM Products_Condition`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
}

const db = require('../db')
module.exports = app => {
	app.get('/suppliers', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT id, name FROM Products_Supplier`)
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

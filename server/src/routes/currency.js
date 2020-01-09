const db = require('../db')
module.exports = app => {
	app.get('/currency', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT id, name, sign, rate FROM Products_Currency`)
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

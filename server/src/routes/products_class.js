const db = require('../db')
module.exports = app => {
	app.get('/products_class', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT * FROM Products_Class`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

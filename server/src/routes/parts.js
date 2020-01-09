const db = require('../db')
module.exports = app => {
	app.get('/parts', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, zid, mid FROM tsddb.Products_Fit_Market ORDER BY `id`')
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

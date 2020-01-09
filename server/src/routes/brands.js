const db = require('../db')
module.exports = app => {
	app.get('/brands', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, `name` FROM tsddb.tsd_prices_vendor tpv ORDER BY `name`')
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

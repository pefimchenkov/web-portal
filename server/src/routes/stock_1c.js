const db = require('../db')
module.exports = app => {
	app.get('/stock_1c', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT 1c, market_id, qty, qtyser, qtygp, date FROM Products_Market_Sklad WHERE market_id=0`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

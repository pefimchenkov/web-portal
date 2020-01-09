const db = require('../db')

module.exports = app => {
	app.get('/test', async (req, res) => {
		const items = [
			{ id: 14, user_name: 'test11', display_name: 'USER11' },
			{ id: 15, user_name: 'test22', display_name: 'USER22' },
			{ id: 16, user_name: 'test33', display_name: 'USER33' },
			{ id: 17, user_name: 'test44', display_name: 'USER44' },
			{ id: 18, user_name: 'test55', display_name: 'USER55' }
		]
		try {
			await db.query(
				`REPLACE INTO Test_cwd_user (id, user_name, display_name) VALUES ?`,
				[
					items.map(item => [
						item.id,
						item.user_name,
						item.display_name
					])
				],
				(err, response) => {
					if (err) throw err
					res.send(' Данные успешно добавлены. ')
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

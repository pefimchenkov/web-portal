const db = require('../db')
const moment = require('moment')

module.exports = app => {
	app.get('/aliases', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT * FROM `Products_Aliases`')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})

	app.post('/aliases/new', async (req, res) => {
		let myDate = moment(new Date()).format('DD-MM-YY HH:mm')
		let obj = Object.values(req.body)
		let data = []
		console.log(obj)

		for (var key in obj) {
			if (key === '1' || key === '3') {
				data.push(obj[key].replace(/.*\{|\}/gi, ''))
			} else {
				data.push(obj[key])
			}
		}
		data.splice(-1, 1, myDate)
		console.log(data)
		try {
			await db.query(
				'INSERT INTO `Products_Aliases` (id, product, name, client, email, date) VALUES (?)',
				[data],
				(err, response) => {
					if (err) throw err
					res.send(' Данные успешно добавлены. ')
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})

	app.post('/aliases/edit', async (req, res) => {
		delete req.body.date
		let obj = Object.values(req.body)
		let id = obj[0]
		let data = []

		let myDate = moment(new Date()).format('DD-MM-YY HH:mm')

		for (var key in obj) {
			if (key === '1' || key === '3') {
				data.push(obj[key].replace(/.*\{|\}/gi, ''))
			} else {
				data.push(obj[key])
			}
		}

		data.splice(0, 1)
		data.push(myDate, id)
		console.log(data)
		try {
			await db.query(
				'UPDATE `Products_Aliases` SET product = ?, name = ?, client = ?, email = ?, date = ?  WHERE id = ?',
				data,
				(err, response) => {
					if (err) throw err
					res.send(' Данные успешно изменены. ')
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})

	app.post('/aliases/del', async (req, res) => {
		let data = req.body[0]

		try {
			await db.query(
				'DELETE FROM `Products_Aliases` WHERE id = ?',
				data,
				(err, response) => {
					if (err) throw err
					res.send('Псевдоним с id ' + req.body + ' успешно удалён!')
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
}

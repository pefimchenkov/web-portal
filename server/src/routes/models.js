const db = require('../db')
const config = require('../config/config')
const emailjs = require('emailjs')
const moment = require('moment')

module.exports = app => {
	app.get('/models', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT m.ID, tpt.name TYPE, tpv.name VENDOR, m.NAME MODEL, m.CAT_EQ CATEGORY, m.BASIC PROFILE, me.engineer ENGINEER, m.EMAIL, m.DATE
				FROM MODELS m
				LEFT JOIN tsd_prices_vendor tpv ON tpv.id=m.VENDOR_ID
				LEFT JOIN tsd_prices_type tpt ON tpt.id=m.TYPE_ID
				LEFT JOIN models_engineers me ON me.model_id=m.ID
				WHERE tpt.name IS NOT NULL
				GROUP BY m.ID`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/models/get_data', async (req, res) => {
		console.log(req.body)
		try {
			let engineers = await db.query('SELECT id, `engineer` FROM models_engineers me WHERE me.model_id = ' + req.body + ' ORDER BY `id`')
			let profile = await db.query('SELECT BASIC FROM MODELS WHERE ID = ' + req.body)
			let category = await db.query('SELECT CAT_EQ FROM MODELS WHERE ID = ' + req.body)
			res.json({ engineers, profile, category })
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/models_category', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, `name` FROM tsddb.models_category tpc ORDER BY `id`')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/models_profile', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, `name` FROM tsddb.models_profile ORDER BY id')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/models_engineers', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT DISTINCT `engineer` FROM models_engineers ORDER BY `engineer`')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/models_type', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, `name` FROM tsddb.tsd_prices_type tpt ORDER BY `name`')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.get('/models/get_vendor', async (req, res) => {
		let data = []
		try {
			data = await db.query('SELECT id, `name` FROM tsddb.tsd_prices_vendor')
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/models/set_vendor', async (req, res) => {
		try {
			await db.query('INSERT INTO `tsd_prices_vendor` (`name`) VALUES (?)',
				req.body,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true, lastId: res2.insertId })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/models/edit_vendor', async (req, res) => {
		let id = req.body.id
		let name = JSON.stringify(req.body.name)
		console.log(id)
		console.log(name)
		try {
			await db.query('UPDATE `tsd_prices_vendor` SET `name` = ' + name + ' WHERE `id` = ' + id,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/models/del_vendor', async (req, res) => {
		console.log('Удаление производителя с id: ' + req.body)
		try {
			await db.query(
				'DELETE FROM `tsd_prices_vendor` WHERE id = ?',
				req.body,
				async (err, response) => {
					if (err) throw err
					res.json({ success: true })
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
	app.post('/models/set_type', async (req, res) => {
		try {
			await db.query('INSERT INTO `tsd_prices_type` (`name`) VALUES (?)',
				req.body,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true, lastId: res2.insertId })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/models/edit_type', async (req, res) => {
		let id = req.body.id
		let name = JSON.stringify(req.body.name)
		console.log(id)
		console.log(name)
		try {
			await db.query('UPDATE `tsd_prices_type` SET `name` = ' + name + ' WHERE `id` = ' + id,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/models/del_type', async (req, res) => {
		console.log('Удаление типа оборудования с id: ' + req.body)
		try {
			await db.query(
				'DELETE FROM `tsd_prices_type` WHERE id = ?',
				req.body,
				async (err, response) => {
					if (err) throw err
					res.json({ success: true })
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
	app.post('/models/add', async (req, res) => {
		const newItems = req.body
		let model = []
		let engineers = []
		let email = newItems.email
		let date = moment(new Date()).format('YYYY.MM.DD HH:mm')
		Object.entries(newItems).sort().forEach(item => {
			if (item[0] === 'ModelsType' || item[0] === 'ModelsCategory' || item[0] === 'ModelsProfile' || item[0] === 'Brands') {
				model.push(item[1].id)
			}
			if (item[0] === 'ModelsEngineers') {
				item[1].forEach(each => {
					engineers.push(each.engineer)
				})
			}
			if (item[0] === 'Name') model.push(item[1])
		})
		model.push(email, date)
		console.log(model)
		console.log(engineers)
		try {
			await db.query(
				'INSERT INTO `MODELS` (VENDOR_ID, CAT_EQ, BASIC, TYPE_ID, `NAME`, EMAIL, DATE) VALUES(?)',
				[model],
				(err, response) => {
					if (err) throw err
					if (engineers.length > 0) {
						engineers.forEach(engineer => {
							let payload = []
							payload.push(engineer, response.insertId)
							db.query('INSERT INTO `models_engineers` (`engineer`, `model_id`) VALUES(?)',
								[payload],
								(error, data) => {
									if (error) throw error
								}
							)
						})
					}
					res.json({ success: 'Модель успешно добавлена', lastId: response.insertId })
					var server = emailjs.server.connect(config.email)
					server.send(
						{
							text: date +
								'\n \n Новая модель: \n' + JSON.stringify(newItems, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + email,
							subject: 'Добавление новой модели с id ' + response.insertId + ' (' + email + ')'
						},
						function (err, message) {
							console.log(err || message)
						}
					)
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
	app.post('/models/edit', async (req, res) => {
		const editItems = req.body
		let model = []
		let engineers = []
		let email = editItems.email
		let date = moment(new Date()).format('YYYY.MM.DD HH:mm')
		let id = editItems.ID
		Object.entries(editItems).sort().forEach(item => {
			if (item[0] === 'ModelsType' || item[0] === 'ModelsCategory' || item[0] === 'ModelsProfile' || item[0] === 'Brands') {
				model.push(item[1].id)
			}
			if (item[0] === 'ModelsEngineers') {
				item[1].forEach(each => {
					engineers.push(each.engineer)
				})
			}
			if (item[0] === 'Name') model.push(item[1])
		})
		model.push(email, date)
		console.log(model)
		console.log(engineers)
		console.log(id)
		try {
			await db.query('UPDATE `MODELS` SET VENDOR_ID = ?, CAT_EQ = ?, BASIC = ?, TYPE_ID = ?, `NAME` = ?, EMAIL = ?, DATE = ? WHERE ID = ' + id,
				model,
				async (err, response) => {
					if (err) throw err
					await db.query('DELETE FROM models_engineers WHERE model_id = ' + id,
						async (err, response) => {
							if (err) throw err
							await engineers.forEach(engineer => {
								let payload = []
								payload.push(engineer, id)
								db.query('INSERT INTO models_engineers (engineer, model_id) VALUES (?)',
									[payload],
									(err, data) => {
										if (err) throw err
									})
							})
							res.send('Модель с id ' + id + ' успешно обновлена.')
							var server = emailjs.server.connect(config.email)
							server.send(
								{
									text: date +
										'\n \n Новые данные: \n' + JSON.stringify(editItems, null, '\t'),
									from: '<robot@tsd-group.ru>',
									to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + email,
									subject: 'Редактирование модели с id ' + id + ' (' + email + ')'
								},
								function (err, message) {
									console.log(err || message)
								}
							)
						}
					)
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
	app.post('/models/del', async (req, res) => {
		let id = req.body[0]
		let userId = req.body[1]
		let date = moment(new Date()).format('YYYY.MM.DD HH:mm')
		console.log('Удаление модели с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `MODELS` WHERE id = ?',
				id,
				async (err, response) => {
					if (err) throw err
					await db.query('DELETE FROM `models_engineers` WHERE model_id = ?',
						id,
						(err) => {
							if (err) throw err
							res.send('Модель с id ' + id + ' успешно удалёна!')
							var server = emailjs.server.connect(config.email)
							server.send(
								{
									text:
										date +
										' - Удалёна Модель с id: ' + id,
									from: '<robot@tsd-group.ru>',
									to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
									subject:
										'Пользователь ' +
										userId +
										' удалил позицию с id ' + id + ' из таблицы `MODELS`'
								},
								function (err, message) {
									console.log(err || message)
								}
							)
						})
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

const axios = require('axios')
const db = require('../db')
// const config = require('../config/config')
module.exports = app => {
	app.post('/ziplist/add', async (req, res) => {
		let main = []
		let market = []
		let fit = []
		let fitOnce = []
		let MaxId = null
		Object.entries(req.body).forEach(([key, value]) => {
			if (key === 'SHORTNAME' || key === 'TYPE' || key === 'CLASS' || key === 'TIME') {
				if (key === 'TYPE' || key === 'CLASS') {
					value = value.id
				}
				value = key === 'TIME' ? parseInt(value) : value
				main.push(value)
			}
			if (key === 'ART' || key === 'PN' || key === 'Pack' || key === 'SUPPLIERS' || key === 'CONDITIONS') {
				if (key === 'SUPPLIERS' || key === 'CONDITIONS') {
					value = value.id
				}
				value = key === 'Pack' ? parseInt(value) : value
				market.push(value)
			}
			if (key === 'MODELS') {
				for (key in value) {
					fitOnce.push(value[key].ID)
					fit.push(fitOnce)
					fitOnce = []
				}
			}
		})
		try {
			await db.query(
				'INSERT INTO Products_Main (`NAME`, Class_ID, Class_Type_ID, `TIME`) VALUES (?)',
				[main],
				async (err, response) => {
					if (err) throw err
					await db.query(
						'INSERT INTO Products_Market (MAIN_JIRA_ID, ART_1C, PN, Pack, Supplier_ID, `Condition`) VALUES ((SELECT MAX(JIRA_ID) FROM Products_Main), ?)',
						[market],
						async (err, response) => {
							if (err) throw err
							await req.body.MODELS.map(item => [
								db.query(
									'INSERT INTO Products_Fit (MAIN_JIRA_ID, Model_JIRA_ID) VALUES ((SELECT MAX(JIRA_ID) FROM Products_Main), ?)',
									[item.ID],
									async (err, response) => {
										if (err) throw err
									}
								)
							])
							MaxId = await db.query('SELECT MAX(JIRA_ID) ID FROM Products_Main')
							console.log('Добавлен новый ЗИП: ' + req.body.SHORTNAME)
							res.json({
								success: ' Данные успешно добавлены! ',
								MaxId
							})
						}
					)
				}
			)
		} catch (err) {
			console.log(err)
			res.json({
				success: false,
				err
			})
		}
	})
	app.post('/ziplist/edit', async (req, res) => {
		axios
			.get('http://my.tsd-group.ru:3000/models')
			.then(async response => {
				let MODELS = req.body.MODELS
				let fit = []
				let fitOnce = []
				let main = []
				let market = []
				MODELS.forEach(m => {
					if (typeof (m) === 'string') {
						response.data.forEach(r => {
							if (r.MODEL === m) {
								fitOnce.push(r.ID, req.body.ID)
								fit.push(fitOnce)
								fitOnce = []
							}
						})
					} else {
						fitOnce.push(m.ID, req.body.ID)
						fit.push(fitOnce)
						fitOnce = []
					}
				})
				// fit.push(req.body.ID)
				Object
					.entries(req.body)
					.sort()
					.forEach(([key, value]) => {
						if (key === 'SHORTNAME' || key === 'TYPE' || key === 'CLASS' || key === 'TIME') {
							if (key === 'TYPE' || key === 'CLASS') {
								value = value.id
							}
							value = key === 'TIME' ? parseInt(value) : value
							main.push(value)
						}
						if (key === 'ART' || key === 'PN' || key === 'Pack' || key === 'SUPPLIERS' || key === 'CONDITIONS') {
							if (key === 'SUPPLIERS' || key === 'CONDITIONS') {
								value = value.id
							}
							value = key === 'Pack' ? parseInt(value) : value
							market.push(value)
						}
					})
				main.push(req.body.ID)
				market.push(req.body.ID)
				console.log(main)
				console.log(fit)
				console.log(market)
				try {
					await db.query(
						'UPDATE Products_Main SET Class_ID = ?, `NAME` = ?, `TIME`= ?, `Class_Type_ID` = ? WHERE JIRA_ID = ?',
						main,
						async (err, resp) => {
							if (err) throw err
							await db.query(
								'UPDATE Products_Market SET `ART_1C` = ?, `Condition` = ?, `PN` = ?, `Pack` = ?, `Supplier_ID` = ? WHERE MAIN_JIRA_ID = ?',
								market,
								async (err, resp) => {
									if (err) throw err
									await db.query(
										`DELETE FROM Products_Fit WHERE MAIN_JIRA_ID = ` + req.body.ID,
										async (err, response) => {
											if (err) throw err
											await fit.map(item => [
												db.query(
													`INSERT INTO Products_Fit (Model_JIRA_ID, MAIN_JIRA_ID) VALUES (?)`,
													[item],
													(err, resp) => {
														if (err) throw err
													})
											])
											res.json({
												success:
													' Данные успешно изменены!'
											})
										}
									)
								}
							)
						}
					)
				} catch (err) {
					console.log(err)
					res.json({
						success: false,
						err
					})
				}
			})
			.catch(err => {
				console.log(err)
			})
	})
	app.post('/ziplist/del', async (req, res) => {
		let id = req.body[0]
		console.log('Удаление ЗИП с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `Products_Main` WHERE JIRA_ID = ?',
				id,
				async (err, response) => {
					if (err) throw err
					await db.query(
						'DELETE FROM `Products_Market` WHERE MAIN_JIRA_ID = ?',
						id,
						async (err, response) => {
							if (err) throw err
							await db.query(
								'DELETE FROM `Products_Fit` WHERE MAIN_JIRA_ID = ?',
								id,
								async (err, response) => {
									if (err) throw err
									res.send(
										'ЗИП с id ' +
											id +
											' успешно удалён!'
									)
									console.log('ЗИП с id ' + id + ' успешно удалён.')
								}
							)
						}
					)
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

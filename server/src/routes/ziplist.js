const axios = require('axios')
const db = require('../db')
const config = require('../config/config')
const email = require('emailjs')
const moment = require('moment')
module.exports = app => {
	app.post('/ziplist/add', async (req, res) => {
		let main = []
		let market = []
		let parts = []
		let fit = []
		let fitOnce = []
		let isZipArt = ` ART_1C, `
		let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
		Object.entries(req.body)
			.sort()
			.forEach(([key, value]) => {
				if (
					key === 'SHORTNAME' ||
                    key === 'zipTYPE' ||
                    key === 'zipCLASS' ||
                    key === 'EMAIL' ||
                    key === 'zipTIME'
				) {
					if (key === 'zipTYPE' || key === 'zipCLASS') {
						if (value !== null) {
							value = value.id
						}
					}
					value = key === 'zipTIME' ? parseInt(value) : value
					if (value !== null) {
						main.push(value)
					}
				}
				if (
					key === 'zipART' ||
                    key === 'zipPN' ||
                    key === 'zipPack' ||
                    key === 'zipSUPPLIERS' ||
                    key === 'zipCONDITIONS' ||
                    key === 'EMAIL'
				) {
					if (key === 'zipSUPPLIERS' || key === 'zipCONDITIONS') {
						if (value !== null) {
							value = value.id
						}
					}
					if (key === 'zipART' && (value === null || value === undefined)) {
						isZipArt = ` `
						return false
					}
					if (value !== null || value !== undefined) {
						value = key === 'zipPack' ? parseInt(value) : value
						market.push(value)
					} else {
						console.log(value)
						value = 1
						market.push(value)
					}
				}
				if (key === 'zipMODELS') {
					for (key in value) {
						fitOnce.push(value[key].ID)
						fit.push(fitOnce)
						fitOnce = []
					}
				}
				if (key === 'Parts') {
					value.forEach(obj => {
						parts.push(obj.marketid)
					})
				}
			})
		main.push(myDate)
		if (market.length >= 4 || market.length === 1) {
			// market.length === 1 - это приходит только email для записи в БД, кто добавлял позицию
			market.push(1, myDate)
			console.log('Добавление ЗИП: ' + main)
			console.log('Добавление ЗИП-совместимости: ' + fit)
			console.log('Добавление ЗИП-маркет: ' + market)
			try {
				await db.query(
					'INSERT INTO Products_Main (`email`, `NAME`, Class_ID, `TIME`, Class_Type_ID, `date`) VALUES (?)', [main],
					async (err, responseMain) => {
						if (err) throw err
						if (market.length >= 4 && market !== undefined) {
							await db.query(
								'INSERT INTO Products_Market (MAIN_JIRA_ID, email,' + isZipArt + '`Condition`, PN, Pack, Supplier_ID, Element_Type, Update_Date) VALUES ((SELECT MAX(JIRA_ID) FROM Products_Main), ?)', [market],
								async (err, response) => {
									if (err) throw err
									if (
										req.body.zipMODELS &&
                                        req.body.zipMODELS.length > 0
									) {
										await req.body.zipMODELS.map(item => [
											db.query(
												'INSERT INTO Products_Fit (MAIN_JIRA_ID, Model_JIRA_ID) VALUES ((SELECT MAX(JIRA_ID) FROM Products_Main), ?)', [item.ID],
												async (err, response) => {
													if (err) throw err
												}
											)
										])
									}
									if (parts.length > 0) {
										parts.forEach(async part => {
											await db.query(
												'INSERT INTO Products_Fit_Market (zid, mid) VALUES (' +
                                                part +
                                                ',' +
                                                responseMain.insertId +
                                                ')'
											)
										})
									}
									console.log(
										'Добавлен новый ЗИП: ' +
                                        req.body.SHORTNAME
									)
									console.log(
										'id нового элемента:' +
                                        responseMain.insertId
									)
									res.json({
										success: ' Новый ЗИП успешно добавлен! ',
										lastItemId: responseMain.insertId
									})
									var server = email.server.connect(
										config.email
									)
									server.send({
										text: myDate +
                                                '\n\n - Добавлен новый ЗИП с следующими параметрами: \n' +
                                                JSON.stringify(req.body, null, '\t'
                                                ),
										from: '<robot@tsd-group.ru>',
										to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' +
                                                req.body.EMAIL,
										subject: 'Пользователь ' +
                                                req.body.EMAIL +
                                                ' добавил новый ЗИП в таблицу `Products_Main`'
									},
									function (err, message) {
										console.log(err || message)
									}
									)
								}
							)
						} else {
							if (
								req.body.zipMODELS &&
                                req.body.zipMODELS.length > 0
							) {
								req.body.zipMODELS.map(async item => [
									await db.query(
										'INSERT INTO Products_Fit (MAIN_JIRA_ID, Model_JIRA_ID) VALUES ((SELECT MAX(JIRA_ID) FROM Products_Main), ?)', [item.ID],
										(err, response) => {
											if (err) throw err
										}
									)
								])
							}
							// MaxId = await db.query('SELECT MAX(JIRA_ID) ID FROM Products_Main')
							console.log(
								'Добавлен новый ЗИП: ' + req.body.SHORTNAME
							)
							console.log(
								'id нового элемента ' + responseMain.insertId
							)
							res.json({
								success: ' Новый ЗИП успешно добавлен! ',
								lastItemId: responseMain.insertId
							})
							var server = email.server.connect(config.email)
							server.send({
								text: myDate +
                                        '\n\n - Добавлен новый ЗИП с следующими параметрами: \n' +
                                        JSON.stringify(req.body, null, '\t'),
								from: '<robot@tsd-group.ru>',
								to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' +
                                        req.body.EMAIL,
								subject: 'Пользователь ' +
                                        req.body.EMAIL +
                                        ' добавил новый ЗИП в таблицу `Products_Main`'
							},
							function (err, message) {
								console.log(err || message)
							}
							)
						}
					}
				)
			} catch (error) {
				console.log(error)
				res.json({
					success: false,
					error: error.message
				})
			}
		} else {
			console.log(
				'////////////////////////////////////////////////////////////////////////////////////////////////'
			)
			console.log(
				'///////// Блок `Маркет` заполнен не полностью, либо изменилось кол-во полей в блоке. ///////////'
			)
			console.log(
				'////////////////////////////////////////////////////////////////////////////////////////////////'
			)
			res.json({
				success: false,
				error: 'Либо заполните весь блок Маркет данными, либо оставьте его пустым!'
			})
		}
	})
	app.post('/ziplist/edit', async (req, res) => {
		axios
			.get('http://webportal.tsd-group.ru:3000/models')
			.then(async response => {
				let MODELS = req.body.zipMODELS
				let fit = []
				let fitOnce = []
				let main = []
				let mainForEmail = []
				let market = []
				let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
				MODELS.forEach(m => {
					if (typeof m === 'string') {
						response.data.forEach(r => {
							if (r.MODEL === m) {
								fitOnce.push(r.ID, req.body.zipID)
								fit.push(fitOnce)
								fitOnce = []
							}
						})
					} else {
						fitOnce.push(m.ID, req.body.zipID)
						fit.push(fitOnce)
						fitOnce = []
					}
				})
				Object.entries(req.body)
					.sort()
					.forEach(([key, value]) => {
						if (
							key === 'SHORTNAME' ||
                            key === 'zipTYPE' ||
                            key === 'zipCLASS' ||
                            key === 'zipTIME' ||
                            key === 'EMAIL'
						) {
							if (key === 'zipTYPE' || key === 'zipCLASS') {
								value = value.id
							}
							value = key === 'zipTIME' ? parseInt(value) : value
							main.push(value)
							mainForEmail.push(key + ':  ' + value)
						}
						if (
							key === 'zipART' ||
                            key === 'zipPN' ||
                            key === 'zipPack' ||
                            key === 'zipSUPPLIERS' ||
                            key === 'zipCONDITIONS'
						) {
							if (
								key === 'zipSUPPLIERS' ||
                                key === 'zipCONDITIONS'
							) {
								value = value.id
							}
							value = key === 'zipPack' ? parseInt(value) : value
							market.push(value)
						}
					})
				main.push(myDate, req.body.zipID)
				market.push(req.body.zipID)
				console.log(main)
				console.log(fit)
				var server = email.server.connect(config.email)
				try {
					await db.query(
						'UPDATE Products_Main SET `email` = ?, `NAME` = ?, Class_ID = ?, `TIME`= ?, `Class_Type_ID` = ?, date = ? WHERE JIRA_ID = ?',
						main,
						async (err, resp) => {
							if (err) throw err
							await db.query(
								`DELETE FROM Products_Fit WHERE MAIN_JIRA_ID = ` +
                                req.body.zipID,
								async (err, response) => {
									if (err) throw err
									if (req.body.zipMODELS && fit.length > 0) {
										await fit.map(item => [
											db.query(
												`INSERT INTO Products_Fit (Model_JIRA_ID, MAIN_JIRA_ID) VALUES (?)`, [item],
												(err, resp) => {
													if (err) throw err
												}
											)
										])
									}
									res.json({
										success: ' Данные успешно изменены!'
									})
									server.send({
										text: myDate +
                                                '\n \n - Редактирование ЗИП (ID: ' +
                                                req.body.zipID +
                                                ' ), новые данные: \n' +
                                                JSON.stringify(main, null, '\t'
                                                ),
										from: '<robot@tsd-group.ru>',
										to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' +
                                                req.body.EMAIL,
										subject: 'Пользователь ' +
                                                req.body.EMAIL +
                                                ' отредактировал ЗИП в таблице `Products_Main`'
									},
									function (err, message) {
										console.log(err || message)
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
		let userId = req.body[1]
		console.log(req.body)
		let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
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
								'DELETE FROM `Products_Fit` WHERE MAIN_JIRA_ID = ?; DELETE FROM `Products_Fit_Market` WHERE mid = ?', [id, id],
								async (err, response) => {
									if (err) throw err
									res.send(
										'ЗИП с id ' + id + ' успешно удалён!'
									)
									console.log(
										'ЗИП с id ' + id + ' успешно удалён.'
									)
									var server = email.server.connect(
										config.email
									)
									server.send({
										text: myDate +
                                                ' - Удалён ЗИП с id: ' +
                                                id,
										from: '<robot@tsd-group.ru>',
										to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' +
                                                userId,
										subject: 'Пользователь ' +
                                                userId +
                                                ' успешно удалил позицию из таблицы `Products_Main`'
									},
									function (err, message) {
										console.log(err || message)
									}
									)
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

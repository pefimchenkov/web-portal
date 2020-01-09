const db = require('../db')
const moment = require('moment')
const multer = require('multer')
const crypto = require('crypto')
const xlsx2json = require('xlsx2json')
const config = require('../config/config')
const emailjs = require('emailjs')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads')
	},
	filename: (req, file, cb) => {
		let customFileName = crypto.randomBytes(18).toString('hex')
		let fileExtension = file.originalname.split('.')[1]
		cb(null, customFileName + '.' + fileExtension)
	}
})
const upload = multer({ storage: storage }).single('file')

module.exports = app => {
	app.get('/serial_numbers', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT SN.ID, SN.Client Client, Model, TSDN, SN, SN.Contract, SN.EndDate ENDDATE, SN.Email EMAIL, SN.Date DATE, CONCAT('CONTRACT-',ji.issuenum) SPEC
				FROM tsddb.SN
				LEFT JOIN jiradb.jiraissue ji ON ji.ID = SN.Spec`
			)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
	app.post('/serial_numbers/upload_file', upload, async (req, res) => {
		try {
			console.log(req.file)
			const originalname = req.file.originalname
			res.json({
				mess: 'Файл ' + originalname + ' успешно загружен',
				filename: req.file.filename
			})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/serial_numbers/json_to_db', async (req, res) => {
		try {
			let file = req.body[0]
			let email = req.body[1]
			xlsx2json('./uploads/' + file, {
				dataStartingRow: 2,
				mapping: {
					Client: 'A',
					Model: 'B',
					SN: 'C',
					Contract: 'D',
					Spec: 'E',
					TSDN: 'F',
					ENDDATE: 'G'
				}
			}).then(data => {
				let date = moment(new Date()).format(
					'YYYY.MM.DD HH:mm'
				)
				var server = emailjs.server.connect(config.email)
				data[0].forEach(el => {
					if (el.Client && el.Model && el.SN && el.Contract && el.Spec && el.TSDN) {
						try {
							console.log(el)
							db.query(
								'INSERT INTO `SN` (Vendor, Client, Model, SN, Contract, Spec, TSDN, ENDDATE, email, date)  VALUES (?)',
								[
									[
										13,
										el.Client,
										el.Model,
										el.SN,
										el.Contract,
										el.Spec,
										el.TSDN,
										moment(new Date(el.ENDDATE)).format('YYYY.MM.DD'),
										(el.email = email),
										(el.date = date)
									]
								],
								(err, response) => {
									if (err) throw err
								}
							)
						} catch (error) {
							console.log(error)
							res.json({
								success: false,
								error: error
							})
						}
					} else {
						console.log('Файл имеет пустые данные, необходимые при импорте!')
						res.json({
							success: false,
							error: 'Файл имеет пустые данные, необходимые при импорте!'
						})
					}
				})
				server.send(
					{
						text: '\n' + date + '\n' + JSON.stringify(data[0], null, '\t'),
						from: '<robot@tsd-group.ru>',
						to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + email,
						subject: 'Массовый импорт серийных номеров на портале (' + email + ')'
					},
					function (err, message) {
						console.log(err || message)
					}
				)
				res.json('Массовое добавление прошло успешно!')
			})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/serial_numbers/add', async (req, res) => {
		let data = []
		let userId = req.body.EMAIL
		const myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
		Object.entries(req.body).sort().forEach(([key, value]) => {
			if (key === 'SPEC') {
				value = value.SPECID
			}
			data.push(value)
		})
		data.push(13, moment(new Date()).format('YYYY-MM-DD HH:mm'))
		try {
			db.query(
				'INSERT INTO `SN` (Client, Contract, Email, ENDDATE, Model, SN, Spec, TSDN, Vendor, Date)  VALUES (?)',
				[data],
				(err, response) => {
					if (err) throw err
					res.json({ success: ' Данные успешно добавлены. ', lastId: response.insertId })
					var server = emailjs.server.connect(config.email)
					server.send(
						{
							text:
								myDate +
								'\n\n  - Добавление Серийного номера: \n' +
								JSON.stringify(req.body, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
							subject:
								'Пользователь ' +
								userId +
								' добавил новую позицию таблицу `SN`'
						},
						function (err, message) {
							console.log(err || message)
						}
					)
				}
			)
			console.log(data)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/serial_numbers/edit', async (req, res) => {
		let data = []
		let id = null
		let userId = ''
		let myDate = moment(new Date()).format(
			'YYYY.MM.DD HH:mm'
		)
		Object.entries(req.body).sort().forEach(([key, value]) => {
			if (key === 'ID') {
				id = value
			} else if (key === 'Client' || key === 'SPEC' || key === 'ID') {
				return false
			} else {
				if (key === 'DATE') {
					value = moment(new Date()).format('YYYY-MM-DD HH:mm')
				}
				if (key === 'EMAIL') {
					userId = value
				}
				data.push(value)
			}
		})
		try {
			await db.query(
				'UPDATE SN SET `Contract` = ?, `Date` = ?, `Email`= ?, `EndDate` = ?, `Model` = ?, `SN` = ?, `TSDN` = ? WHERE `ID` = ' + id,
				data,
				async (err, resp) => {
					if (err) throw err
					res.send(' Данные успешно изменены. ')
					var server = emailjs.server.connect(config.email)
					server.send(
						{
							text:
								myDate +
								'\n\n  - Редактирование Серийных номеров, новые данные: \n' +
								JSON.stringify(req.body, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
							subject:
								'Пользователь ' +
								userId +
								' внёс корректировки в таблицу `SN`'
						},
						function (err, message) {
							console.log(err || message)
						}
					)
				})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/serial_numbers/del', async (req, res) => {
		let id = req.body[0]
		let userId = req.body[1]
		let myDate = moment(new Date()).format(
			'YYYY.MM.DD HH:mm'
		)
		console.log('Удаление элемента с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `SN` WHERE id = ?',
				id,
				(err, response) => {
					if (err) throw err
					res.send('Элемент с id ' + id + ' успешно удалён!')
					var server = emailjs.server.connect(config.email)
					server.send(
						{
							text:
								myDate +
								' - Удалена позиция таблицы `SN` с id: ' + id,
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
							subject:
								'Пользователь ' +
								userId +
								' успешно удалил позицию с id: ' + id
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
}

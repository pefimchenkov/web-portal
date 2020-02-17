const db = require('../db')
const moment = require('moment')
const multer = require('multer')
const crypto = require('crypto')
const xlsx2json = require('xlsx2json')
const rp = require('request-promise')
const config = require('../config/config')
const emailjs = require('emailjs')
// const prependFile = require('prepend-file')

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
	app.get('/specprices', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT ps.id AS ID, ps.product, CONCAT(pt.name,' ',pm.NAME) ZIPNAME, GROUP_CONCAT(ART_1C) ART, price, pricends, currency, currency_agent,
				CONCAT('CONTRACT-',ji.issuenum) SPEC, ps.client AS client, ps.alias alias, ps.email EMAIL, ps.date DATE, ps.duplicate, price_agent
        		FROM tsddb.Prices_Spec ps
        		LEFT JOIN tsddb.Products_Main pm ON pm.JIRA_ID=ps.product
        		LEFT JOIN tsddb.Products_Type pt ON pt.id=pm.Class_Type_ID
        		LEFT JOIN tsddb.Products_Market pmar ON pmar.MAIN_JIRA_ID=product AND pmar.Element_Type = 1
				LEFT JOIN jiradb.jiraissue ji ON ji.ID=ps.spec
				GROUP BY ID
				ORDER BY ID DESC`
			)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/specprices/nds', async (req, res) => {
		console.log(req.body)
		try {
			const nds = await db.query(`SELECT STRINGVALUE
				FROM jiradb.jiraissue ji LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE = ji.ID AND cfv.CUSTOMFIELD = 22709
				WHERE CONCAT('CONTRACT-', ji.issuenum) = '` + req.body + `' AND ji.PROJECT = 15700`)
			res.json({
				success: true,
				nds: nds
			})
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/specprices/new', async (req, res) => {
		console.log('Добавление спеццен: ')
		console.log(req.body)
		try {
			await db.query(
				'INSERT INTO `Prices_Spec` (client, product, spec, alias, pricends, price, currency, email, date)  VALUES (?)',
				[req.body],
				(err, response) => {
					if (err) throw err
					res.json({ success: ' Данные успешно добавлены. ', lastItemId: response.insertId })
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
	app.post('/specprices/edit', async (req, res) => {
		let obj = req.body
		if (obj.nds && obj.nds === true) {
			obj.pricends = parseFloat(obj.price)
			obj.price = parseFloat((obj.price / 1.2).toFixed(2))
			delete obj.nds
		} else {
			obj.pricends = parseFloat((obj.price * 1.2).toFixed(2))
			delete obj.nds
		}
		let arr = []
		let email = obj.email
		let date = moment(new Date()).format('YYYY.MM.DD HH:mm')
		Object.entries(obj).sort().forEach(item => {
			arr.push(item[1])
		})
		arr.push(date)
		arr = arr.reverse()
		console.log('Редактирование спеццен:')
		console.log(arr)
		try {
			await db.query(
				'UPDATE `Prices_Spec` SET date = ?, product = ?, pricends = ?, price = ?, email = ?, duplicate = ?, currency = ?, client = ?, alias = ? WHERE id = ?',
				arr,
				(err, response) => {
					if (err) throw err
					var server = emailjs.server.connect(config.email)
					server.send(
						{
							text: date +
								'\n \n Новые данные: \n' + JSON.stringify(obj, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + email,
							subject: 'Редактирование Спеццен от ' + date + ' (' + email + ')'
						},
						function (err, message) {
							console.log(err || message)
						}
					)
					res.send(' Данные успешно обновлены. ')
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
	app.post('/specprices/del', async (req, res) => {
		let id = req.body[0]
		console.log('Удаление элемента с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `Prices_Spec` WHERE id = ?',
				id,
				(err, response) => {
					if (err) throw err
					res.send('Элемент с id ' + id + ' успешно удалён!')
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
	app.get('/specprices/key', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT C.ID, CONCAT('CONTRACT-',ji.issuenum) IKEY, SUMMARY, ji.ID SPECID
        		FROM jiradb.jiraissue ji
        		LEFT JOIN jiradb.customfieldvalue cfo ON cfo.ISSUE=ji.ID AND cfo.CUSTOMFIELD=20822
        		LEFT JOIN tsddb.CLIENTS C ON cfo.TEXTVALUE LIKE CONCAT('%>',C.ID,'<%')
        		WHERE issuetype in (13600,14401)`
			)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/specprices/upload_file', upload, async (req, res) => {
		try {
			console.log(req.file)
			const originalname = req.file.originalname
			res.json({
				mess:
					'Файл ' +
					originalname +
					' успешно загружен',
				filename: req.file.filename
			})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/specprices/json_to_db', async (req, res) => {
		try {
			let file = req.body[0]
			let email = req.body[1]
			const options = { method: 'GET', uri: 'http://' + config.host + ':' + config.port + '/zip', json: true }
			rp(options)
				.then(response => {
					xlsx2json('./uploads/' + file, {
						dataStartingRow: 2,
						mapping: {
							product: 'A',
							alias: 'B',
							client: 'C',
							spec: 'D',
							price: 'E',
							currency: 'F',
							duplicate: 'G',
							price_agent: 'H',
							currency_agent: 'I'
						}
					}).then(data => {
						let obj = {}
						let undefArt = []
						let pricends = null
						let date = moment(new Date()).format('YYYY.MM.DD HH:mm')
						var server = emailjs.server.connect(config.email)
						data[0].forEach(async el => {
							if (el.product && el.alias && el.client && el.spec && el.price && el.currency) {
								obj = response.find(r => r.zipART && (r.zipART.includes(el.product)))
							} else {
								return false
							}
							if (typeof obj !== 'undefined') {
								el.product = obj.zipID
								el.price = parseFloat(el.price.replace(/,/g, ''))
								if (el.duplicate === 0 || el.duplicate === '') {
									el.duplicate = null
								}
								try {
									const nds = await db.query('SELECT STRINGVALUE FROM jiradb.customfieldvalue cfv WHERE cfv.ISSUE=' + el.spec + ' AND cfv.CUSTOMFIELD=22709')
									if (nds && nds.length !== 0) {
										pricends = el.price
										el.price = el.price / 1.2
									} else {
										pricends = parseFloat(el.price) * 1.2
									}
									await db.query(
										'INSERT INTO `Prices_Spec` (product, alias, client, spec, price, pricends, currency, duplicate, price_agent, currency_agent, email, date)  VALUES (?)',
										[
											[
												el.product,
												el.alias,
												el.client,
												el.spec,
												el.price,
												pricends,
												el.currency,
												el.duplicate,
												el.price_agent,
												el.currency_agent,
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
									res.json({ success: false, error: error })
								}
							} else {
								undefArt.push(el.product)
							}
						})
						if (undefArt.length !== 0) {
							server.send(
								{
									text: undefArt,
									from: '<robot@tsd-group.ru>',
									to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + email,
									subject: 'Неопределённые артикулы 1с при массовом импорте от ' + date + ' (' + email + ')'
								},
								function (err, message) {
									console.log(err || message)
								}
							)
							res.json(
								'ВНИМАНИЕ! Массовое добавление прошло частично успешно, проверьте почту!'
							)
						} else {
							res.json(
								'Массовое добавление прошло успешно!'
							)
						}
					})
				})
				.catch(error => {
					console.log(error)
					res.json({ success: false, error: error.message })
				})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
}

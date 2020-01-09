const db = require('../db')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs')
const config = require('../config/config')
const sizeOf = require('image-size')
const Promise = require('promise')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var newDestination = './uploads/market_images/' + req.body.id
		var stat = null
		try {
			stat = fs.statSync(newDestination)
		} catch (err) {
			fs.mkdirSync(newDestination)
		}
		if (stat && !stat.isDirectory()) {
			throw new Error('Directory cannot be created because an inode of a different type exists at "' + newDestination + '"')
		}
		cb(null, newDestination)
	},
	filename: (req, file, cb) => {
		let customFileName = crypto.randomBytes(5).toString('hex')
		let fileExtension = file.originalname.split('.')[1]
		cb(null, customFileName + '.' + fileExtension)
	}
})
const upload = multer({ storage: storage }).single('image')

module.exports = app => {
	app.get('/market/loadimages', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT * FROM Products_Market_Images ORDER BY ID DESC LIMIT 6`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/get_parts', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT pmr.id marketid, pmr.MAIN_JIRA_ID marketID, pt.name marketTYPE, CONCAT(pt.name,' ',pm.NAME) marketNAME, ART_1C marketART, PN marketPN, pmr.Element_Type elementTYPE
				FROM Products_Market pmr
				LEFT JOIN Products_Main pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID
				LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
				LEFT JOIN Products_Fit pf ON pf.MAIN_JIRA_ID=pm.JIRA_ID
				WHERE pmr.Element_Type = 1 AND pf.Model_JIRA_ID=` + req.body + `
				GROUP BY pmr.id`
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
	app.post('/market/get_current_market_parts', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT pfm.id, pmr.id marketid, CONCAT(pt.name,' ',pm.NAME) marketNAME, pmr.ART_1C marketART, pmr.PN marketPN, ps.name marketSUPPLIER, pc.name_ru marketCOND, GROUP_CONCAT(m.NAME) marketMODELS
				FROM Products_Fit_Market pfm
				LEFT JOIN Products_Market pmr ON pmr.id=pfm.zid
				LEFT JOIN Products_Main pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID
				LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
				LEFT JOIN Products_Condition pc ON pc.id=pmr.Condition
				LEFT JOIN Products_Supplier ps ON ps.id=pmr.Supplier_ID
				LEFT JOIN Products_Fit pf ON pf.MAIN_JIRA_ID=pm.JIRA_ID
				LEFT JOIN MODELS m ON m.ID=pf.Model_JIRA_ID
				WHERE pfm.mid=` + req.body + `
				GROUP BY pfm.zid`
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
	app.post('/market/uploadphoto', upload, async (req, res) => {
		try {
			const originalname = req.file.originalname
			const dir = './uploads/market_images/'
			var dimensions = sizeOf(dir + req.body.id + '/' + req.file.filename)
			var url = 'http://' + config.host + ':' + config.port + '/market_images/' + req.body.id + '/' + req.file.filename
			var query = [
				parseInt(req.body.id),
				url
			]
			try {
				await db.query(
					'INSERT INTO `Products_Market_Images`(JIRA_MARKET_ID, URL) VALUE (?)',
					[query],
					(err, response) => {
						if (err) throw err
						res.json({
							success:
								'Файл ' +
								originalname +
								' успешно загружен',
							url: url,
							width: dimensions.width
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
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/market/getimages', async (req, res) => {
		let id = req.body[0]
		let dir = './uploads/market_images/'
		let files_ = []

		if (id) {
			try {
				var files = fs.readdirSync(dir + id)
				for (var i in files) {
					var name = files[i]
					var dimensions = sizeOf(dir + id + '/' + name)
					files_.push({ url: 'http://' + config.host + ':' + config.port + '/market_images/' + id + '/' + name, width: dimensions.width })
				}
				console.log(files_)
				res.send(files_)
			} catch (err) {
				if (err.code !== 'ENOENT') throw err
				res.json({ error: err.message })
			}
		} else {
			var folders = fs.readdirSync(dir)
			for (var key in folders) {
				var zipid = folders[key]
				var filename = fs.readdirSync(dir + zipid + '/')
				if (filename[0] !== undefined) {
					var dimen = sizeOf(dir + zipid + '/' + filename[0])
					files_.push({
						url: 'http://' + config.host + ':' + config.port + '/market_images/' + zipid + '/' + filename[0],
						id: zipid,
						width: dimen.width
					})
				}
			}
			console.log(files_)
			res.send(files_)
		}
	})
	app.post('/market/delImg', (req, res) => {
		try {
			const id = req.body[0]
			const name = req.body[1]
			let dir = './uploads/market_images/'
			let url = 'http://' + config.host + ':' + config.port + '/market_images/' + id + '/' + name
			fs.unlink(dir + id + '/' + name, function (err) {
				if (err) {
					console.error(err)
				}
				console.log('Файл ' + name + ' успешно удалён')
				try {
					db.query(
						'DELETE FROM `Products_Market_Images` WHERE URL = ?',
						url,
						(err, response) => {
							if (err) throw err
							res.json({
								success: 'Файл ' + name + ' успешно удалён',
								url: url
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
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/market/add_current_parts', (req, res) => {
		function insertParts () {
			let id = req.body[0]
			let newParts = req.body[1]
			return Promise.resolve(
				newParts.forEach(part => {
					if (!part.id) {
						try {
							db.query(
								'INSERT INTO Products_Fit_Market (zid, mid) VALUES (' + part.marketid + ', ' + id + ')'
							)
						} catch (error) {
							console.log(error)
							res.json({
								success: false,
								error: error
							})
						}
					}
				})
			)
		}
		function selectCurrentParts () {
			let id = req.body[0]
			return Promise.resolve(
				db.query(
					`SELECT pfm.id, pmr.id marketid, CONCAT(pt.name,' ',pm.NAME) marketNAME, pmr.ART_1C marketART, pmr.PN marketPN, ps.name marketSUPPLIER, pc.name_ru marketCOND, GROUP_CONCAT(m.NAME) marketMODELS
					FROM Products_Fit_Market pfm
					LEFT JOIN Products_Market pmr ON pmr.id=pfm.zid
					LEFT JOIN Products_Main pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID
					LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
					LEFT JOIN Products_Condition pc ON pc.id=pmr.Condition
					LEFT JOIN Products_Supplier ps ON ps.id=pmr.Supplier_ID
					LEFT JOIN Products_Fit pf ON pf.MAIN_JIRA_ID=pm.JIRA_ID
					LEFT JOIN MODELS m ON m.ID=pf.Model_JIRA_ID
					WHERE pfm.mid=` + id + `
					GROUP BY pfm.zid`
				)
			)
		}
		function sendParts (data) {
			res.json({
				success: true,
				payload: data
			})
		}
		insertParts()
			.then(
				console.log('Вставка прошла успешно'),
				selectCurrentParts()
					.then(result => {
						sendParts(result)
					})
			)
	})
	app.post('/market/delParts', (req, res) => {
		let ids = []
		if (typeof req.body[0] === 'number') {
			ids = req.body
		} else {
			req.body.forEach(item => {
				if (item.id && item.id !== undefined) {
					ids.push(item.id)
				}
			})
		}
		if (ids && ids !== 'NaN' && ids !== undefined) {
			try {
				ids.forEach(item => {
					db.query(
						'DELETE FROM `Products_Fit_Market` WHERE id = ' + item,
						(err, response) => {
							if (err) throw err
						}
					)
				})
				res.json({
					success: true,
					message: 'Составная(ые) часть(и) успешно удалёна(ны) из БД'
				})
			} catch (error) {
				console.log(error)
				res.json({
					success: false,
					error: error
				})
			}
		} else {
			res.json({
				success: false,
				error: 'Удаляемая позиция не существует в БД или была только что выбрана к добавлению.'
			})
		}
	})
	app.post('/market/quality', async (req, res) => {
		const id = req.body
		let quality = []
		try {
			quality = await db.query(
				'SELECT Market_Rating, Comment FROM `Products_Market` WHERE id = ' + id
			)
			res.json(quality)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/save_rating', async (req, res) => {
		const id = Number(req.body[0])
		const rating = req.body[1]
		try {
			await db.query('UPDATE tsddb.Products_Market SET Market_Rating = ' + rating + ' WHERE id = ' + id,
				(err) => {
					if (err) throw err
					res.json({success: true, rate: rating})
				}
			)
		} catch (err) {
			if (err) throw err
			res.json({ success: false, error: err })
		}
	})
	app.post('/market/save_comment', async (req, res) => {
		const id = Number(req.body[0])
		const comment = JSON.stringify(req.body[1])
		try {
			await db.query('UPDATE tsddb.Products_Market SET `Comment` = ' + comment + ' WHERE id = ' + id,
				(err) => {
					if (err) throw err
					res.json({ success: true, comment: comment })
				}
			)
		} catch (err) {
			if (err) throw err
			res.json({ success: false, error: err })
		}
	})
	app.post('/market/get_sklad', async (req, res) => {
		let [dataSklad, dataSkladIn] = []
		try {
			dataSklad = await db.query(`
				SELECT
				CONCAT(pmar.ART_1C,' (',pmar.PN,')') LINK,
				IFNULL(IF(pms.qty LIKE '%.0%',ROUND(pms.qty),ROUND(pms.qty,2)),'-') OSN,
				IFNULL(IF(pms.qtyser LIKE '%.0%',ROUND(pms.qtyser),ROUND(pms.qtyser,2)),'-') SER,
				IFNULL(IF(pms.qtygp LIKE '%.0%',ROUND(pms.qtygp),ROUND(pms.qtygp,2)),'-') GP
				FROM Products_Market pmar
				LEFT JOIN Products_Market_Sklad pms ON pms.1c=ART_1C
				WHERE pmar.id=` + req.body)
			dataSkladIn = await db.query(`
				SELECT pmars.id,
				CONCAT(pmars.ART_1C,' (',pmars.PN,')') LINK,
				IFNULL(IF(pms.qty LIKE '%.0%',ROUND(pms.qty),ROUND(pms.qty,2)),'-') OSN_IN,
				IFNULL(IF(pms.qtyser LIKE '%.0%',ROUND(pms.qtyser),ROUND(pms.qtyser,2)),'-') SER_IN,
				IFNULL(IF(pms.qtygp LIKE '%.0%',ROUND(pms.qtygp),ROUND(pms.qtygp,2)),'-') GP_IN
				FROM Products_Fit_Market pfm
				LEFT JOIN Products_Market pmars ON pmars.id=pfm.mid
				LEFT JOIN Products_Market_Sklad pms ON pms.1c=ART_1C
				WHERE zid=` + req.body)
			await res.json({ dataSklad, dataSkladIn })
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/get_zakupka', async (req, res) => {
		let [dataZakupka, dataZakupkaIn] = []
		try {
			dataZakupka = await db.query(`
			SELECT CONCAT('ZAKUPKA-', Zk1.issuenum) LINK,
				IFNULL(IF(Zk1.Osn LIKE '%.0%', ROUND(Zk1.Osn), ROUND(Zk1.Osn, 2)), '-') OSN,
				IFNULL(IF(Zk1.Ser LIKE '%.0%', ROUND(Zk1.Ser), ROUND(Zk1.Ser, 2)), '-') SER,
				IFNULL(IF(Zk1.GP LIKE '%.0%', ROUND(Zk1.GP), ROUND(Zk1.GP, 2)), '-') GP
			FROM Products_Market pmar
			LEFT JOIN(
				SELECT ji.issuenum, ji.SUMMARY, ExtractValue(cfvt.TEXTVALUE, '/content/value') Mar, SUM(IFNULL(cfvq.NUMBERVALUE, 0)) QtyZ,
				SUM(CASE
			WHEN cfvo.STRINGVALUE IN(13905, 13906, 15307) AND cfvi.STRINGVALUE NOT IN(18906) THEN IFNULL(cfvq.NUMBERVALUE, 0)
			ELSE NULL
			END) Osn,
				SUM(CASE
			WHEN cfvo.STRINGVALUE IN(13905, 13906, 15307) AND cfvi.STRINGVALUE IN(18906) THEN IFNULL(cfvq.NUMBERVALUE, 0)
			ELSE NULL
			END) Ser,
				SUM(CASE
			WHEN cfvo.STRINGVALUE NOT IN(13905, 13906, 15307) THEN IFNULL(cfvq.NUMBERVALUE, 0)
			ELSE NULL
			END) GP,
				cfvi.STRINGVALUE, COUNT(1), GROUP_CONCAT(cfvi.STRINGVALUE)
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.customfieldvalue cfvt ON cfvt.ISSUE = ji.ID AND cfvt.CUSTOMFIELD = 23215
			LEFT JOIN jiradb.customfieldvalue cfvq ON cfvq.ISSUE = ji.ID AND cfvq.CUSTOMFIELD = 11615
			LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE = ji.ID AND cfvo.CUSTOMFIELD = 13900
			LEFT JOIN jiradb.customfieldvalue cfvi ON cfvi.ISSUE = ji.ID AND cfvi.CUSTOMFIELD = 13904
			WHERE ji.issuetype = 10102 AND ji.issuestatus NOT IN(6, 13729) AND cfvt.ID IS NOT NULL
			GROUP BY Mar) Zk1 ON Zk1.Mar = pmar.id
			WHERE pmar.id = ` + req.body)
			dataZakupkaIn = await db.query(`
				SELECT CONCAT('ZAKUPKA-',Zk1.issuenum) LINK,
				IFNULL(IF(Zk1.Osn LIKE '%.0%',ROUND(Zk1.Osn),ROUND(Zk1.Osn,2)),'-') OSN_IN,
				IFNULL(IF(Zk1.Ser LIKE '%.0%',ROUND(Zk1.Ser),ROUND(Zk1.Ser,2)),'-') SER_IN,
				IFNULL(IF(Zk1.GP LIKE '%.0%',ROUND(Zk1.GP),ROUND(Zk1.GP,2)),'-') GP_IN
				FROM Products_Fit_Market pfm
				LEFT JOIN Products_Market pmars ON pmars.id=pfm.mid
				LEFT JOIN (
				SELECT ji.issuenum, ji.SUMMARY, ExtractValue(cfvt.TEXTVALUE,'/content/value') Mar, SUM(IFNULL(cfvq.NUMBERVALUE,0)) QtyZ,
				SUM(CASE
				WHEN cfvo.STRINGVALUE IN (13905,13906,15307) AND cfvi.STRINGVALUE NOT IN (18906) THEN IFNULL(cfvq.NUMBERVALUE,0)
				ELSE NULL
				END) Osn,
				SUM(CASE
				WHEN cfvo.STRINGVALUE IN (13905,13906,15307) AND cfvi.STRINGVALUE IN (18906) THEN IFNULL(cfvq.NUMBERVALUE,0)
				ELSE NULL
				END) Ser,
				SUM(CASE
				WHEN cfvo.STRINGVALUE NOT IN (13905,13906,15307) THEN IFNULL(cfvq.NUMBERVALUE,0)
				ELSE NULL
				END) GP,
				cfvi.STRINGVALUE, COUNT(1), GROUP_CONCAT(cfvi.STRINGVALUE)
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.customfieldvalue cfvt ON cfvt.ISSUE=ji.ID AND cfvt.CUSTOMFIELD=23215
				LEFT JOIN jiradb.customfieldvalue cfvq ON cfvq.ISSUE=ji.ID AND cfvq.CUSTOMFIELD=11615
				LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=13900
				LEFT JOIN jiradb.customfieldvalue cfvi ON cfvi.ISSUE=ji.ID AND cfvi.CUSTOMFIELD=13904
				WHERE ji.issuetype=10102 AND ji.issuestatus NOT IN (6, 13729) AND cfvt.ID IS NOT NULL
				GROUP BY Mar) Zk1 ON Zk1.Mar=pmars.id
				WHERE Zk1.issuenum IS NOT NULL AND zid=` + req.body)
			await res.json({ dataZakupka, dataZakupkaIn })
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/get_tech_props', async (req, res) => {
		let data = []
		let id = req.body.id
		let typeID = req.body.typeID
		let element = req.body.element
		try {
			data = await db.query(`SELECT IFNULL(tf2.th,tp1.id) elementID, tp1.id mainID, tp1.name TH1, IF(tf2.id IS NULL,NULL,tp2.name) TH2
				FROM Products_Tech_Fit tf1
					LEFT JOIN Products_Tech_Properties tp1 ON tp1.id=tf1.th
					LEFT JOIN Products_Tech_Properties tp2 ON tp2.parent_id=tf1.th
					LEFT JOIN Products_Tech_Fit tf2 ON tf2.level=2 AND tf2.th=tp2.id AND tf2.zip=` + id + `
				WHERE tf1.level=1 AND tf1.element = ` + element + ` AND tf1.zip = ` + typeID + `
				GROUP BY tp1.id`
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
	app.post('/market/get_tech_prop_values', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT id, name FROM Products_Tech_Properties WHERE parent_id = ` + req.body)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/add_tech_prop_value', async (req, res) => {
		const marketID = req.body.marketID
		const valueID = req.body.TechPropValue.id
		const elementID = req.body.item.elementID
		const isTH2 = !!req.body.item.TH2
		console.log(req.body)
		try {
			if (isTH2) {
				await db.query(`UPDATE Products_Tech_Fit SET th = ` + valueID + ` WHERE zip = ` + marketID + ` AND th = ` + elementID,
					(err, result) => {
						if (err) throw err
						res.json({ elementID: valueID })
					}
				)
			} else {
				await db.query(`INSERT INTO Products_Tech_Fit (zip, th, level) VALUES (` + marketID + `, ` + valueID + `, 2)`,
					(err, result) => {
						if (err) throw err
						res.json({ insertId: result.insertId })
					}
				)
			}
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/market/delete_tech_prop_fit', async (req, res) => {
		console.log(req.body)
		try {
			await db.query(`DELETE FROM Products_Tech_Fit WHERE id = ` + req.body,
				(err) => {
					if (err) throw err
					res.json({
						success: true,
						text: 'Привязка ТХ с id ' + req.body + ' успешно удалена.'
					})
				}
			)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
}

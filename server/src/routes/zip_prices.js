const db = require('../db')
const email = require('emailjs')
const config = require('../config/config')
const moment = require('moment')
module.exports = app => {
	app.get('/zip_prices', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT pmr.id marketid, pmr.MAIN_JIRA_ID marketID, pc.name marketCLASS, pt.name marketTYPE, CONCAT(pt.name,' ',pm.NAME) marketNAME, IF(Element_Type=1,GROUP_CONCAT(DISTINCT m.NAME SEPARATOR ", "),pm.NAME) marketMODELS,
					ps.name marketSUPPLIER, pcon.name_ru marketCOND, pmr.ART_1C marketART, PN marketPN, Price_In_Stock marketPRICE,
					K1 RATIO_1, K2 RATIO_2, pcur.sign CUR, pt.id marketTypeID,
						Skl.qtys marketSKLAD, Zak.QtyF marketZAKAZ, abss.qty marketABS, sb.qty marketBEIJING,
						pmr.Update_Date marketDATE, pmr.email marketEMAIL, pmr.Site marketSITE, pmr.Pack marketPack, pmr.Element_Type elementTYPE, pmr.Description marketDESC, pmr.Market_Rating marketRating,
						IF(pfm.zid IS NULL,0,1) marketPARTS, IF(Skl.mids IS NULL,0,1) marketINPARTS
				FROM Products_Market pmr
				LEFT JOIN Products_Supplier ps ON ps.id=pmr.Supplier_ID
				LEFT JOIN Products_Condition pcon ON pcon.id=pmr.Condition
				LEFT JOIN Products_Currency pcur ON pcur.id=pmr.Currency_In
				LEFT JOIN (
				SELECT pm.JIRA_ID, pm.Class_ID, pm.Class_Type_ID, pm.NAME, 1 Element
				FROM Products_Main pm
				UNION ALL
				SELECT m.ID, m.CLASS_ID, m.TYPE_ID, m.NAME, 2
				FROM MODELS m) pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID AND pm.Element=pmr.Element_Type
				LEFT JOIN Products_Class pc ON pc.id=pm.Class_ID
				LEFT JOIN (
				SELECT pt.id, pt.name, 1 Element FROM Products_Type pt
				UNION ALL
				SELECT tpt.id, tpt.name, 2 FROM tsd_prices_type tpt) pt ON pt.id=pm.Class_Type_ID AND pt.Element=pmr.Element_Type
				LEFT JOIN (
				SELECT pmar.id, pmar.ART_1C,
				IF(pms.qty IS NULL AND pms.qtyser IS NULL AND pms.qtygp IS NULL AND pmss.qty IS NULL AND pmss.qtyser IS NULL AND pmss.qtygp IS NULL,
						NULL,
					CONCAT(
						IFNULL(IF(pms.qty LIKE '%.0%',ROUND(pms.qty),ROUND(pms.qty,2)),'-'),' ',
						IFNULL(IF(pms.qtyser LIKE '%.0%',ROUND(pms.qtyser),ROUND(pms.qtyser,2)),'-'),' ',
						IFNULL(IF(pms.qtygp LIKE '%.0%',ROUND(pms.qtygp),ROUND(pms.qtygp,2)),'-'),
						IF(SUM(pmss.qty) IS NULL AND SUM(pmss.qtyser) IS NULL AND SUM(pmss.qtyser) IS NULL,'',
						CONCAT(' (',
						IFNULL(IF(SUM(pmss.qty) LIKE '%.0%',ROUND(SUM(pmss.qty)),ROUND(SUM(pmss.qty),2)),'-'),' ',
						IFNULL(IF(SUM(pmss.qtyser) LIKE '%.0%',ROUND(SUM(pmss.qtyser)),ROUND(SUM(pmss.qtyser),2)),'-'),' ',
						IFNULL(IF(SUM(pmss.qtygp) LIKE '%.0%',ROUND(SUM(pmss.qtygp)),ROUND(SUM(pmss.qtygp),2)),'-'),')')))) qtys,
					GROUP_CONCAT(pfm.mid) mids,
					GROUP_CONCAT(pmars.ART_1C) Arts
				FROM Products_Market pmar
				LEFT JOIN Products_Market_Sklad pms ON pms.market_id=pmar.id
				LEFT JOIN Products_Fit_Market pfm ON pfm.zid=pmar.id
				LEFT JOIN Products_Market pmars ON pmars.id=pfm.mid
				LEFT JOIN Products_Market_Sklad pmss ON pmss.market_id=pmars.id
				GROUP BY pmar.id) Skl ON Skl.id=pmr.id
				LEFT JOIN (
				SELECT pmar.id, IF(Zk1.Osn IS NULL AND Zk1.Ser IS NULL AND Zk1.GP IS NULL AND Zks.Osn IS NULL AND Zks.Ser IS NULL AND Zks.GP IS NULL,
					NULL,
					CONCAT(
						IFNULL(IF(Zk1.Osn LIKE '%.0%',ROUND(Zk1.Osn),ROUND(Zk1.Osn,2)),'-'),' ',
						IFNULL(IF(Zk1.Ser LIKE '%.0%',ROUND(Zk1.Ser),ROUND(Zk1.Ser,2)),'-'),' ',
						IFNULL(IF(Zk1.GP LIKE '%.0%',ROUND(Zk1.GP),ROUND(Zk1.GP,2)),'-'),' ',
						IF(Zks.Osn IS NULL AND Zks.Ser IS NULL AND Zks.GP IS NULL,'',
							CONCAT('(',
								IFNULL(IF(SUM(Zks.Osn) LIKE '%.0%',ROUND(SUM(Zks.Osn)),ROUND(SUM(Zks.Osn),2)),'-'),' ',
								IFNULL(IF(SUM(Zks.Ser) LIKE '%.0%',ROUND(SUM(Zks.Ser)),ROUND(SUM(Zks.Ser),2)),'-'),' ',
								IFNULL(IF(SUM(Zks.GP) LIKE '%.0%',ROUND(SUM(Zks.GP)),ROUND(SUM(Zks.GP),2)),'-'),' ',')'))
						)) QtyF
				FROM Products_Market pmar
				LEFT JOIN (
					SELECT ji.SUMMARY, ExtractValue(cfvt.TEXTVALUE,'/content/value') Mar, SUM(IFNULL(cfvq.NUMBERVALUE,0)) QtyZ,
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
					GROUP BY Mar) Zk1 ON Zk1.Mar=pmar.id
				LEFT JOIN Products_Fit_Market pfm ON pfm.zid=pmar.id
				LEFT JOIN (
					SELECT ji.SUMMARY, ExtractValue(cfvt.TEXTVALUE,'/content/value') Mar, SUM(IFNULL(cfvq.NUMBERVALUE,0)) QtyZ,
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
					WHERE ji.issuetype=10102 AND ji.issuestatus NOT IN (6) AND cfvt.ID IS NOT NULL
				GROUP BY Mar) Zks ON Zks.Mar=pfm.mid
				GROUP BY pmar.id) Zak ON pmr.id=Zak.id
				/* СКЛАД ABS */
				LEFT JOIN (
				SELECT pm.id, IF(pms.qty IS NULL AND pmss.qty IS NULL, NULL,CONCAT(IFNULL(ROUND(pms.qty),'-'),' (',IFNULL(ROUND(pmss.qty),'-'),')')) qty
				FROM Products_Market pm
				LEFT JOIN Products_Market_Sklad_ABS pms ON pms.market_id=pm.id
				LEFT JOIN Products_Fit_Market pfm ON pfm.zid=pm.id
				LEFT JOIN Products_Market pmars ON pmars.id=pfm.mid
				LEFT JOIN Products_Market_Sklad_ABS pmss ON pmss.market_id=pmars.id) abss ON pmr.id=abss.id
				/* КОНЕЦ СКЛАД ABS */
				LEFT JOIN Products_Fit pf ON pf.MAIN_JIRA_ID=pm.JIRA_ID
				LEFT JOIN MODELS m ON m.ID=pf.Model_JIRA_ID
				LEFT JOIN (
				SELECT mid, GROUP_CONCAT(zid) zid
				FROM Products_Fit_Market
				GROUP BY mid) pfm ON pfm.mid=pmr.id
				LEFT JOIN Products_Market_Sklad_Beijing sb ON sb.market=pmr.id
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
	app.get('/zip_prices/get_future_market_id', async (req, res) => {
		const id = await db.query(`SELECT MAX(id) ID FROM Products_Market`)
		res.json({
			success: true,
			lastItemId: id
		})
	})
	app.post('/zip_prices/add', async (req, res) => {
		let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
		let userId = ''
		if (!req.body.PartsId) {
			userId = req.body[0]
			req.body.unshift(myDate)
		} else {
			userId = req.body.ELEMENT[0]
			req.body.ELEMENT.unshift(myDate)
		}
		try {
			await db.query(
				'INSERT INTO `Products_Market` (`Update_Date`, `email`, `Price_In_Stock`, `Currency_In`, K1, K2, `PN`, `Condition`, `Supplier_ID`, `MAIN_JIRA_ID`, `Site`, `ART_1C`, `Pack`, `Element_Type`, `Description`) VALUES (?)',
				[!req.body.PartsId ? req.body : req.body.ELEMENT],
				async (err, response) => {
					if (err) throw err
					if (req.body.PartsId) {
						await req.body.PartsId.forEach(zid => {
							db.query('INSERT INTO Products_Fit_Market (zid, mid) VALUES (' + zid + ',' + response.insertId + ')',
								(error) => {
									if (error) throw error
								}
							)
						})
					}
					console.log('Добавлен новый Маркет: ' + response.insertId)
					res.json({
						success: ' Данные успешно добавлены! ',
						lastItemId: response.insertId
					})
					var server = email.server.connect(config.email)
					server.send(
						{
							text:
								myDate +
								'\n\n - Добавлена новая позиция в Маркет с параметрами: \n' +
								JSON.stringify(req.body, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
							subject:
								'Пользователь ' +
								userId +
								' добавил новую позицию в таблицу `Products_Market`'
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
	app.post('/zip_prices/edit', async (req, res) => {
		let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
		let userId = ''
		let elementId = null
		userId = req.body[0]
		req.body.unshift(myDate)
		elementId = req.body[req.body.length - 1]

		console.log(req.body)
		try {
			await db.query(
				'UPDATE `Products_Market` SET `Update_Date` = ?, `email` = ?, `Price_In_Stock` = ?, `Currency_In` = ?, K1 = ?, K2 = ?, `PN` = ?, `Condition` = ?, `Supplier_ID` = ?, `MAIN_JIRA_ID` = ?, `Site` = ?, `ART_1C` = ?, Pack = ?, Description = ?, `Element_Type` = ? WHERE `id` = ?',
				!req.body.PartsId ? req.body : req.body.ELEMENT,
				async (err, response) => {
					if (err) throw err
					res.send(' Данные успешно изменены. ')
					var server = email.server.connect(config.email)
					server.send(
						{
							text:
								myDate +
								'\n\n  - Редактирование Маркета (' + elementId + '), новые данные: \n' +
								JSON.stringify(req.body, null, '\t'),
							from: '<robot@tsd-group.ru>',
							to: '<epf@tsd-group.ru>, <a.tyumkin@tsd-group.ru>, ' + userId,
							subject:
								'Пользователь ' +
								userId +
								' внёс корректировки в таблицу `Products_Market`'
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
	app.post('/zip_prices/setrate', async (req, res) => {
		console.log(req.body)

		try {
			await db.query(
				'UPDATE `Products_Currency` SET rate = ? WHERE id = 2',
				req.body[0],
				(err, response) => {
					if (err) throw err

					db.query(
						'UPDATE `Products_Currency` SET rate = ? WHERE id = 3',
						req.body[1],
						(err, response) => {
							if (err) throw err
							res.send(' Курс успешно установлен!  ')
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
	app.get('/zip_prices/editprices', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT GROUP_CONCAT(REPLACE(ExtractValue(cfv.TEXTVALUE,'/content/value'),' ',',')) AS zID
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=22502
				WHERE ji.PROJECT=14800 AND ji.issuetype=12401 AND ji.issuestatus IN (1,3) AND cfv.ID IS NOT NULL`
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
	app.post('/zip_prices/del', async (req, res) => {
		let id = req.body[0]
		let userId = req.body[1]
		let myDate = moment(new Date()).format('YYYY.MM.DD HH:mm')
		console.log('Удаление позиции Маркета с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `Products_Market` WHERE id = ?',
				id,
				async (err, response) => {
					if (err) throw err
					await db.query('DELETE FROM `Products_Fit_Market` WHERE mid = ?',
						id,
						err => {
							if (err) throw err
							res.send(
								'позиция Маркета с id ' +
								id +
								' успешно удалёна!'
							)
							var server = email.server.connect(config.email)
							server.send(
								{
									text:
										myDate +
										' - Удалена позиция Маркета с id: ' + id,
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
							console.log('позиция Маркета с id ' + id + ' успешно удалёна.')
						}
					)
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
	app.post('/zip_prices/del/check', async (req, res) => {
		let id = req.body[0]
		console.log('Проверка позиции с id в текущих ремонтах: ' + id)
		try {
			const check = await db.query(
				`SELECT GROUP_CONCAT(ji.ID) zID, COUNT(1) Qty
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=22502
				WHERE ji.PROJECT=14800 AND ji.issuetype=12401 AND ji.issuestatus!=6 AND cfv.ID IS NOT NULL AND TEXTVALUE LIKE ('%>` + id + `<%')`
			)
			res.json(check)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

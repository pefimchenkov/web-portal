const db = require('../db')

module.exports = app => {
	app.get('/deals/list', async (req, res) => {
		let data = []
		try {
			data = await db.query(`
			SELECT CAST(IFNULL(CONCAT(1cb.id,jira.ID),1cb.id) AS DECIMAL(18,0)) UniqueId, 1cb.id id, client_1c, lp.name client_db, lpt.name client_1c_db, bill_1c, bill_date, bill_base, bill_base_date,
				bill_parent, bill_parent_date, bill_reporter, firm, project_1c, rnh, ready, bill_sum, bill_pay, bill_ship,
				jira.JiraKey jira_id, DATE(jira.CREATED) jira_date, jira.SUMMARY, jira.NAME jira_client, jira.pname STATUS, jira.STRINGVALUE jira_bill, jira.SM_SERV jira_sm,
				jira.Litso, jira.Resolve, jira.MANAGER, jira.LEAD_ENG, jira.Dep, jira.Cmmnt, Dupl.qty, Zak.Zakupka,
			CASE
			WHEN Zak.Oplata LIKE '%Red%' THEN 'Red'
			WHEN Zak.Oplata LIKE '%Yellow%' THEN 'Yellow'
			WHEN Zak.Oplata LIKE '%Green%' THEN 'Green'
			END StatusOpl,
			IF(ships_info NOT LIKE '[%',-1000,(UNIX_TIMESTAMP(DATE(NOW()))-UNIX_TIMESTAMP(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(ships_info,'[',-1),' ',-2),' ',1)))/86400-IFNULL(jira.Otsr,0)) Delay,
			jira.Spec, jira.Cont,
			LENGTH(ships_info)-LENGTH(REPLACE(ships_info,'[','')) ShipsQty,
			SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(ships_info,'[',-1),' ',2),' ',1) LastShip,
			SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(ships_info,'[',-1),' ',-2),' ',1) LastShipDate,
			REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(ships_info,'[',-1),' ',-2),' ',-1),']','') LastShipSum
			FROM 1C_Bills 1cb
			LEFT JOIN LegPers_1C lpt ON lpt.1c_id = 1cb.client_1c
			LEFT JOIN LegPers lp ON lp.1c_id=1cb.client_1c
			LEFT JOIN
			(SELECT ji.ID, CONCAT(p.pkey,'-',ji.issuenum) JiraKey, ji.SUMMARY, ji.issuestatus, ist.pname, cfv.STRINGVALUE, cl.NAME,
				ji.CREATED, cum.display_name MANAGER, cusm.display_name SM_SERV, GROUP_CONCAT(cuvi.display_name) LEAD_ENG, cfvz.TEXTVALUE Zadanie, zad.AUTHOR ZadAvtor, zad.CREATED ZadDate, cfvot.TEXTVALUE Otvet, ot.AUTHOR OtAvtor, ot.CREATED OtDate, cfvr.STRINGVALUE Reshen,
				cfvol.STRINGVALUE Litso, st.Dep,
				CASE
				WHEN cfvr.STRINGVALUE IS NOT NULL THEN 'Решён'
				WHEN IFNULL(zad.CREATED,0) > IFNULL(ot.CREATED,0) THEN 'Не отвечен'
				WHEN IFNULL(zad.CREATED,0) < IFNULL(ot.CREATED,0) THEN 'Отвечен'
				END Resolve,
			CASE
				WHEN IFNULL(zad.CREATED,0) > IFNULL(ot.CREATED,0) THEN cfvz.TEXTVALUE
				WHEN IFNULL(zad.CREATED,0) < IFNULL(ot.CREATED,0) THEN cfvot.TEXTVALUE
				END Cmmnt,
			IF(ExtractValue(cfsp.TEXTVALUE,'/content/value') LIKE '% %','Red','') Spec,
			ExtractValue(cfsp.TEXTVALUE,'/content/value') SpecS,
			IF(il.SOURCE IS NULL,NULL,IF(cfcs.NUMBERVALUE IS NULL,'Bold','Italic')) Cont,
			cfcs.NUMBERVALUE Otsr
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
			LEFT JOIN jiradb.issuestatus ist ON ji.issuestatus=ist.ID
			LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=10900
			LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cfvz ON cfvz.ISSUE=ji.ID AND cfvz.CUSTOMFIELD=23302
			LEFT JOIN jiradb.customfieldvalue cfvot ON cfvot.ISSUE=ji.ID AND cfvot.CUSTOMFIELD=23303
			LEFT JOIN jiradb.customfieldvalue cfvol ON cfvol.ISSUE=ji.ID AND cfvol.CUSTOMFIELD=23304
			LEFT JOIN jiradb.customfieldvalue cfvr ON cfvr.ISSUE=ji.ID AND cfvr.CUSTOMFIELD=23305
			LEFT JOIN CLIENTS cl ON cl.ID=ExtractValue(cfvo.TEXTVALUE,'/content/value')
			LEFT JOIN jiradb.cwd_user cum ON cum.user_name=cl.MANAGER
			LEFT JOIN jiradb.cwd_user cusm ON cusm.user_name=cl.SM_SERV
			LEFT JOIN STAFF st ON st.user=cfvol.STRINGVALUE
			LEFT JOIN
			(SELECT ch.issueid, ch.CREATED, ch.NEWSTRING, ch.AUTHOR FROM
				(SELECT issueid, CREATED, NEWSTRING, AUTHOR
				FROM jiradb.changegroup chg
				LEFT JOIN jiradb.changeitem chi ON chi.groupid=chg.ID
				WHERE chi.FIELD='Задание от руководителя'
				ORDER BY CREATED DESC) ch
			GROUP BY ch.issueid) zad ON zad.issueid=ji.ID
			LEFT JOIN
			(SELECT ch.issueid, ch.CREATED, ch.NEWSTRING, ch.AUTHOR FROM
				(SELECT issueid, CREATED, NEWSTRING, AUTHOR
				FROM jiradb.changegroup chg
				LEFT JOIN jiradb.changeitem chi ON chi.groupid=chg.ID
				WHERE chi.FIELD='Комментарий ответственного лица'
				ORDER BY CREATED DESC) ch
			GROUP BY ch.issueid) ot ON ot.issueid=ji.ID
			LEFT JOIN jiradb.customfieldvalue cfsp ON ji.ID=cfsp.ISSUE ANd cfsp.CUSTOMFIELD=22608
			LEFT JOIN jiradb.jiraissue jis ON jis.ID=SUBSTRING_INDEX(ExtractValue(cfsp.TEXTVALUE,'/content/value'),' ',1)
			LEFT JOIN jiradb.customfieldvalue cfvi ON cfvi.ISSUE=jis.ID AND cfvi.CUSTOMFIELD=21926
			LEFT JOIN jiradb.cwd_user cuvi ON cuvi.user_name=cfvi.STRINGVALUE
			LEFT JOIN jiradb.issuelink il ON il.LINKTYPE=10100 AND il.DESTINATION=SUBSTRING_INDEX(ExtractValue(cfsp.TEXTVALUE,'/content/value'),' ',1)
			LEFT JOIN jiradb.jiraissue jic ON jic.ID=SOURCE
			LEFT JOIN jiradb.customfieldvalue cfcs ON cfcs.ISSUE=jic.ID AND cfcs.CUSTOMFIELD=23400
			WHERE ji.issuetype IN (10, 12300, 12, 10201, 12400, 14200) AND ji.CREATED >= '2019-08-01'
			GROUP BY ji.ID) jira ON jira.STRINGVALUE=1cb.bill_1c
			LEFT JOIN
			(SELECT bill_1c bill, COUNT(1) qty FROM
			(SELECT cfv.STRINGVALUE
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=10900
			WHERE ji.issuetype IN (10, 12300, 12, 10201, 12400, 14200) AND ji.CREATED >= '2019-08-01') Jira
			LEFT JOIN 1C_Bills 1cb ON Jira.STRINGVALUE=1cb.bill_1c
			WHERE bill_1c IS NOT NULL
			GROUP BY 1 HAVING COUNT(1)>1
			ORDER BY 2 DESC) Dupl ON Dupl.bill=1cb.bill_1c
			LEFT JOIN
			(SELECT GROUP_CONCAT(Zakupki.IDs) IDs, GROUP_CONCAT(Zakupki.Zakupka) Zakupka, Zakupki.Bill Bill, GROUP_CONCAT(Zakupki.Str) Str,
			GROUP_CONCAT(DISTINCT Zakupki.Oplata) Oplata
			FROM
			(SELECT ji.ID IDs, CONCAT('ZAKUPKA-',ji.issuenum) Zakupka, cf1с.STRINGVALUE Bill, cfop.STRINGVALUE Str,
			CASE
			WHEN (cfop.STRINGVALUE IS NULL OR cfop.STRINGVALUE=20440) THEN 'Red'
			WHEN (cfop.STRINGVALUE=20437) THEN 'Green'
			ELSE 'Yellow'
			END Oplata
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.customfieldvalue cf1с ON cf1с.ISSUE=ji.ID AND cf1с.CUSTOMFIELD=10900
			LEFT JOIN jiradb.customfieldvalue cfop ON cfop.ISSUE=ji.ID AND cfop.CUSTOMFIELD=10909
			WHERE issuetype IN (10102) AND cf1с.STRINGVALUE IS NOT NULL) Zakupki
			GROUP BY Zakupki.Bill) Zak ON Zak.Bill=bill_1c
			`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/deals_no_bills', async (req, res) => {
		try {
			const data = await db.query(`
			SELECT ji.ID UniqueId, CONCAT(p.pkey,'-',ji.issuenum) jira_id, ji.SUMMARY, it.pname IssueType, ji.issuestatus, ist.pname STATUS, cfv.STRINGVALUE jira_bill, cl.NAME jira_client,
					ji.CREATED jira_date, cum.display_name MANAGER, cusm.display_name jira_sm, GROUP_CONCAT(cuvi.display_name) LEAD_ENG,
				IF(ExtractValue(cfsp.TEXTVALUE,'/content/value') LIKE '% %','Red','') Spec,
				cfvz.TEXTVALUE Zadanie, zad.AUTHOR ZadAvtor, zad.CREATED ZadDate, cfvot.TEXTVALUE Otvet, ot.AUTHOR OtAvtor, ot.CREATED OtDate, cfvr.STRINGVALUE Reshen,
					cfvol.STRINGVALUE Litso, st.Dep,
					CASE
					WHEN cfvr.STRINGVALUE IS NOT NULL THEN 'Решён'
					WHEN IFNULL(zad.CREATED,0) > IFNULL(ot.CREATED,0) THEN 'Не отвечен'
					WHEN IFNULL(zad.CREATED,0) < IFNULL(ot.CREATED,0) THEN 'Отвечен'
					END Resolve,
				CASE
					WHEN IFNULL(zad.CREATED,0) > IFNULL(ot.CREATED,0) THEN cfvz.TEXTVALUE
					WHEN IFNULL(zad.CREATED,0) < IFNULL(ot.CREATED,0) THEN cfvot.TEXTVALUE
					END Cmmnt
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
				LEFT JOIN jiradb.issuestatus ist ON ji.issuestatus=ist.ID
				LEFT JOIN jiradb.issuetype it ON it.ID=ji.issuetype
				LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=10900
				LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=11901
				LEFT JOIN jiradb.customfieldvalue cfvz ON cfvz.ISSUE=ji.ID AND cfvz.CUSTOMFIELD=23302
				LEFT JOIN jiradb.customfieldvalue cfvot ON cfvot.ISSUE=ji.ID AND cfvot.CUSTOMFIELD=23303
				LEFT JOIN jiradb.customfieldvalue cfvol ON cfvol.ISSUE=ji.ID AND cfvol.CUSTOMFIELD=23304
				LEFT JOIN jiradb.customfieldvalue cfvr ON cfvr.ISSUE=ji.ID AND cfvr.CUSTOMFIELD=23305
				LEFT JOIN CLIENTS cl ON cl.ID=ExtractValue(cfvo.TEXTVALUE,'/content/value')
				LEFT JOIN jiradb.cwd_user cum ON cum.user_name=cl.MANAGER
				LEFT JOIN jiradb.cwd_user cusm ON cusm.user_name=cl.SM_SERV
				LEFT JOIN STAFF st ON st.user=cfvol.STRINGVALUE
				LEFT JOIN
				(SELECT ch.issueid, ch.CREATED, ch.NEWSTRING, ch.AUTHOR FROM
					(SELECT issueid, CREATED, NEWSTRING, AUTHOR
					FROM jiradb.changegroup chg
					LEFT JOIN jiradb.changeitem chi ON chi.groupid=chg.ID
					WHERE chi.FIELD='Задание от руководителя'
					ORDER BY CREATED DESC) ch
				GROUP BY ch.issueid) zad ON zad.issueid=ji.ID
				LEFT JOIN
				(SELECT ch.issueid, ch.CREATED, ch.NEWSTRING, ch.AUTHOR FROM
					(SELECT issueid, CREATED, NEWSTRING, AUTHOR
					FROM jiradb.changegroup chg
					LEFT JOIN jiradb.changeitem chi ON chi.groupid=chg.ID
					WHERE chi.FIELD='Комментарий ответственного лица'
					ORDER BY CREATED DESC) ch
				GROUP BY ch.issueid) ot ON ot.issueid=ji.ID
				LEFT JOIN jiradb.customfieldvalue cfsp ON ji.ID=cfsp.ISSUE ANd cfsp.CUSTOMFIELD=22608
				LEFT JOIN jiradb.jiraissue jis ON jis.ID=SUBSTRING_INDEX(ExtractValue(cfsp.TEXTVALUE,'/content/value'),' ',1)
				LEFT JOIN jiradb.customfieldvalue cfvi ON cfvi.ISSUE=jis.ID AND cfvi.CUSTOMFIELD=21926
				LEFT JOIN jiradb.cwd_user cuvi ON cuvi.user_name=cfvi.STRINGVALUE
				WHERE ji.issuetype IN (10, 12300, 12, 10201, 12400, 14200) AND ji.CREATED >= '2019-08-01'
				AND (cfv.STRINGVALUE NOT IN (SELECT bill_1c FROM 1C_Bills) OR cfv.STRINGVALUE IS NULL)
				GROUP BY ji.ID
			`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/budget/income', async (req, res) => {
		const period = req.body
		try {
			const data = await db.query(
				`SELECT
					ROUND(SUM(Wait*salary),2) zp_red, ROUND(SUM(Wait*purchase),2) zak_red, ROUND(SUM(Wait*credit),2) cred_red, ROUND(SUM(Wait*office),2) ofis_red, ROUND(SUM(Wait*other),2) other_red,
					ROUND(SUM(Done*salary),2) zp_green, ROUND(SUM(Done*purchase),2) zak_green, ROUND(SUM(Done*credit),2) cred_green, ROUND(SUM(Done*office),2) ofis_green, ROUND(SUM(Done*other),2) other_green
				FROM
				(SELECT project_1c, SUM(bill_sum) Wait, SUM(bill_pay) Done
					FROM tsddb.1C_Bills
					WHERE MONTH(bill_date) = ${period} AND YEAR(bill_date)=2019 AND firm = 'ТСД-СЕРВИС (ВЕКТОР)') Pay
				LEFT JOIN tsddb.Budget_Plans bp ON bp.name=project_1c`
			)
			await res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error.message
			})
		}
	})
	app.post('/budget/fact', async (req, res) => {
		const period = req.body
		try {
			const data = await db.query(
				`SELECT
				SUM(IF(jira_code=3 AND proj.yellow=1,pay_sum,0)) salary,
				SUM(IF(jira_code=4 AND proj.yellow=1,pay_sum,0)) purchase,
				SUM(IF(jira_code=5 AND proj.yellow=1,pay_sum,0)) credit,
				SUM(IF(jira_code=6 AND proj.yellow=1,pay_sum,0)) office,
				SUM(IF(jira_code=7 AND proj.yellow=1,pay_sum,0)) other
				FROM 1C_Pays pay
				LEFT JOIN 1C_Projects proj ON pay.project_1c_code=proj.1c_code
				LEFT JOIN 1C_Cost_Items ci ON pay.cost_item_code=ci.cost_item_code
				LEFT JOIN
				(SELECT TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION
				FROM information_schema.COLUMNS
				WHERE TABLE_NAME='Budget_Plans' AND TABLE_SCHEMA='tsddb') Jira ON Jira.ORDINAL_POSITION=jira_code
				WHERE YEAR(pay.pay_date)=2019 AND MONTH(pay.pay_date) = ${period}`
			)
			await res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error.message
			})
		}
	})
	app.post('/budget/income_prev', async (req, res) => {
		// const period = req.body
		try {
			const data = await db.query(
				`SELECT
					ROUND(SUM(Dolg*salary),2) zp_darkred, ROUND(SUM(Dolg*purchase),2) zak_darkred, ROUND(SUM(Dolg*credit),2) cred_darkred, ROUND(SUM(Dolg*office),2) ofis_darkred, ROUND(SUM(Dolg*other),2) other_darkred,
					ROUND(SUM(Wait*salary),2) zp_orange, ROUND(SUM(Wait*purchase),2) zak_orange, ROUND(SUM(Wait*credit),2) cred_orange, ROUND(SUM(Wait*office),2) ofis_orange, ROUND(SUM(Wait*other),2) other_orange,
					ROUND(SUM(Done*salary),2) zp_green, ROUND(SUM(Done*purchase),2) zak_green, ROUND(SUM(Done*credit),2) cred_green, ROUND(SUM(Done*office),2) ofis_green, ROUND(SUM(Done*other),2) other_green,
					ROUND(SUM(Ship*salary),2) zp_brown, ROUND(SUM(Ship*purchase),2) zak_brown, ROUND(SUM(Ship*credit),2) cred_brown, ROUND(SUM(Ship*office),2) ofis_brown, ROUND(SUM(Ship*other),2) other_brown
					FROM (
					SELECT project_1c, SUM(IF(bill_ship-bill_pay>0,bill_ship-bill_pay,0)) Dolg, IF(bill_ship-bill_pay>0,IF(bill_sum-bill_ship<0,0,bill_sum-bill_ship),IF(bill_sum-bill_pay<0,0,bill_sum-bill_pay)) Wait,
					SUM(bill_pay) Done, SUM(bill_ship) Ship
					FROM tsddb.1C_Bills
					WHERE bill_date < '2019-10-01' AND bill_pay-bill_sum<0 AND firm='ТСД-СЕРВИС (ВЕКТОР)'
					GROUP BY project_1c) Pay
					LEFT JOIN tsddb.Budget_Plans bp ON bp.name=project_1c`
			)
			await res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error.message
			})
		}
	})
	app.post('/budget/plans', async (req, res) => {
		const period = req.body
		try {
			const data = await db.query(
				`SELECT salary zp_gray, purchase zak_gray, credit cred_gray, office ofis_gray, other other_gray
				FROM tsddb.Budget_Plans
				WHERE name='Планы' AND period = ${period}`
			)
			console.log(data)
			await res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error.message
			})
		}
	})
	app.post('/deals/add_budget', async (req, res) => {
		let PROJECT = ''
		if (req.body.PROJECT === 'Зарплата') PROJECT = 'zp_'
		if (req.body.PROJECT === 'Закупка') PROJECT = 'zakupka_'
		if (req.body.PROJECT === 'Кредит') PROJECT = 'credit_'
		if (req.body.PROJECT === 'Другое') PROJECT = 'other_'

		const BALANCE = parseInt(req.body.BALANCE)
		const WEEK = parseInt(req.body.DATE.ID)
		console.log(BALANCE)
		console.log(WEEK)
		const BILL = JSON.stringify(req.body.BILL)

		try {
			const data = await db.query('SELECT * FROM `BUDGET` WHERE bill_1c = ' + BILL)
			if (data.length > 0) {
				await db.query('UPDATE `BUDGET` SET ' + PROJECT + 'sum = ' + BALANCE + ', ' + PROJECT + 'date = ' + WEEK + ' WHERE bill_1c = ' + BILL,
					(err, response) => {
						if (err) throw err
						res.json({ success: true, actions: 'update' })
					}
				)
			} else {
				await db.query('INSERT INTO `BUDGET` (`bill_1c`, ' + PROJECT + 'sum, ' + PROJECT + 'date) VALUES (' + BILL + ', ' + BALANCE + ', ' + WEEK + ')',
					(err, response) => {
						if (err) throw err
						res.json({ success: true, actions: 'insert' })
					}
				)
			}
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/deals/delete_debit', async (req, res) => {
		let PROJECT = ''
		const BILL = JSON.stringify(req.body.BILL)
		const BALANCE = 0
		const WEEK = 0
		if (req.body.DEBIT.name === 'Зарплата') PROJECT = 'zp_'
		if (req.body.DEBIT.name === 'Закупка') PROJECT = 'zakupka_'
		if (req.body.DEBIT.name === 'Кредит') PROJECT = 'credit_'
		if (req.body.DEBIT.name === 'Другое') PROJECT = 'other_'
		try {
			await db.query('UPDATE `BUDGET` SET ' + PROJECT + 'sum = ' + BALANCE + ', ' + PROJECT + 'date = ' + WEEK + ' WHERE bill_1c = ' + BILL,
				(err, response) => {
					if (err) throw err
					res.json({ success: true, message: 'Удаление прошло успешно.' })
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
	app.post('/deals/debit_done', async (req, res) => {
		const zpDone = (req.body.zp_done === true || req.body.zp_done === 1) ? 1 : 0
		const zakupkaDone = (req.body.zakupka_done === true || req.body.zakupka_done === 1) ? 1 : 0
		const creditDone = (req.body.credit_done === true || req.body.credit_done === 1) ? 1 : 0
		const otherDone = (req.body.other_done === true || req.body.other_done === 1) ? 1 : 0
		const bill1C = JSON.stringify(req.body.bill_1c)
		const responsible = JSON.stringify(req.body.responsible)
		const date = JSON.stringify(req.body.date)

		try {
			await db.query('UPDATE BUDGET SET `zp_done` = ' + zpDone + ', `zakupka_done` = ' + zakupkaDone + ', `credit_done` = ' + creditDone + ', `other_done` = ' + otherDone + ', `responsible` = ' + responsible + ', `date` = ' + date + ' WHERE `bill_1c` = ' + bill1C,
				(err, response) => {
					if (err) throw err
					res.json({ success: true })
				})
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	/* app.get('/budget', async (req, res) => {
		let data = []
		try {
			data = await db.query(`
				SELECT b.id, b.bill_1c, c.bill_sum, c.bill_pay, b.zp_sum, b.zp_date, b.zp_done,
					b.zakupka_sum, b.zakupka_date, b.zakupka_done,
					b.credit_sum, b.credit_date, b.credit_done,
					b.other_sum, b.other_date, b.other_done,
					b.responsible, b.date
				FROM BUDGET b
				LEFT JOIN 1C_Bills c ON c.bill_1c=b.bill_1c`
			)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	}) */
	app.get('/budget/list_prev', async (req, res) => {
		try {
			const data = await db.query(`
			SELECT 1cb.id id, client_1c, project_1c, lp.name, bill_1c, DATE(bill_date) bill_date, firm, rnh, bill_sum, bill_pay, bill_ship,
				IF(bill_ship-bill_pay>0,bill_ship-bill_pay,0) Dolg,
			ROUND(IFNULL(IF(bill_ship-bill_pay>0,bill_ship-bill_pay,0)*(bp.salary+bp.purchase+bp.credit+bp.office+bp.other),0),2) DolgSR,
			IF((bp.salary+bp.purchase+bp.credit+bp.office+bp.other) IS NULL OR (bp.salary+bp.purchase+bp.credit+bp.office+bp.other)<1,'bold',0) K,
			IF(bill_ship-bill_pay>0,bill_sum-bill_ship,bill_sum-bill_pay) Wait,
				IF(bill_ship-bill_pay>0,IF(bill_sum-bill_ship<0,0,bill_sum-bill_ship),IF(bill_sum-bill_pay<0,0,bill_sum-bill_pay)) WaitNew,
				CONCAT(GROUP_CONCAT(jira.JiraKey),' (',GROUP_CONCAT(DISTINCT jira.NAME),')') Jira
				FROM 1C_Bills 1cb
			LEFT JOIN Budget_Plans bp ON bp.name=project_1c
				LEFT JOIN LegPers lp ON lp.1c_id=1cb.client_1c
				LEFT JOIN
				(SELECT ji.ID, CONCAT(p.pkey,'-',ji.issuenum) JiraKey, ji.SUMMARY, ji.issuestatus, ist.pname, cfv.STRINGVALUE, cl.NAME,
				ji.CREATED, cl.SM_SERV
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
				LEFT JOIN jiradb.issuestatus ist ON ji.issuestatus=ist.ID
				LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=10900
				LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=11901
				LEFT JOIN CLIENTS cl ON cl.ID=ExtractValue(cfvo.TEXTVALUE,'/content/value')
				WHERE ji.issuetype IN (10, 12300, 12, 10201, 12400, 14200) AND ji.CREATED >= '2019-08-01') jira ON jira.STRINGVALUE=1cb.bill_1c
			WHERE bill_date < '2019-10-01'
			GROUP BY bill_1c
				ORDER BY 1`
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
	app.get('/budget/list', async (req, res) => {
		try {
			const data = await db.query(`SELECT 1cb.id id, client_1c, lp.name, bill_1c, DATE(bill_date) bill_date, rnh, bill_sum, bill_pay, firm, project_1c,
				CONCAT(GROUP_CONCAT(jira.JiraKey),' (',GROUP_CONCAT(DISTINCT jira.NAME),')') Jira
				FROM 1C_Bills 1cb
				LEFT JOIN LegPers lp ON lp.1c_id=1cb.client_1c
				LEFT JOIN
				(SELECT ji.ID, CONCAT(p.pkey,'-',ji.issuenum) JiraKey, ji.SUMMARY, ji.issuestatus, ist.pname, cfv.STRINGVALUE, cl.NAME,
				ji.CREATED, cl.SM_SERV
				FROM jiradb.jiraissue ji
				LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
				LEFT JOIN jiradb.issuestatus ist ON ji.issuestatus=ist.ID
				LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=10900
				LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=11901
				LEFT JOIN CLIENTS cl ON cl.ID=ExtractValue(cfvo.TEXTVALUE,'/content/value')
				WHERE ji.issuetype IN (10, 12300, 12, 10201, 12400, 14200) AND ji.CREATED >= '2019-08-01') jira ON jira.STRINGVALUE=1cb.bill_1c
			WHERE bill_date >= '2019-10-01'
			GROUP BY bill_1c
				ORDER BY 1`
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
	app.get('/budget/pays', async (req, res) => {
		try {
			const data = await db.query(`
					SELECT pay.id, pay.client_1c, pay.pay_1c, pay.pay_date, pay.currency_code, pay.pay_sum, pay.account_pay_sum, proj.name project_name, ci.name one_c_name, ci.jira_name, proj.yellow, pay.fact_pay_date
					FROM 1C_Pays pay
					LEFT JOIN 1C_Projects proj ON pay.project_1c_code=proj.1c_code
					LEFT JOIN 1C_Cost_Items ci ON pay.cost_item_code=ci.cost_item_code
					LEFT JOIN
					(SELECT TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION
					FROM information_schema.COLUMNS
					WHERE TABLE_NAME='Budget_Plans' AND TABLE_SCHEMA='tsddb') Jira ON Jira.ORDINAL_POSITION=jira_code
				`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/weeks', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT ID, DATE FROM calendar_weeks_2019`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
}

const db = require('../db')
module.exports = app => {
	/*  новая интерпретация! */
	const clients = require('../controllers/clients.controller.js')

	app.get('/client/crm/editable', clients.fetchEditableCRM)
	app.get('/client/crm/readonly', clients.fetchReadonlyCRM)
	app.get('/client/crm/legpers', clients.fetchLegPers)
	app.get('/client/crm/clientsdomains', clients.fetchClientsDomains)
	app.get('/client/crm/get_percent', clients.fetchPercentCRM)
	app.put('/client/crm/curator', clients.updateCurator)
	app.put('/client/crm/manager', clients.updateManager)
	app.put('/client/crm/AIDC_SALE', clients.updateAIDC_SALE)
	app.put('/client/crm/AIDC_SALE_ZIP', clients.updateAIDC_SALE_ZIP)
	app.put('/client/crm/AIDC_SERV', clients.updateAIDC_SERV)
	app.put('/client/crm/IT', clients.updateIT)
	app.put('/client/crm/activate', clients.activateCRM)
	app.put('/client/crm/deactivate', clients.deactivateCRM)
	app.post('/client/crm/add_legpers', clients.addLegPers)
	app.put('/client/crm/update_legpers', clients.updateLegPers)
	app.delete('/client/crm/delete_legpers', clients.deleteLegPers)
	app.post('/client/crm/add_domains', clients.addDomains)
	app.put('/client/crm/update_domains', clients.updateDomains)
	app.delete('/client/crm/delete_domains', clients.deleteDomains)
	app.put('/client/crm/set_percent', clients.setPercent)
	app.put('/client/crm/set_custom_percent', clients.setCustomPercent)
	app.put('/client/crm/delete_custom_percent', clients.deleteCustomPercent)

	app.get('/clients', async (req, res) => {
		let data = []
		try {
			data = await db.query(`
				SELECT
				C.ID, C.NAME, GROUP_CONCAT(DISTINCT LP.name SEPARATOR ", ") LEGPERS, C.PROJECT, C.MANAGER, C.HEAD_MANAGER, C.CRM,
				C.AIDC_SALE, C.AIDC_SALE_ZIP, C.AIDC_SERV, C.IT, OM_SALE, OM_SALE_ZIP, OM_SERV, OM_IT,
				cp.AIDC_SALE P_SALE, cp.AIDC_SALE_ZIP P_SALE_ZIP, cp.AIDC_SERV P_SERV, cp.IT P_IT,
				SUM(IF(1cb.project_1c IN ('Продажи'),1cj.doc_sum,0)) FACT_AIDC_SALE,
				SUM(IF(1cb.project_1c IN ('Продажи (ЗИП)','Продажи (Склад)'),1cj.doc_sum,0)) FACT_AIDC_SALE_ZIP,
				SUM(IF(1cb.project_1c IN ('Ремонт','Сервисный контракт','Ремонт (ФИКС)','Аренда Оборудования','Сервисный контракт (ФИКС)','СКС'),1cj.doc_sum,0)) FACT_AIDC_SERV,
				SUM(IF(1cb.project_1c IN ('IT'),1cj.doc_sum,0)) FACT_IT,
				SUM(1cj.doc_sum) FACT,
				1cj.doc_date,
				CONCAT(IF(C.AIDC_SALE IS NULL AND SUM(IF(1cb.project_1c IN ('Продажи'),1cj.doc_sum,0))>0,'sale ',''),
				IF(C.AIDC_SALE_ZIP IS NULL AND SUM(IF(1cb.project_1c IN ('Продажи (ЗИП)','Продажи (Склад)'),1cj.doc_sum,0))>0,'sale_zip ',''),
				IF(C.AIDC_SERV IS NULL AND SUM(IF(1cb.project_1c IN ('Ремонт','Сервисный контракт','Ремонт (ФИКС)','Аренда Оборудования','Сервисный контракт (ФИКС)','СКС'),1cj.doc_sum,0))>0,'serv ',''),
				IF(C.IT IS NULL AND SUM(IF(1cb.project_1c IN ('IT'),1cj.doc_sum,0))>0,'it','')) marker
				FROM CLIENTS C
				LEFT JOIN LegPers LP ON LP.client_id = C.ID
				LEFT JOIN crm_percents cp ON cp.crm_id=C.CRM_TYPE
				LEFT JOIN 1C_Bills 1cb ON 1cb.client_1c=LP.1c_id
				LEFT JOIN 1C_Journal 1cj ON 1cj.doc_base_num=1cb.bill_1c AND 1cj.doc_type='Реализация' AND (1cj.doc_date >= '2019-10-01' OR 1cj.doc_date IS NULL)
				WHERE C.PROJECT != 'DIVISION'
				GROUP BY C.ID
				ORDER BY C.ID
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
	app.post('/clients/add', async (req, res) => {
		let arr = []
		let LEGPERS = "'" + req.body.LEGPERS + "'"
		let NAME = "'" + req.body.NAME + "'"
		let ART_1C = "'" + req.body.ART_1C + "'"
		Object.entries(req.body).forEach(
			([key, value]) => {
				if (key === 'NAME' || key === 'PROJECT' || key === 'TYPE_TABLE' || key === 'SPEC_TABLE' || key === 'SHORT_PROJ' || key === 'GROUP' || key === 'ZAKUPKA') {
					arr.push(value)
				}
			}
		)
		/* добавляем Active = 1 для разделения Текущих и Архивных клиентов */
		arr.push(1)
		try {
			await db.query(
				'INSERT INTO CLIENTS (`NAME`, PROJECT, TYPE_TABLE, SPEC_TABLE, SHORT_PROJ, `GROUP`, ZAKUPKA, `ACTIVE`) VALUES (?)',
				[arr],
				(err, response) => {
					if (err) throw err
					db.query(
						'INSERT INTO LegPers (client_id, client_name, `name`, 1c_id) VALUES ((SELECT MAX(ID) FROM CLIENTS), ' + NAME + ', ' + LEGPERS + ', ' + ART_1C + ')',
						async (err, response) => {
							if (err) throw err
							console.log('Добавление контрагента: ' + arr)
							try {
								let MaxId = await db.query('SELECT MAX(ID) ID FROM CLIENTS')
								res.json({
									success: ' Данные успешно добавлены! ',
									MaxId
								})
							} catch (error) {
								console.log(error)
								res.json({ success: false, error: error })
							}
						}
					)
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
	app.post('/clients/edit', async (req, res) => {
		const { NAME, PROJECT, TYPE_TABLE, SPEC_TABLE, SHORT_PROJ, GROUP, ZAKUPKA, ID } = req.body
		let query
		console.log(PROJECT)
		if (ZAKUPKA) {
			query = 'UPDATE tsddb.CLIENTS SET `GROUP` = ' + GROUP + ', SHORT_PROJ = ' + JSON.stringify(SHORT_PROJ) + ', `SPEC_TABLE` = ' + JSON.stringify(SPEC_TABLE) + ', TYPE_TABLE = ' + JSON.stringify(TYPE_TABLE) + ', ZAKUPKA = ' + ZAKUPKA + ', `PROJECT` = ' + JSON.stringify(PROJECT) + ', `NAME` = ' + JSON.stringify(NAME) + ' WHERE ID = ' + parseInt(ID)
		} else {
			query = 'UPDATE tsddb.CLIENTS SET `GROUP` = ' + GROUP + ', SHORT_PROJ = ' + JSON.stringify(SHORT_PROJ) + ', `SPEC_TABLE` = ' + JSON.stringify(SPEC_TABLE) + ', TYPE_TABLE = ' + JSON.stringify(TYPE_TABLE) + ', `PROJECT` = ' + JSON.stringify(PROJECT) + ', `NAME` = ' + JSON.stringify(NAME) + ' WHERE ID = ' + parseInt(ID)
		}
		try {
			await db.query(
				query,
				(err, response) => {
					if (err) throw err
					res.send('Данные успешно обновлены!')
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
	app.post('/clients/del', async (req, res) => {
		let id = req.body[0]
		console.log('Удаление клиента с id: ' + id)
		try {
			await db.query(
				'DELETE FROM `CLIENTS` WHERE id = ?',
				id,
				(err, response) => {
					if (err) throw err
					db.query(
						'DELETE FROM `LegPers` WHERE client_id = ?',
						id,
						(err, response) => {
							if (err) throw err
							res.send('Клиент с id ' + id + ' успешно удалён!')
						})
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error })
		}
	})
}

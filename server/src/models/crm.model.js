const db = require('../db')

const CRM = []

CRM.fetchNoFactsLegpers = (result) => {
	db.query(`SELECT 1cb.client_1c, lp1c.1c_id, lp1c.name, COUNT(1) qty, SUM(1cj.doc_sum) Sum, GROUP_CONCAT(DISTINCT 1cb.project_1c) Projects
		FROM 1C_Journal_1 1cj
		LEFT JOIN 1C_Bills 1cb ON 1cb.bill_1c=1cj.doc_base_num
		LEFT JOIN LegPers_1C lp1c ON lp1c.1c_id=1cb.client_1c
		LEFT JOIN LegPers lp ON lp.1c_id=1cb.client_1c
		LEFT JOIN CLIENTS cli ON cli.ID=lp.client_id 
		WHERE 1cb.id IS NOT NULL AND 1cj.doc_type='Реализация' AND doc_date >= '2020-01-01' AND lp.id IS NULL
		GROUP BY 1cb.client_1c
		ORDER BY Sum DESC`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('JIRA USERS: ', res)
		result(null, res)
	})
}
CRM.fetchNoFactsProjects = (result) => {
	db.query(`SELECT 1cb.client_1c, lp1c.1c_id, lp1c.name, COUNT(1) qty, SUM(1cj.doc_sum) Sum, GROUP_CONCAT(DISTINCT 1cb.project_1c) Projects
		FROM 1C_Journal_1 1cj
		LEFT JOIN 1C_Bills 1cb ON 1cb.bill_1c=1cj.doc_base_num
		LEFT JOIN LegPers_1C lp1c ON lp1c.1c_id=1cb.client_1c
		LEFT JOIN LegPers lp ON lp.1c_id=1cb.client_1c
		LEFT JOIN CLIENTS cli ON cli.ID=lp.client_id 
		WHERE 1cb.id IS NOT NULL AND 1cj.doc_type='Реализация' AND doc_date >= '2020-01-01'
		AND 1cb.project_1c NOT IN ('Продажи','Продажи (ЗИП)','Продажи (Склад)','Ремонт','Сервисный контракт','Ремонт (ФИКС)','Аренда Оборудования','Сервисный контракт (ФИКС)','СКС','IT')
		GROUP BY 1cb.client_1c
		ORDER BY Sum DESC`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('JIRA USERS: ', res)
		result(null, res)
	})
}

module.exports = CRM

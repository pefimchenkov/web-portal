const db = require('../db')

const Clients = []

Clients.getEditableCRM = (id, result) => {
	db.query(`
		SELECT
		HEAD_MANAGER, MANAGER,
		cli.AIDC_SALE, IFNULL(cpm.AIDC_SALE,cp.AIDC_SALE) P_SALE, IF(cpm.AIDC_SALE IS NULL,cp.type,cpm.type) P_SALE_type, IFNULL(CONCAT(OM_SALE,' *'),MANAGER) OM_SALE,
		cli.AIDC_SALE_ZIP, IFNULL(cpm.AIDC_SALE_ZIP,cp.AIDC_SALE_ZIP) P_SALE_ZIP, IF(cpm.AIDC_SALE_ZIP IS NULL,cp.type,cpm.type) P_SALE_ZIP_type, IFNULL(CONCAT(OM_SALE_ZIP,' *'),MANAGER) OM_SALE_ZIP,
		cli.AIDC_SERV, IFNULL(cpm.AIDC_SERV,cp.AIDC_SERV) P_SERV, IF(cpm.AIDC_SERV IS NULL,cp.type,cpm.type) P_SERV_type, IFNULL(CONCAT(OM_SERV,' *'),MANAGER) OM_SERV,
		cli.IT, IFNULL(cpm.IT,cp.IT) P_IT, IF(cpm.IT IS NULL,cp.type,cpm.type) P_IT_type, IFNULL(CONCAT(OM_IT,' *'),MANAGER) OM_IT,
		SUM(1cj.doc_sum) Fact
		FROM CLIENTS cli
		LEFT JOIN crm_percents cp ON cp.crm_id=cli.CRM_TYPE
		LEFT JOIN crm_percents cpm ON cpm.crm_id=cli.ID
		LEFT JOIN LegPers lp ON cli.ID=lp.client_id
		LEFT JOIN 1C_Bills 1cb ON 1cb.client_1c=lp.1c_id
		LEFT JOIN 1C_Journal 1cj ON 1cj.doc_base_num=1cb.bill_1c
		WHERE cli.ID=${id} AND 1cj.doc_type='Реализация' AND 1cj.doc_date >= '2019-10-01'`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('CRM: ', res)
		result(null, res)
	})
}
Clients.getReadonlyCRM = (id, result) => {
	db.query(`
		SELECT C.ID CLI_ID, C.NAME CLIENT,
			GROUP_CONCAT(DISTINCT cub.display_name) Buhs, GROUP_CONCAT(DISTINCT cuvi.display_name) VIs
		FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cfvnd ON cfvnd.ISSUE=ji.ID AND cfvnd.CUSTOMFIELD=21300
			LEFT JOIN jiradb.issuelink il ON il.DESTINATION=ji.ID AND il.LINKTYPE=10100
			LEFT JOIN jiradb.customfieldvalue cfvop ON cfvop.ISSUE=ji.ID AND cfvop.CUSTOMFIELD=20822
			LEFT JOIN jiradb.customfieldvalue cfvb ON cfvb.ISSUE=ji.ID AND cfvb.CUSTOMFIELD=22704
			LEFT JOIN jiradb.customfieldvalue cfvvi ON cfvvi.ISSUE=ji.ID AND cfvvi.CUSTOMFIELD=21926
			LEFT JOIN CLIENTS C ON IFNULL(cfv.TEXTVALUE,cfvop.TEXTVALUE) LIKE CONCAT('%>',C.ID,'<%')
			LEFT JOIN jiradb.cwd_user cub ON cub.user_name=cfvb.STRINGVALUE
			LEFT JOIN jiradb.cwd_user cuvi ON cuvi.user_name=cfvvi.STRINGVALUE
		WHERE ji.PROJECT=15700 AND ji.issuetype IN (13400,13600,14401) AND ji.issuestatus!=6 AND C.ID=${id}`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('CRM: ', res)
		result(null, res)
	})
}
Clients.getLegPers = (id, result) => {
	db.query(`SELECT lp.id, lp.name, lp.just_name, lf.name form, 1c_id id_1c, client_id
			FROM LegPers lp
			LEFT JOIN Legpers_Forms lf ON lf.id=lp.form_id
			WHERE lp.client_id=${id}
			ORDER BY id DESC`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('CRM LegPers: ', res)
		result(null, res)
	})
}
Clients.getClientsDomains = (id, result) => {
	db.query(`SELECT id, NAME
			FROM tsddb.Clients_Domains cd
			WHERE cd.client_id=${id}
			ORDER BY id DESC`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		console.log('CRM Clients Domains: ', res)
		result(null, res)
	})
}
Clients.getPercentCRM = result => {
	db.query(`SELECT * FROM crm_percents`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM Percent: ', res)
			result(null, res)
		})
}
Clients.updateCurator = (name, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET HEAD_MANAGER = ${name} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.updateManager = (name, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET MANAGER = ${name} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.updateAIDC_SALE = (plan, manager, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET AIDC_SALE = ${plan}, OM_SALE = ${manager} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.updateAIDC_SALE_ZIP = (plan, manager, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET AIDC_SALE_ZIP = ${plan}, OM_SALE_ZIP = ${manager} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.updateAIDC_SERV = (plan, manager, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET AIDC_SERV = ${plan}, OM_SERV = ${manager} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.updateIT = (plan, manager, id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET IT = ${plan}, OM_IT = ${manager} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Curator: ', res)
			result(null, res)
		})
}
Clients.activateCRM = (id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET CRM = 1 WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM: ', res)
			result(null, res)
		})
}
Clients.deactivateCRM = (id, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET CRM = 2 WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM: ', res)
			result(null, res)
		})
}
Clients.addLegPers = (id, clientName, fullName, justName, form, code1c, result) => {
	db.query(`INSERT INTO tsddb.LegPers (client_id, client_name, name, 1c_id, just_name, form_id) VALUES (${id}, ${clientName}, ${fullName}, ${code1c}, ${justName}, ${form.id})`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('LEGPERS: ', res)
			console.log('INSERT_ID: ', res.insertId)
			result(null, res.insertId)
		})
}
Clients.updateLegPers = (id, clientID, fullName, justName, form, code1c, result) => {
	db.query(`UPDATE tsddb.LegPers SET client_id = ${clientID}, name = ${fullName}, 1c_id = ${code1c}, just_name = ${justName}, form_id = ${form.id} WHERE id = ${id} `,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('LEGPERS: ', res)
			result(null, res.insertId)
		})
}
Clients.deleteLegPers = (id, result) => {
	db.query(`DELETE FROM tsddb.LegPers WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('LEGPERS DELETED: ', res)
			result(null, res)
		})
}
Clients.addDomains = (id, name, result) => {
	db.query(`INSERT INTO tsddb.Clients_Domains (client_id, name) VALUES (${id}, ${name})`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('DOMAINS: ', res)
			console.log('INSERT_ID: ', res.insertId)
			result(null, res.insertId)
		})
}
Clients.updateDomains = (id, clientID, name, result) => {
	db.query(`UPDATE tsddb.Clients_Domains SET client_id = ${clientID}, NAME = ${name} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('DOMAINS: ', res)
			result(null, res)
		})
}
Clients.deleteDomains = (id, result) => {
	db.query(`DELETE FROM tsddb.Clients_Domains WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('DOMAINS DELETED: ', res)
			result(null, res)
		})
}
Clients.setPercent = (id, type, result) => {
	db.query(`UPDATE tsddb.CLIENTS SET CRM_TYPE = ${type} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM_TYPE: ', res)
			result(null, res)
		})
}
Clients.getIdsPercent = (result) => {
	db.query(`SELECT crm_id FROM crm_percents`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Ids: ', res)
			result(null, res)
		})
}
Clients.updateCustomPercent = async (id, name, percent, result) => {
	await db.query(`UPDATE tsddb.crm_percents SET ${name} = ${percent} WHERE crm_id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM_TYPE: ', res)
			result(null, res)
		})
}
Clients.setCustomPercent = async (id, name, percent, result) => {
	await db.query(`INSERT tsddb.crm_percents (crm_id, ${name}, type) VALUES (${id}, ${percent}, 'manual')`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM_TYPE: ', res)
			result(null, res)
		})
}
Clients.deleteCustomPercent = async (id, value, result) => {
	await db.query(`UPDATE tsddb.crm_percents SET ${value} = NULL WHERE crm_id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('CRM_TYPE: ', res)
			result(null, res)
		})
}

module.exports = Clients

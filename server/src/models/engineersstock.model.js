const db = require('../db')

const EngineersStock = []

EngineersStock.getEngineersStockGood = (result) => {
	db.query(`
		SELECT se.id, pm.JIRA_ID zip_id, CONCAT(pt.name,' ',pm.NAME) zip, GROUP_CONCAT(pmr.ART_1C) arts, au.lower_user_name eng, CONCAT('REMONT-',ji.issuenum) isskey, se.type, se.request, se.date, se.executor
		FROM Sklad_Engineer se
		LEFT JOIN Products_Main pm ON pm.JIRA_ID=se.zip_id
		LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
		LEFT JOIN jiradb.jiraissue ji ON ji.ID=se.jira_id
		LEFT JOIN jiradb.customfieldvalue cf ON cf.ISSUE=ji.ID AND cf.CUSTOMFIELD=12200
		LEFT JOIN jiradb.app_user au ON au.user_key=cf.STRINGVALUE
		LEFT JOIN Products_Market pmr ON pmr.MAIN_JIRA_ID=pm.JIRA_ID
		GROUP BY ji.ID
		`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		// console.log('Stock Engineers Good: ', res)
		result(null, res)
	})
}
EngineersStock.getEngineersStock = async (result) => {
	await db.query(`SET group_concat_max_len = 4096`)
	await db.query(`
		SELECT  CONCAT(JIRA_ID,IFNULL(Sklad.EngID,0)) UniqueID, GROUP_CONCAT(Sklad.element) element, pm.JIRA_ID, Eng, SUM(Sklad.count) Count, GROUP_CONCAT(CONCAT(ART_1C,' (',PN,') ',count)) Content, CONCAT(pt.name,' ',pm.NAME) Zip,
		GROUP_CONCAT(Sklad.count) ContentNum, GROUP_CONCAT(Sklad.IDs) IDs
		FROM
		(SELECT GROUP_CONCAT(Fact.ID) IDs, Fact.issuenum, Fact.Eng, SUBSTRING_INDEX(SUBSTRING_INDEX(val, ' ', num), ' ', -1) element, COUNT(*) count, Fact.EngID
		FROM
		(SELECT ji.ID, ji.issuenum, ji.SUMMARY, au.lower_user_name Eng, ExtractValue(cfvz.TEXTVALUE,'/content/value') Val, cu.ID EngID
		FROM jiradb.jiraissue ji
		LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=12200
		LEFT JOIN jiradb.customfieldvalue cfvz ON cfvz.ISSUE=ji.ID AND cfvz.CUSTOMFIELD=22502
		LEFT JOIN jiradb.app_user au ON au.user_key=cfvo.STRINGVALUE
		LEFT JOIN jiradb.cwd_user cu ON au.lower_user_name=cu.user_name
		LEFT JOIN tsddb.Sklad_Engineer se ON se.jira_id=ji.ID
		WHERE ji.issuetype IN (12401) AND  ji.issuestatus IN (6,12038) AND CREATED >= ADDDATE(NOW(), INTERVAL -1 QUARTER) AND se.jira_id IS NULL) Fact, tsddb.Parcel_Numbers
		WHERE LENGTH(val)-LENGTH(REPLACE(val, ' ', '')) >= num-1
		GROUP BY element, Eng
		ORDER BY count DESC) Sklad
		LEFT JOIN tsddb.Products_Market mrkt ON mrkt.id=Sklad.element
		LEFT JOIN tsddb.Products_Main pm ON pm.JIRA_ID=mrkt.MAIN_JIRA_ID
		LEFT JOIN tsddb.Products_Type pt ON pt.id=pm.Class_Type_ID
		WHERE pm.Class_ID != 7
		GROUP BY 4, 3
		ORDER BY 4, 3
		`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		// console.log('Stock Engineers: ', res)
		result(null, res)
	})
}
EngineersStock.getEngineersStockArchive = async (result) => {
	await db.query(`SET group_concat_max_len = 4096`)
	await db.query(`
		SELECT  CONCAT(JIRA_ID,IFNULL(Sklad.EngID,0)) UniqueID, GROUP_CONCAT(Sklad.element) element, pm.JIRA_ID, Eng, SUM(Sklad.count) Count, GROUP_CONCAT(CONCAT(ART_1C,' (',PN,') ',count)) Content, CONCAT(pt.name,' ',pm.NAME) Zip,
		GROUP_CONCAT(Sklad.count) ContentNum, GROUP_CONCAT(Sklad.IDs) IDs
		FROM
		(SELECT GROUP_CONCAT(Fact.ID) IDs, Fact.issuenum, Fact.Eng, SUBSTRING_INDEX(SUBSTRING_INDEX(val, ' ', num), ' ', -1) element, COUNT(*) count, Fact.EngID
		FROM
		(SELECT ji.ID, ji.issuenum, ji.SUMMARY, au.lower_user_name Eng, ExtractValue(cfvz.TEXTVALUE,'/content/value') Val, cu.ID EngID
		FROM jiradb.jiraissue ji
		LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=12200
		LEFT JOIN jiradb.customfieldvalue cfvz ON cfvz.ISSUE=ji.ID AND cfvz.CUSTOMFIELD=22502
		LEFT JOIN jiradb.app_user au ON au.user_key=cfvo.STRINGVALUE
		LEFT JOIN jiradb.cwd_user cu ON au.lower_user_name=cu.user_name
		LEFT JOIN tsddb.Sklad_Engineer se ON se.jira_id=ji.ID
		WHERE ji.issuetype IN (12401) AND  ji.issuestatus IN (6,12038) AND CREATED >= ADDDATE(NOW(), INTERVAL -1 YEAR) AND CREATED < ADDDATE(NOW(), INTERVAL -1 QUARTER) AND se.jira_id IS NULL) Fact, tsddb.Parcel_Numbers
		WHERE LENGTH(val)-LENGTH(REPLACE(val, ' ', '')) >= num-1
		GROUP BY element, Eng
		ORDER BY count DESC) Sklad
		LEFT JOIN tsddb.Products_Market mrkt ON mrkt.id=Sklad.element
		LEFT JOIN tsddb.Products_Main pm ON pm.JIRA_ID=mrkt.MAIN_JIRA_ID
		LEFT JOIN tsddb.Products_Type pt ON pt.id=pm.Class_Type_ID
		WHERE pm.Class_ID != 7
		GROUP BY 4, 3
		ORDER BY 4, 3
		`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		// console.log('Stock Engineers Archive: ', res)
		result(null, res)
	})
}
EngineersStock.getEngineersStockDetails = (ids, zipID, userName, result) => {
	db.query(`
		SELECT ji.ID, CONCAT('REMONT-',ji.issuenum) IssKey, cfnr.STRINGVALUE NomRem, ji.SUMMARY, ist.pname Status, ji.CREATED, cfrd.TEXTVALUE DiagResult, ji.RESOLUTIONDATE,
		(SELECT CONCAT(pt.name,' ',pm.NAME) FROM Products_Main pm LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID WHERE pm.JIRA_ID=${zipID}) ZipName,
		(SELECT email_address FROM jiradb.cwd_user cu WHERE cu.user_name=${userName}) Email
		FROM jiradb.jiraissue ji
		LEFT JOIN jiradb.customfieldvalue cfnr ON cfnr.CUSTOMFIELD=10400 AND cfnr.ISSUE=ji.ID
		LEFT JOIN jiradb.customfieldvalue cfrd ON cfrd.CUSTOMFIELD=10300 AND cfrd.ISSUE=ji.ID
		LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
		WHERE ji.ID IN (${ids})`,
	(err, res) => {
		if (err) {
			console.log('Error: ', err)
			result(null, err)
			return
		}
		/* console.log('Stock Engineers Ids: ', res) */
		result(null, res)
	})
}
EngineersStock.setConditionStock = (jiraID, zipID, type, user, date, result) => {
	db.query(`INSERT INTO tsddb.Sklad_Engineer (jira_id, zip_id, type, executor, date) VALUES (${jiraID}, ${zipID}, ${type}, ${user}, ${date})`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Type: ', res)
			result(null, res)
		})
}
EngineersStock.delete = (id, result) => {
	db.query(`DELETE FROM tsddb.Sklad_Engineer WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Delete: ', res)
			result(null, res)
		})
}
EngineersStock.sendRequest = (status, id, user, now, result) => {
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = ${status}, executor = ${user}, date = ${now} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Request: ', res)
			result(null, res)
		})
}
EngineersStock.sendApprove = (id, user, now, result) => {
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = null, executor = ${user}, type = 3, date = ${now} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Approve: ', res)
			result(null, res)
		})
}
EngineersStock.sendDecline = (id, user, now, result) => {
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = 0, executor = ${user}, type = 3, date = ${now} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Decline: ', res)
			result(null, res)
		})
}
EngineersStock.sendCheck = (id, user, now, result) => {
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = 2, executor = ${user}, date = ${now} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Check: ', res)
			result(null, res)
		})
}

module.exports = EngineersStock

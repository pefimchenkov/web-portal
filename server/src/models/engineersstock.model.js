const db = require('../db')

const EngineersStock = []

EngineersStock.getEngineersStockGood = (result) => {
	db.query(`
		SELECT se.id, pm.JIRA_ID zip_id, CONCAT(pt.name,' ',pm.NAME) zip, pmp.ART_1C arts, au.lower_user_name eng,
			CONCAT('REMONT-',ji.issuenum) isskey, se.type, se.request, se.date, se.executor, se.sklad, se.comment, ROUND(pmp.Price_In_Stock*pc.rate,2) Cost, 
			IF(request=0,0, ROUND(pmp.Price_In_Stock*pc.rate/IF(sklad=1,IF(se.type=1,30,15),IF(se.type=1,50,25))) ) Bonus
		FROM Sklad_Engineer se
		LEFT JOIN Products_Main pm ON pm.JIRA_ID=se.zip_id
		LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
		LEFT JOIN jiradb.jiraissue ji ON ji.ID=se.jira_id
		LEFT JOIN jiradb.customfieldvalue cf ON cf.ISSUE=ji.ID AND cf.CUSTOMFIELD=12200
		LEFT JOIN jiradb.app_user au ON IF(cf.STRINGVALUE IS NULL,au.lower_user_name,au.user_key)=IFNULL(cf.STRINGVALUE,se.Eng)
		LEFT JOIN Products_Market pmr ON pmr.MAIN_JIRA_ID=pm.JIRA_ID
		LEFT JOIN Products_Market pmp ON pmp.id=se.market_id
		LEFT JOIN Products_Currency pc ON pc.id=pmp.Currency_In
		GROUP BY se.id
		ORDER BY se.id DESC
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
EngineersStock.getEngineersStock = (result) => {
	db.query(`SET group_concat_max_len = 4096`)
	db.query(`
		SELECT CONCAT(JIRA_ID,IFNULL(Sklad.EngID,0)) UniqueID, GROUP_CONCAT(Sklad.element) element, pm.JIRA_ID, Eng, SUM(Sklad.count) Count, GROUP_CONCAT(CONCAT(ART_1C,' (',PN,') ',count)) Content, CONCAT(pt.name,' ',pm.NAME) Zip,
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
EngineersStock.getEngineersStockDetails = (ids, zipID, result) => {
	db.query(`
		SELECT Tbl.ID, Tbl.IssKey, Tbl.NomRem, Tbl.SUMMARY, Tbl.pname Status, Tbl.CREATED, Tbl.DiagResult, Tbl.RESOLUTIONDATE,
		CONCAT(pt.name,' ',pm.NAME) ZipName, Tbl.Mid MarketId, pmr.ART_1C, Tbl.email_address, Tbl.Lead, Tbl.email_lead
		FROM (
		SELECT *, SUBSTRING_INDEX(SUBSTRING_INDEX(Mids, ' ', num), ' ', -1) Mid
		FROM (
		SELECT ji.ID, CONCAT('REMONT-',ji.issuenum) IssKey, cf.STRINGVALUE NomRem, ji.SUMMARY, ji.CREATED, ji.RESOLUTIONDATE, ExtractValue(cfz.TEXTVALUE,'/content/value') Mids,
		au.lower_user_name Eng, ist.pname, cfrd.TEXTVALUE DiagResult, cu.email_address, en.Lead, cul.email_address email_lead
		FROM jiradb.jiraissue ji
		LEFT JOIN jiradb.customfieldvalue cf ON cf.ISSUE=ji.ID AND cf.CUSTOMFIELD=10400
		LEFT JOIN jiradb.customfieldvalue cfz ON cfz.ISSUE=ji.ID AND cfz.CUSTOMFIELD=22502
		LEFT JOIN jiradb.customfieldvalue cfvo ON cfvo.ISSUE=ji.ID AND cfvo.CUSTOMFIELD=12200
		LEFT JOIN jiradb.customfieldvalue cfrd ON cfrd.ISSUE=ji.ID AND cfrd.CUSTOMFIELD=10300
		LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
		LEFT JOIN jiradb.app_user au ON au.user_key=cfvo.STRINGVALUE
		LEFT JOIN jiradb.cwd_user cu ON au.lower_user_name=cu.user_name
		LEFT JOIN tsddb.Engineers en ON en.Eng=cu.user_name
	LEFT JOIN jiradb.cwd_user cul ON en.Lead=cul.user_name
		WHERE ji.ID IN (${ids})) Dtl, tsddb.Parcel_Numbers
		WHERE LENGTH(Mids)-LENGTH(REPLACE(Mids, ' ', '')) >= num-1
		ORDER BY 1) Tbl
		LEFT JOIN Products_Market pmr ON pmr.id=Mid
		LEFT JOIN Products_Main pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID
		LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
		WHERE MAIN_JIRA_ID=${zipID}`,
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
EngineersStock.setConditionStock = (jiraID, zipID, marketID, type, user, comment, date, result) => {
	db.query(`INSERT INTO tsddb.Sklad_Engineer (jira_id, zip_id, market_id, sklad, type, executor, comment, date) VALUES (${jiraID}, ${zipID}, ${marketID}, ${1}, ${type}, ${user}, ${comment}, ${date})`,
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
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = null, executor = ${user}, request = 3, date = ${now} WHERE id = ${id}`,
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
	db.query(`UPDATE tsddb.Sklad_Engineer SET request = 0, executor = ${user}, date = ${now} WHERE id = ${id}`,
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
EngineersStock.manualAddZip = (zipId, marketId, type, eng, user, comment, date, result) => {
	db.query(`INSERT INTO tsddb.Sklad_Engineer (zip_id, market_id, type, eng, sklad, executor, comment, date) VALUES (${zipId}, ${marketId}, ${type}, ${eng}, ${2}, ${user}, ${comment}, ${date})`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Manual Add: ', res)
			result(null, res)
		})
}
EngineersStock.saveComment = (id, comment, result) => {
	db.query(`UPDATE tsddb.Sklad_Engineer SET comment = ${comment} WHERE id = ${id}`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			console.log('Engineers Stock Comment Edit: ', res)
			result(null, res)
		})
}

module.exports = EngineersStock

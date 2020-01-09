const db = require('../db')
module.exports = app => {
	app.get('/contracts', async (req, res) => {
		let data = []
		try {
			data = await db.query(
				`SELECT ji.ID, CONCAT('CONTRACT-',ji.issuenum) AS ISSUEKEY, cfvnd.STRINGVALUE NOM_DOG, ji.SUMMARY, C.ID client, C.NAME CLIENT, it.pname DOG_TYPE, IF(isst.pname='Approved','Подтверждён',isst.pname) STATUS,
        CASE STATUSCATEGORY
        WHEN 4 THEN 'yellow'
        WHEN 2 THEN 'blue-gray'
        WHEN 3 THEN 'green'
        END COLOR, IFNULL(il.SOURCE,ji.ID) ORD, il.SEQUENCE SEQ
       FROM jiradb.jiraissue ji
       LEFT JOIN jiradb.customfieldvalue cfv ON cfv.ISSUE=ji.ID AND cfv.CUSTOMFIELD=11901
       LEFT JOIN jiradb.issuetype it ON it.ID = ji.issuetype
       LEFT JOIN jiradb.issuestatus isst ON isst.ID = ji.issuestatus
       LEFT JOIN jiradb.customfieldvalue cfvnd ON cfvnd.ISSUE=ji.ID AND cfvnd.CUSTOMFIELD=21300
       LEFT JOIN jiradb.issuelink il ON il.DESTINATION=ji.ID AND il.LINKTYPE=10100
       LEFT JOIN jiradb.customfieldvalue cfvop ON cfvop.ISSUE=ji.ID AND cfvop.CUSTOMFIELD=20822
       LEFT JOIN tsddb.CLIENTS C ON IFNULL(cfv.TEXTVALUE,cfvop.TEXTVALUE) LIKE CONCAT('%>',C.ID,'<%')
       WHERE ji.PROJECT=15700
       ORDER BY ORD DESC, SEQ`
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
}

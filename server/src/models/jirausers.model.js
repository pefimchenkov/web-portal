const db = require('../db')

const JiraUsers = []

JiraUsers.getJiraUsers = (result) => {
	db.query(`SELECT * FROM (
		SELECT user_name, display_name, GROUP_CONCAT(parent_name) jira_groups, cu.active, email_address email
		FROM jiradb.cwd_user cu
		LEFT JOIN jiradb.cwd_membership cm ON cu.ID=cm.child_id
		GROUP BY user_name
		ORDER BY display_name) users
		WHERE users.active=1 AND users.jira_groups LIKE '%jira-developers%' OR users.user_name IN ('perov','a.podkolzin') `,
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

module.exports = JiraUsers

const JiraUsers = require('../models/jirausers.model.js')

// Retrieve crm data from the database.
exports.fetchJiraUsers = (req, res) => {
	JiraUsers.getJiraUsers((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных пользователей JIRA.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}

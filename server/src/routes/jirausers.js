module.exports = app => {
	const jirausers = require('../controllers/jirausers.controller.js')

	app.get('/jirausers', jirausers.fetchJiraUsers)
}

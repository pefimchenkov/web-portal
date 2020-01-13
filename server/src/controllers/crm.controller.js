const CRM = require('../models/crm.model.js')

exports.fetchNoFactsLegpers = (req, res) => {
	CRM.fetchNoFactsLegpers((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных о непопавшем ФАКТЕ CRM (Юрлица).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchNoFactsProjects = (req, res) => {
	CRM.fetchNoFactsProjects((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных о непопавшем ФАКТЕ CRM (Проекты 1с).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}

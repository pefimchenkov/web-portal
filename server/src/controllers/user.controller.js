const User = require('../models/user.model.js')

exports.getBonusSale = (req, res) => {
	User.getBonusSale((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении бонусных баллов.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.getBonusSaleSum = (req, res) => {
	const { email } = req.body
	User.getBonusSaleSum(JSON.stringify(email), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении суммы бонусных баллов.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.getBonusProfit = (req, res) => {
	User.getBonusProfit((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении бонусных баллов.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.getBonusProfitSum = (req, res) => {
	const { email } = req.body
	User.getBonusProfitSum(JSON.stringify(email), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении суммы бонусных баллов.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}

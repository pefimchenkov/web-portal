const EngineersStock = require('../models/engineersstock.model.js')
const config = require('../config/config')
const emailjs = require('emailjs')
const moment = require('moment')
moment.locale('ru')
const server = emailjs.server.connect(config.email)

// Retrieve crm data from the database.
exports.fetchEngineersStockGood = (req, res) => {
	EngineersStock.getEngineersStockGood((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных СКЛАД ИНЖЕНЕРОВ (хорошие).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchEngineersStock = (req, res) => {
	EngineersStock.getEngineersStock((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных СКЛАД ИНЖЕНЕРОВ.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchEngineersStockArchive = (req, res) => {
	EngineersStock.getEngineersStockArchive((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных СКЛАД ИНЖЕНЕРОВ (Архив).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchEngineersStockDetails = (req, res) => {
	const { ids, zipID } = req.body
	EngineersStock.getEngineersStockDetails(ids, parseInt(zipID), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных ID's СКЛАДА ИНЖЕНЕРОВ.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.setConditionStock = (req, res) => {
	const { jiraID, zipID, type, user, comment, date } = req.body
	EngineersStock.setConditionStock(parseInt(jiraID), parseInt(zipID), parseInt(type), JSON.stringify(user), JSON.stringify(comment), JSON.stringify(date), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при установке состояния (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else {
			server.send(
				{
					text: parseInt(type) === 2 ? 'В зелёной таблице появилась новая запчасть' : 'В оранжевой таблице появилась новая запчасть',
					from: '<robot@tsd-group.ru>',
					to: parseInt(type) === 2 ? '<zsa@tsd-group.ru>' : '<zsa@tsd-group.ru, petrovichev@service-tsd.ru>',
					subject: parseInt(type) === 2 ? `Обновление списка новых ЗИП` : `Обновление списка ЗИП, которые можно восстановить`
				},
				function (err, message) {
					console.log(err || message)
				}
			)
			res.send(data = { code: 20000, data: data })
		}
	})
}
exports.delete = (req, res) => {
	const { id } = req.body
	EngineersStock.delete(parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при удалении состояния (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else {
			res.send(data = { code: 20000, data: data })
		}
	})
}
exports.sendRequest = (req, res) => {
	const { status, id, user, date } = req.body
	EngineersStock.sendRequest(parseInt(status), parseInt(id), JSON.stringify(user), JSON.stringify(date), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при отправке статуса запроса (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.sendApprove = (req, res) => {
	const { id, user, date } = req.body
	EngineersStock.sendApprove(parseInt(id), JSON.stringify(user), JSON.stringify(date), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при отправке подтверждения (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.sendDecline = (req, res) => {
	const { id, user, date } = req.body
	EngineersStock.sendDecline(parseInt(id), JSON.stringify(user), JSON.stringify(date), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при отправке отклонения (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.sendCheck = (req, res) => {
	const { id, user, date } = req.body
	EngineersStock.sendCheck(parseInt(id), JSON.stringify(user), JSON.stringify(date), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при отправке проверки ЗИП (СКЛАД ИНЖЕНЕРОВ).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.sendRequestForZip = (req, res) => {
	const { item, user, email } = req.body
	const { ZipName, IssKey, NomRem } = item
	const date = moment(new Date()).format('DD.MM.YYYY HH:mm:ss')
	server.send(
		{
			text: 'Пользователь ' + user + ' запросил [' + ZipName + ', номер ремонта: ' + IssKey + '] со склада ' + item.Email + '.\n\r Cсылка на ремонт: http://http://support.tsd-group.ru/browse/' + NomRem,
			from: user,
			to: `<${email}, ${item.Email}>`,
			subject: date + ' - ' + 'Склад инженеров: запрос ЗИП (' + ZipName + ')'
		},
		function (err, message) {
			console.log(err || message)
		}
	)
	res.send({ code: 20000, data: req.body })
}
exports.manualAddZip = (req, res) => {
	const date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
	const { zip, type, engineer, user, comment } = req.body
	EngineersStock.manualAddZip(
		parseInt(zip.marketID),
		parseInt(zip.marketid),
		parseInt(type),
		JSON.stringify(engineer.user_name),
		JSON.stringify(user),
		JSON.stringify(comment),
		JSON.stringify(date),
		(err, data) => {
			if (err) {
				res.status(500).send({
					message:
						err.message || `Ошибка при ручном добавлении ЗИП (СКЛАД ИНЖЕНЕРОВ).`
				})
			} else res.send(data = { code: 20000, data: data })
		})
}
exports.saveComment = (req, res) => {
	const { id, comment } = req.body
	EngineersStock.saveComment(parseInt(id), JSON.stringify(comment),
		(err, data) => {
			if (err) {
				res.status(500).send({
					message:
						err.message || `Ошибка при редактировании комментария (СКЛАД ИНЖЕНЕРОВ).`
				})
			} else res.send(data = { code: 20000, data: data })
		})
}

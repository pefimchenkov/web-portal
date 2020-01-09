const Clients = require('../models/clients.model.js')

// Retrieve crm data from the database.
exports.fetchEditableCRM = (req, res) => {
	Clients.getEditableCRM(req.query.id, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных CRM (editable) по id ${req.query.id}.`
			})
		} else res.send(data = { code: 20000, data: data[0] })
	})
}
exports.fetchReadonlyCRM = (req, res) => {
	Clients.getReadonlyCRM(req.query.id, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных CRM (readonly) по ${req.query.id}.`
			})
		} else res.send(data = { code: 20000, data: data[0] })
	})
}
exports.fetchLegPers = (req, res) => {
	Clients.getLegPers(req.query.id, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении Юрлиц по ${req.query.id}.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchClientsDomains = (req, res) => {
	Clients.getClientsDomains(req.query.id, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении Доменов по ${req.query.id}.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.fetchPercentCRM = (req, res) => {
	Clients.getPercentCRM((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при получении данных CRM (проценты).`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateCurator = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Куратор не может быть пустым! '
		})
	}
	const { name, id } = req.body
	Clients.updateCurator(JSON.stringify(name), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении куратора в CRM.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateManager = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Менеджер не может быть пустым! '
		})
	}
	const { name, id } = req.body
	Clients.updateManager(JSON.stringify(name), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении менеджера в CRM.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateAIDC_SALE = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Планы (новое) не могут быть пустыми! '
		})
	}
	const { plan, manager, id } = req.body
	console.log(plan)
	Clients.updateAIDC_SALE(plan === null ? null : parseInt(plan), JSON.stringify(manager), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении планов Продажи (новое) в CRM.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateAIDC_SALE_ZIP = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Планы по зип не могут быть пустыми!'
		})
	}
	const { plan, manager, id } = req.body
	Clients.updateAIDC_SALE_ZIP(plan === null ? null : parseInt(plan), JSON.stringify(manager), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении планов Продажи (зип) в CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateAIDC_SERV = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Планы по сервису не могут быть пустыми!'
		})
	}
	const { plan, manager, id } = req.body
	Clients.updateAIDC_SERV(plan === null ? null : parseInt(plan), JSON.stringify(manager), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении планов по сервису в CRM.`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateIT = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Планы по IT не могут быть пустыми!'
		})
	}
	const { plan, manager, id } = req.body
	Clients.updateIT(plan === null ? null : parseInt(plan), JSON.stringify(manager), parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении планов по IT в CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.activateCRM = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'ID клиента не может быть пустым!'
		})
	}
	const id = req.body
	Clients.activateCRM(parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при активации статуса CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.deactivateCRM = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'ID клиента не может быть пустым!'
		})
	}
	const id = req.body
	Clients.deactivateCRM(parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при деактивации статуса CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.addLegPers = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Юрлицо не может быть пустым!'
		})
	}
	const { id, clientName, fullName, justName, form, code1c } = req.body
	Clients.addLegPers(parseInt(id),
		JSON.stringify(clientName),
		JSON.stringify(fullName),
		JSON.stringify(justName),
		form,
		JSON.stringify(code1c),
		(err, data) => {
			if (err) {
				res.status(500).send({
					message:
					err.message || `Ошибка при добавлении Юрлица..`
				})
			} else res.send(data = { code: 20000, data: data })
		})
}
exports.updateLegPers = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Юрлицо не может быть пустым!'
		})
	}
	const { id, clientID, fullName, justName, form, code1c } = req.body
	Clients.updateLegPers(
		parseInt(id),
		parseInt(clientID),
		JSON.stringify(fullName),
		JSON.stringify(justName),
		form,
		JSON.stringify(code1c),
		(err, data) => {
			if (err) {
				res.status(500).send({
					message:
					err.message || `Ошибка при обновлении Юрлица..`
				})
			} else res.send(data = { code: 20000, data: data })
		})
}
exports.deleteLegPers = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'ID Юрлица не может быть пустым!'
		})
	}
	const { id } = req.body
	Clients.deleteLegPers(parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при удалении Юрлица..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.addDomains = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Домен не может быть пустым!'
		})
	}
	const { id, name } = req.body
	Clients.addDomains(parseInt(id), JSON.stringify(name), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при добавлении Домена..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.updateDomains = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Домен не может быть пустым!'
		})
	}
	const { id, clientID, name } = req.body
	Clients.updateDomains(parseInt(id), parseInt(clientID), JSON.stringify(name), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при обновлении Домена..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.deleteDomains = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'ID Домена не может быть пустым!'
		})
	}
	const { id } = req.body
	Clients.deleteDomains(parseInt(id), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при удалении Домена..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.setPercent = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Тип процентов не может быть пустым!'
		})
	}
	const { id, type } = req.body
	Clients.setPercent(parseInt(id), JSON.stringify(type), (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при задании процентов CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}
exports.setCustomPercent = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Ручной процент не может быть пустым!'
		})
	}
	const { id, name, percent } = req.body
	Clients.getIdsPercent((err, data) => {
		if (err) {
			res.status(500).send({
				message: err.message || `Ошибка при получения спмска id процентов CRM..`
			})
		} else {
			const result = Object.values(JSON.parse(JSON.stringify(data))).find(obj => obj.crm_id === id)
			console.log(result)
			if (result) {
				console.log('do update:')
				Clients.updateCustomPercent(parseInt(id), name, parseFloat(percent), (err, data) => {
					console.log(percent)
					if (err) {
						res.status(500).send({
							message:
					err.message || `Ошибка при задании ручного процента в CRM..`
						})
					} else res.send(data = { code: 20000, data: data })
				})
			} else {
				console.log('do insert:')
				Clients.setCustomPercent(parseInt(id), name, parseFloat(percent), (err, data) => {
					console.log(percent)
					if (err) {
						res.status(500).send({
							message:
					err.message || `Ошибка при задании ручного процента в CRM..`
						})
					} else res.send(data = { code: 20000, data: data })
				})
			}
		}
	})
}
exports.deleteCustomPercent = (req, res) => {
	if (!req.body) {
		res.status(400).send({
			message: 'Ручной процент не может быть пустым!'
		})
	}
	const { id, value } = req.body
	Clients.deleteCustomPercent(parseInt(id), value, (err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || `Ошибка при удалении процентов CRM..`
			})
		} else res.send(data = { code: 20000, data: data })
	})
}

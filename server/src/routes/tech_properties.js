const db = require('../db')
module.exports = app => {
	app.get('/tech_properties', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT tp.id, tp.name, parent_id, GROUP_CONCAT(pt.name SEPARATOR ', ') types
				FROM Products_Tech_Properties tp
				LEFT JOIN Products_Tech_Fit tf ON tf.th=tp.id
				LEFT JOIN (
				SELECT pt.id, pt.name, 1 Element FROM Products_Type pt
				UNION ALL
				SELECT tpt.id, tpt.name, 2 FROM tsd_prices_type tpt) pt ON pt.id=tf.zip AND pt.Element=tf.element
				WHERE parent_id IS NULL
				GROUP BY tp.id`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/tech_properties_values', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT id, name, parent_id FROM Products_Tech_Properties tp`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.get('/tech_properties_fit', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT * FROM Products_Tech_Fit WHERE level=2`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/types', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT * FROM Products_Tech_Fit WHERE th = ` + req.body)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/add_tech_property', async (req, res) => {
		let data = Object.values(req.body)
		let nameProp = []
		let typeProp = []
		try {
			data.forEach(item => {
				if (typeof item === 'object' && item !== null) {
					typeProp = Object.assign([], item)
				} else {
					nameProp.push(item)
				}
			})
			console.log(typeProp)
			console.log(nameProp)
			await db.query(`INSERT INTO Products_Tech_Properties (name, parent_id) VALUES (?)`,
				[nameProp],
				async (err, response) => {
					if (err) throw err
					if (typeProp.length > 0) {
						typeProp.forEach(async type => {
							await db.query(`INSERT INTO Products_Tech_Fit (zip, th, element, level) VALUES (` + type.id + `, ` + response.insertId + `, ` + type.element + `, 1)`)
						})
					}
					res.json({ insertId: response.insertId })
				}
			)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/update_tech_property', async (req, res) => {
		let property = []
		let types = []
		let parentId = null
		if (req.body.parent_id) {
			delete req.body.parent_id
		}
		if (req.body.types && typeof req.body.types === 'object') {
			types = req.body.types
			parentId = req.body.id
			console.log(parentId)
			delete req.body.types
		}
		property = Object.values(req.body)
		console.log(property)
		console.log(types)
		try {
			if (property.length > 0) {
				await db.query(`UPDATE Products_Tech_Properties SET name = ? WHERE id = ?`, property)
			}
			if (types.length > 0) {
				await db.query(`SELECT * FROM Products_Tech_Fit WHERE th = ` + parentId,
					(err, rows) => {
						if (err) throw err
						let typesInDB = Object.values(JSON.parse(JSON.stringify(rows)))
						console.log(typesInDB + ' - значение до обновления БД')
						typesInDB.forEach(async item => {
							if (types.find(type => type.id === item.zip) === undefined) {
								await db.query(`DELETE FROM Products_Tech_Fit WHERE zip = ` + item.zip + ` AND th = ` + parentId)
							}
						})
						types.forEach(async type => {
							if (typesInDB.find(item => item.zip === type.id) === undefined) {
								await db.query(`INSERT INTO Products_Tech_Fit (zip, th, element, level) VALUES (` + type.id + `, ` + parentId + `, ` + type.element + `, 1)`)
							}
						})
						res.send('success')
					}
				)
			} else {
				res.send('success')
			}
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/delete_tech_property', async (req, res) => {
		console.log(req.body)
		try {
			await db.query(`DELETE FROM Products_Tech_Properties WHERE id = ` + req.body + `;
				 	DELETE FROM Products_Tech_Properties WHERE parent_id = ` + req.body + `;
					DELETE FROM Products_Tech_Fit WHERE th = ` + req.body,
			(err) => {
				if (err) throw err
				res.json({ text: 'Свойство с id ' + req.body + ' успешно удалено.' })
			}
			)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/delete_tech_property_value', async (req, res) => {
		console.log(req.body)
		try {
			await db.query(`DELETE FROM Products_Tech_Properties WHERE id = ` + req.body,
				(err) => {
					if (err) throw err
					res.json({ text: 'Значение с id ' + req.body + ' успешно удалено.' })
				}
			)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/add_tech_property_value', async (req, res) => {
		console.log(Object.values(req.body))
		try {
			await db.query(`INSERT INTO Products_Tech_Properties (name, parent_id) VALUES (?)`,
				[Object.values(req.body)],
				(err, response) => {
					if (err) throw err
					res.json({ insertId: response.insertId })
				}
			)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/check_use_type_in_prop', async (req, res) => {
		let data = []
		const id = req.body.id
		const elementID = req.body.item.id
		console.log(id)
		console.log(elementID)
		try {
			data = await db.query(`SELECT 1
				FROM Products_Tech_Fit pf1
				LEFT JOIN Products_Tech_Properties tp ON tp.parent_id=pf1.th
				LEFT JOIN Products_Tech_Fit pf2 ON pf2.th=tp.id
				LEFT JOIN Products_Market pmr ON pmr.id=pf2.zip
				LEFT JOIN (
					SELECT pm.JIRA_ID, pm.Class_ID, pm.Class_Type_ID, pm.NAME, 1 Element
					FROM Products_Main pm
					UNION ALL
					SELECT m.ID, m.CLASS_ID, m.TYPE_ID, m.NAME, 2
					FROM MODELS m) pm ON pm.JIRA_ID=pmr.MAIN_JIRA_ID AND pm.Element=pmr.Element_Type
				WHERE pf1.th= ` + id + ` AND pf1.zip = ` + elementID + ` AND pm.Class_Type_ID=pf1.zip`
			)
			console.log(data)
			res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/tech_properties/check_use_value_in_prop', async (req, res) => {
		let data = []
		let ids
		const parentId = req.body.parent_id
		if (parentId) {
			ids = req.body.id
		} else {
			const tpv = req.body.tpv.map(obj => obj.id).join(', ')
			tpv ? ids = tpv : ids = 0
		}
		try {
			data = await db.query(`SELECT 1 FROM Products_Tech_Fit WHERE th IN (` + ids + `) GROUP BY level`)
			res.json(data)
		} catch (error) {
			if (error) throw error
			res.json({
				success: false,
				error: error
			})
		}
	})
}

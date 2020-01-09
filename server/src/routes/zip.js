const db = require('../db')
const multer = require('multer')
const crypto = require('crypto')
const fs = require('fs')
const config = require('../config/config')
const sizeOf = require('image-size')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var newDestination = './uploads/zip_images/' + req.body.id
		var stat = null
		try {
			stat = fs.statSync(newDestination)
		} catch (err) {
			fs.mkdirSync(newDestination)
		}
		if (stat && !stat.isDirectory()) {
			throw new Error('Directory cannot be created because an inode of a different type exists at "' + newDestination + '"')
		}
		cb(null, newDestination)
	},
	filename: (req, file, cb) => {
		let customFileName = crypto.randomBytes(5).toString('hex')
		let fileExtension = file.originalname.split('.')[1]
		cb(null, customFileName + '.' + fileExtension)
	}
})
const upload = multer({ storage: storage }).single('image')

module.exports = app => {
	app.get('/zip', async (req, res) => {
		let data = []
		try {
			data = await db.query(`SELECT JIRA_ID zipID, pc.name zipCLASS, CONCAT(pt.name, " ",  pm.NAME) zipNAME,
				GROUP_CONCAT(DISTINCT m.NAME SEPARATOR ", ") zipMODELS, GROUP_CONCAT(DISTINCT pmr.ART_1C,' (',pcon.name_short,')') zipART, GROUP_CONCAT(DISTINCT pmr.PN) zipPN,
				pm.TIME zipTIME, pcon.name_ru zipCONDITIONS, ps.name zipSUPPLIERS, pmr.Pack zipPack, pt.name zipTYPE, pm.NAME SHORTNAME, pm.email zipemail, pm.date zipdate
				FROM Products_Main pm
				LEFT JOIN Products_Type pt ON pt.id=pm.Class_Type_ID
				LEFT JOIN Products_Class pc ON pc.id=pm.Class_ID
				LEFT JOIN Products_Fit pf ON pf.MAIN_JIRA_ID=pm.JIRA_ID
				LEFT JOIN MODELS m ON m.ID=pf.Model_JIRA_ID
				LEFT JOIN Products_Market pmr ON pmr.MAIN_JIRA_ID=JIRA_ID
				LEFT JOIN Products_Condition pcon ON pcon.id=pmr.Condition
				LEFT JOIN Products_Supplier ps ON ps.id=pmr.Supplier_ID
				WHERE (pmr.Element_Type = 1 OR pmr.Element_Type IS NULL)
				GROUP BY JIRA_ID
				ORDER BY JIRA_ID DESC`)
			res.json(data)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/zip/uploadphoto', upload, async (req, res) => {
		try {
			const originalname = req.file.originalname
			const dir = './uploads/zip_images/'
			var dimensions = sizeOf(dir + req.body.id + '/' + req.file.filename)
			res.json({
				success:
					'Файл ' +
					originalname +
					' успешно загружен',
				url: 'http://' + config.host + ':' + config.port + '/zip_images/' + req.body.id + '/' + req.file.filename,
				width: dimensions.width
			})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/zip/get_images', async (req, res) => {
		let id = req.body[0]
		let dir = './uploads/zip_images/'
		let files_ = []
		if (id) {
			try {
				var files = fs.readdirSync(dir + id)
				for (var i in files) {
					var name = files[i]
					var dimensions = sizeOf(dir + id + '/' + name)
					files_.push({ url: 'http://' + config.host + ':' + config.port + '/zip_images/' + id + '/' + name, width: dimensions.width })
				}
				console.log(files_)
				res.send(files_)
			} catch (err) {
				if (err.code !== 'ENOENT') throw err
				res.json({ error: err.message })
			}
		} else {
			var folders = fs.readdirSync(dir)
			for (var key in folders) {
				var zipid = folders[key]
				var filename = fs.readdirSync(dir + zipid + '/')
				if (filename[0] !== undefined) {
					var dimen = sizeOf(dir + zipid + '/' + filename[0])
					files_.push({
						url: 'http://' + config.host + ':' + config.port + '/zip_images/' + zipid + '/' + filename[0],
						id: zipid,
						width: dimen.width
					})
				}
			}
			console.log(files_)
			res.send(files_)
		}
	})
	app.post('/zip/delImg', (req, res) => {
		try {
			const id = req.body[0]
			const name = req.body[1]
			let dir = './uploads/zip_images/'
			fs.unlink(dir + id + '/' + name, function (err) {
				if (err) {
					console.error(err)
				}
				console.log('Файл ' + name + ' успешно удалён')
			})
			res.json({
				success: 'Файл ' + name + ' успешно удалён',
				url: 'http://' + config.host + ':' + config.port + '/zip_images/' + id + '/' + name
			})
		} catch (error) {
			console.log(error)
			res.json({ success: false, error: error.message })
		}
	})
	app.post('/zip/add_type', async (req, res) => {
		const name = req.body.name
		const time = req.body.install_time
		try {
			await db.query(`INSERT INTO Products_Type (name, install_time) VALUES (${JSON.stringify(name)}, ${time})`,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true, lastId: res2.insertId })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/edit_type', async (req, res) => {
		let id = req.body.id
		let name = JSON.stringify(req.body.name)
		let time = req.body.install_time
		try {
			await db.query(`UPDATE Products_Type SET name = ${name}, install_time = ${time} WHERE id = ${id}`,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/del_type', async (req, res) => {
		console.log('Удаление производителя с id: ' + req.body)
		try {
			await db.query(
				'DELETE FROM `Products_Type` WHERE id = ?',
				req.body,
				async (err, response) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/zip/add_class', async (req, res) => {
		try {
			await db.query('INSERT INTO `Products_Class` (`name`) VALUES (?)',
				req.body,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true, lastId: res2.insertId })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/edit_class', async (req, res) => {
		let id = req.body.id
		let name = JSON.stringify(req.body.name)
		console.log(id)
		console.log(name)
		try {
			await db.query('UPDATE `Products_Class` SET `name` = ' + name + ' WHERE `id` = ' + id,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/del_class', async (req, res) => {
		console.log('Удаление производителя с id: ' + req.body)
		try {
			await db.query(
				'DELETE FROM `Products_Class` WHERE id = ?',
				req.body,
				async (err, response) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
	app.post('/zip/add_supplier', async (req, res) => {
		try {
			await db.query('INSERT INTO `Products_Supplier` (`name`) VALUES (?)',
				req.body,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true, lastId: res2.insertId })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/edit_supplier', async (req, res) => {
		let id = req.body.id
		let name = JSON.stringify(req.body.name)
		console.log(id)
		console.log(name)
		try {
			await db.query('UPDATE `Products_Supplier` SET `name` = ' + name + ' WHERE `id` = ' + id,
				(err, res2) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({ error: error })
		}
	})
	app.post('/zip/del_supplier', async (req, res) => {
		console.log('Удаление производителя с id: ' + req.body)
		try {
			await db.query(
				'DELETE FROM `Products_Supplier` WHERE id = ?',
				req.body,
				async (err, response) => {
					if (err) throw err
					res.json({ success: true })
				}
			)
		} catch (error) {
			console.log(error)
			res.json({
				success: false,
				error: error
			})
		}
	})
}

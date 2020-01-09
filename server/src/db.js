const mysql = require('mysql')
const util = require('util')
const config = require('./config/config')
const db = mysql.createPool(config.db)

// Ping database to check for common exception errors.
db.getConnection((err, connection) => {
	if (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.error('Database connection was closed.')
		}
		if (err.code === 'ER_CON_COUNT_ERROR') {
			console.error('Database has too many connections.')
		}
		if (err.code === 'ECONNREFUSED') {
			console.error('Database connection was refused.')
		}
	}

	if (connection) connection.release()
})

// Promisify for Node.js async/await.
db.query = util.promisify(db.query)

module.exports = db

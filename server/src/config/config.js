module.exports = {
	port: process.env.PORT || 3000,
	host: process.env.HOST || 'dev.tsd-group.ru',
	db: {
		connectionLimit: 15,
		host: 'support.tsd-group.ru',
		user: 'root',
		password: '000TSDservice',
		database: 'tsddb',
		multipleStatements: true,
		charset: 'utf8_general_ci',
		debug: false
	},
	email: {
		user: 'epf@tsd-group.ru',
		password: 'Bassman148846208',
		host: 'mx1.tsd-group.ru',
		ssl: false
	}
}

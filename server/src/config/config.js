module.exports = {
	port: process.env.PORT || 3000,
	host: process.env.HOST || 'dev.tsd-group.ru',
	db: {
		connectionLimit: 15,
		host: 'xxxxxxxxx',
		user: 'root',
		password: 'xxxxxxxxx',
		database: 'tsddb',
		multipleStatements: true,
		charset: 'utf8_general_ci',
		debug: false
	},
	email: {
		user: 'xxx@xxx.com',
		password: 'xxxxxxxxx',
		host: 'mx1.tsd-group.ru',
		ssl: false
	}
}

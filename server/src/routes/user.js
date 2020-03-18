module.exports = app => {
	const User = require('../controllers/user.controller.js')

	app.get('/user/bonus_sale', User.getBonusSale)
	app.post('/user/bonus_sale_sum', User.getBonusSaleSum)
	app.get('/user/bonus_profit', User.getBonusProfit)
	app.post('/user/bonus_profit_sum', User.getBonusProfitSum)
}

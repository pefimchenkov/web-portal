module.exports = app => {
	const EngineersStock = require('../controllers/engineersstock.controller.js')

	app.get('/engineers_stock', EngineersStock.fetchEngineersStock)
	app.get('/engineers_stock_archive', EngineersStock.fetchEngineersStockArchive)
	app.get('/engineers_stock_good', EngineersStock.fetchEngineersStockGood)
	app.post('/engineers_stock_details', EngineersStock.fetchEngineersStockDetails)
	app.post('/engineers_stock/set_condition', EngineersStock.setConditionStock)
	app.post('/engineers_stock/delete', EngineersStock.delete)
	app.post('/engineers_stock/send_request', EngineersStock.sendRequest)
	app.post('/engineers_stock/send_approve', EngineersStock.sendApprove)
	app.post('/engineers_stock/send_decline', EngineersStock.sendDecline)
	app.post('/engineers_stock/send_check', EngineersStock.sendCheck)
	app.post('/engineers_stock/send_request_for_zip', EngineersStock.sendRequestForZip)
}

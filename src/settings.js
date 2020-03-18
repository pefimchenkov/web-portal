module.exports = {
	title: 'Web Portal TSD Group',
	jira_url: 'http://support.tsd-group.ru/browse/',
	barcodespace_url:
		'https://barcodespace.ru/index.php?route=extension/module/market_orders/newOrder&key=l2tRotC3RGKHY8H9FyCpAySq1IhR9Pl&points=',
	/**
	 * @type {boolean} true | false
	 * @description Whether show the settings right-panel
	 */
	showSettings: true,

	/**
	 * @type {boolean} true | false
	 * @description Whether need tagsView
	 */
	tagsView: true,

	/**
	 * @type {boolean} true | false
	 * @description Whether fix the header
	 */
	fixedHeader: false,

	/**
	 * @type {boolean} true | false
	 * @description Whether show the logo in sidebar
	 */
	sidebarLogo: false,

	/**
	 * @type {string | array} 'production' | ['production', 'development']
	 * @description Need show err logs component.
	 * The default is only used in the production env
	 * If you want to also use it in dev, you can pass ['production', 'development']
	 */
	errorLog: 'production'
}

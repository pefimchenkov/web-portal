// vue.config.js
const path = require('path')

function resolve (dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	chainWebpack: config => {
		config.module
			.rule('vue')
			.use('vue-loader')
			.loader('vue-loader')
			.tap(options => Object.assign(options, {
				transformAssetUrls: {
					'v-img': ['src', 'lazy-src'],
					'v-card': 'src',
					'v-card-media': 'src',
					'v-responsive': 'src',
					'v-carousel-item': 'src'
				}
			}))
		// set svg-sprite-loader
		config.module
			.rule('svg')
			.exclude.add(resolve('src/icons'))
			.end()
		config.module
			.rule('icons')
			.test(/\.svg$/)
			.include.add(resolve('src/icons'))
			.end()
			.use('svg-sprite-loader')
			.loader('svg-sprite-loader')
			.options({
				symbolId: 'icon-[name]'
			})
			.end()
	}
}

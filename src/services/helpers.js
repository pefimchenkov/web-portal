import moment from 'moment'

function formatDate (value) {
	if (value) {
		if (typeof moment(new Date(value)).toISOString() !== 'object') {
			return moment(new Date(value)).format('YYYY-MM-DD')
		} else {
			return moment(new Date(value.toString())).format('YYYY-MM-DD')
		}
	} else {
		return null
	}
}

const duplicates = array =>
	array.filter(value => {
		const index = array.findIndex(
			needle => needle === value
		)
		return array.findIndex(
			(needle, i) => {
				return needle === value && i !== index
			}
		) > -1
	})

export { formatDate, duplicates }

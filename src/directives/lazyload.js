export default {
	inserted: image => {
		function loadImage () {
			if (image) {
				image.addEventListener('load', () => {
					setTimeout(() => image.classList.add('loaded'), 100)
				})
				image.addEventListener('error', () => console.log('error'))
				image.src = image.dataset.url
			}
		}

		function handleIntersect (entries, observer) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					loadImage()
					observer.unobserve(image)
				}
			})
		}

		function createObserver () {
			const options = {
				root: null,
				threshold: '0'
			}
			const observer = new IntersectionObserver(handleIntersect, options)
			observer.observe(image)
		}
		if (window['IntersectionObserver']) {
			createObserver()
		} else {
			loadImage()
		}
	}
}

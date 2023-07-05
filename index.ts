const wrapper = document.querySelector('.wrapper') as HTMLDivElement
const input = document.querySelector('#search') as HTMLInputElement
const insensitive = document.querySelector(
	'.search__insensitive-checkbox'
) as HTMLInputElement


let options = 'g'

function highlightPhrase(phrase: string, options: string) {
	const paragraphs = wrapper.children
	const phraseRegex = new RegExp(phrase, options)
	for (let paragraph of paragraphs) {
		if (!phrase) {
			paragraph.innerHTML = paragraph.textContent!
		} else {
			paragraph.innerHTML = paragraph.textContent!.replace(
				phraseRegex,
				match => `<span class='highlighted'>${match}</span>`
			)
		}
	}
}

const debouncedHighlightPhrase = debounce(highlightPhrase, 300)

input.addEventListener('input', function () {
	debouncedHighlightPhrase(this.value, options)
})

insensitive.addEventListener('change', function () {
	if (this.checked) {
		options += 'i'
	} else {
		options = options.replace('i', '')
	}
	if (input.value) {
		highlightPhrase(input.value, options)
	}
})

window.addEventListener('load', () => {
	if (insensitive.checked) {
		options += 'i'
	}
})

function debounce(callback: Function, ms: number) {
	let timer: number

	return (...args: any) => {
		clearTimeout(timer)
		timer = setTimeout(() => callback(...args), ms)
	}
}

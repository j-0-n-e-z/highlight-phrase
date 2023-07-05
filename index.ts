const wrapper = document.querySelector('.wrapper') as HTMLDivElement
const input = document.querySelector('#search') as HTMLInputElement
const insensitive = document.querySelector(
	'.search__insensitive-checkbox'
) as HTMLInputElement

let additionalRegexOptions: '' | 'i' = ''
const paragraphs = [...wrapper.children] as HTMLParagraphElement[]
const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400)

input.addEventListener('input', function () {
	debouncedHighlightAllParagraphs(paragraphs, this.value)
})

insensitive.addEventListener('change', function () {
	additionalRegexOptions = this.checked ? 'i' : ''
	if (input.value) {
		highlightAllParagraphs(paragraphs, input.value)
	}
})

window.addEventListener('load', () => {
	if (insensitive.checked) {
		additionalRegexOptions = 'i'
	}
})

function highlightAllParagraphs(
	paragraphs: HTMLParagraphElement[],
	phrase: string
) {
	paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase))
}

function highlightParagraph(paragraph: HTMLParagraphElement, phrase: string) {
	if (!phrase) {
		paragraph.innerHTML = paragraph.textContent || ''
		return
	}
	const phraseRegex = new RegExp(phrase, 'g' + additionalRegexOptions)
	paragraph.innerHTML =
		paragraph.textContent?.replace(
			phraseRegex,
			match => `<span class='highlighted'>${match}</span>`
		) || ''
}

function debounce(callback: Function, ms: number) {
	let timer: number

	return (...args: any) => {
		clearTimeout(timer)
		timer = setTimeout(() => callback(...args), ms)
	}
}

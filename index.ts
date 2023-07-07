const wrapper = document.querySelector('.wrapper') as HTMLDivElement
const input = document.querySelector('#search') as HTMLInputElement
const insensitive = document.querySelector(
	'.search__insensitive-checkbox'
) as HTMLInputElement

let additionalRegexOptions: Set<'g' | 'i'> = new Set(['g'])
const paragraphs = [...wrapper.children] as HTMLParagraphElement[]
const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400)
const highlightWorker = new Worker('./highlight.js', {
	type: 'module'
}) as HighlightWorker

highlightWorker.onmessage = (message: MessageEvent<HighlightedParagraph>) => {
	const { id, text, containsPhrase } = message.data
	const paragraph = wrapper.querySelector(
		`p[data-id="${id}"`
	) as HTMLParagraphElement
	if (containsPhrase) {
		paragraph.classList.add('contains-phrase')
	} else {
		paragraph.classList.remove('contains-phrase')	
	}
	paragraph.innerHTML = text
}

input.addEventListener('input', function () {
	debouncedHighlightAllParagraphs(paragraphs, this.value)
})

insensitive.addEventListener('change', function () {
	if (this.checked) {
		additionalRegexOptions.add('i')
	} else {
		additionalRegexOptions.delete('i')
	}

	if (input.value) {
		highlightAllParagraphs(paragraphs, input.value)
	}
})

window.addEventListener('load', () => {
	if (insensitive.checked) {
		additionalRegexOptions.add('i')
	}
})

function highlightAllParagraphs(
	paragraphs: HTMLParagraphElement[],
	phrase: string
) {
	paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase))
}

function highlightParagraph(paragraph: HTMLParagraphElement, phrase: string) {
	const paragraphWithRegex = {
		id: paragraph.getAttribute('data-id'),
		text: paragraph.textContent,
		regex: new RegExp(phrase, [...additionalRegexOptions].join(''))
	} as ParagraphWithRegex

	highlightWorker.postMessage(paragraphWithRegex)
}

function debounce(callback: Function, ms: number) {
	let timer: number

	return (...args: any) => {
		clearTimeout(timer)
		timer = setTimeout(() => callback(...args), ms)
	}
}

interface Paragraph {
	id: string
	text: string
}

interface HighlightedParagraph extends Paragraph {
	containsPhrase: boolean
}

interface ParagraphWithRegex extends Paragraph {
	regex: RegExp
}

interface HighlightWorker extends Omit<Worker, 'postMessage'> {
	postMessage(message: ParagraphWithRegex | HighlightedParagraph): void
}

export { Paragraph, ParagraphWithRegex, highlightWorker }

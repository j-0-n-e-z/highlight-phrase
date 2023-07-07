const wrapper = document.querySelector('.wrapper') as HTMLDivElement
const input = document.querySelector('#search') as HTMLInputElement
const insensitive = document.querySelector(
	'.search__insensitive-checkbox'
) as HTMLInputElement

let regexOptions: Set<'g' | 'i'> = new Set(['g'])
const paragraphs = [...wrapper.children] as HTMLParagraphElement[]

const highlightWorker: HighlightWorker = new Worker('./highlight.js', {
	type: 'module'
})
highlightWorker.onmessage = (message: MessageEvent<Paragraph>) => {
	const { id, text } = message.data
	const paragraph = wrapper.querySelector(
		`p[data-id="${id}"]`
	) as HTMLParagraphElement

	if (paragraph.textContent !== text) {
		paragraph.classList.add('contains-phrase')
	} else {
		paragraph.classList.remove('contains-phrase')
	}
	
	paragraph.innerHTML = text
}

const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400)
input.addEventListener('input', function () {
	debouncedHighlightAllParagraphs(paragraphs, this.value)
})

insensitive.addEventListener('change', function () {
	if (this.checked) {
		regexOptions.add('i')
	} else {
		regexOptions.delete('i')
	}

	if (input.value) {
		highlightAllParagraphs(paragraphs, input.value)
	}
})

window.addEventListener('load', () => {
	if (insensitive.checked) {
		regexOptions.add('i')
	}
})

function highlightAllParagraphs(
	paragraphs: HTMLParagraphElement[],
	phrase: string
) {
	paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase))
}

function highlightParagraph(paragraph: HTMLParagraphElement, phrase: string) {
	const paragraphToHighlight: ParagraphToHighlight = {
		id: paragraph.getAttribute('data-id') || '',
		text: paragraph.textContent || '',
		regex: new RegExp(phrase, [...regexOptions].join(''))
	}

	highlightWorker.postMessage(paragraphToHighlight)
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

interface ParagraphToHighlight extends Paragraph {
	regex: RegExp
}

interface HighlightWorker extends Omit<Worker, 'postMessage'> {
	postMessage(message: ParagraphToHighlight | Paragraph): void
}

export { ParagraphToHighlight }

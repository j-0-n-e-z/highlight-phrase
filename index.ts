const wrapper = document.querySelector('.wrapper') as HTMLDivElement
const input = document.querySelector('.search__input') as HTMLInputElement
const insensitive = document.querySelector(
	'.search__insensitive-checkbox'
) as HTMLInputElement

const regexOptions: Set<'g' | 'i'> = new Set(['g'])
const paragraphs = [...wrapper.children] as HTMLParagraphElement[]

const highlightWorker: HighlightWorker = new Worker('./highlight-worker.js', {
	type: 'module'
})
highlightWorker.onmessage = (message: MessageEvent<Paragraph>) => {
	const { id, text } = message.data
	const paragraph = wrapper.querySelector(
		`p[data-id="${id}"]`
	) as HTMLParagraphElement

	const isTextHighlighted = paragraph.textContent !== text

	if (isTextHighlighted) {
		paragraph.classList.add('contains-phrase')
	} else {
		paragraph.classList.remove('contains-phrase')
	}

	paragraph.innerHTML = text
}

const highlightAllParagraphsDebounced = debounce(highlightAllParagraphs, 400)
input.addEventListener('input', function () {
	highlightAllParagraphsDebounced(paragraphs, this.value)
})

insensitive.addEventListener('change', function () {
	if (this.checked) {
		regexOptions.add('i')
	} else {
		regexOptions.delete('i')
	}

	if (input.value) {
		highlightAllParagraphs()
	}
})

window.addEventListener('load', () => {
	if (insensitive.checked) {
		regexOptions.add('i')
	}
})

function highlightAllParagraphs() {
	paragraphs.forEach(paragraph => highlightParagraph(paragraph))
}

function highlightParagraph(paragraph: HTMLParagraphElement) {
	const paragraphToHighlight: ParagraphToHighlight = {
		id: paragraph.getAttribute('data-id') || '',
		text: paragraph.textContent || '',
		regex: new RegExp(input.value, [...regexOptions].join(''))
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

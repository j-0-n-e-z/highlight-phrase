import { ParagraphToHighlight } from './index'

self.onmessage = (message: MessageEvent<ParagraphToHighlight>) => {
	// some long operation
	for (let i = 0; i < 999999999; i++) {}

	let { id, text, regex } = message.data

	const isPhraseEmpty = regex.source === '(?:)'

	if (isPhraseEmpty) {
		self.postMessage({ id, text })
		return
	}

	text = text.replace(
		regex,
		match => `<span class='highlighted'>${match}</span>`
	)

	self.postMessage({
		id,
		text
	})
}

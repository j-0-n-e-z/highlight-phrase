import { ParagraphWithRegex } from './index'

self.onmessage = (message: MessageEvent<ParagraphWithRegex>) => {
	for (let i = 0; i < 999999999; i++) {}

	const { id, text, regex } = message.data as ParagraphWithRegex

	console.log(regex)

	if (regex.source === '(?:)') {
		self.postMessage({ id, text, containsPhrase: false })
		return
	}

	let highlightedText = text.replace(
		regex,
		match => `<span class='highlighted'>${match}</span>`
	)
	self.postMessage({
		id,
		text: highlightedText,
		containsPhrase: regex.test(text)
	})
}

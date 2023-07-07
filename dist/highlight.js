self.onmessage = (message) => {
    for (let i = 0; i < 999999999; i++) { }
    let { id, text, regex } = message.data;
    if (regex.source === '(?:)') {
        self.postMessage({ id, text });
        return;
    }
    text = text.replace(regex, match => `<span class='highlighted'>${match}</span>`);
    self.postMessage({
        id,
        text
    });
};
export {};

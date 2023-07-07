const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('#search');
const insensitive = document.querySelector('.search__insensitive-checkbox');
let regexOptions = new Set(['g']);
const paragraphs = [...wrapper.children];
const highlightWorker = new Worker('./highlight.js', {
    type: 'module'
});
highlightWorker.onmessage = (message) => {
    const { id, text } = message.data;
    const paragraph = wrapper.querySelector(`p[data-id="${id}"]`);
    if (paragraph.textContent !== text) {
        paragraph.classList.add('contains-phrase');
    }
    else {
        paragraph.classList.remove('contains-phrase');
    }
    paragraph.innerHTML = text;
};
const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400);
input.addEventListener('input', function () {
    debouncedHighlightAllParagraphs(paragraphs, this.value);
});
insensitive.addEventListener('change', function () {
    if (this.checked) {
        regexOptions.add('i');
    }
    else {
        regexOptions.delete('i');
    }
    if (input.value) {
        highlightAllParagraphs(paragraphs, input.value);
    }
});
window.addEventListener('load', () => {
    if (insensitive.checked) {
        regexOptions.add('i');
    }
});
function highlightAllParagraphs(paragraphs, phrase) {
    paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase));
}
function highlightParagraph(paragraph, phrase) {
    const paragraphToHighlight = {
        id: paragraph.getAttribute('data-id') || '',
        text: paragraph.textContent || '',
        regex: new RegExp(phrase, [...regexOptions].join(''))
    };
    highlightWorker.postMessage(paragraphToHighlight);
}
function debounce(callback, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), ms);
    };
}
export {};

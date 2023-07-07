const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('#search');
const insensitive = document.querySelector('.search__insensitive-checkbox');
let additionalRegexOptions = new Set(['g']);
const paragraphs = [...wrapper.children];
const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400);
const highlightWorker = new Worker('./highlight.js', {
    type: 'module'
});
highlightWorker.onmessage = (message) => {
    const { id, text, containsPhrase } = message.data;
    const paragraph = wrapper.querySelector(`p[data-id="${id}"`);
    if (containsPhrase) {
        paragraph.classList.add('contains-phrase');
    }
    else {
        paragraph.classList.remove('contains-phrase');
    }
    paragraph.innerHTML = text;
};
input.addEventListener('input', function () {
    debouncedHighlightAllParagraphs(paragraphs, this.value);
});
insensitive.addEventListener('change', function () {
    if (this.checked) {
        additionalRegexOptions.add('i');
    }
    else {
        additionalRegexOptions.delete('i');
    }
    if (input.value) {
        highlightAllParagraphs(paragraphs, input.value);
    }
});
window.addEventListener('load', () => {
    if (insensitive.checked) {
        additionalRegexOptions.add('i');
    }
});
function highlightAllParagraphs(paragraphs, phrase) {
    paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase));
}
function highlightParagraph(paragraph, phrase) {
    const paragraphWithRegex = {
        id: paragraph.getAttribute('data-id'),
        text: paragraph.textContent,
        regex: new RegExp(phrase, [...additionalRegexOptions].join(''))
    };
    highlightWorker.postMessage(paragraphWithRegex);
}
function debounce(callback, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), ms);
    };
}
export { highlightWorker };

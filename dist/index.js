const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('.search__input');
const insensitive = document.querySelector('.search__insensitive-checkbox');
const regexOptions = new Set(['g']);
const paragraphs = [...wrapper.children];
const highlightWorker = new Worker('./highlight-worker.js', {
    type: 'module'
});
highlightWorker.onmessage = (message) => {
    const { id, text } = message.data;
    const paragraph = wrapper.querySelector(`p[data-id="${id}"]`);
    const isTextHighlighted = paragraph.textContent !== text;
    if (isTextHighlighted) {
        paragraph.classList.add('contains-phrase');
    }
    else {
        paragraph.classList.remove('contains-phrase');
    }
    paragraph.innerHTML = text;
};
const highlightAllParagraphsDebounced = debounce(highlightAllParagraphs, 400);
input.addEventListener('input', function () {
    highlightAllParagraphsDebounced(paragraphs, this.value);
});
insensitive.addEventListener('change', () => {
    console.log(this);
    if (this.checked) {
        regexOptions.add('i');
    }
    else {
        regexOptions.delete('i');
    }
    if (input.value) {
        highlightAllParagraphs();
    }
});
window.addEventListener('load', () => {
    if (insensitive.checked) {
        regexOptions.add('i');
    }
});
function highlightAllParagraphs() {
    paragraphs.forEach(paragraph => highlightParagraph(paragraph));
}
function highlightParagraph(paragraph) {
    const paragraphToHighlight = {
        id: paragraph.getAttribute('data-id') || '',
        text: paragraph.textContent || '',
        regex: new RegExp(input.value, [...regexOptions].join(''))
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

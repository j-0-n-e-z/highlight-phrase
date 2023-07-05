"use strict";
const wrapper = document.querySelector('.wrapper');
const input = document.querySelector('#search');
const insensitive = document.querySelector('.search__insensitive-checkbox');
let additionalRegexOptions = '';
const paragraphs = [...wrapper.children];
const debouncedHighlightAllParagraphs = debounce(highlightAllParagraphs, 400);
input.addEventListener('input', function () {
    debouncedHighlightAllParagraphs(paragraphs, this.value);
});
insensitive.addEventListener('change', function () {
    additionalRegexOptions = this.checked ? 'i' : '';
    if (input.value) {
        highlightAllParagraphs(paragraphs, input.value);
    }
});
window.addEventListener('load', () => {
    if (insensitive.checked) {
        additionalRegexOptions = 'i';
    }
});
function highlightAllParagraphs(paragraphs, phrase) {
    paragraphs.forEach(paragraph => highlightParagraph(paragraph, phrase));
}
function highlightParagraph(paragraph, phrase) {
    var _a;
    if (!phrase) {
        paragraph.innerHTML = paragraph.textContent || '';
        return;
    }
    const phraseRegex = new RegExp(phrase, 'g' + additionalRegexOptions);
    paragraph.innerHTML =
        ((_a = paragraph.textContent) === null || _a === void 0 ? void 0 : _a.replace(phraseRegex, match => `<span class='highlighted'>${match}</span>`)) || '';
}
function debounce(callback, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), ms);
    };
}

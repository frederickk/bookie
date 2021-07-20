import {Localize} from './ts/localize';

const markdownTextarea =
    <HTMLTextAreaElement>document.querySelector('.intro textarea');
const htmlPreview =
    <HTMLElement>document.querySelector('.intro .notes__content--html');

const fitTextareaToContent = () => {
  markdownTextarea.style.height = `${markdownTextarea.scrollHeight}px`;
}

window.addEventListener('DOMContentLoaded', () => {
  new Localize();
  fitTextareaToContent();
});
htmlPreview.addEventListener('mouseup', () => {
  window.setTimeout(() => {
    fitTextareaToContent();
  }, 10);
})
markdownTextarea.addEventListener('input', fitTextareaToContent);


export function getTextBeforeCursor(editable: HTMLElement): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return '';
  }

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) {
    return '';
  }

  const preRange = range.cloneRange();
  preRange.selectNodeContents(editable);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString();
}

export function replaceTextBeforeCursor(
  editable: HTMLElement,
  charsToReplace: number,
  newText: string,
): void {
  editable.focus();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  if (!editable.contains(range.startContainer)) {
    return;
  }

  selection.removeAllRanges();
  selection.addRange(range);
  selection.collapseToEnd();

  for (let i = 0; i < charsToReplace; i++) {
    selection.modify('extend', 'backward', 'character');
  }

  selection.deleteFromDocument();

  const insertRange = selection.getRangeAt(0);
  insertRange.deleteContents();
  const textNode = document.createTextNode(newText);
  insertRange.insertNode(textNode);
  insertRange.setStartAfter(textNode);
  insertRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(insertRange);

  editable.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertReplacementText',
      data: newText,
    }),
  );
}

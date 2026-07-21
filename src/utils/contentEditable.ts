export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/**
 * Text before the caret inside a contenteditable. Falls back to full text when
 * selection is missing (common right after focus changes in ProseMirror).
 */
export function getTextBeforeCursor(editable: HTMLElement): string {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (editable.contains(range.startContainer)) {
      const preRange = range.cloneRange();
      preRange.selectNodeContents(editable);
      preRange.setEnd(range.startContainer, range.startOffset);
      return preRange.toString();
    }
  }

  return editable.innerText.replace(/\u00a0/g, ' ');
}

function getTextNodeAtCharacterOffset(
  root: HTMLElement,
  charOffset: number,
): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(0, charOffset);
  let current = walker.nextNode() as Text | null;
  let last: Text | null = null;

  while (current) {
    last = current;
    const length = current.data.length;
    if (remaining <= length) {
      return { node: current, offset: remaining };
    }
    remaining -= length;
    current = walker.nextNode() as Text | null;
  }

  if (last) {
    return { node: last, offset: last.data.length };
  }

  return null;
}

function restoreSelection(caretRange: Range): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  selection.removeAllRanges();
  selection.addRange(caretRange);
}

function placeCaretAtEnd(editable: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(editable);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectCharRange(editable: HTMLElement, start: number, end: number): boolean {
  const startPos = getTextNodeAtCharacterOffset(editable, start);
  const endPos = getTextNodeAtCharacterOffset(editable, end);
  if (!startPos || !endPos) {
    return false;
  }

  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);

  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function insertMultilineText(text: string): void {
  const lines = normalizeNewlines(text).split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    if (index > 0) {
      document.execCommand('insertParagraph');
    }
    if (lines[index].length > 0) {
      document.execCommand('insertText', false, lines[index]);
    }
  }
}

/**
 * Removes `triggerText` (e.g. `//` or `//api`) before the caret, then inserts `newText`.
 */
export function replaceTextBeforeCursor(
  editable: HTMLElement,
  triggerText: string,
  newText: string,
  caretRange?: Range | null,
): void {
  if (!triggerText) {
    return;
  }

  editable.focus();

  if (caretRange && editable.contains(caretRange.startContainer)) {
    restoreSelection(caretRange);
  } else {
    placeCaretAtEnd(editable);
  }

  const textBefore = getTextBeforeCursor(editable);
  let start = -1;
  let end = -1;

  if (textBefore.endsWith(triggerText)) {
    end = textBefore.length;
    start = end - triggerText.length;
  } else {
    const index = textBefore.lastIndexOf(triggerText);
    if (index >= 0) {
      start = index;
      end = index + triggerText.length;
    }
  }

  if (start < 0) {
    // Trigger already gone — insert at caret.
    if (normalizeNewlines(newText).includes('\n')) {
      insertMultilineText(newText);
    } else {
      document.execCommand('insertText', false, newText);
    }
    return;
  }

  if (!selectCharRange(editable, start, end)) {
    return;
  }

  // insertText replaces the current selection in ProseMirror.
  if (normalizeNewlines(newText).includes('\n')) {
    document.execCommand('delete');
    insertMultilineText(newText);
  } else {
    document.execCommand('insertText', false, newText);
  }
}

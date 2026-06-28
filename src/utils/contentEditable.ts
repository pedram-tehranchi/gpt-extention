export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

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

function findLastTextNodeInSubtree(node: Node): Text | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return node as Text;
  }

  for (let index = node.childNodes.length - 1; index >= 0; index -= 1) {
    const found = findLastTextNodeInSubtree(node.childNodes[index]);
    if (found) {
      return found;
    }
  }

  return null;
}

function findPreviousTextNode(root: HTMLElement, before: Text): Text | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  walker.currentNode = before;
  return walker.previousNode() as Text | null;
}

function resolveTextEndPoint(
  container: Node,
  offset: number,
): { node: Text; offset: number } | null {
  if (container.nodeType === Node.TEXT_NODE) {
    return { node: container as Text, offset };
  }

  if (container.nodeType === Node.ELEMENT_NODE && offset > 0) {
    const child = container.childNodes[offset - 1];
    const lastText = findLastTextNodeInSubtree(child);
    if (lastText) {
      return { node: lastText, offset: lastText.data.length };
    }
  }

  return null;
}

function createRangeForLastNChars(root: HTMLElement, charCount: number): Range | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || charCount <= 0) {
    return null;
  }

  const anchor = selection.getRangeAt(0);
  const endPoint = resolveTextEndPoint(anchor.startContainer, anchor.startOffset);
  if (!endPoint || !root.contains(endPoint.node)) {
    return null;
  }

  let { node, offset } = endPoint;
  const endNode = endPoint.node;
  const endOffset = endPoint.offset;
  let remaining = charCount;

  while (remaining > 0) {
    const take = Math.min(offset, remaining);
    offset -= take;
    remaining -= take;

    if (remaining === 0) {
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(endNode, endOffset);
      return range;
    }

    const previous = findPreviousTextNode(root, node);
    if (!previous) {
      return null;
    }

    node = previous;
    offset = previous.data.length;
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

function selectLastCharsBeforeCursor(root: HTMLElement, charCount: number): boolean {
  const range = createRangeForLastNChars(root, charCount);
  if (!range) {
    return false;
  }

  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function deleteWithBackspace(editable: HTMLElement, charCount: number): void {
  for (let index = 0; index < charCount; index += 1) {
    editable.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Backspace',
        code: 'Backspace',
        bubbles: true,
        cancelable: true,
      }),
    );
  }
}

function tryPastePlainText(editable: HTMLElement, text: string): boolean {
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/plain', text);

    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });

    editable.dispatchEvent(pasteEvent);
    return pasteEvent.defaultPrevented;
  } catch {
    return false;
  }
}

function insertPlainTextLineByLine(editable: HTMLElement, text: string): void {
  editable.focus();
  const lines = normalizeNewlines(text).split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    if (index > 0) {
      document.execCommand('insertLineBreak', false);
    }

    if (lines[index].length > 0) {
      document.execCommand('insertText', false, lines[index]);
    }
  }
}

function hasNonCollapsedSelection(): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  return !selection.getRangeAt(0).collapsed;
}

function tryInsertReplacementText(editable: HTMLElement, text: string): boolean {
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertReplacementText',
    data: text,
  });

  editable.dispatchEvent(event);
  return event.defaultPrevented;
}

function insertPlainText(editable: HTMLElement, text: string): void {
  if (hasNonCollapsedSelection() && tryInsertReplacementText(editable, text)) {
    return;
  }

  if (hasNonCollapsedSelection() && tryPastePlainText(editable, text)) {
    return;
  }

  if (hasNonCollapsedSelection()) {
    insertPlainTextLineByLine(editable, text);
    return;
  }

  if (tryPastePlainText(editable, text)) {
    return;
  }

  insertPlainTextLineByLine(editable, text);
}

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

  if (caretRange) {
    restoreSelection(caretRange);
  }

  const textBefore = getTextBeforeCursor(editable);
  if (!textBefore.endsWith(triggerText)) {
    return;
  }

  if (!selectLastCharsBeforeCursor(editable, triggerText.length)) {
    deleteWithBackspace(editable, triggerText.length);
  } else if (!hasNonCollapsedSelection()) {
    deleteWithBackspace(editable, triggerText.length);
  }

  insertPlainText(editable, newText);

  editable.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertReplacementText',
      data: newText,
    }),
  );
}

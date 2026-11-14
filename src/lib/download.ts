/** Saves text as a file via a temporary object URL. Content is never executed. */
export function downloadText(fileName: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function formatBytes(chars: number): string {
  // localStorage stores UTF-16; this is an estimate of characters, shown as KB.
  if (chars < 1024) return `${chars} B`;
  return `${(chars / 1024).toFixed(chars < 10 * 1024 ? 1 : 0)} KB`;
}

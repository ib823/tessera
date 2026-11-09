/**
 * Issue entries are real links (playbook §06): a reader can open one in a new
 * tab, long-press to copy it, and crawlers can follow it. A plain primary
 * click still opens the issue in place.
 */

export function issueHref(id: string): string {
  return `/issue/${id}`;
}

/** True when the click should be left to the browser (new tab, new window, download). */
export function isModifiedClick(event: MouseEvent): boolean {
  return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

/** Click handler for an issue link: open in place on a plain click, otherwise let the browser follow the href. */
export function inAppClick(open: () => void): (event: MouseEvent) => void {
  return (event) => {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    open();
  };
}

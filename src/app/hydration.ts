/**
 * Taking over a pre-rendered page (D-068). The build writes some public pages' HTML as a guest
 * would see them and marks `#root` with the exam it used: `data-prerendered="clf-c02"`. The
 * browser can take that HTML over in place (hydrateRoot) only if its first render will be the
 * same; otherwise it clears it and renders afresh (createRoot), as on every other page.
 */

/** The attribute on `#root`. */
export const PRERENDERED_ATTRIBUTE = 'data-prerendered';

export interface TakeOverCheck {
  /** The exam the build used, from `#root`, or undefined if the page wasn't pre-rendered. */
  readonly renderedExam: string | undefined;
  /** The exam this visitor's first render will use (address, else exam used last). */
  readonly visitorExam: string;
  /** A signed-in visitor gets their dashboard or their own data, not the guest page. */
  readonly signedIn: boolean;
}

export function canTakeOver({ renderedExam, visitorExam, signedIn }: TakeOverCheck): boolean {
  return renderedExam !== undefined && !signedIn && renderedExam === visitorExam;
}

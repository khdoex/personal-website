/**
 * Shade between the world and a page of text. On wide screens it covers the
 * text side and clears toward the right, where the scene plays. On small
 * screens it is even, unless the page asks for a window: then the top of the
 * screen stays clear for the scene and the shade starts below it, where the
 * reader's eye is. Render it first inside the page: it sits under the page's
 * text and over the world.
 */
export default function Scrim({ window = false }: { window?: boolean }) {
  return <div aria-hidden className={window ? 'scrim scrim--window' : 'scrim'} />
}

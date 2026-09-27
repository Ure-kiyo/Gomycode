import type { ReactNode } from 'react'

/**
 * Minimal rich-text renderer for assistant copy.
 *
 * The mock backend returns Markdown-ish text (`**bold**`, blank-line
 * paragraphs). Rather than pull in a Markdown dependency for two features, we
 * render exactly those two things and escape everything else by construction —
 * React does the escaping.
 */
export function renderRichText(text: string): ReactNode[] {
  return text.split('\n').map((line, lineIndex) => {
    if (line.trim() === '') return <br key={`br-${lineIndex}`} />

    const segments = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
    return (
      <span key={`line-${lineIndex}`} className="block">
        {segments.map((segment, index) =>
          segment.startsWith('**') && segment.endsWith('**') ? (
            <strong key={index} className="font-semibold text-ink">
              {segment.slice(2, -2)}
            </strong>
          ) : (
            <span key={index}>{segment}</span>
          ),
        )}
      </span>
    )
  })
}

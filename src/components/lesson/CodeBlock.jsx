import { highlightC } from '../../utils/cHighlighter.js'
import './CodeBlock.css'

export default function CodeBlock({ code, highlightLines = [], onLineHover, hoveredLine }) {
  const lines = highlightC(code)

  return (
    <pre className="code-block">
      <code>
        {lines.map((line) => {
          const isEmphasized = highlightLines.includes(line.lineNumber)
          const isHovered = hoveredLine === line.lineNumber
          return (
            <div
              key={line.lineNumber}
              className={`code-block__line${isEmphasized ? ' code-block__line--emphasized' : ''}${isHovered ? ' code-block__line--hovered' : ''}`}
              onMouseEnter={() => onLineHover && onLineHover(line.lineNumber)}
              onMouseLeave={() => onLineHover && onLineHover(null)}
            >
              <span className="code-block__gutter">{line.lineNumber}</span>
              <span className="code-block__content">
                {line.tokens.map((tok, i) => (
                  <span key={i} className={`code-token code-token--${tok.type}`}>{tok.text}</span>
                ))}
                {line.tokens.length === 0 ? '\u00A0' : null}
              </span>
            </div>
          )
        })}
      </code>
    </pre>
  )
}

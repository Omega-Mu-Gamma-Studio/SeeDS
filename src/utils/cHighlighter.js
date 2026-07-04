// Minimal, dependency-free C syntax highlighter. Splits source into tokens
// and tags each with a class name; PhaseContainer/CodeBlock renders these as
// <span> elements styled via CSS (see CodeBlock.css). Deliberately not using
// a heavy third-party highlighter — the token set C needs for lesson code is
// small and well-defined.

const KEYWORDS = new Set([
  'int', 'char', 'float', 'double', 'void', 'struct', 'typedef', 'return',
  'if', 'else', 'while', 'for', 'do', 'switch', 'case', 'break', 'continue',
  'default', 'sizeof', 'const', 'static', 'unsigned', 'signed', 'long',
  'short', 'NULL', 'define',
])

const TOKEN_REGEX = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(#\w+)|(\b\d+\b)|(\b[A-Za-z_]\w*\b)|([{}()[\];,])|(->|\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/%=<>!&|^~])|(\s+)/gm

export function highlightC(code) {
  if (!code) return []
  const lines = code.split('\n')
  return lines.map((line, i) => {
    const tokens = []
    let match
    TOKEN_REGEX.lastIndex = 0
    while ((match = TOKEN_REGEX.exec(line)) !== null) {
      const [full, comment, dquote, squote, directive, number, word, punct, op, ws] = match
      let type = 'plain'
      if (comment) type = 'comment'
      else if (dquote || squote) type = 'string'
      else if (directive) type = 'directive'
      else if (number) type = 'number'
      else if (word) type = KEYWORDS.has(word) ? 'keyword' : 'identifier'
      else if (punct) type = 'punct'
      else if (op) type = 'operator'
      else if (ws) type = 'whitespace'
      tokens.push({ text: full, type })
    }
    return { lineNumber: i + 1, tokens }
  })
}

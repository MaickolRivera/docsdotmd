// Ajusta la cantidad de ":" de los contenedores anidados para que remark-directive
// los lea como espera quien escribe.
//
// En remark-directive (igual que en los bloques de código) un cierre ":::"
// cierra cualquier contenedor abierto con igual o menos ":"; por eso, para
// anidar, el contenedor de afuera necesita MÁS ":" que el de adentro. Con esta
// normalización cada cierre cierra el contenedor abierto más reciente, así que
// funcionan tanto `:::steps` con `::::code-tabs` adentro (como en la
// especificación) como cualquier combinación escrita solo con ":::".

const CONTAINER_OPEN = /^( {0,3})(:{3,})([A-Za-z][\w-]*)/
const CONTAINER_CLOSE = /^( {0,3})(:{3,})\s*$/
const CODE_FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/

type Container = { open: number; close: number | null; children: Container[] }

export function normalizeDirectiveFences(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n")
  const roots: Container[] = []
  const stack: Container[] = []
  let codeFence: { char: string; size: number } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Dentro de un bloque de código no hay directivas.
    if (codeFence) {
      const fence = CODE_FENCE.exec(line)
      if (
        fence &&
        fence[1][0] === codeFence.char &&
        fence[1].length >= codeFence.size &&
        fence[2].trim() === ""
      ) {
        codeFence = null
      }
      continue
    }

    const fence = CODE_FENCE.exec(line)
    if (fence && !(fence[1][0] === "`" && fence[2].includes("`"))) {
      codeFence = { char: fence[1][0], size: fence[1].length }
      continue
    }

    if (CONTAINER_OPEN.test(line)) {
      const container: Container = { open: i, close: null, children: [] }
      const parent = stack.at(-1)
      if (parent) parent.children.push(container)
      else roots.push(container)
      stack.push(container)
      continue
    }

    if (CONTAINER_CLOSE.test(line)) {
      const container = stack.pop()
      if (container) container.close = i
    }
  }

  const height = (container: Container): number =>
    container.children.length ? 1 + Math.max(...container.children.map(height)) : 0

  const rewrite = (container: Container) => {
    const colons = ":".repeat(3 + height(container))
    lines[container.open] = lines[container.open].replace(/^( {0,3}):{3,}/, `$1${colons}`)
    if (container.close !== null) {
      lines[container.close] = lines[container.close].replace(/^( {0,3}):{3,}/, `$1${colons}`)
    }
    container.children.forEach(rewrite)
  }
  roots.forEach(rewrite)

  return lines.join("\n")
}

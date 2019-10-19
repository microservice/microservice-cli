import { safeLoad, YAMLNode, Kind } from 'yaml-ast-parser'
import * as TMonaco from 'monaco-editor/esm/vs/editor/editor.api'

import { getLineStartPositions, getPosition } from './helpers'

interface GetValidationMarkersOptions {
  text: string
  validationErrors: string[]
  monaco: typeof TMonaco
}

interface ParsedError {
  path: string[]
  message: string
}

const ERROR_PARSE_REGEXP = /^(\S+) (.*?)$/

export default function getValidationMarkers({
  text,
  monaco,
  validationErrors,
}: GetValidationMarkersOptions): TMonaco.editor.IMarkerData[] {
  const markers: TMonaco.editor.IMarkerData[] = []
  const parsedErrors: ParsedError[] = []
  validationErrors.forEach(validationError => {
    if (!validationError.startsWith('.')) {
      // Unknown format, ignore for editor marking
      return
    }
    const chunks = ERROR_PARSE_REGEXP.exec(validationError)
    if (chunks) {
      parsedErrors.push({
        path: chunks[1].slice(1).split('.'),
        // ^ Ignore first dot and count everything as chunk afterwards
        message: chunks[2],
      })
    }
  })

  const yamlDocument = safeLoad(text)
  if (yamlDocument.errors.length) {
    // TODO: Handle badly formatted documents
    return []
  }
  if (!parsedErrors.length) {
    // Nothing to do here
    return []
  }

  // Kind.MAPPING is top-level document, has .mappings
  // Kind.MAPPING is a value object, has .value.mappings
  function findNode(node: YAMLNode, path: string[]): { node: YAMLNode } {
    let relevantMappings: any[] = []

    if (node.kind === Kind.MAP) {
      relevantMappings = node.mappings
    } else if (node.kind === Kind.MAPPING && node.value) {
      relevantMappings = node.value.mappings
    }

    if (Array.isArray(relevantMappings) && path.length) {
      const itemToFind = path[0]
      const foundItem = relevantMappings.find(item => item && item.key && item.key.value === itemToFind)

      if (foundItem) {
        return findNode(foundItem, path.slice(1))
      }
    }

    return { node }
  }

  const lineStartPositions = getLineStartPositions(text)
  parsedErrors.forEach(parsedError => {
    const { node } = findNode(yamlDocument, parsedError.path)

    if (!node) {
      return
    }

    let indexStart = node.startPosition
    let indexEnd = node.endPosition

    const message = `.${parsedError.path.join('.')} ${parsedError.message}`
    // ^ If path is unresolved, paint error at the key def
    // if it's the resolved item, paint on value

    if (node.key) {
      indexStart = node.key.startPosition
      indexEnd = node.key.endPosition
    }
    const posStart = getPosition(indexStart, lineStartPositions)
    const posEnd = getPosition(indexEnd, lineStartPositions)

    markers.push({
      startLineNumber: posStart.line + 1,
      startColumn: posStart.column + 1,
      endLineNumber: posEnd.line + 1,
      endColumn: posEnd.column + 1,
      message,
      severity: monaco.MarkerSeverity.Error,
    })
  })

  return markers
}

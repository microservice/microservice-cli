import fs from 'fs'
import path from 'path'

import getOMSFilePath from './getOMSFilePath'

/**
 * @param {string} dir Directory to search for Open Microservice specification file
 * @return {string} Content of the microservice file
 */
export default function readOMSFile(dir: string): string {
  let content = ''
  const omsPath = getOMSFilePath(dir)
  try {
    content = fs.readFileSync(omsPath).toString()
  } catch {
    content = ''
  }
  return content
}

import fs from 'fs'
import path from 'path'

const omsFileAliases = ['oms.yml', 'oms.yaml', 'microservice.yml', 'microservice.yaml']

/**
 * @param {string} dir Directory to search for the Open Microservice specification file
 * @return {string} microservice file path
 */
export default function getOMSFilePath(dir: string): string {
  for (let i = 0; i < omsFileAliases.length; i++) {
    const fileAlias = omsFileAliases[i]
    const filePath = path.join(dir, fileAlias)
    if (fs.existsSync(filePath)) return filePath
  }
  return null
}

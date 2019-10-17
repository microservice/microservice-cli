import fs from 'fs'
import path from 'path'

const omsFileAliases = ['oms.yml', 'oms.yaml', 'microservice.yml', 'microservice.yaml']

/**
 * @param {string} dir Directory to search for the Open Microservice specification file
 * @return {string} microservice file path
 */
export default function getOMSFilePath(dir: string): string {
  return omsFileAliases.map(fileName => path.join(dir, fileName)).find(filePath => fs.existsSync(filePath)) || null
}

import fs from 'fs'
import path from 'path'

import getOMSFilePath from './getOMSFilePath'

/**
 * @param {string} dir Directory to search for Open Microservice specification file
 * @return {boolean} if a `oms.yml` file exists in the provided directory
 */
export default function checkValidOMGDirectory(dir: string): boolean {
  const omsPath = getOMSFilePath(dir)
  if (omsPath === null) return false
  if (!fs.existsSync(path.join(dir, 'Dockerfile'))) return false
  return true
}

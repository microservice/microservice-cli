import fs from 'fs'
import path from 'path'

/**
 * @return {string} microservice file path
 */
export default function getMicroserviceFilePath(): string {
  if (fs.existsSync(path.join(process.cwd(), 'microservice.yml'))) {
    return path.join(process.cwd(), 'microservice.yml')
  }
  if (fs.existsSync(path.join(process.cwd(), 'microservice.yaml'))) {
    return path.join(process.cwd(), 'microservice.yaml')
  }
  return null
}

import fs from 'fs'
import path from 'path'

/**
 * @return {string} Content of the microservice file
 */
export default function readMicroserviceFile(): string {
  let content = ''
  try {
    content = fs.readFileSync(path.join(process.cwd(), 'microservice.yml')).toString()
  } catch {
    try {
      content = fs.readFileSync(path.join(process.cwd(), 'microservice.yaml')).toString()
    } catch {
      content = ''
    }
  }
  return content
}

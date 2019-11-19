import fs from 'fs'
import path from 'path'
import { OMSValidate } from '@microservices/validate'

const FILES_PATH = path.join(__dirname, 'files')
const EXPECT_PATH = path.join(__dirname, 'expectations')

const tests = {}

const loading = () => {
  const loadExpectations = () => {
    return new Promise((resolve, reject) => {
      fs.readdir(EXPECT_PATH, (err, files) => {
        if (err) {
          console.log("Unable to scan directory 'expectations'")
          reject(err)
        }
        console.log('===== LOADING EXPECTATIONS =====')
        files.forEach(file => {
          if (file !== 'microservice.txt') {
            const content = fs.readFileSync(path.join(EXPECT_PATH, file), {
              encoding: 'utf8'
            })
            const key = file.replace('.txt', '')
            tests[key] = { expect: '', content: '' }
            tests[key].expect = content
            console.log(`${file} loaded`)
          }
        })
        resolve()
      })
    })
  }

  const loadFiles = () => {
    return new Promise((resolve, reject) => {
      fs.readdir(FILES_PATH, (err, files) => {
        if (err) {
          console.log("Unable to scan directory 'files'")
          reject(err)
        }
        console.log('===== LOADING FILES =====')
        files.forEach(file => {
          if (file !== 'Dockerfile' && file !== 'microservice.yml') {
            const content = fs.readFileSync(path.join(FILES_PATH, file), {
              encoding: 'utf8'
            })
            const key = file.replace('.yml', '')
            tests[key].content = content
            console.log(`${file} loaded`)
          }
        })
        resolve()
      })
    })
  }

  return Promise.all([loadExpectations, loadFiles])
}

const start = async () => {
  loading()
    .then(() => {
      console.log('\n===== TESTING FILES =====')
      Object.keys(tests).forEach(test => {
        console.log(`===== Testing ${test} =====`)
        let output = ''
        try {
          output = new OMSValidate(tests[test].content).validate()
        } catch (e) {
          output = e
        }
        if (output !== tests[test].expect) {
          console.log(`FAILED: GOT \n${output}\nINSTEAD OF \n${tests[test].expect}\n`)
          process.exit(1)
        }
      })
    })
    .catch(() => {
      process.exit(1)
    })
}

start()

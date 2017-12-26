const fs = require('fs')
const uuid = require('uuid')
const STORAGE_FILENAME = './adminex_data.json'
const BASIC_OBJECT = {
  projects: []
}

const createBasicFile = (callback) => {
  fs.writeFile(STORAGE_FILENAME, JSON.stringify(BASIC_OBJECT), (err) => {
    callback(err, BASIC_OBJECT)
  })
}

const writeContents = (data) => new Promise((resolve, reject) => {
  fs.writeFile(STORAGE_FILENAME, JSON.stringify(data), (err) => {
    if (err) {
      reject(err)
    } else {
      resolve(data)
    }
  })
})

const getContents = () => new Promise((resolve, reject) => {
  fs.readFile(STORAGE_FILENAME, (err, data) => {
    if (err) {
      createBasicFile((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    } else {
      resolve(JSON.parse(data.toString()))
    }
  })
})

const addProject = (projectData) =>
  getContents()
    .then((contents) => {
      const projectDataWithId = Object.assign(projectData, { Id: uuid.v4() })
      contents.projects.push(projectDataWithId)
      return writeContents(contents)
    })

const updateProject = (project) => 
  getContents()
    .then(contents => writeContents(Object.assign(contents, {
      projects: contents.projects.map(p => p.Id == project.Id ? project : p)
    })))

const getProjects = getContents

module.exports = {
  addProject,
  getProjects,
  updateProject
}
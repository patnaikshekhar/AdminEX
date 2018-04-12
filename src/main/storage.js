const fs = require('fs')
const uuid = require('uuid')
const Constants = require('../main/constants')
const STORAGE_FILENAME = `${Constants.MAIN_DIRECTORY}/adminex_data.json`
const { log } = require('./utilities')
let isWritingFile = false

const BASIC_OBJECT = {
  projects: []
}

const createBasicFile = (callback) => {
  fs.writeFile(STORAGE_FILENAME, JSON.stringify(BASIC_OBJECT), (err) => {
    callback(err, BASIC_OBJECT)
  })
}

const writeContents = (data) => new Promise((resolve, reject) => {
  log(`Storage.writeContents writing contents ${JSON.stringify(data)}`, 'Info')
  
  // const writeFile = () => {

  //   if (isWritingFile) {
  //     log(`Storage.writeContents storage file locked waiting`, 'Info')
  //     setTimeout(() => {
  //       writeFile()
  //     }, 200)
  //   } else {
  //     isWritingFile = true
  //     fs.writeFile(STORAGE_FILENAME, JSON.stringify(data), (err) => {
  //       isWritingFile = false
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve(data)
  //       }
  //     })
  //   }
  // }

  // writeFile()

  try {
    fs.writeFileSync(STORAGE_FILENAME, JSON.stringify(data))
    resolve(data)
  } catch(e) {
    reject(e)
  }
})

const cleanProjects = (projects) => 
  projects.filter(proj => fs.existsSync(proj.directory))

const getContents = () => new Promise((resolve, reject) => {
  // fs.readFile(STORAGE_FILENAME, (err, data) => {
  //   if (err) {
  //     createBasicFile((err, data) => {
  //       if (err) {
  //         reject(err)
  //       } else {
  //         resolve(data)
  //       }
  //     })
  //   } else {
  //     const result = JSON.parse(data.toString())
  //     const projects = cleanProjects(result.projects)
  //     const store = Object.assign(result, {
  //       projects
  //     })
  //     writeContents(store)
  //       .then(() => {
  //         resolve(store)
  //       })
  //     resolve(store)
  //   }
  // })

  try {
    const data = fs.readFileSync(STORAGE_FILENAME)
    const result = JSON.parse(data.toString())
    const projects = cleanProjects(result.projects)
    const store = Object.assign(result, {
      projects
    })
    writeContents(store)
      .then(() => {
        resolve(store)
      })
      .catch(e => reject(e))
  } catch(e) {
    reject(e)
  }
})

const addProject = (projectData) =>
  getContents()
    .then((contents) => {
      const projectDataWithId = Object.assign(projectData, { Id: uuid.v4() })
      contents.projects.push(projectDataWithId)
      return writeContents(contents)
    })

const updateProject = (project) => {
  log(`Storage.updateProject updating project ${JSON.stringify(project)}`, 'Info')
  return getContents()
    .then(contents => {
      log(`Storage.updateProject current contents ${JSON.stringify(contents)}`, 'Info')
      
      const updatedContents = Object.assign(contents, {
        projects: contents.projects.map(p => p.Id == project.Id ? project : p)
      })

      log(`Storage.updateProject updated contents ${JSON.stringify(updatedContents)}`, 'Info')

      return writeContents(updatedContents)
    })
}
  
    

const getProject = (project) => {
  return getContents()
    .then(contents => {
      return contents.projects.filter(p => {
        return p.Id == project.Id
      })[0]
    })
}
    

const getProjects = getContents

module.exports = {
  addProject,
  getProjects,
  updateProject,
  getProject,
  STORAGE_FILENAME
}
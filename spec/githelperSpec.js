const gitHelper = require('../src/main/gitHelper')
const simpleGit = require('simple-git/promise')
const fs = require('fs')
const TEMP_DIR = './tmp'
const shell = require('shelljs')

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR)
}

const cleanDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function(file, index){
      var curdir = dir + "/" + file
      if (fs.lstatSync(curdir).isDirectory()) { // recurse
        cleanDir(curdir)
      } else { // delete file
        fs.unlinkSync(curdir)
      }
    })
    fs.rmdirSync(dir)
  }
}

describe('gitHelper', () => {
  describe('stash', () => {
    it('should stash working directory and add to stash list', done => {
      const testDir = `/Users/spatnaik/Downloads/testgitHelperStash`
  
      cleanDir(testDir)
      fs.mkdirSync(testDir)
      
      const git = simpleGit(testDir)
      const branchName = 'stashbranch'
  
      git.init()
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents1'))
        .then(() => git.add('./*'))
        .then(() => git.commit('First Commit'))
        .then(() => git.checkoutLocalBranch('develop'))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents2'))
        .then(() => git.add('./*'))
        .then(() => git.commit('Second Commit'))
        .then(() => git.checkoutLocalBranch(branchName))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents3'))
        .then(() => git.add('./*'))
        .then(() => gitHelper.openProject({ directory: testDir }))
        .then(() => gitHelper.stash(branchName))
        .then(() => git.stashList())
        .then(({all}) => {
          const list = all.map(l => l.message).join('')
          expect(list).toContain('stashbranchstash')
          cleanDir(testDir)
          done()
        })
        .catch(e => {
          expect(e.toString()).toBe(null)
          cleanDir(testDir)
          done()
        })
    })
  })

  describe('restoreStash', () => {
    it('should restore stash from a branch', done => {
      const testDir = `/Users/spatnaik/Downloads/testgitHelperrestoreStash`
  
      cleanDir(testDir)
      fs.mkdirSync(testDir)
      
      const git = simpleGit(testDir)
      const branchName = 'restorebranch'
  
      git.init()
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents1'))
        .then(() => git.add('./*'))
        .then(() => git.commit('First Commit'))
        .then(() => git.checkoutLocalBranch('develop'))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents2'))
        .then(() => git.add('./*'))
        .then(() => git.commit('Second Commit'))
        .then(() => git.checkoutLocalBranch(branchName))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents3'))
        .then(() => git.add('./*'))
        .then(() => gitHelper.openProject({ directory: testDir }))
        .then(() => gitHelper.stash(branchName))
        .then(() => git.checkout('develop'))
        .then(() => {
          const contents = fs.readFileSync(`${testDir}/test.txt`).toString()
          expect(contents).toBe('contents2')
        })
        .then(() => git.checkout(branchName))
        .then(() => gitHelper.restoreStash(branchName))
        .then(() => {
          const contents = fs.readFileSync(`${testDir}/test.txt`).toString()
          expect(contents).toBe('contents3')
          cleanDir(testDir)
          done()
        })
        .catch(e => {
          expect(e.toString()).toBe(null)
          cleanDir(testDir)
          done()
        })
    })

    it('should restore the right stash from a branch', done => {
      const testDir = `/Users/spatnaik/Downloads/testgitHelperrestoreStash2`
  
      cleanDir(testDir)
      fs.mkdirSync(testDir)
      
      const git = simpleGit(testDir)
      const branchName = 'restorebranch'
  
      git.init()
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents1'))
        .then(() => git.add('./*'))
        .then(() => git.commit('First Commit'))
        .then(() => git.checkoutLocalBranch('develop'))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents2'))
        .then(() => git.add('./*'))
        .then(() => git.commit('Second Commit'))
        .then(() => git.checkoutLocalBranch(branchName))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents3'))
        .then(() => git.add('./*'))
        .then(() => gitHelper.openProject({ directory: testDir }))
        .then(() => gitHelper.stash(branchName))
        .then(() => git.checkout('develop'))
        .then(() => git.checkout(branchName))
        .then(() => fs.writeFileSync(`${testDir}/test.txt`, 'contents4'))
        .then(() => git.add('./*'))
        .then(() => gitHelper.stash(branchName))
        .then(() => git.checkout('develop'))
        .then(() => git.checkout(branchName))
        .then(() => gitHelper.restoreStash(branchName))
        .then(() => {
          const contents = fs.readFileSync(`${testDir}/test.txt`).toString()
          expect(contents).toBe('contents4')
          cleanDir(testDir)
          done()
        })
        .catch(e => {
          expect(e.toString()).toBe(null)
          cleanDir(testDir)
          done()
        })
    })
  })

  describe('createProjectFromScratch', () => {
    it('should create a new project in the directory specified', (done) => {

      const sampleDir = `${TEMP_DIR}/sampleSFDXProject`
      const repo = 'https://github.com/patnaikshekhar/SampleSFDX'

      if (fs.existsSync(sampleDir)) {
        shell.rm('-rf', sampleDir)
      }

      fs.mkdirSync(sampleDir)

      gitHelper.createProjectFromScratch({ directory: sampleDir, repositoryURL: repo }, true)
        .then(() => {
          expect(fs.existsSync(`${sampleDir}/sfdx-project.json`)).toBe(true)
          return simpleGit(sampleDir).getRemotes(true)
        })
        .then(remotes => {
          expect(remotes.length).toBeGreaterThan(0)
          expect(remotes[0].refs.fetch).toBe(repo)
          done()
        })
        .catch(e => {
          expect(e.toString()).toBe(null)
          done()
        })
    })
  })

  describe('getRemoteBranches', () => {
    it('should fetch all remote branches', (done) => {
      const sampleDir = `${TEMP_DIR}/sampleSFDXProject_getRemoteBranches`
      const repo = 'https://github.com/patnaikshekhar/SampleSFDX'

      if (fs.existsSync(sampleDir)) {
        shell.rm('-rf', sampleDir)
      }

      fs.mkdirSync(sampleDir)

      simpleGit().clone(repo, sampleDir)
        .then(() => gitHelper.openProject({ directory: sampleDir }))
        .then(() => gitHelper.getRemoteBranches())
        .then(branches => {
          expect(branches).toContain('master')
          done()
        })
        .catch(e => {
          expect(e.toString()).toBe(null)
          done()
        })
    })
  })
})

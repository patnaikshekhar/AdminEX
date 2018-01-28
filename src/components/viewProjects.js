import React from 'react'
import Alert from './alert'

const NoProjects = (props) => 
  <div>
    <Alert type="warning">
      <h2>You don't seem to have any projects at the moment.<a href="javascript:void(0);" onClick={props.createProject}>Click here</a> to create one.</h2>
    </Alert>
  </div>

const SelectProject = (props) => 
  <table className="slds-table slds-table_bordered slds-table_cell-buffer" id="projectsTable">
    <thead className="thead-dark">
      <tr>
        <th scope="col">#</th>
        <th scope="col"></th>
        <th scope="col">Name</th>
        <th scope="col">Location</th>
      </tr>
    </thead>
    <tbody id="projectList">
      { props.projects.map((proj, index) => 
        <tr key={proj.Id}>
          <td>{ index + 1 }</td>
          <td>
            <button 
              className="slds-button"
              onClick={() => props.openProject(proj)}>Open</button>
          </td>
          <td>{ proj.name }</td>
          <td>{ proj.directory }</td>
        </tr>
      )}
    </tbody>
  </table>

const ViewProjects = (props) =>
  <div className="project-select">
    { props.projects.length == 0 ? 
      <NoProjects createProject={props.createProject} /> : 
      <SelectProject 
        projects={props.projects} 
        openProject={props.openProject} />}
  </div>

export default ViewProjects
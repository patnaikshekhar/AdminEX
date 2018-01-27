import React from 'react'

const NoProjects = (props) => 
  <div>
    <div className="slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_warning" role="alert">
      <span className="slds-assistive-text">warning</span>
      <span className="slds-icon_container slds-icon-utility-warning slds-m-right_x-small" title="Description of icon when needed">
        <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
          <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="../lib/salesforce-lightning-design-system-2.4.6/assets/icons/utility-sprite/svg/symbols.svg#warning" />
        </svg>
      </span>
      <h2>You don't seem to have any projects at the moment.<a href="javascript:void(0);" id="noProjectsClick">Click here</a> to create one.</h2>
    </div>
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
      <NoProjects /> : 
      <SelectProject 
        projects={props.projects} 
        openProject={props.openProject} />}
  </div>

export default ViewProjects
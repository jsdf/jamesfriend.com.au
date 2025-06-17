import React from 'react';
import {projects} from '../data/projects'; // Import the project data
import type {Project} from '../types';

const Projects: React.FC = () => {
  return (
    <div className="projects block">
      <h3>Projects</h3>
      <div>
        {projects.map((item: Project) => (
          <div key={item.url}>
            <a href={item.url} title={item.tip}>
              {item.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;

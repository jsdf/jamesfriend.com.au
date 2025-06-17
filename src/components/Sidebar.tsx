import React from 'react';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import RecentArticles from './RecentArticles';
import Projects from './Projects';
import type {PostData} from '../types';

interface SidebarProps {
  recentPosts: PostData[];
}

const Sidebar: React.FC<SidebarProps> = ({recentPosts}) => {
  return (
    <div className="sidebar">
      <AboutMe />
      <ContactMe />
      <RecentArticles posts={recentPosts} />
      <Projects />
    </div>
  );
};

export default Sidebar;

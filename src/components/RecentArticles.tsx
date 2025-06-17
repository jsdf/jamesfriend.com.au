import React from 'react';
import type {PostData} from '../types';

interface RecentArticlesProps {
  posts: PostData[];
}

const RecentArticles: React.FC<RecentArticlesProps> = ({posts}) => {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="recent-articles block">
      <h3>Recent stuff</h3>
      <div>
        {posts.map((post) => (
          <div key={post.slug}>
            <a href={`/${post.slug}`}>{post.title}</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentArticles;

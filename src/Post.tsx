import React, {useEffect, useState} from 'react';
import {Helmet, HelmetProvider} from 'react-helmet-async';
import type {PostData} from './types';
import allPostsData from '../posts.json'; // Direct import for build-time access
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import {formatPostDate} from './utils/dateFormat';

interface PostPageProps {
  slug: string;
}

const PostPage: React.FC<PostPageProps> = ({slug}) => {
  const [currentPost, setCurrentPost] = useState<PostData | null | undefined>(
    undefined
  ); // undefined: loading, null: not found
  const [recentPosts, setRecentPosts] = useState<PostData[]>([]);
  const [PostContentComponent, setPostContentComponent] =
    useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all posts metadata
    const posts: PostData[] = allPostsData as PostData[];

    // Find current post
    const foundPost = posts.find(
      (p) => p.slug === slug && p.published !== false
    );

    if (foundPost) {
      setCurrentPost({
        ...foundPost,
        created_human: formatPostDate(foundPost.created),
        // meta_description can be derived from post content later if needed
      });

      // Set recent posts (top 5 published, excluding current if already in list)
      const sortedPublishedPosts = posts
        .filter((p) => p.published !== false)
        .sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );

      setRecentPosts(sortedPublishedPosts.slice(0, 5));

      // Dynamically import the markdown content
      import(`../posts/${slug}.md`)
        .then((module) => {
          setPostContentComponent(() => module.default);
        })
        .catch((err) => {
          console.error('Error loading post content:', err);
          setError('Could not load post content.');
          setCurrentPost(null); // Mark as not found if content fails
        });
    } else {
      setCurrentPost(null); // Post not found or not published
      setError(`Post with slug "${slug}" not found or not published.`);
    }
  }, [slug]);

  if (currentPost === undefined) {
    return <div>Loading post...</div>;
  }

  if (currentPost === null || error) {
    return (
      <div>
        <h1>Post not found</h1>
        <p>{error || `The post with slug "${slug}" could not be found.`}</p>
        <a href="/">Go to homepage</a>
      </div>
    );
  }

  const {title, meta_description, created, author, body} = currentPost;
  const canonicalUrl = `https://jamesfriend.com.au/${slug}`;

  // Prepare Schema.org data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: title,
    datePublished: created, // ISO format
    author: {
      '@type': 'Person',
      name: author || 'James Friend', // Default author
    },
    // image: "URL_to_a_representative_image_for_the_article", // Optional
    // publisher: { // Optional
    //   "@type": "Organization",
    //   "name": "James Friend",
    //   "logo": {
    //     "@type": "ImageObject",
    //     "url": "URL_to_logo_image"
    //   }
    // },
    // description: meta_description || "Brief description of the article" // Optional
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{`${title} | James Friend`}</title>
        {meta_description && (
          <meta name="description" content={meta_description} />
        )}
        <link rel="canonical" href={canonicalUrl} />
        {/* Other meta tags from common_css/preload_js are typically handled by Vite/index.html */}
        {/* For example, viewport and charset are usually in index.html */}
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link
          rel="shortcut icon"
          href="/favicon.ico"
          type="image/vnd.microsoft.icon"
        />
        <meta name="generator" content="Vite + React" />
      </Helmet>

      <div className="page-post-full">
        <Header />
        <div id="main" className="content two-col">
          <article className="main-col">
            <h1 className="title" id="page-title">
              {title}
            </h1>
            <div about={`/${slug}`}>
              <div className="submitted">
                Posted by {author} on {currentPost.created_human}
              </div>
              <div className="post-body">
                {PostContentComponent ? (
                  <PostContentComponent />
                ) : (
                  body || <p>Loading content...</p>
                )}
              </div>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(schemaData)}}
              />
            </div>
          </article>
          <Sidebar recentPosts={recentPosts} />
        </div>
        {/* common_js partial (analytics, etc.) would typically be in index.html or handled by Vite plugins */}
      </div>
    </HelmetProvider>
  );
};

export default PostPage;

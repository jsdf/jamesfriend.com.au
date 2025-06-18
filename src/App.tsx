import './App.css';

import {useHash} from './useHash';

type PostMetadata = {
  id: string;
  slug: string;
  title: string;
  author: string;
  created: string;
  published: boolean;
};

import posts from '../posts.json';
import Post from './Post';
import {projects} from './data/projects';
import AboutMe from './components/AboutMe';
import ContactMe from './components/ContactMe';
import CanvasDemo from './components/CanvasDemo';
import {formatPostDate} from './utils/dateFormat';

function App() {
  const [hash] = useHash();

  // Filter published posts and sort by date
  const publishedPosts = (posts as PostMetadata[])
    .filter((post) => post.published !== false)
    .sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

  if (hash === '') {
    // Homepage layout matching production site
    return (
      <div className="page-home">
        <div className="demo-container">
          <CanvasDemo />
          <div className="demo-fadeout"></div>
          <div className="demo-overlay">
            <header id="name-and-slogan" className="content">
              <div id="site-name">
                <h1>James Friend</h1>
              </div>
            </header>
            <nav className="content">
              <h2>Projects</h2>
              <ul className="project-links">
                {projects.map((project) => (
                  <li key={project.url}>
                    <a
                      href={project.url}
                      title={project.tip}
                      className="tooltip"
                    >
                      {project.label}
                      <span className="tooltip-content">{project.tip}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <section className="posts content">
          <h2>Blog</h2>
          <a id="posts-section" />
          {publishedPosts.map((post) => (
            <div key={post.id} className="post">
              <h3>
                <a href={`#${post.slug}`}>{post.title}</a>
              </h3>
              <div className="submitted">
                Posted by {post.author} on {formatPostDate(post.created)}
              </div>
            </div>
          ))}
        </section>

        <footer className="content">
          <AboutMe />
          <ContactMe />
        </footer>
      </div>
    );
  } else {
    const post = publishedPosts.find((post) => `#${post.slug}` === hash);
    if (!post) {
      return <h1>404</h1>;
    }
    return (
      <div className="content">
        <Post slug={post.slug} />
      </div>
    );
  }
}

export default App;

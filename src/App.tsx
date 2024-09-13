import { useState, useEffect } from "react";
import "./App.css";

import { useHash } from "./useHash";

type PostMetadata = {
  id: string;
  slug: string;
  title: string;
  author: string;
  created: string;
  published: boolean;
};

import posts from "../posts.json";
import Post from "./Post";

function App() {
  const [hash, updateHash] = useHash();
  if (hash === "") {
    return (
      <div className="content">
        <ul>
          {(posts as PostMetadata[]).map((post, index) => (
            <li key={index}>
              <a href={`#${post.slug}`}>
                <h2>{post.title}</h2>
              </a>
              <p>{new Date(post.created).toLocaleDateString()}</p>
              <p>{post.author}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    const post = (posts as PostMetadata[]).find(
      (post) => `#${post.slug}` === hash
    );
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

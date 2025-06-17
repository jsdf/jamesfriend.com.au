import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '../client/normalize.css';
import '../client/boilerplate.css';
import '../client/typography.css';
import '../client/site.less';
import '../client/tooltip.less';
import '../client/prism.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

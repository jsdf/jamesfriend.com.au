// @flow

const hogan = require('hogan.js');
const path = require('path');

const escapeHTML = hogan.Template.prototype.v;

const projects = [
  {
    url: '/projects/basiliskii/BasiliskII-worker.html',
    tip: 'Mac OS System 7, SimCity 2000 & Marathon in the browser',
    label: 'BasiliskII.js Macintosh emulator',
  },
  {
    url: '/pce-js/',
    tip: 'Mac Plus/IBM PC/Atari ST emulator in the browser',
    label: 'pce.js Mac/PC/Atari ST emulator',
  },
  {
    url: 'https://github.com/jsdf/goose64',
    tip: 'Untitled Goose Game for the Nintendo 64',
    label: 'Goose 64',
  },
  {
    url: 'https://github.com/jsdf/applescript-raytracer',
    label: 'applescript-raytracer',
    tip: 'A raytracer written in AppleScript',
  },
  {
    url: 'https://jsdf.github.io/scaletoy',
    tip: 'Easily explore chords and scales',
    label: 'scaletoy',
  },
  {
    url: 'https://github.com/jsdf/n64soundtools',
    label: 'n64soundtools',
    tip: 'Tools for adding sound and music to N64 SDK homebrew games',
  },
  {
    url:
      'https://github.com/jsdf/n64-sdk-demo#nintendo-64-homebrew-demo--tutorial',
    tip: 'Learn to make n64 games',
    label: 'Nintendo 64 SDK tutorial',
  },
  {
    url: 'https://jsdf.github.io/little-virtual-computer/computer1',
    label: 'Little Virtual Computer',
    tip: 'Learn how computers work by simulating them in Javascript',
  },
  {
    url: '/projects/tryhypercard',
    tip: 'Explore HyperCard, the visual programming tool for Macintosh',
    label: 'Try HyperCard',
  },
  {
    url: 'https://github.com/jsdf/robot-control',
    label: 'robot',
    tip:
      'A crappy robot arm I built and wrote inverse kinematics-based control software for',
  },
  {
    url: '/projects/wolf3d/Chocolate-Wolfenstein-3D.html',
    tip: 'Wolfenstein 3D in the browser',
    label: 'wolf3d.js',
  },
  {
    url: 'https://jsdf.github.io/ReasonPhysics',
    tip: '2D Physics simulation in ReasonML',
    label: 'ReasonPhysics',
  },
  {
    url: 'https://jsdf.github.io/sysex-loader/',
    tip:
      'a tool for uploading and downloading sysex patches/samples/messages to your midi gear from your web browser',
    label: 'sysex-loader',
  },
  {
    url: 'https://jsdf.github.io/planetarium/',
    tip:
      'A beat-synced music visualization which controls RGB LED strips via bluetooth',
    label: 'planetarium',
  },
  {
    url: 'https://github.com/jsdf/ed64log',
    tip: 'A development tool for debugging homebrew n64 games',
    label: 'Everdrive 64 logger',
  },
  {
    url: 'https://jsdf.github.io/aiff-explorer/',
    label: 'aiff explorer',
    tip: 'A tool for peeking at the structure of AIFF audio files',
  },
  {
    url: 'https://jsdf.github.io/bit-packing-explorer/',
    tip:
      'Play around with storing multiple pieces of data in a single number value using bit packing',
    label: 'bit packing explorer',
  },
  {
    url: 'https://jsdf.github.io/lisp.re/',
    tip: 'A Scheme interpreter in Reason',
    label: 'lisp.re',
  },
  {
    url: 'https://github.com/jsdf/reason-react-hacker-news',
    tip: 'Hacker News mobile progressive web app built with Reason React',
    label: 'reason-react-hacker-news',
  },
  {
    url: 'https://github.com/jsdf/react-native-htmlview',
    tip: 'A React Native component which renders HTML content as native views',
    label: 'react-native-htmlview',
  },
  {
    url: 'https://github.com/jsdf/they-live',
    tip: 'Serverless server monitoring for AWS Lambda',
    label: 'they-live',
  },
  {
    url: 'https://github.com/jsdf/lisp.rs',
    tip: 'A crappy Scheme interpreter in Rust',
    label: 'lisp.rs',
  },
];

const projectsTemplate = hogan.compile(`
      <li>
        <a href="{{{url}}}" title="{{tip}}" class="tooltip">
          {{label}}
          <span class="tooltip-outer">
            <span class="tooltip-content">
              {{tip}}
            </span>
          </span>
        </a>
      </li>
      `);

module.exports = (
  context /*:
  {
    options: {
      host: string,
      posts: Array<Object>
    },
    getJS: () => Array<string>,
    getCSS: () => Array<string>,
    getPublicPath: (string) => string
  }*/
) => {
  const partials = {
    common_css: () =>
      context
        .getCSS()
        .map(
          (bundle) =>
            `<link type="text/css" rel="stylesheet" href="${
              context.options.host
            }/${context.getPublicPath(
              path.join(bundle.dir, bundle.fileName)
            )}" media="all"/>`
        )
        .join('\n'),
    common_js: () =>
      `
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-23661560-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-23661560-1');
</script>
<script type="text/javascript" src="${context.options.host}/assets/s.js"></script>
` +
      context
        .getJS()
        .map(
          (bundle) =>
            `<script type="text/javascript" src="${
              context.options.host
            }/${context.getPublicPath(
              path.join(bundle.dir, bundle.fileName)
            )}"></script>`
        )
        .join('\n'),
    preload_js: () =>
      context
        .getJS()
        .map(
          (bundle) =>
            `<link rel="preload" href="${
              context.options.host
            }/${context.getPublicPath(
              path.join(bundle.dir, bundle.fileName)
            )}" as="script" />`
        )
        .join('\n'),

    meta_tags: () =>
      `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="shortcut icon" href="${context.options.host}/favicon.ico" type="image/vnd.microsoft.icon"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="AppleScript"/>
`,

    sidebar: () =>
      `
<div class="sidebar"> 
  ${partials.block_me()}
  ${partials.block_contact()}
  ${partials.block_recent_articles()}
  ${partials.block_projects()} 
</div>
      `,
    block_me: () =>
      `
<div class="about-me block">
  <h3>Hi! I&#039;m James.</h3>
  <div>
    <div class="pic-me">
      <img width="230" height="230" src="/files/corndog.jpeg" title="James Friend" alt="James Friend">
    </div>
    <p>I make neat stuff on the web.<br> I'm into UX, music production, designing the future, and learning from the past.</p>
  </div>
</div>
`,
    block_contact: () =>
      `
<div class="contact-me block">
  <h3>Drop me a line</h3>
  <div>
    <ul>
      <li><a href="hi@kf.jsdf.co">Email</a></li>
      <li><a href="https://twitter.com/ur_friend_james">Twitter</a></li>
      <li><a href="https://github.com/jsdf">GitHub</a></li>
     </ul>
  </div>
</div>
`,
    block_recent_articles: () =>
      `
<div class="recent-articles block">
  <h3>Recent stuff</h3>
  <div>
    ${context.options.posts
      .slice(0, 5)
      .map(
        (post) => `
        <div>
          <a href="/${post.slug}">${escapeHTML(post.title)}</a>
        </div>
        `
      )
      .join('\n')}
  </div>
</div>
`,

    block_projects: () => {
      return ` 
<div class="projects block">
  <h3>Projects</h3>
  <div>
    ${projects
      .map(
        (item) => `
          <div>
            <a href="${item.url}" title="${escapeHTML(item.tip)}">${escapeHTML(
          item.label
        )}</a>
          </div>
          `
      )
      .join('\n')}
  </div>
</div>
     `;
    },
    site_slogan: () => escapeHTML(`dusting off the digital bones`),
    rss_link: () =>
      `
<a href="${context.options.host}/rss.xml" class="feed-icon" title="Subscribe to Front page feed">
  <img src="${context.options.host}/misc/feed.png" width="16" height="16" alt="Subscribe to Front page feed"/>
</a>
`,
    top_links_bar: () => {
      const renderItem = ({url, tip, label}) =>
        projectsTemplate.render({url, tip, label});

      return `
      <ul class="project-links">
        ${projects.map(renderItem).join('\n')}
      </ul>
     `;
    },

    header: () =>
      `
<div id="name-and-slogan">
  <div id="site-name"><a href="/" title="Home" rel="home">James Friend</a></div>
  ${false ? `<div id="site-slogan">${partials.site_slogan()}</div>` : ''}
</div>
    `,
  };
  return partials;
};

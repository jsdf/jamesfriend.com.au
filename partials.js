// @flow

const hogan = require('hogan.js');

const projects = [
  {
    url: '/pce-js/',
    tip: 'Mac Plus/IBM PC/Atari ST emulator in the browser',
    label: 'pce.js emulator',
  },
  {
    url: '/projects/basiliskii/BasiliskII-worker.html',
    tip: 'Mac OS System 7/SimCity 2000/Marathon in the browser',
    label: 'BasiliskII.js emulator',
  },
  {
    url: 'https://jsdf.github.io/little-virtual-computer/computer1',
    tip: 'Learn how computers work by simulating them in Javascript',
    label: 'little-virtual-computer',
  },
  {
    url: 'https://jsdf.github.io/ReasonPhysics',
    tip: '2D Physics simulation in ReasonML',
    label: 'ReasonPhysics',
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
    tip: 'Serverless server monitoring with near-zero running costs',
    label: 'they-live',
  },
  {
    url: 'https://github.com/jsdf/lisp.rs',
    tip: 'A crappy Scheme interpreter in Rust',
    label: 'lisp.rs',
  },
];

module.exports = (options /*: {host: string, posts: Array<Object>}*/) => {
  const partials = {
    common_css: () =>
      `
<link type="text/css" rel="stylesheet" href="${
        options.host
      }/assets/main.css" media="all"/>
`,
    common_js: () =>
      `
<script type="text/javascript">
<!--//--><![CDATA[//><!--
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","//www.google-analytics.com/analytics.js","ga");ga("create", "UA-23661560-1", {"cookieDomain":"auto"});ga("send", "pageview");
//--><!]]>
</script>
<script type="text/javascript" src="${options.host}/assets/main.js"></script>
`,
    meta_tags: () =>
      `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="shortcut icon" href="${
        options.host
      }/favicon.ico" type="image/vnd.microsoft.icon"/>
<meta name="viewport" id="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=10.0,initial-scale=1.0">
<meta name="generator" content="AppleScript"/>
`,
    sidebar: () =>
      `
<div id="sidebar-second" class="sidebar span3">
  <div class="row-fluid">
    <div class="region region-sidebar-second clearfix">
      ${partials.block_me()}
      ${partials.block_contact()}
      ${partials.block_recent_articles()}
      ${partials.block_projects()}
    </div>
  </div>
</div>
`,
    block_me: () =>
      `
<div id="block-block-1" class="clearfix block block-block">
  <h2>Hi! I&#039;m James.</h2>
  <div class="content">
    <div class="pic-me">
      <img src="/files/corndog.jpeg" title="James Friend" alt="James Friend">
    </div>
    <p>I work at Facebook and make neat stuff on the web.<br> I'm into UX, music production, designing the future, and learning from the past.</p>
  </div>
</div>
`,
    block_contact: () =>
      `
<div id="block-block-3" class="clearfix block block-block">
  <h2>Drop me a line</h2>
  <div class="content">
    <ul>
      <li><a href="&#109;&#97;&#x69;l&#116;&#x6f;&#x3a;j&#97;&#x6d;&#x65;&#115;&#64;&#x6a;&#x73;&#100;&#102;&#x2e;&#x63;&#111;">Email</a></li>
      <li><a href="https://twitter.com/ur_friend_james">Twitter</a></li>
      <li><a href="https://github.com/jsdf">GitHub</a></li>
      <li><a href="http://www.linkedin.com/in/jamesfriendau">LinkedIn</a></li>
    </ul>
  </div>
</div>
`,
    block_recent_articles: () =>
      `
<div id="block-views-recent-articles-block" class="clearfix block block-views">
  <h2>Recent stuff</h2>
  <div class="content">
    <div class="view view-recent-articles view-id-recent_articles view-display-id-block">
      <div class="view-content">
      ${options.posts
        .slice(0, 5)
        .map(
          post => `
          <div class="views-row">
            <div class="views-field views-field-title"> <span class="field-content"><a href="/${
              post.slug
            }">${post.title}</a></span>
            </div>
          </div>
          `
        )
        .join('\n')}
      </div>
    </div>
  </div>
</div>
`,

    block_projects: () => {
      return ` 
<div id="block-views-projects-block" class="clearfix block block-views">
  <h2>Projects</h2>
  <div class="content">
    <div class="view view-projects view-id-projects view-display-id-block">
      <div class="view-content">
      ${projects
        .map(
          item => `
          <div class="views-row">
            <div class="views-field views-field-title"> <span class="field-content">
              <a class="has-tooltip" href="${item.url}" title="${
            item.tip
          }" data-toggle="tooltip" data-trigger="hover" data-placement="left">${
            item.label
          }</a>
            </div>
          </div>
          `
        )
        .join('\n')}
      </div>
    </div>
  </div>
</div>
     `;
    },
    site_slogan: () => `Web Platform Adventures &amp; PC Archeology`,
    rss_link: () =>
      `
<a href="${
        options.host
      }/rss.xml" class="feed-icon" title="Subscribe to Front page feed">
  <img typeof="foaf:Image" src="${
    options.host
  }/misc/feed.png" width="16" height="16" alt="Subscribe to Front page feed"/>
</a>
`,
    top_links_bar: () => {
      const renderItem = ({url, tip, label}) =>
        `
<li>
  <a href="${url}" title="${tip}" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">${label}</a>
</li>
      `;

      return `
<div id="top-links-bar">
  <div class="container">
    <a class="attention-seeker" href="https://github.com/jsdf">here's some neat stuff I made</a>
    <ul>
    ${projects.map(renderItem).join('\n')}
    </ul>
  </div>
</div>
     `;
    },
    header: () =>
      `
<div id="header" class="clearfix">
  <div class="container">
    <div class="row">
      <div class="span12">
        <div id="name-and-slogan">
          <div id="site-name"><a href="/" title="Home" rel="home">James Friend</a></div>
          <div id="site-slogan">${partials.site_slogan()}</div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  };
  return partials;
};

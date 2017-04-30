const hogan = require('hogan.js');

function subtitute(input) {
  const template = hogan.compile(input);
  return template.render(partials);
}

module.exports = options => {
  const partials = {
    common_css: () =>
      `
<link type="text/css" rel="stylesheet" href="/sites/default/files/css/css_xE-rWrJf-fncB6ztZfd2huxqgxu4WO-qwma6Xer30m4.css" media="all"/>
<link type="text/css" rel="stylesheet" href="/sites/default/files/css/css_hYCLW089C9S9sP3ZYkuG6R-Q5ZHbEhblZBFjwZ_bE_I.css" media="all"/>
<link type="text/css" rel="stylesheet" href="/sites/default/files/css/css_MnXiytJtb186Ydycnpwpw34cuUsHaKc80ey5LiQXhSY.css" media="all"/>
<link type="text/css" rel="stylesheet" href="/sites/default/files/css/css_EQmBOaqeJ6UMg2PoNVczLlpd0AwgWU0blkdCDAsm-3Q.css" media="all"/>
`,
    common_js: () =>
      `
<script type="text/javascript" src="https://jamesfriend.com.au/sites/default/files/js/js_Xjzh1hVfcgVAixhmmB6Go8TUMPOiprA-2vkC-oWXARQ.js"></script>
<script type="text/javascript">
<!--//--><![CDATA[//><!--
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","//www.google-analytics.com/analytics.js","ga");ga("create", "UA-23661560-1", {"cookieDomain":"auto"});ga("send", "pageview");
//--><!]]>
</script>
<script type="text/javascript" src="https://jamesfriend.com.au/sites/default/files/js/js_sTOU3jnGFEE0UHPROho9n2P1-yiOmwxWWJre6f_dNEQ.js"></script>
`,
    meta_tags: () =>
      `
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="shortcut icon" href="https://jamesfriend.com.au/favicon.ico" type="image/vnd.microsoft.icon"/>
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
    </div>
  </div>
</div>
`,
    block_archive: () =>
      `
<div id="block-views-archive-block" class="clearfix block block-views"> <h2>Past months</h2>
  <div class="content"> <div class="view view-archive view-id-archive view-display-id-block">
    <div class="view-content">
      <div class="item-list">
        <ul class="views-summary">
          <li><a href="/archive/201612">December 2016</a>
            (1)
          </li>
          <li><a href="/archive/201509">September 2015</a>
            (1)
          </li>
          <li><a href="/archive/201412">December 2014</a>
            (1)
          </li>
          <li><a href="/archive/201402">February 2014</a>
            (1)
          </li>
          <li><a href="/archive/201310">October 2013</a>
            (1)
          </li>
          <li><a href="/archive/201309">September 2013</a>
            (1)
          </li>
          <li><a href="/archive/201308">August 2013</a>
            (2)
          </li>
          <li><a href="/archive/201307">July 2013</a>
            (1)
          </li>
          <li><a href="/archive/201305">May 2013</a>
            (1)
          </li>
          <li><a href="/archive/201303">March 2013</a>
            (1)
          </li>
          <li><a href="/archive/201301">January 2013</a>
            (1)
          </li>
        </ul>
      </div>
    </div>
  </div> </div>
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
        <div class="views-row views-row-1 views-row-odd views-row-first">
          <div class="views-field views-field-title"> <span class="field-content"><a href="/how-do-binary-and-hexadecimal-numbers-work">How do binary and hexadecimal numbers work?</a></span>
          </div>
        </div>
        <div class="views-row views-row-2 views-row-even">
          <div class="views-field views-field-title"> <span class="field-content"><a href="/better-assertions-shallow-rendered-react-components">Better assertions for shallow-rendered React components</a></span>
          </div>
        </div>
        <div class="views-row views-row-3 views-row-odd">
          <div class="views-field views-field-title"> <span class="field-content"><a href="/installing-pygame-python-3-mac-os-yosemite">Installing Pygame for Python 3 on Mac OS Yosemite</a></span>
          </div>
        </div>
        <div class="views-row views-row-4 views-row-even">
          <div class="views-field views-field-title"> <span class="field-content"><a href="/running-hypercard-stack-2014">Running a Hypercard stack on a modern Mac</a></span>
          </div>
        </div>
        <div class="views-row views-row-5 views-row-odd views-row-last">
          <div class="views-field views-field-title"> <span class="field-content"><a href="/why-port-emulators-browser">Why port emulators to the browser?</a></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
    rss_link: () =>
      `
<a href="https://jamesfriend.com.au/rss.xml" class="feed-icon" title="Subscribe to Front page feed">
  <img typeof="foaf:Image" src="https://jamesfriend.com.au/misc/feed.png" width="16" height="16" alt="Subscribe to Front page feed"/>
</a>
`,
    top_links_bar: () =>
      `
<div id="top-links-bar">
  <div class="container">
    <a class="attention-seeker" href="https://github.com/jsdf">here's some neat stuff I made</a>
    <ul>
      <li>
        <a href="/pce-js/" title="Mac Plus/IBM PC/Atari ST emulator in the browser" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">pce.js emulator</a>
      </li>
      <li>
        <a href="https://github.com/jsdf/cached-loader" title="Adds persistent on-disk caching to webpack loaders" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">cached-loader</a>
      </li>
      <li>
        <a href="https://github.com/jsdf/react-native-htmlview" title="A React Native component which renders HTML content as native views" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">react-native-htmlview</a>
      </li>
      <li>
        <a href="https://github.com/jsdf/hacker-news-mobile" title="Hacker News mobile web app built in Universal/Isomorphic React" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">hacker-news-mobile</a>
      </li>
      <li>
        <a href="https://github.com/jsdf/lisp.rs" title="A crappy Scheme interpreter in Rust" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">lisp.rs</a>
      </li>
      <li>
        <a href="https://github.com/jsdf/browserify-incremental" title="Incremental rebuild for browserify" data-toggle="tooltip" data-trigger="hover" data-placement="bottom">browserify-incremental</a>
      </li>
    </ul>
  </div>
</div>
`,
    header: () =>
      `
<div id="header" class="clearfix">
  <div class="container">
    <div class="row">
      <div class="span12">
        <div id="name-and-slogan">
          <div id="site-name"><a href="/" title="Home" rel="home">James Friend</a></div>
          <div id="site-slogan">Web Platform Adventures &amp; PC Archeology</div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  };
  return partials;
};

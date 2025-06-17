import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="content post-header">
      <div id="name-and-slogan">
        <div id="site-name">
          <a href="/" title="Home" rel="home">
            James Friend
          </a>
        </div>
        {/* The site_slogan was conditionally rendered as false in partials.js, so omitting it here */}
      </div>
    </div>
  );
};

export default Header;

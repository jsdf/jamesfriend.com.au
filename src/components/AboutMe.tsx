import React from 'react';

const AboutMe: React.FC = () => {
  return (
    <div className="about-me block">
      <h3>Hi! I'm James.</h3>
      <div>
        <div className="pic-me">
          <img
            width="230"
            height="230"
            src="/files/corndog.jpeg"
            title="James Friend"
            alt="James Friend"
          />
        </div>
        <p>
          I make neat stuff on the web.
          <br /> I'm into UX, music production, designing the future, and
          learning from the past.
        </p>
      </div>
    </div>
  );
};

export default AboutMe;

import React from 'react';

const ContactMe: React.FC = () => {
  return (
    <div className="contact-me block">
      <h3>Drop me a line</h3>
      <div>
        <ul>
          <li>
            <a href="mailto:hi@kf.jsdf.co">Email</a>
          </li>
          <li>
            <a href="https://twitter.com/ur_friend_james">Twitter</a>
          </li>
          <li>
            <a href="https://github.com/jsdf">GitHub</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ContactMe;

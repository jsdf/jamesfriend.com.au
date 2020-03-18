import ReactDOM from 'react-dom';
import React from 'react';

export default function renderComponent(element, id) {
  ReactDOM.render(element, document.getElementById(id));
}

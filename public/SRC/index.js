import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Make sure to adjust the import paths as needed
import App from './App';  // Ensure this is the correct import path for your root component
import reportWebVitals from './reportWebVitals'; // Optional

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

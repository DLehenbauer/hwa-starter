// Require static content
require.context('./', true, /\.(html|webmanifest|te?xt)$/);
require.context('./', true, /\.(png|jpe?g|gif|svg|ico)$/);

// Require styles
require('normalize.css');
require('./css/styles.scss');

// main.js
const React = require('react');
const ReactDOM = require('react-dom');
const Model = require('./js/model');
const UI = require('./js/ui');

ReactDOM.render(
    <UI.Soroban rods='9' />,
    document.getElementById('root')
);
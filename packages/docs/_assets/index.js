// Bootstrap.
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap-icons/font/bootstrap-icons.css');
require('bootstrap');
require('./css/bootstrap.css');

require('./css/prism.css');

// Prism.
var Prism = require('prismjs');

// Prism languages.
require('prismjs/components/prism-clike');
require('prismjs/components/prism-markup-templating');
require('prismjs/components/prism-tt2');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-perl');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-json');

// Prism plug-ins.
require('prismjs/plugins/line-numbers/prism-line-numbers');
require('prismjs/plugins/autolinker/prism-autolinker');

// Prism CSS.
require('prismjs/themes/prism.css');
require('prismjs/plugins/line-numbers/prism-line-numbers.css');

// Custom CSS.
require('./css/qgoda.css');
require('./css/toc.css');

require('./css/cookie-consent.css');
require('./js/cookie-consent.js');

// Custom JS.
require('./js/code-language');

// Matomo.
require('./js/matomo');

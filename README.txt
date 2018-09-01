By default, nodemon looks for files with the .js, .coffee, .litcoffee, and .json extensions

You can a) provide additional paths to --watch and b) additional extensions. This is my Nodemon npm run script:

"serve": "node_modules/nodemon/bin/nodemon.js --watch dist --watch templates -e js,json,html ./dist/index.js"

Watches for changes in directory dist, templates, extensions js, json and html and runs ./dist/index.js

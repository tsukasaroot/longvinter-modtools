rm -f ./public/lib/all.min.js
rm -rf ./dist
npm run uglify-front
npm run deploy
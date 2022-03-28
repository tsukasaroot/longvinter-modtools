rm -f ./public/lib/all.min.js
rm -f ./lib/lib.min.js
rm -rf ./dist
npm run uglify-front
npm run uglify-lib
npm run build
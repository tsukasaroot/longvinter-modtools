rm -f ./public/lib/all.min.js
rm -rf ./dist
npm run uglify
npm run build
### Common Libs used both in extension and Browse page

- use uglify to create one file from them

#### For library css run following command from top repo folder
```
npm install uglifycss -g
uglifycss common/lib/css/* --output common/generated/lib/css/generated-lib.css
cp common/generated/lib/css/generated-lib.css bookmark-extension/lib/css/
cp common/generated/lib/css/generated-lib.css server/public/lib/css
```


#### For library js
```
npm install uglify-es -g
uglifyjs common/lib/js/* --compress --keep-fnames -o common/generated/lib/js/generated-lib.js
cp common/generated/lib/js/generated-lib.js bookmark-extension/lib/js/
cp common/generated/lib/js/generated-lib.js server/public/lib/js

```

#### For js
```
uglifyjs common/js/* --compress --keep-fnames -o common/generated/js/generated.js
cp common/generated/js/generated.js server/public/js
cp common/generated/js/generated.js bookmark-extension/js/
```
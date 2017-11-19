### Common Libs used both in extension and Browse page

- use uglify to create one file from them
- Correct order of libraries in uglifyjs command is important

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
uglifyjs common/lib/js/jquery-3.2.1.min.js common/lib/js/jquery-ui.js common/lib/js/handlebars.min.js common/lib/js/pouchdb.js common/lib/js/pouchdb.find.js common/lib/js/superagent.min.js common/lib/js/anchorme.min.js common/lib/js/bluebird.min.js common/lib/js/bootstrap.min.js common/lib/js/bootstrap-toggle.min.js common/lib/js/compromise.min.js common/lib/js/date_fns.min.js common/lib/js/fuzzyset.js common/lib/js/highlight.min.js common/lib/js/simplemde.min.js common/lib/js/star-rating.min.js common/lib/js/taggle.js common/lib/js/toastr.min.js common/lib/js/jquery.dropdown.js  --beautify ascii_only --compress --keep-fnames -o common/generated/lib/js/generated-lib.js
cp common/generated/lib/js/generated-lib.js bookmark-extension/lib/js/
cp common/generated/lib/js/generated-lib.js server/public/lib/js

```

#### For js
```
uglifyjs common/js/* --compress --keep-fnames -o common/generated/js/generated.js
cp common/generated/js/generated.js server/public/js
cp common/generated/js/generated.js bookmark-extension/js/
```
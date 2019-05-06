### TODO (Features)
- CouchDB in same package as node
- CouchDB backup process
- Default Collection Per Website
- Remove Unused or unnecessary features
- Improve Title Detection
    - Title present in top 30% of page
    - Title detection is a weighted function of font-size, font-weight, greatest enclosing tags upto some x level
    - Title with more words has more weight
- Navigation with chrome forward and backward broken bug
- http://interactjs.io/
- Better Error Messages - send fine grained error from background.
- Fix bug of frame tag input jumping
- fix autocomplete deletions bug in browse page, deleted entries still show in autocomplete
- Google sign in
- youtube match videos even if they are in playlist by using watch=parameter
- search with multiple terms. Like search dp in geeksforgeeks
- File attachments / images
- Improve main bookmark widget by making it a round closeable draggable
- Resize and reposition by drag drop
- show similar pages to this that you have bookmarked.
- Text Area for writing notes to be minimisable.
- dock to bottom like chrome debugger

### Browse Page Improvements
- pagination/Infinite scroll - browse page


### Won't do
- Add link to previous entry since the topic is same/similar
- search bug, search matches paragraph when searched for graph, hard to fix cause full word search breaks search in hrefs and paths
- In browse page, have a Tags included and Tags excluded as separate check boxes
- Active conditions - match path
- Admin Login
- Secure send password over http by hashing
- dev mode
- Unify pouchDB access overall. unnecessary and backend has different features from frontend
- Provide list and tile view by using iframe? in browse page. Perf issue
- detect content type - audio/video/article etc. Most sites are mixed content.
- Video timer in coursera and udemy. hard to do and not very beneficial
- Tag Detection and suggestion, call these implicit tags, as opposed to user specific tags
- User preference to start the browse page with selected config, allow creation of custom browse pages
- Offline save for reading, show online version if net available
- Integrate search with already bookmarked chrome store?
- Integrate search with google search page and url bar
- Support Annotations, with offline caching (for speedup? or not)
- Video timer in coursera and udemy
- Browse Page Improvements
    - Make 2 tabs, browse with filters and search, chrome bookmarks
    - Add a chrome bookmarks browse page with fuzzy search, sortby date and other sortby. Ability to add to Geekmarks.
    - Show notes as well
    - Improve sidebar by making it closeable with hamburger / Webengage menu.
    - Decide whether to allow edit abilities

### Login/Sign Up issues
- If check-login is false then try sync and determine actual logout before returning
- If save fails due to logged out then open login page, after user logs in, resave.
- forgot password on login page
- Unify login/sign_up for all layers
- Auth Token + Https + Bookmarklet (color thousand or less)
- make /api for api calls and if check-login fails then return unauthenticated/unauthorized error codes, handle on client side by saying save failed and open login page

### TODO (Refactoring/Code changes)
- Return proper error http codes for non-permitted actions
- Use res.render and stop browse.html to be rendered.
- Remove Globals pollution
- Handle runtime.lastError where possible in chrome.* apis
- Migrate to PouchDB
- do payload validation at client end and only post to server if a valid payload is present.

### Tree Libs
- [Jq-tree](https://mbraak.github.io/jqTree/)
- [jquery-treetable](http://ludo.cubicphuse.nl/jquery-treetable/)

### Links
- https://answers.squarespace.com/questions/88719/problem-with-iframe-on-mobile-device.html
- http://benmarshall.me/responsive-iframes/
- https://www.smashingmagazine.com/2014/02/making-embedded-content-work-in-responsive-design/
- http://stackoverflow.com/questions/4612374/iframe-inherit-from-parent
- http://stackoverflow.com/questions/12235806/can-html-iframes-inherit-css-and-javascript-data
- http://stackoverflow.com/questions/13591983/onclick-within-chrome-extension-not-working
- https://pouchdb.com/2015/04/05/filtered-replication.html
- https://github.com/josdejong/jsoneditor
- https://selectize.github.io/selectize.js/
- http://h.readthedocs.io/en/latest/api/authorization/
- https://developers.google.com/identity/sign-in/web/sign-in
- https://developer.chrome.com/apps/app_identity
- https://developers.google.com/identity/sign-in/web/devconsole-project
- https://stackoverflow.com/questions/44657832/how-to-draw-circle-with-text-in-middle-and-an-image-as-a-background-of-the-circl

### Iframe chrome extensions
- http://stackoverflow.com/questions/11325415/access-iframe-content-from-a-chromes-extension-content-script
- http://stackoverflow.com/questions/19288202/inject-javascript-in-an-iframe-using-chrome-extension
- http://stackoverflow.com/questions/9457700/chrome-extension-not-injecting-javascript-into-iframe
- http://stackoverflow.com/questions/9602022/chrome-extension-retrieving-gmails-original-message
- http://codepen.io/tommywang/pen/rVLBbq

### Annotations
- http://aroc.github.io/side-comments-demo/
- https://hypothes.is/contribute/
- http://h.readthedocs.io/en/latest/
- http://h.readthedocs.io/en/latest/api/authorization/
- http://docs.annotatorjs.org/en/v1.2.x
- https://github.com/openannotation/annotator
- https://github.com/auth0/node-jsonwebtoken
- http://www.annotationstudio.org/project/technology/
- https://github.com/openannotation/annotator-store

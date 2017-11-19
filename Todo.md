### TODO (Features)
- Better Error Messages - send fine grained error from background.
- Fix bug of frame tag input jumping
- fix autocomplete deletions bug in browse page, deleted entries still show in autocomplete
- Video timer in coursera and udemy
- Google sign in
- Support Annotations, with offline caching (for speedup? or not)
- Tag searches on fuzzy text search (misspellings)
- Integrate search with google search page and url bar
- File attachments / images
- detect content type - audio/video/article etc.
- Improve main bookmark widget by making it a round closeable draggable
- Resize and reposition by drag drop
- show similar pages to this that you have bookmarked.
- CSS Fix on Flipkart, prefix css with some custom stuff for content script
- Text Area for writing notes to be minimisable.
- dock to bottom like chrome debugger
- Offline save for reading, show online version if net available

### Browse Page Improvements
- Make 3 tabs, browse with filters, search, chrome bookmarks
- Improve search by having word auto-complete + having auto results after 4 letters
- Add a chrome bookmarks browse page with fuzzy search, sortby date and other sortby. Ability to add to Geekmarks.
- In browse page, have a Tags included and Tags excluded as separate check boxes
- Show notes as well
- Improve sidebar by making it closeable with hamburger / Webengage menu.
- Decide whether to allow edit abilities
- pagination/Infinite scroll - browse page
- Provide list and tile view by using iframe? in browse page

### Won't do
- Add link to previous entry since the topic is same/similar
- Active conditions - match path
- Admin Login
- Secure send password over http by hashing
- dev mode
- Tag Detection and suggestion, call these implicit tags, as opposed to user specific tags
- User preference to start the browse page with selected config, allow creation of custom browse pages

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

### TODO (Features)
- Tag searches on fuzzy text search (misspellings)
- General fuzzy search based on text distance
- Bookmarks heirarchy support like chrome bookmarks
- Integrate search with google search page and url bar
- detect content type - audio/video/article etc.
- Text Area for writing notes to be minimisable.
- Improve main bookmark widget by making it a round closeable draggable
- Resize and reposition by drag drop
- Ability to create collections/topics (When you browse a topic you will see only contents of that topic even if a mentioned tag is in another topic as well). Allow only 10 topics per user, so users know topic is a big thing. 
- show similar pages to this that you have bookmarked. 
- Group similar pages together in browse view.
- Tag Detection and suggestion, call these implicit tags, as opposed to user specific tags
- CSS Fix on Flipkart, prefix css with some custom stuff for content script
- Support Annotations
- Tag heirarchy creation
- dock to bottom like chrome debugger

### Browse Page Improvements
- Improve search by having word auto-complete + having auto results after 4 letters
- Add a chrome bookmarks browse page with fuzzy search, sortby date and other sortby. Ability to add to Geekmarks.
- Add firstVisited Column to store the first time page was seen and add sort option for it
- In browse page, have a Tags included and Tags excluded as separate check boxes
- Show notes as well
- Improve sidebar by making it closeable with hamburger / Webengage menu.
- Provide list and tile view in browse page
- Provide sorting in the way e-commerce sites do
- Decide whether to allow edit abilities
- pagination/Infinite scroll - browse page

### Won't do
- File attachments / images
- Add link to previous entry since the topic is same/similar
- Active conditions - match path
- Admin Login
- Offline save for reading, show online version if net available
- Secure send password over http by hashing
- dev mode
- User preference to start the browse page with selected config, allow creation of custom browse pages

### Login/Sign Up issues
- If check-login is false then try sync and determine actual logout before returning
- If save fails due to logged out then open login page, after user logs in, resave.
- forgot password on login page
- Fix logout issues by migrating to a persist store for sessions
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

### Links
- https://answers.squarespace.com/questions/88719/problem-with-iframe-on-mobile-device.html
- http://benmarshall.me/responsive-iframes/
- https://www.smashingmagazine.com/2014/02/making-embedded-content-work-in-responsive-design/
- http://stackoverflow.com/questions/4612374/iframe-inherit-from-parent
- http://stackoverflow.com/questions/12235806/can-html-iframes-inherit-css-and-javascript-data
- http://stackoverflow.com/questions/13591983/onclick-within-chrome-extension-not-working
- https://pouchdb.com/2015/04/05/filtered-replication.html

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
- http://docs.annotatorjs.org/en/v1.2.x
- https://github.com/openannotation/annotator
- https://github.com/auth0/node-jsonwebtoken
- http://www.annotationstudio.org/project/technology/
- https://github.com/openannotation/annotator-store

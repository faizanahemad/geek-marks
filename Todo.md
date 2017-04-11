### TODO (Features)
- make /api for api calls and if check-login fails then return unauthenticated/unauthorized error codes, handle on client side by saying save failed and open login page
- If check-login is false then try sync and determine actual logout before returning
- Make checkLogin as Cookie check + API call , call per min from Bg page and save in promise, separate from sync
- If save fails due to logged out then open login page, after user logs in, resave.
- Login issues
- Improve main bookmark widget by making it a round closeable draggable 
- detect content type - audio/video/article etc.
- Resize and reposition by drag drop
- Secure send password over http by hashing
- Fix logout issues by migrating to a persist store for sessions
- Ability to create collections/topics (When you browse a topic you will see only contents of that topic even if a mentioned tag is in another topic as well). Allow only 10 topics per user, so users know topic is a big thing. 
- Tag heirarchy creation
- Migrate to PouchDB
- fuzzy search based on text distance, show similar pages to this that you have bookmarked. Group similar pages together in browse view.
- Handle runtime.lastError where possible in chrome.* apis
- Unify login/sign_up for all layers
- do payload validation at client end and only post to server if a valid payload is present.
- Admin Login
- Auth Token + Https + Bookmarklet (color thousand or less)
- Offline save for reading, show online version if net available
- Tag Detection and suggestion, call these implicit tags, as opposed to user specific tags
- CSS Fix on Flipkart, prefix css with some custom stuff for content script
- Support Annotations
- dev mode, forgot password on login page

### Browse Page Improvements
- In browse page, have a Tags included and Tags excluded as separate check boxes
- Show notes as well
- Improve sidebar by making it closeable with hamburger / Webengage menu.
- Improve search by having word auto-complete + having auto results after 4 letters
- Provide list and tile view in browse page
- Provide sorting in the way e-commerce sites do
- Decide whether to allow edit abilities
- User preference to start the browse page with selected config, allow creation of custom browse pages
- pagination/Infinite scroll - browse page

### Won't do
- File attachments / images
- Add link to previous entry since the topic is same/similar
- Active conditions - match path

### TODO (Refactoring/Code changes)
- Return proper error http codes for non-permitted actions
- Use res.render and stop browse.html to be rendered.
- Remove Globals pollution

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

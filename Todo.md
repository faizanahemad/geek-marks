### TODO (Features)
- Rename difficulty to rating
- search should have option to not show useless
- Unable to save, you are offline modal/tooltip/popup when any post API fails
- If save fails due to logged out then open login page, after user logs in, resave.
- exponential decay sync if extension not in use
- Color preferences save
- Default styles not picked up on selected sites
- Resize and reposition by drag drop
- Secure send password over http by hashing
- Fix logout issues by migrating to a persist store for sessions
- dev mode, forgot password on login page
- Migrate to PouchDB
- Active conditions - match path
- enable disable sync/online storage, default link color
- Handle runtime.lastError where possible in chrome.* apis
- Resync if Client version > DB version
- Unify login/sign_up for all layers
- Provide configurable options to store programs for various extraction logic like title/href-match
- do payload validation at client end and only post to server if a valid payload is present.
- Admin Login
- Bucketing tags into topics to support wider use on other sites,
- User preference to start the browse page with selected config, allow creation of custom browse pages
- Add link to previous entry since the topic is same/similar
- Shift to MongoDB
- Migrate to linux
- Auth Token + Https + Bookmarklet (color thousand or less)
- Support Annotations
- Have a blacklist option to not show on pages like fb/scoopwhoop
- Offline save for reading, show online version if net available
- Give a use only offline option
- Per user metadata like used tags etc.
- pagination/Infinite scroll - browse page
- Tag Detection and suggestion
- Make extension as your new tab page.
- Show most rated/visited hosts in the new tab page
- Edit tags to already added bookmark from browse page
 




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
- http://www.annotationstudio.org/
- https://hypothes.is/about/
- https://github.com/openannotation/annotator

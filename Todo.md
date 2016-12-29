### TODO (Features)
- Use trie for Prefix matching of Href
- Use background page to update/sync Browser DB, Iframe to only update, and content_script to only consume, http calls from background page
- Unify DB files for all layers
- Unify login/sign_up for all layers
- Provide configurable options to store programs for various extraction logic like title/href-match
- doo payload validation at client end and only post to server if a valid payload is present.
- Login in new window, close window once login completes, open actual iframe once logged in.
- Admin Login
- Enable on Quora and Medium
- Bucketing tags into topics to support wider use on other sites,
- User preference to start the browse page with selected config, allow creation of custom browse pages
- Add link to previous entry since the topic is same/similar
- Make Iframe responsive
- Show hide or use on this site, per website config from plugin options / popup.html
- Primary key of DB as hash of username + href (get current page annotations/notes/data easily easily)
- Shift to MongoDB
- Migrate to linux
- Auth Token + Https + Bookmarklet (Only tag the page n color thousand or less)
- Enable on this site in extension popup
- Chrome extension (Per page activate / global activate)
- Google Drive / AWS
- Sign Up page
- Support Annotations
- Explore other storage options
- Avoid repaint of browser UI during periodic fetch if no data is updated.
- Use extension background page / nedb on browser for cache. Versioned updates of data thought.
- Have a blacklist option to not show on pages like fb/scoopwhoop
- Offline save for reading, show online version if net available
- Give a use only offline option
- Detect whether the user has read the page based on scroll/mouse move/cursor patterns or stay duration of 1 min
- Per user metadata like used tags etc.
- pagination/Infinite scroll - browse page
- Tag Detection and suggestion
- Make extension as your new tab page.
- Show notes on desktop. Disable on Mobile sites.
- Recognise mobile and desktop versions of the site by hrefs and collate data
- Show most rated/visited hosts in the new tab page
- Edit tags to already added bookmark from browse page
 




### TODO (Refactoring/Code changes)
- Return proper error http codes for non-permitted actions
- make a bookmarks client js and use it in browse and extension
- Use res.render and stop browse.html to be rendered.
- Remove Globals pollution

### Links
- https://answers.squarespace.com/questions/88719/problem-with-iframe-on-mobile-device.html
- http://benmarshall.me/responsive-iframes/
- https://www.smashingmagazine.com/2014/02/making-embedded-content-work-in-responsive-design/
- http://stackoverflow.com/questions/4612374/iframe-inherit-from-parent
- http://stackoverflow.com/questions/12235806/can-html-iframes-inherit-css-and-javascript-data
- http://stackoverflow.com/questions/13591983/onclick-within-chrome-extension-not-working

### Iframe chrome extensions
- http://stackoverflow.com/questions/11325415/access-iframe-content-from-a-chromes-extension-content-script
- http://stackoverflow.com/questions/19288202/inject-javascript-in-an-iframe-using-chrome-extension
- http://stackoverflow.com/questions/9457700/chrome-extension-not-injecting-javascript-into-iframe
- http://stackoverflow.com/questions/9602022/chrome-extension-retrieving-gmails-original-message

### Annotations
- http://www.annotationstudio.org/
- https://hypothes.is/about/
- https://github.com/openannotation/annotator

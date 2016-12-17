### TODO (Features)
- Sign Up page
- Support Other Sites by having generic cross site parsing and styles based on hostnames
- Bring Page optimised CSS/JS from server / Local Storage
- Color chrome bookmarks separately
- Support Annotations
- Enable on this site in extension popup
- Explore other storage options
- Use extension background page / nedb on browser for cache. Versioned updates of data thought.
- Offline save for reading, show online version if net available
- Give a use only offline option
- Have a blacklist option to not show on pages like fb/scoopwhoop
- Chrome extension (Per page activate / global activate)
- Detect whether the user has read the page based on scroll/mouse move/cursor patterns
- Per user metadata like used tags etc.
- pagination/Infinite scroll
- Make extension as your new tab page.
- Show most rated/visited hosts in the new tab page
- Tag Detection and suggestion
- Add option to enable notes on a site. By default note taking will be disabled.
- Google Drive / AWS




### TODO (Refactoring/Code changes)
- Return proper error http codes for non-permitted actions
- make a bookmarks client js and use it in browse and extension
- Use res.render and stop browse.html to be rendered.
- Remove Globals pollution

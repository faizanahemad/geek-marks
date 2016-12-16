
(function() {
    var head = document.getElementsByTagName("head")[0];


    var scripts = [serverUrl+'/lib/js/superagent.min.js',
                   serverUrl+'/lib/js/anchorme.min.js',
                   serverUrl+'/lib/js/taggle.js',
                   serverUrl+'/js/common.js',
                   serverUrl+'/js/history.js'];
    var styles = [serverUrl+'/css/styles.css'];

    scripts.forEach(s=>{
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = s;
        head.appendChild(script);
    });
    styles.forEach(s=>{
        var link = document.createElement('link');
        link.type = 'text/css';
        link.href = s;
        link.rel = "stylesheet";
        head.appendChild(link);
    });

    var a=document.getElementById("comment");
    if(a) {
        a.click();
    }

})();

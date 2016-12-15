
(function() {
    var head = document.getElementsByTagName("head")[0];

    var linkStarter = 'http://localhost:8000/';
    if(location.protocol==="https:") {
        linkStarter = 'https://localhost:8443/';
    }

    var scripts = ['https://localhost:8443/js/superagent.min.js',
                   'https://localhost:8443/js/anchorme.min.js',
                   'https://localhost:8443/js/taggle.js',
                   'https://localhost:8443/js/history.js',];
    var styles = ['https://localhost:8443/css/styles.css'];

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

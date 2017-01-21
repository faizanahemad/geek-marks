function popUpOnload() {
    var colors = [{color: "Magenta", active: false},
        {color: "LimeGreen", active: false},
        {color: "Silver", active: false},
        {color: "DodgerBlue", active: false},
        {color: "SandyBrown", active: false}];
    function getIndexOfSelectedColor(colors) {
        return colors.reduce((prev,cur,index)=>{
           if(cur.active) {
               return index;
           } else {
               return prev;
           }
        },-1)
    }
    function changeStyle(style,colors) {
        colors.forEach(c=>c.active = false);
        colors[style].active = true;
    }
    function sendChange() {
        chrome.runtime.sendMessage({from: 'popup', type: 'settings_change'});
    }
    var siteSettings = {area:"site"};
    var globalSettings = {area:"global",isGlobal:true};
    var settingsTemplateString = document.getElementById("settings-area-template").innerHTML;
    var globalSettingsTemplateString = document.getElementById("global-settings-area-template").innerHTML;
    var siteTemplate = Handlebars.compile(settingsTemplateString);
    var globalTemplate = Handlebars.compile(globalSettingsTemplateString);

    function renderArea(data,area) {
        var template = globalTemplate;
        area = area || data.area;
        if(area==="site") {
            template = siteTemplate;
        }
        data.colors = $.extend(true,[],colors);
        console.log(area);
        console.log(data);
        if(data.style.color) {
            data.colors[data.style.color].active = true;
        }
        var html = template(data);
        var outer = document.getElementById(area+"-area");
        outer.innerHTML = html;
        $('#'+area+"-enabled").bootstrapToggle();
        $('#'+area+"-show-on-load").bootstrapToggle();
        $('#'+area+"-bookmarks").bootstrapToggle();
        $('#'+area+"-notes").bootstrapToggle();
        document.getElementById(area+"-enabled").onchange = ()=>save(area);
        if(area==="site") {
            document.getElementById(area+"-bookmarks").onchange = ()=>save(area);
            document.getElementById(area+"-show-on-load").onchange = ()=>save(area);
            document.getElementById(area+"-notes").onchange = ()=>save(area);
            document.getElementById(area+"-path-matcher").onchange = ()=>save(area);
            document.getElementById(area+"-path").onchange = ()=>save(area);
        }
        document.getElementById(area+"-top").onchange = ()=>save(area);
        document.getElementById(area+"-right").onchange = ()=>save(area);
        document.getElementById(area+"-height").onchange = ()=>save(area);
        document.getElementById(area+"-width").onchange = ()=>save(area);

        for (var i=0;i<=4;i++ ) {
            var btn=document.getElementById(area+"-color-button-"+i);
            btn.onclick = (function (index) {
                return function () {
                    changeStyle(index,data.colors);
                    save(area);
                }
            })(i);
        }
    }

    function save(area) {
        var data = getData(area);
        console.log("Saving Data for"+area);
        console.log(data);
        if(area==="site") {
            chromeStorage.setSiteSettings(data).then(renderAreaData).then(sendChange)
        } else if(area==="global") {
            chromeStorage.setGlobalSettings(data).then(renderAreaData).then(sendChange)
        }
    }

    function getData(area) {
        var dataObj = {};
        if(area==="site") {
            dataObj = $.extend(true,{},siteSettings)
        } else if(area==="global") {
            dataObj = $.extend(true,{},globalSettings);
        }
        dataObj.style = dataObj.style || {};
        dataObj.settings = dataObj.settings || {};
        dataObj.settings.path = dataObj.settings.path || {};
        dataObj.settings["enabled"] = document.getElementById(area+"-enabled").checked;
        if(area==="site") {
            dataObj.settings["bookmarks"] =document.getElementById(area+"-bookmarks").checked;
            dataObj.settings["show_on_load"] =document.getElementById(area+"-show-on-load").checked;
            dataObj.settings["notes"] =document.getElementById(area+"-notes").checked;
            dataObj.settings.path["contains"] = false;
            dataObj.settings.path["equals"] = false;
            dataObj.settings.path["endsWith"] = false;
            dataObj.settings.path["startsWith"] = false;
            dataObj.settings.path[document.getElementById(area+"-path-matcher").value] = true;
            dataObj.settings.path["value"] =document.getElementById(area+"-path").value;
        }
        dataObj.style["top"] = document.getElementById(area+"-top").value;
        dataObj.style["right"] = document.getElementById(area+"-right").value;
        dataObj.style["height"] = document.getElementById(area+"-height").value;
        dataObj.style["width"] = document.getElementById(area+"-width").value;
        var color = getIndexOfSelectedColor(dataObj.colors);
        if(color!=-1) {
            dataObj.style["color"] = color;
        }
        console.log("saved data for: "+area);
        console.log(dataObj);
        delete dataObj.colors;
        return dataObj;

    }

    function renderAreaData() {
        chromeStorage.getGlobalSettings().then(settings=>{
            $.extend(globalSettings,settings);
            renderArea(globalSettings,"global");
            return globalSettings;
        }).then(gs=>{
            return Promise.join(chromeStorage.getSiteSettings(),gs)
        }).then(data=>{
            var gs=data[1];
            var settings=data[0];
            $.extend(siteSettings,settings);
            if(!gs.settings.enabled) {
                siteSettings.settings.enabledDisable = true;
            } else {
                if(!siteSettings.settings.enabled || !siteSettings.settings.notes) {
                    siteSettings.settings.show_on_loadDisable = true;
                }
            }
            return siteSettings;
        }).then(siteSettings=>renderArea(siteSettings,"site"));
    }
    renderAreaData();
}

window.onload = popUpOnload;

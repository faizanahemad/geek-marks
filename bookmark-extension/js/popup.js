function popUpOnload() {
    var siteSettings = {area:"site"};
    var globalSettings = {area:"global",isGlobal:true};
    var settingsTemplateString = document.getElementById("settings-area-template").innerHTML;
    var template = Handlebars.compile(settingsTemplateString);

    function renderArea(data,area) {
        area = area || data.area;
        var html = template(data);
        var outer = document.getElementById(area+"-area");
        outer.innerHTML = html;
        $('#'+area+"-enabled").bootstrapToggle();
        $('#'+area+"-show-on-load").bootstrapToggle();
        $('#'+area+"-bookmarks").bootstrapToggle();
        $('#'+area+"-notes").bootstrapToggle();
        document.getElementById(area+"-enabled").onchange = ()=>save(area);
        document.getElementById(area+"-show-on-load").onchange = ()=>save(area);
        document.getElementById(area+"-bookmarks").onchange = ()=>save(area);
        document.getElementById(area+"-notes").onchange = ()=>save(area);
        document.getElementById(area+"-path-matcher").onchange = ()=>save(area);
        document.getElementById(area+"-path").onchange = ()=>save(area);
        document.getElementById(area+"-top").onchange = ()=>save(area);
        document.getElementById(area+"-right").onchange = ()=>save(area);
        document.getElementById(area+"-height").onchange = ()=>save(area);
        document.getElementById(area+"-width").onchange = ()=>save(area);

    }

    function save(area) {
        var data = getData(area);
        if(area==="site") {
            chromeStorage.setSiteSettings(data).then(renderAreaData)
        } else if(area==="global") {
            chromeStorage.setGlobalSettings(data).then(renderAreaData)

        }
    }

    function getData(area) {
        var dataObj = {};
        if(area==="site") {
            dataObj = siteSettings
        } else if(area==="global") {
            dataObj = globalSettings;
        }
        dataObj.style = dataObj.style || {};
        dataObj.settings = dataObj.settings || {};
        dataObj.settings.path = dataObj.settings.path || {};
        dataObj.settings["enabled"] = document.getElementById(area+"-enabled").checked;
        dataObj.settings["show_on_load"] =document.getElementById(area+"-show-on-load").checked;
        dataObj.settings["bookmarks"] =document.getElementById(area+"-bookmarks").checked;
        dataObj.settings["notes"] =document.getElementById(area+"-notes").checked;
        dataObj.settings.path["contains"] = false;
        dataObj.settings.path["equals"] = false;
        dataObj.settings.path["endsWith"] = false;
        dataObj.settings.path["startsWith"] = false;
        dataObj.settings.path[document.getElementById(area+"-path-matcher").value] = true;
        dataObj.settings.path["value"] =document.getElementById(area+"-path").value;
        dataObj.style["top"] =document.getElementById(area+"-top").value;
        dataObj.style["right"] =document.getElementById(area+"-right").value;
        dataObj.style["height"] =document.getElementById(area+"-height").value;
        dataObj.style["width"] =document.getElementById(area+"-width").value;

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
            console.log("Site Settings");
            console.log(settings);
            $.extend(siteSettings,settings);
            if(!gs.settings.enabled) {
                siteSettings.settings.enabledDisable = true;
            } else {
                if(!gs.settings.notes || !siteSettings.settings.enabled) {
                    siteSettings.settings.notesDisable = true;
                }
                if(!gs.settings.bookmarks || !siteSettings.settings.enabled) {
                    siteSettings.settings.bookmarksDisable = true;
                }
                if(!gs.settings.show_on_load || !siteSettings.settings.enabled) {
                    siteSettings.settings.show_on_loadDisable = true;
                }
            }
            return siteSettings;
        }).then(siteSettings=>renderArea(siteSettings,"site"));
    }
    renderAreaData();
}

window.onload = popUpOnload;

const fetch = require("node-fetch");

/**
* Make fetch requests to given url with either GET or POST
 */

function httpPostAsync(params, theUrl, csrf, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST', theUrl, true);

    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback('success;' + xmlHttp.responseText);
        } else if (xmlHttp.readyState == 4) {
            callback('error;' + xmlHttp.responseText);
        }
    }
    if (csrf !== null)
        xmlHttp.setRequestHeader("X-CSRF-TOKEN", csrf);
    xmlHttp.send(params);
}

async function httpGet(url) {
        let settings = {
            method: "GET",
            headers: {
                Accept: "application/json; charset=UTF-8",
            }
        };

        const response = await fetch(url, settings);
        return await response.json();
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}
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

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}
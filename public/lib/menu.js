function openTab(tab_name) {
    var i;
    var x = document.getElementsByClassName("tabs");

    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tab_name).style.display = "block";
}
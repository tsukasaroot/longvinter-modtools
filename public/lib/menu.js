function openTab(tab_name, t) {
    var i;
    var x = document.getElementsByClassName('tabs');
    var y = document.getElementsByClassName('nav-item');

    for (i = 0; i < y.length; i++) {
        y[i].childNodes[0].className = 'nav-link';
    }

    for (i = 0; i < x.length; i++) {
        x[i].style.display = 'none';
    }
    document.getElementById(tab_name).style.display = 'block';
    t.className = 'nav-link active';
}
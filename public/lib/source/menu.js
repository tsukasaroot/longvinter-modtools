/**
* Open a tab when user click it
 */

function openTab(tab_name, t) {
    let i;
    let x = document.getElementsByClassName('tabs');
    let y = document.getElementsByClassName('nav-item');

    for (i = 0; i < y.length; i++) {
        y[i].children[0].className = 'nav-link';
    }

    for (i = 0; i < x.length; i++) {
        x[i].style.display = 'none';
    }

    document.getElementById(tab_name).style.display = 'block';
    t.className = 'nav-link active';
}
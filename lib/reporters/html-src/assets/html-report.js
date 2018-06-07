function addSuiteNames() {
    var suites = document.getElementsByClassName('suite');

    for (var idx = 0; idx < suites.length; idx++) {
        var suite = suites[idx];
        var headers = suite.getElementsByTagName('h1');
        if (headers.length > 0) {
            var file = headers[0].innerText;
            var suiteName = suite.getElementsByClassName('suite-name-hidden');
            if (suiteName.length > 0) {
                headers[0].innerHTML = suiteName[0].innerText + ' ( ' + file + ' )';
            }
        }
    }
}

addSuiteNames();

function toggleTestDetailedView(elem) {
    var allPreElements = elem.parentNode.getElementsByTagName('pre');

    for (var idx = 0; idx < allPreElements.length; idx++) {
        var preElem = allPreElements[idx];
        preElem.classList.toggle("show");
    }
}


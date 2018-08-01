'use strict';

export function buildHTML(data) {
    return `<html>
    <head>
        <title>Just-API Report</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style type="text/css">
        ${data.css}
        </style>
    </head>
    <body>
        <div id="just-api">
            <div class="just-api-top-header">
                <div class="just-api-label">Just-API Report</div>
                <div class="just-api-summary">
                <span>${ data.stats.skippedTests } Skipped, ${ data.stats.failedTests } Failed, ${ data.stats.passedTests } Passed ( ${ data.stats.tests } Tests )</span>
                <br>
                <span>${ data.stats.skippedSuites } Skipped, ${ data.stats.failedSuites } Failed, ${ data.stats.passedSuites} Passed ( ${ data.stats.suites } Suites )</span>
                <br>
                <span>Duration: ${ data.stats.duration }</span>
                <br>
                <span>${ new Date().toUTCString() }</span>
                </div>
            </div>
            <ul id="report">${ data.report }</ul>
        </div>
        <script>
        ${data.js}
        </script>
    </body>
    <footer class="footer-container">
    <div class="container">
    <p>©2018 &nbsp;<a href="https://kiranz.github.io/just-api/" target="_blank" rel="noopener noreferrer">Just-API</a>&nbsp;is designed and built by&nbsp;<a href="https://github.com/kiranz" target="_blank" rel="noopener noreferrer">Kiran Mandadi</a></p>
    </div>
    </footer>
</html>
`;
}

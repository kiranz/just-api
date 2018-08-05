# Reporters


### Generating a report ###
Just-API has several built-in reporters, `json`, `specs`, `html` etc.

When you need a HTML report, you can invoke just-api with the `--reporter` option

```sh
./node_modules/.bin/just-api --reporter html
```

#### A sample html report:

![Report](./img/html-report.png)

_Notice that report has request, response details for the failed test_

### Generating reports in multiple formats ###

Just-API can generate reports in multiple formats.

When you need a HTML report and a JSON report too, you could do something like this

```sh
./node_modules/.bin/just-api --reporter html,json
```

This way you can generate reports in multiple formats for the same run.

### Custom Reporters ###

When built-in reporters do not provide the information you need, you can write a custom reporter and use it:

```sh
./node_modules/.bin/just-api --reporter html,custom-reporter-module-name
```
or if the reporter is local js file 

```sh
./node_modules/.bin/just-api --reporter html,/absolute/path/to/js/file
```

Reporters in Just-API are JavaScript constructors. When instantiated, a reporter receives the test launcher object  along with program options.


Just-API emits events on launcher object and suite object, So a custom reporter should listen to these events and implement  reporting.

Following events are emitted on the launcher object

 - start
 - end
 - new suite (Indicates the start of a new suite)

 And below events are emitted on each suite object

  - test pass
  - test fail
  - test skip
  - end (Indicates the end of a suite)

If you are looking to write a custom reporter, take a look at Just-API's [JSON Reporter](https://github.com/kiranz/just-api/blob/master/lib/reporters/json.js) 

### Reporter options ###

Just-API accepts an additonal command line option `--reporter-options` that you can use to customize how and where reports are generated and saved.

You must pass a comma separated list of key and value pairs to this option as `k=v,k2=v2,...`

Following keys are supported currently.

  - jsonReportDir
  - jsonReportName
  - htmlReportDir
  - htmlReportName
  - logRequests

`jsonReportDir`: Provide an existing directory path that is relative to Just-API node process's cwd. JSON report will be saved to this directory.

`htmlReportDir`: Provide an existing directory path that is relative to Just-API node process's cwd. HTML report will be saved to this directory.

`jsonReportName`: Provide a name for the JSON report file. JSON report will be saved with this name.

`htmlReportName`: Provide a name for the HTML report file. HTML report will be saved with this name.

`logRequests`: Tells Just-API to log HTTP request & response details in reports for failed tests. Omit this if you don't want to log details.


A sample Just-API invocation would look like:


```sh
./node_modules/.bin/just-api --reporter html,json --reporter-options jsonReportDir=reports,jsonReportName=json-report,htmlReportDir=reports,htmlReportName=html-report,logRequests     
```

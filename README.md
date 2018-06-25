# Just-API

[![npm package](https://nodei.co/npm/just-api.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/just-api)

[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Just-API is a robust, specification based, codeless testing framework that tests REST, GraphQL (or any HTTP based) APIs.  It runs on [node.js](http://nodejs.org/). Just-API allows users to test APIs without writing code.
It takes API test specification from YAML files and runs them either in serial mode or in parallel mode as instructed by the user. It also reports errors and test results in several formats including HTML and JSON.
<br>

In simple terms, how it works is that you provide request and response validation specification in an yaml file. Just-API builds the request, makes a call to server
and validates response as per the specification.
You can choose to validate any or all of response status code, headers, JSON data, JSON schema or provide your own custom validator function.

[Find more](http://kiranz.github.io/just-api/)
<br>

## Links

- **[Documentation](http://kiranz.github.io/just-api/)**
- [Gitter Chatroom](https://gitter.im/just-api/Lobby) (ask questions here!)
- [Google Group](https://groups.google.com/forum/#!forum/just-api)
- [Issue Tracker](https://github.com/kiranz/just-api/issues)

## Features

- Running suites in parallel
- Support all widely used HTTP methods
- Supports Form, Multipart requests, File uploads too
- Response Validation (Headers, Status code, JSON body, JSON schema, Custom Response Validation function)
- Can run imported functions from external modules
- Custom inline and module Javascript sync/async functions
- Hooks (Before all, After all, Before each, After each, Before test, After test)
- Custom suite configuration
- Chained Request flows
- Ability to define/override Request path, query params, path params, headers, body at runtime
- Storing suite & test data in context for reuse
- Importing specs from multiple external suites
- Intrasuite and Intersuite spec dependencies
- Reusing test specification
- Retry failed tests with wait time
- Looping - Generate n number of tests with a list
- Ability to generate reports in multiple formats for the same run
- Logging HTTP request/response data for failed tests
- Proper error reporting
- Runs only tests matching with a given pattern/text
- Skipping tests with specification
- Disable or Enable redirections

[Find out all features](https://kiranz.github.io/just-api/features/)


## Getting Started

Following is a simple example showing usage of Just-API. 

>To run just-api, you will need Node.js v7.10.0 or newer.

```sh
$ npm install just-api
$ mkdir specs
$ $EDITOR specs/starwars_service.yml # or open with your preferred editor
```

In your editor (make sure yaml is properly indented)

```yaml
meta:
  name: Star Wars suite
configuration:
  scheme: https
  host: swapi.co
  base_path: /api
specs:
  - name: get "Luke Skywalker" info
    request:
      path: /people/1/
      method: get
    response:
      status_code: 200
      headers:
        - name: content-type
          value: !!js/regexp application/json     
      json_data:
        - path: $.name
          value: Luke Skywalker
```

Back in the terminal

```sh
$ ./node_modules/.bin/just-api

   ✓ get Luke Skywalker info (1516ms)

  Done: specs/suite.yml (Passed)

0 skipped, 0 failed, 1 passed (1 tests)
0 skipped, 0 failed, 1 passed (1 suites)
Duration: 1.6s
```

### Testing GraphQL APIs

Following example tests a GraphQL API that returns location for a given ip address.

Create the yaml suite file and run just-api.

```yaml
meta:
  name: GraphQL location service
configuration:
  host: api.graphloc.com
  scheme: https
specs:
  - name: Get Location of a an ip address
    request:
      method: post
      path: /graphql
      headers:
        - name: content-type
          value: application/json
      payload:
        body:
          type: json
          content:
            query: >
                   {
                    getLocation(ip: "8.8.8.8") {
                      country {
                        iso_code
                      }
                     }
                    }
            variables: null
            operationName: null
    response:
      status_code: 200
      json_data:
        - path: $.data.getLocation.country.iso_code
          value: "US"

```

### Chained Dynamic request construction with hooks and Custom response validation

When you need to test complex chained API flows, you can run dependencies in hooks to fetch prerequisite data 
and pass it to actual test.

Following example shows how to get data from dependencies with hooks and using custom validator functions to validate the response.

```yaml
meta:
  name: Starwars suite
configuration:
  scheme: https
  host: swapi.co
  base_path: /api
specs:
  - name: get R2-D2 info
    request:
      path: /people/3/
      method: get
    response:
      status_code: 200
      json_data:
        - path: $.name
          value: R2-D2

  - name: search R2-D2 info
    before_test:
      run_type: inline
      inline:
        function: !js/asyncFunction >
          async function() {
            var response = await this.runSpec('get R2-D2 info');
            var jsonData = JSON.parse(response.body);
            this.test.query_params = { name:  jsonData.name };
          }
    request:
      path: /people
      method: get
    response:
      status_code: 200
      custom_validator:
        run_type: inline
        inline:
          function: !!js/function >
            function() {
              var jsonData = JSON.parse(this.response.body);
              var r2d2 = jsonData.results.find(result => result.name === 'R2-D2');
              
              if (!r2d2) throw new Error('R2-D2 not returned in search results');
            }
```
Note that you can also place your custom JS functions in separate JS file and specify the function name in YAML to import.

You can do much more advanced stuff with Just-API. Our documentation says it all.
Take a look at [Just-API Website](http://kiranz.github.io/just-api/) for detailed documentation.


## License

Just-API is [MIT-licensed](https://github.com/kiranz/just-api/blob/master/LICENSE)

## Installation

Install with [npm](https://npmjs.org):

``` bash
npm install just-api
```

!!! note
      To run just-api, you will need Node.js v7.10.0 or newer.

## Getting Started

``` bash
mkdir specs
```

``` bash
vim specs/starwars_service.yml
```

Enter below specification in YAML file

``` yaml
meta:
  name: "Star Wars suite"
configuration:
  scheme: "https"
  host: "swapi.co"
  base_path: "/api"
specs:
  - name: "get Luke Skywalker info"
    request:
      path: "/people/1/"
      method: "get"
    response:
      status_code: 200
      headers:
        - name: "content-type"
          value: !!js/regexp application/json      
      json_data:
        - path: "$.name"
          value: "Luke Skywalker"
```

Back in the terminal

``` text
$ ./node_modules/.bin/just-api

   ✓ get Luke Skywalker info (1216ms)

  Done: specs/starwars_service.yml (Passed)

0 skipped, 0 failed, 1 passed (1 tests)
0 skipped, 0 failed, 1 passed (1 suites)
Duration: 1.3s
```

### Testing GraphQL APIs

Following example tests a GraphQL API that returns location for a given ip address.

Create a YAML suite and run just-api.

```yaml
meta:
  name: GraphQL location service
configuration:
  host: api.graphloc.com
  scheme: https
specs:
  - name: Get Location of a given ip address
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
          value: US
```

### A chained request flow with hook and custom validation

When you need to test complex chained API flows, run dependencies in hooks to fetch pre-requisite data 
and pass it to actual test.

Following example shows how to run dependencies using a hook, get data and validating response with a custom validator function.

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


!!! note
    You can also place custom JS functions in a module and specify the function name and path to module in YAML.

### Using docker to run Just-API tests
If you are looking to use Docker to run Just-API, you might want to checkout
Just-API docker boilerplate [here](https://github.com/kiranz/docker-just-api-sample)
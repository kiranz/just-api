# Just-API Features

## Request Specification

A typical request specification includes request path, headers, query params, path params, and payload (if applicable).

### Request Methods
Just-API supports following HTTP request methods. You can have a request specification which
includes any of these methods.

* GET
* POST
* PUT
* PATCH
* DELETE
* HEAD
* OPTIONS

Note that when a request is POST, PUT or PATCH, payload details can be provided and it will
be sent as request body. More on this in later sections.

### Specifying Headers, Query params, Path params

Request headers can be specified to `headers` key as list of name, value pair.
Request Query params can be specified to `query_params` key as list of name, value pair.
Request Path params can be specified to `path_params` key as list of name, value pair.

A sample test specification with method, headers, query params and path params:

```yaml
  - name: A sample test
    request:
       path: /user/{userId}/posts/{postId}
       method: get
       headers:
         - name: Accept
           value: application/json
       path_params:
          - name: userId
            value: 12876
          - name: postId
            value: 92
       query_params:
          - name: limit
            value: 10
    response:
       status_code: 200
```

### Request Body Specification

When you need to send body for POST, PUT and PATCH requests, you can specify the body to `payload` key.

You will need to specify `content-type` header and body `type` as shown below
Here's how to send JSON body with a POST request

```yaml
  - name: create a new user
    request: 
      path: /users
      method: post
      headers:
        - name: content-type
          value: application/json
      payload:
          body:
            type: json
            content:
              firstName: john
              lastName: doe
    response:
      status_code: 201
```

You can also send binary data as body by reading from a file as shown below.

```yaml
  - name: post binary data (file) as body
    request:
      path: /uploadImage
      method: post
      headers:
        - name: content-type
          value: image/png
      payload:
          body:
            type: binary
            content: static/assets/image.png
    response:
      status_code: 200
```

Note that the image path should be relative to process's current working directory.

Please checkout more examples on how to specify request body [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/postrawbody.suite.yml)

### Form, multipart requests, file uploads

Just-API supports `x-www-form-urlencoded` and `multipart/form-data` requests using which you can upload files and perform tests on complex requests.

#### **specify `x-www-form-urlencoded` request**
To create a `x-www-form-urlencoded` request test, you will need to specify the `content-type` header and form body like below:

Note that `payload` should have a key `form` and it should contain form data in key value pairs.

```yaml
  - name: Authenticate a user
    request:
      path: /authenticate
      method: post
      headers:
        - name: content-type
          value: application/x-www-form-urlencoded
      payload:
          form:
            userName: john.doe
            password: john.doe.password
    response:
      status_code: 200
```
More examples on `x-www-form-urlencoded` tests can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/urlencodeformpost.suite.yml)

#### **specify `multipart/form-data` request**

Here's how you can specify a multipart request.

Note that `payload` should have a key `form_data` and it should contain list of form data fields.

```yaml
  - name: post multipart form data - single file and field
    request:
      path: /imageNText
      method: post
      headers:
        - name: content-type
          value: multipart/form-data
      payload:
          form_data:
            - name: image_name
              content: static/assets/logo.png
              type: file
            - name: field1
              content: value1
              type: text
    response:
      status_code: 200
```

More examples on `multipart/form-data` tests can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/multipartformpost.suite.yml)

## Response Validation

Just-API allows you to validate responses without writing any code, you can validate following in a response by specifying what to validate.

* Status code
* Headers
* JSON schema
* JSON body

You can also have a custom validator function that will validate the response.

### Status code validation

You can provide `status_code` attribute in response and Just-API matches actual response's Status code against the specification.
Test will fail when actual response's Status code does not match with specified value.

A sample:

```yaml
  - name: get users
    request:
      path: /users
      method: get
    response:
      status_code: 400
```

### Headers validation
When you specify headers in response, Just-API will validate response headers against your specification.

A sample on how to specify headers validation.

```yaml
  - name: get users
    request:
      path: /users
      method: get
    response:
      headers:
        - name: content-type
          value: application/json
```

You can even match header against a regex instead of exact value, like below:

Following response specification would check if response header _content-type_ matches with regex pattern _'json'_.

```yaml
  - name: get users
    request:
      path: /users
      method: get
    response:
      headers:
        - name: content-type
          value: !!js/regexp json
```

More examples on response header validation can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/headers.suite.yaml)

### Response JSON schema validation

Some times you may want to validate the schema of JSON received in response's body, which will allow you to ensure that server is sending data exactly what you are expecting.

with Just-API, you can validate the response JSON schema by specifying the `json_schema` attribute in response.

Following sample shows how to read expected schema from a file and validate response JSON body against it. Here json_schema has two fields, `type` key can be either file or inline.
When `type` is file, you need to provide the relative path to schema file to `$ref` key.

```yaml
  - name: get users
    request: 
      path: /users
      method: get
    response:
      json_schema:
          type: file
          $ref: static/schema/expected_schema_for_users.json
```

You can also specify expected JSON schema in yaml by setting type as `inline` and assigning a string to `$ref` like below:

```yaml
  - name: get users
    request: 
      path: /users
      method: get
    response:
      json_schema:
          type: inline
          $ref: >
                {
                  "$id": "http://example.com/example.json",
                  "type": "object",
                  "$schema": "http://json-schema.org/draft-06/schema#",
                  "properties": {
                    "firstName": {
                      "$id": "/properties/firstName",
                      "type": "string"
                    }
                  }
                }
```

If you are not sure about JSON schema standard, Please refer to [JSON schema](http://json-schema.org/)

More examples on response JSON schema validation can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/jsonschema.suite.yml)

### Response JSON body validation

When you want to validate one or many fields of response JSON, you can do so by providing `json_data` as part of response specification.

`json_data` should have a list of pair of path & value, where path tells Just-API how to locate the field, and value is the expected value for that field.

Following sample shows that.

```yaml
  - name: get users
    request: 
      path: /users
      method: get
    response:
      json_data:
        - path: $.[0].firstName
          value: john
```

If you are not sure on how to generate JSON path, Please refer to [JSON path](https://github.com/dchester/jsonpath)

More examples on response JSON data validation can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/jsondata.suite.yml)

### User defined custom response validator functions

When you need to validate a response using your custom logic, you can do so by providing a `inline` or `module` custom javascript function to `custom_validator` attribute.

Just-API will invoke the custom function by passing the response to function's this context, so you can access the response using `this.response`: 

Here's a sample on how to specify a custom inline Javascript function to validate the response

```yaml
  - name: get users
    request:
      path: /users
      method: get
    response:
      status_code: 200
      custom_validator:
        run_type: inline
        inline:
          function: !!js/function >
            function() {
              var body = JSON.parse(this.response.body);
              
              if (body.users[0].firstName !== 'john')
                  throw new Error("first user's name is not john");
            }
```

You can also specify a custom function defined and exported in a module by providing `run_type` as module and module path like below.

```yaml
  - name: get users
    request:
      path: /users
      method: get
    response:
      status_code: 200
      custom_validator:
        run_type: module
        module:
          module_path: modules/custom_module.js
          function_name: validateUsersResponse
```
More examples on validating response using custom functions can be found [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/customvalidator.suite.yml)

## Custom Javascript functions

Just-API allows users to specify custom Javascript functions for (hooks and custom validator).

These custom Javascript function can be inline or defined in a module. They can synchronous or asynchronous defined with (async keyword). 

### cutom inline and module functions

#### custom inline function

An `inline` synchronous function is defined as below.

```yaml
  custom_validator:
    run_type: inline
    inline:
      function: !!js/function >
        function() {
          // some custom code here...
        }
```

Note that run_type is `inline` and function is mapped to function key of `inline` attribute. `!!js/function` is how you tell Just-API parse to consider it as custom synchronous functions.

#### custom module function

A `module` synchronous function is specified as below.

```yaml
 custom_validator:
   run_type: module
   module:
     module_path: modules/custom_module.js
     function_name: customFunctionName
```

Note that run_type is `module` and function details are mapped to `module` attribute. `module_path` has the relative path to the JS file.
The JS file is expected to be a standard Node.js module.
`function_name` is the function exported in the module.

### Async support for custom functions with promises

Custom functions can be asynchronous defined with async keyword, Just-API waits until promise returned by function is resolved or rejected.

An `inline` asynchronous function is defined as below.

```yaml
  custom_validator:
    run_type: inline
    inline:
      function: !js/asyncFunction >
        async function() {
          // some custom asynchrounous code here...
        }
```

Note that run_type is `inline` and function is mapped to function key of `inline` attribute. `!js/asyncFunction` is how you tell Just-API parse to consider it as custom asynchronous functions.


A `module` asynchronous function is specified as below.

```yaml
 custom_validator:
   run_type: module
   module:
     module_path: modules/custom_module.js
     function_name: customAsyncFunctionName
```

Note that run_type is `module` and function details are mapped to `module` attribute. `module_path` has the relative path to the JS file.The JS file is expected to be a standard Node.js module.
`function_name` is the async function defined async keyword in the module.

## Suite configuration

When you are running tests, you would want to configure API host, port etc according to the environment you are testing against.

In order to facilitate this, Just-API provides a `configuration` section in each suite, where you can have a `custom_configuration` attribute 
and provide a custom JS function to set suite configuration.

Here's an example to do that with an inline custom JS function.

```yaml
configuration:
  scheme: https
  custom_configuration:
    run_type: inline
    inline:
      function: !!js/function >
        function() {
          if (process.env.TEST_ENVIRONMENT === 'Dev') {
             this.host = 'dev-host.com'
          }
          
          if (process.env.TEST_ENVIRONMENT === 'QA') { 
            this.host = 'qa-host.com';
          }
        }
```

you can also have a module based custom JS function to configure the suite.

Note that `custom_configuration` is optional. you can always specify static suite configuration if test environment details does not change for you.

```yaml
configuration:
  scheme: https
  host: testhost.com
  port: 8000
  base_path: /api
```

More examples [here](https://github.com/kiranz/just-api/tree/master/test/cli/src/suites/suiteconfig)

## Hooks

If you are familiar with mocha, you might have used hooks. Just-API supports following hooks so it's easy setup your tests.

**Suite specific hooks**
  
  These can be specified as part of `hooks` attribute.
  
- Before all  (runs before all specs in a suite)
- After all   (runs after all specs in a suite)
- Before each  (runs before each spec in a suite )
- After each  (runs after each passed spec in a suite )

**Test specific hooks**
   
   These can be specified for each as required.

 - Before test  (runs before a spec, you can use this hook to setup test prerequisites )
 - After test  (runs after a passed spec, you can use this hook to teardown/clear any test specific data  )

Checkout some samples of hooks [here](https://github.com/kiranz/just-api/tree/master/test/cli/src/suites/hooks)

## Dynamic request construction

Static specification of request is not possible for all sort of test. Sometimes a test depends on data returned by another request, where you would want 
to run the dependency spec first and fetch required data from it and pass it on to request. To handle usecases like this, Just-API provides a
`before_test` hook for every test. Using this hook you can run test prerequisites and update request data for actual test.

Typically we need to build dynamic requests when a request depends on the data received from another request. In such cases, you 
can run the dependency spec in before_test hook and use the response to build the actual request for test.

### Headers 

Updating or overriding request headers in before test:

```yaml
  - name: send headers specified in before test hook
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.headers = { Authorization: 'some token' };
          }
    request:
      path: /users
      method: get
    response:
      status_code: 200
```

### Query params

Updating or overriding request query params in before test:

```yaml
  - name: Query params added in hook
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.query_params = { limit: 10 };
          }
    request:
       path: /users
       method: get
    response:
       status_code: 200
```
### Path params

Updating or overriding request Path params in before test:

```yaml
  - name: path params added in hook
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.path_params = { id: 1 };
          }
    request:
       path: /user/{id}
       method: get
    response:
       status_code: 200
```

### Body

You can also define request payload at runtime using hooks

```yaml
  - name: Payload defined in hook
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.payload = { body: {type: 'json', content: { firstName: 'john',
             lastName: 'doe'}} };
          }
    request:
       path: /users
       method: post
       headers:
         - name: content-type
           value: application/json
    response:
       status_code: 201
```

## Custom context

You will have access to suite context and test context in hooks, So you can use them as a way to store custom data to use in later hooks.

Suite context can be accessed in hooks using `this.suite`.
Test context can be accessed in test specific hooks using 'this.test'.

### Storing suite & test data in context for reuse

When you have some data that you want to use later in some tests, you can store the data into suite context in `before_all` hook.

```yaml
  before_all:
    run_type: inline
    inline:
      function: !!js/function >
        function() {
           this.suite.serviceSecret = 'secret';
        }
```

and later when you need the secret in a test, you can access it in before_test hook.

```yaml
  - name: using suite context in before test hook
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
              this.test.headers = { Authorization: this.suite.serviceSecret };
          }
    request:
      path: /users
      method: get
    response: 
      status_code: 200
```

Similarly you can set test context in before_test hook using `this.test` and access it using `this.test' in after_test hook.

## Spec dependencies

This is probably one of best features of Just-API.

Just-API allows testing APIs in flow, where one request depends on response data from another request. This is really useful when you are
testing complex transaction APIs etc.

### Running dependencies

Running pre-requisite requests can be done using hooks. There is `before_each` and `before_test` hooks.

If you have a dependency specific to a test, then you might want to use `before_test` hook to run the dependecy spec.

There is support for 2 types of dependencies, `Intrasuite` & `Intersuite` spec.

You will need to first provide dependency specification so that you can run it from other specs.

### Intrasuite spec dependencies

Intrasuite dependency is when you have a dependency that is specified in the same suite. You can then run the dependency by
using `this.runSpec()` in a hook. runSpec function takes 2 arguments. First argument is the name of your dependency spec and second argument
is an object with additional information you want to pass to the request such as headers, query params, path params, and body.

Following set of specs show how to run dependencies as part of a test and use the data for subsequent requests.

```yaml
specs:
  - name: thisis the dependency
    enabled: false
    request:
      path: /token
      method: get
    response:
      status_code: 200

  - name: actual test spec
    before_test:
      run_type: inline
      inline:
        function: !js/asyncFunction >
          async function() {
            var response = await this.runSpec('thisis the dependency');
            var tokenResponse = JSON.parse(response.body);
            this.test.headers = {Authorization:  tokenResponse.token};
          }
    request:
      path: /users
      method: get
    response:
      status_code: 200
```

### Intersuite spec dependencies

Intersuite is when you have a dependency that is specified in the another suite but you import it using `spec_dependencies` construct.

Running Intersuite dependency is similar to running Intrasuite dependency.

You can import specs defined in another by specifying relative path to the suite.

```yaml
spec_dependencies:
  - suites/anothersuite.yml
```

And you can import specs from multiple suites by listing their relative paths.

Note that these imported specs will only be available when you run them using `this.runSpec`.

Please find some examples on dependencies [here](https://github.com/kiranz/just-api/blob/master/test/cli/src/suites/suitedependencies/intersuitedeps.suite.yml)

## Skipping
You can explicitly skip suites and tests with specification.

### Skipping a suite
 When you have written a suite in a directory, but want to skip running it for some reason, you can do so by providing
  `false` as value for enabled key under `meta` in a suite, Just-API will skip the suite.
 
```yaml
 meta:
  name: Disabled sute
  enabled: false
configuration:
  scheme: http
  host: 127.0.0.1
specs:
  - name: get users
    request:
      path: /users
      method: get
    response:
      status_code: 200
``` 
 
 Note that if any error occurs before Just-API reads `meta` info of the suite, then suite will be marked as failure.
 
### Skipping a test

When you written a set of specs in a suite, but want to skip a spec, you can do so by providing `false` as value for enabled key of the spec.

```yaml
  - name: disabled spec
    enabled: false
    request:
      path: /
      method: get
    response:
      status_code: 200
```

Just-API will mark the spec as a skipped test.

## reusing test specification

Apart from readability, an awesome thing about yaml is that you can reuse parts of your specification.

Refer to [dry](https://blog.daemonl.com/2016/02/yaml.html) to see how you can reuse stuff in yaml.

you can see how response specification is being reused below

```yaml
meta:
  name: suite name
configuration:
  scheme: http
  host: example.com
specs:
  - name: get user1
    request:
      path: /users/1
      method: get
    response: &default_response
      status_code: 200

  - name: get user2
    request: &default_request
      path: /users/1
      method: get
    response: *default_response
```


## Retrying failed tests

Sometimes a resource takes a bit of time to get to a state you expect, for instance when you are polling a job status and it goes 
to completed state after a while. In such cases, you would want to retry hitting the same request few times. 

If you see below sample, response validation says expect 200 status code. If the response validation fails then Just-API attempt to retry the request
if you have specified `retry` attribute.
Here the request is attempted 3 times denoted by `count` with 10ms wait before each attempt.

`wait_before_each` is an optional attribute to specify how many milliseconds you want to wait before each attempt.

```yaml
  - name: retry example
    request:
      path: /retryPath
      method: get
    retry:
      count: 3
      wait_before_each: 10
    response:
      status_code: 200
```

## Looping

You can use the loop construct to loop through a list of items, each item generating a test.

The list of items can be specified in spec beforehand or you can specify a custom JS function which returns a list of items.
 
Here's how a static loop is specified, `type` is static and loop list is mapped to `static` field as list of items.
You will have access to that item in before_test hook by accessing `this.loopItem`.
 
```yaml
  - name: static loop test
    loop:
      type: static
      static:
        - 2
        - 3
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.query_params = { limit : this.loopItem };
          }
    request:
      path: /users
      method: get
    response:
      status_code: 200
``` 

There's another way to provide a list of items, with `dynamic` type and a custom JS function.

```yaml
  - name: dynamic loop test
    loop:
      type: dynamic
      dynamic:
        run_type: inline
        inline:
          function: !!js/function  >
            function() {
              return [2, 3];
            }           
    before_test:
      run_type: inline
      inline:
        function: !!js/function >
          function() {
            this.test.query_params = { limit : this.loopItem };
          }           
    request:
      path: /users
      method: get
    response:
      status_code: 200
``` 

Note that if your loop has a list of n items, n tests will be generated at runtime.


## Additional features

Following are some additional features offered by Just-API.

### reports test duration

Just-API includes duration of each test run in all formats of reports.

### running only tests match with a given pattern/text

If you want to run only specs matches with a given text or pattern, you can do so by using `--grep` option.

Following invocation will run all specs whose name matches with 'user' string.

```sh
./node_modules/.bin/just-api --grep user specs
```

### additional request options

Following additional request options are supported.

 - followRedirect - follow HTTP 3xx responses as redirects.
 - followAllRedirects - follow non-GET HTTP 3xx responses as redirects.
 - followOriginalHttpMethod - by default we redirect to HTTP method GET. you can enable this property to redirect to the original HTTP method (default: false)
 - encoding - encoding to be used on setEncoding of response data. If null, the body is returned as a Buffer. 
   Anything else (including the default value of undefined) will be passed as the encoding parameter to toString() (meaning this is effectively utf8 by default). (Note: if you expect binary data, you should set encoding: null.)
 - gzip - if true, add an Accept-Encoding header to request compressed content encodings from the server (if not already present) and decode supported content encodings in the response.

A sample spec on how to specify these options:

```yaml
  - name: spec with redirection disabled
    request: 
      path: /home
      method: get
      additional_options:
        followRedirect: false
    response:
      status_code: 200
```

### Finding suites recursively
When you want to run suites stored in a directory hierarchy spanning more than one nested level, you can invoke the Just-API with `--recursive` option.

```sh
./node_modules/.bin/just-api --recursive specs
```

### Proper error reporting
When a test or suite fails, Just-API provides the correct error, that caused the failure in reports.

### Exit code for CI support
Just-API exits with proper exit code, so you can use it in CI to determine the status of your tests.

Usually exit code is equal to number of failed suite unless some unexpected error occurs.

### Logging HTTP request/response data for failed tests

When a test with multiple dependencies fails it's hard to track which request has failed. To make failure tracking easy, Just-API allows you to 
ask for HTTP call details for failed tests. You would be able to see all HTTP calls made for a failed test n HTML or JSON report.

To enable this feature you need to invoke Just-API with `--reporter-options logRequests`

```sh
./node_modules/.bin/just-api --reporter html --reporter-options logRequests specs
```

### No callbacks

You might have observed that there is mention of callbacks anywhere. yes, Just-API does not support callback mechanism when running custom JS functions.
This is to encourage usage of promises for asynchronous operations.

When you are dealing with asynchronous tasks, wrap them in an async function.

## Running suites in parallel

Please see [page](running-suites-in-parallel) 

## Reporters 

Please see [page](reporters) 



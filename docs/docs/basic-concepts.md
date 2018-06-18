# Basic Concepts

This section covers some high level basic concepts that are important to understand for day to day Just-API usage. We highly recommend that you read this
page before proceeding to use Just-API.

## The High-level View

Just-API is a framework that you can use to run HTTP based API tests.

You write your API test specification and tell Just-API to run them. API test specifications are written in YAML and we call each YAML file a test suite, with the option to write Javascript (using any `npm` module if needed) to write custom logic.

Just-API's main purpose is to test HTTP based APIs without code, and make API testing easy, free and fast for everyone.

Just-API is written with parallelism as priority while running suites, so your test execution takes as less time as possible.


## Putting a test suite together ##

A test suite has three required sections - `meta`, `configuration` and `specs`.

And optional sections `hooks` and `spec_dependencies` (you can find more about these optional parts in later sections of the documentation).

### The `meta` Section ###

This is where you specify `name` for the suite and other suite related metadata.

### The `configuration` Section ###

You can use `configuration` section to specify API's host, scheme, port etc. you can also provide a custom Javascript function to `custom_configuration` key, so it's easy to 
dynamically configure your suite at runtime.

### The `specs` Section ###

`specs` section is a list of tests. Each test contains name, request, response validation specification etc.

### An Example Suite ###

A sample suite for Star Wars API service would look like this:

```yaml
meta:
  name: Star Wars service
configuration:
  scheme: https
  base_path: /api
  custom_configuration:
    run_type: inline
    inline:
      function: !!js/function >
        function() {
          this.host = 'swapi.co';
        }  
specs:
  - name: get Luke Skywalker info
    request: 
      path: /people/1/
      method: get
    response:
      status_code: 200
      json_data:
        - path: $.name
          value: Luke Skywalker     
  - name: get all Star Wars Films
    request: 
      path: /films/   
      method: get
    response:
      status_code: 200  
```


**Next:**

- See the full set of features available in [Features](features).
- Learn about  **reports** in [Reporters](reporters).




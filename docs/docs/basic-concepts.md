# Basic Concepts

This section covers some high level basic concepts that are important to understand for day to day Just-API usage. We highly recommend that you read this page before proceeding to use Just-API.

## The High-level View

Just-API's main purpose is to test HTTP-based APIs without code, and make API testing easy, free and fast for everyone.

Write your API test specification and tell Just-API to run them. API test specification is written in YAML and we call each YAML file a test suite, with the option to write Javascript (using any `npm` module if needed) to implement custom logic.

Just-API is written with parallelism as high priority when running test suites, so your test execution takes as less time as possible.

## Putting a test suite together ##

A test suite has three required sections - `meta`, `configuration` and `specs`.

And optional sections `hooks` and `spec_dependencies` (you can find more about these optional parts in later sections of the documentation).

### The `meta` Section ###

Specify following suite attributes in this section

- `name` (_required attribute_)
- `locate_files_relative` (_optional attribute_)

*name*[String]: Give a name that describes the suite (e.g: like a microservice name)

*locate_files_relative*[Boolean]: Tells Just-API if file paths provided in the suite are relative to suite path or not. If false, Just-API will try to find files relative to Node process's current working directory.
If true, Just-API will try to find files relative to the suite's path.
Default value is false.

Note: This attribute value applies to every file path you provide in a suite.

### The `configuration` Section ###

You can use `configuration` section to specify API's host, protocol, port etc. You can also provide a custom Javascript function to `custom_configuration` attribute, so it's easy to 
dynamically configure your suite at runtime.

### The `specs` Section ###

`specs` section is a list of tests. Each test contains name, request, response validation specification, and a few other additional attributes.

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
- Learn about  **reporters** in [Reporters](reporters).




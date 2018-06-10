---
title: 'Just-API - robust specification based API testing framework'
---

Just-API is a robust, specification based API testing framework running on [node.js](http://nodejs.org/). Just-API takes API test specification from YAML files and runs them either in serial mode or in parallel mode as instructed by the user. Just-API reports errors and test results in several formats including HTML and JSON.
Just-API allows users to test APIs without writing code.


[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Features

<!-- toc -->

- [supports all widely used http methods](#various-http-methods)
- [specification includes headers, query params, path params, body]
- [supports form, multipart requests, file uploads](#forms-multipart-requests-and-file-uploads)
- [response status code validation]
- [response headers validation]
- [response json body validation]
- [response json schema validation]
- [supports user defined custom response validator functions]
- [cutom inline and module functions]
- [async support for custom functions with promises]
- [suite level configuration]
- [before all, after all, before each, after each, before test, after test hooks]
- [dynamic request construction with headers, query params, path params, body]
- [storing suite & test context for reuse]
- [running suites in parallel]
- [ability to skip suites]
- [ability to skip tests]
- [running test dependencies in hooks]
- [inter-suite spec dependencies]
- [reusing test specification]
- [test retry support]
- [loop support to test an endpoint with parameterized data]
- [reports test duration]
- [running only tests match with a given pattern/text]
- [test specific timeout ]
- [additional request options]
- [Reporters]
- [proper error reporting]
- [proper exit status for CI support]
- [logging HTTP request/response data for failed tests]

<!-- tocstop -->
<br>

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Hooks]
- [Finding suites recursively]
- [Reporters]
- [no callbacks]
- [A complex test]
- [Examples]
<!-- tocstop -->
<br>
<br>

## Installation

Install with [npm](https://npmjs.org):

```sh
$ npm install just-api
```

>To run just-api, you will need Node.js v7.10.0 or newer.


## Getting Started

```
$ npm install just-api
$ mkdir specs
$ $EDITOR specs/starwars_service.yml # or open with your preferred editor
```

API test specification is written in yaml files, Enter below specification

```yaml
meta:
  name: StarWars suite
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
      json_data:
        - path: $.name
          value: Luke Skywalker
```

Back in the terminal

```
$ ./node_modules/.bin/just-api

   ✓ get Luke Skywalker info (1516ms)

  Done: specs/suite.yml (Passed)

0 skipped, 0 failed, 1 passed (1 tests)
0 skipped, 0 failed, 1 passed (1 suites)
Duration: 1.6s
```



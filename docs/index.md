---
layout: default
title: 'Just-API - robust specification based API testing framework'
---

Just-API is a robust, specification based API testing framework running on [node.js](http://nodejs.org/). Just-API takes API test specification from YAML files and runs them either in serial mode or in parallel mode as instructed by the user. Just-API reports errors and test results in several formats including HTML and JSON.
Just-API allows users to test APIs without writing code.


[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Getting Started](#getting-started)

<!-- tocstop -->

## Installation

Install with [npm](https://npmjs.org):

```sh
$ npm install just-api
```

>To run Mocha, you will need Node.js v7.10.0 or newer.


## Getting Started

```
$ npm install just-api
$ mkdir specs
$ $EDITOR specs/starwars_service.yml # or open with your preferred editor
```

In your editor (make sure yaml is properly indented)

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



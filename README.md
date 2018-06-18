# Just-API

[![npm package](https://nodei.co/npm/just-api.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/just-api)

[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Just-API is a robust, specification based, codeless API testing framework running on [node.js](http://nodejs.org/). Just-API allows users to test APIs without writing code.
Just-API takes API test specification from YAML files and runs them either in serial mode or in parallel mode as instructed by the user. It also reports errors and test results in several formats including HTML and JSON.
<br>

In simple terms, how it works is that you provide request and response validation specification in an yaml file. Just-API builds the request, makes a call to server
and validates response as per the specification.
You can choose to validate any or all of response status code, headers, JSON data, JSON schema or provide your own custom validator function.
<br>

## Links

- **[Documentation](http://kiranz.github.io/just-api/)**
- [Gitter Chatroom](https://gitter.im/just-api/Lobby) (ask questions here!)
- [Google Group](https://groups.google.com/forum/#!forum/just-api)
- [Issue Tracker](https://github.com/kiranz/just-api/issues)

## Getting Started

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

Refer to [Just-API Website](http://kiranz.github.io/just-api/) for detailed documentation.

## License

[MIT](https://github.com/kiranz/just-api/blob/master/LICENSE)

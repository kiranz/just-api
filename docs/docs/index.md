# Just-API
Just-API is a declarative, specification based test framework for `REST`, `GraphQL` (or any HTTP-based) APIs. Users can test APIs without writing code, but they can also tap into code when they want to. It reads API test specification from YAML files and runs them in serial/parallel mode. Test reports can be generated in several formats including HTML and JSON.
<br>

In simple terms, users build a test suite by providing a set of request and response validation specification in a YAML file. Each suite can have one or more specs. Just-API builds the request, sends it to server and validates response as per the specification.
One can choose to validate any or all of following

- Response Status code
- Response Headers
- Response JSON body
- Response JSON schema

_or Provide a custom Javascript function to validate the response_

## Contents

### Documentation

- [Getting Started](getting-started)
- [Basic Concepts](basic-concepts)
- [CLI](CLI)
- [Features](features)
- [Reporters](reporters)
- [Examples](examples)

## Find it on npm
[![npm package](https://nodei.co/npm/just-api.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/just-api)
## Stay In Touch

[![Twitter](https://img.shields.io/twitter/follow/just_api_.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=just_api_)     [![GitHub stars](https://img.shields.io/github/stars/kiranz/just-api.svg?style=social&label=Star)](https://github.com/kiranz/just-api)

If you are having problems with Just-API, or have a question, chat with the community on gitter.

[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


[Just-API Google group](https://groups.google.com/forum/#!forum/just-api)
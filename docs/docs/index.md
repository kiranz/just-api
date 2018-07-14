# Just-API docs
Just-API is a robust, specification based test framework for `REST`, `GraphQL` (or any HTTP-based) APIs.  It runs on [node.js](http://nodejs.org/). Users can test APIs without writing code, or they can tap into code when they want to. It takes API test specification from YAML files and runs them either in serial or in parallel mode. Reports errors and test results in several formats including HTML and JSON.
<br>


In simple terms, users build a suite by providing a set of request and response validation specification in a YAML file. Each suite can contain one or more specs. Just-API builds the request, sends it to server and validates response as per the specification. You can choose to validate any or all of following

- Response Status code
- Response Headers
- Response JSON body
- Response JSON schema

_or Provide your own custom Javascript validator function_
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

<a href="https://twitter.com/just_api_" class="twitter-follow-button" data-show-count="false">Follow @just_api_</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
[![GitHub stars](https://img.shields.io/github/stars/kiranz/just-api.svg?style=social&label=Star)](https://github.com/kiranz/just-api)

If you are having problems with Just-API, or have a question, chat with the community on gitter.

[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


[Just-API Google group](https://groups.google.com/forum/#!forum/just-api)
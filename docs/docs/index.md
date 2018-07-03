# Just-API docs
<br>
Just-API is a robust, specification based test framework for `REST`, `GraphQL` (or any HTTP-based) APIs.  It runs on [node.js](http://nodejs.org/). Just-API allows users to test APIs without writing code, but users can tap into code when they want to. It takes API test specification from YAML files and runs them either in serial mode or in parallel mode as instructed by the user. It also reports errors and test results in several formats including HTML and JSON.
<br>


In simple terms, users build a suite by providing request and response validation specification in a YAML file. Each suite can contain one or more specs. Just-API builds the request, makes a call to server and validates response as per the specification. You can choose to validate any or all of

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

<br>
## Find it on npm
[![npm package](https://nodei.co/npm/just-api.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/just-api)

## Stay In Touch

### Twitter

For an occasional update on what we're up to, follow us on Twitter.

<a href="https://twitter.com/just_api_" class="twitter-follow-button" data-show-count="false">Follow @just_api_</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

### Github

Star Just-API on Github.

<a class="github-button" href="https://github.com/kiranz/just-api" data-style="small" data-count-href="/kiranz/just-api/stargazers" data-count-api="/repos/kiranz/just-api#stargazers_count" data-count-aria-label="# stargazers on GitHub" aria-label="Star kiranz/just-api on GitHub">Star</a>

### Gitter

If you are having problems with Just-API, have a question, or just want to say hello, you can chat with the community on gitter.
[![Join the chat at https://gitter.im/just-api/Lobby](https://badges.gitter.im/just-api/Lobby.svg)](https://gitter.im/just-api/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### Google group
[Just-API](https://groups.google.com/forum/#!forum/just-api)
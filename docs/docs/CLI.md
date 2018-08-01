# CLI Reference

Invoke `just-api` from command-line

```text
Usage: just-api [options] [files]

Options:

    -V, --version                       outputs the version number
    --parallel <integer>                specify the number of suites to be run in parallel
    --reporter <reporternames>          specify the reporters to use, comma separated list e.g json,html
    --reporter-options <k=v,k2=v2,...>  reporter-specific options
    --grep <pattern>                    only run tests matching <pattern/string>
    --recursive                         include sub directories when searching for suites
    --reporters                         display available reporters
    -h, --help                          outputs usage information
```

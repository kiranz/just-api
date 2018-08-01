# Executing suites in parallel

When you have lots of test suites, it might take a while to execute all of them serially. 

To reduce the test execution time, Just-API is built with parallelism. You can invoke just-api with `--parallel` option to trigger parallel execution mode.
All reporters respect parallel mode and generate correct reports with properly mapped errors if any.

This is how you can execute suites in parallel with just-api

```sh
./node_modules/.bin/just-api --parallel 8
```

Above command will start test execution in parallel mode with 8 suites at a time. 

**Note**: Maximum number of suites you can run in parallel is 24.
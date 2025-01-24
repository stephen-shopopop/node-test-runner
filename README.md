# runner

Runner is a wrapper test runner for `node:test`.

Runner is self-hosted, i.e. Runner runs its own tests.

## Install

```bash
npm i @stephen-shopopop/runner --save-dev
```

## Usage

```bash
runner --coverage
```

Runner will automatically run all tests files matching `*.test.{js|ts}`.

## Options

* `--concurrency` or `-c`, to set the number of concurrent tests. Defaults to the number of available CPUs minus one.
* `--coverage` or `-C`, enables code coverage
* `--watch` or `-w`, re-run tests on changes
* `--expose-gc`, exposes the gc() function to tests
* `--reporter` or `-r`, set up a reporter, use a colon to set a file destination. Reporter may either be a module name resolvable by standard `

## Reporters

Here are the available reporters:

* `tap`: outputs the test results in the TAP format.
* `spec`: outputs the test results in a human-readable format.
* `dot`: outputs the test results in a compact format, where each passing test is represented by a ., and each failing test is represented by a X.
* `junit`: outputs test results in a jUnit XML format

## Reference

[Run node test](https://nodejs.org/api/test.html#runoptions)

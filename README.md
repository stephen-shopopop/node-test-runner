# runner

Runner is a wrapper test runner for `node:test`.

Runner is self-hosted, i.e. Runner runs its own tests.

## Install

```bash
npm i @stephen-shopopop/runner --save-dev
```

## Usage

For js:

```bash
runner --file **/*.test.js --coverage
```

For ts:

```bash
runner --file **/*.test.ts --coverage
```

Runner will automatically run all tests files matching `*.test.{js|ts}`.

## Options

* `--concurrency` or `-c`, to set the number of concurrent tests. Defaults to the number of available CPUs minus one.
* `--coverage` or `-C`, enables code coverage
* `--watch` or `-w`, re-run tests on changes
* `--expose-gc`, exposes the gc() function to tests
* `--reporter` or `-r`, set up a reporter`
* `--file` or `-f`, define file to testing`

## Reporters

Here are the available reporters:

* `tap`: outputs the test results in the TAP format.
* `spec`: outputs the test results in a human-readable format.
* `dot`: outputs the test results in a compact format, where each passing test is represented by a ., and each failing test is represented by a X.
* `junit`: outputs test results in a jUnit XML format

## Setup

Create file  `setup.js` on `.`

```js
export default function () {
  // ️️️✅ Best Practice: force UTC
  process.env.TZ = 'UTC';

  console.time('global-setup');

  // ... Put your setup

  // 👍🏼 We're ready
  console.timeEnd('global-setup');
}
```

## Teardown

Create file  `teardown.js` on `.`

```js
export default function () {
  console.time('global-teardown');

  // ... Put your teardown

  // 👍🏼 We're ready
  console.timeEnd('global-teardown');
}
```

## Reference

[Run node test](https://nodejs.org/api/test.html#runoptions)

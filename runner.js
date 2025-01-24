#! /usr/bin/env node

import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { argv } from 'node:process';
import { finished } from 'node:stream';
import { run } from 'node:test';
import reporters from 'node:test/reporters';
import { parseArgs } from 'node:util';
import githubReporter from '@reporters/github';

// Listen unhandledRejection
process.on('unhandledRejection', (err) => {
  console.error(err);

  process.exit(1);
});

const { values } = parseArgs({
  args: argv.slice(2),
  allowPositionals: true,
  options: {
    concurrency: {
      type: 'string',
      short: 'c',
      default: `${os.availableParallelism() - 1}`
    },
    'expose-gc': {
      type: 'boolean'
    },
    watch: {
      default: false,
      short: 'w',
      type: 'boolean'
    },
    help: {
      default: false,
      short: 'h',
      type: 'boolean'
    },
    file: {
      default: undefined,
      short: 'f',
      type: 'string',
      multiple: true
    },
    coverage: {
      default: false,
      short: 'C',
      type: 'boolean'
    },
    reporter: {
      short: 'r',
      type: 'string'
    }
  }
});

if (values?.help) {
  console.log(await readFile(new URL('./README.md', import.meta.url), 'utf8'));

  process.exit(0);
}

try {
  const stream = run({
    files: values.file ? values.file.map((f) => path.resolve(f)) : undefined,
    concurrency: Number.parseInt(values.concurrency, 10),
    coverage: values.coverage,
    watch: values.watch,
    argv: [values['expose-gc'] === true ? '--expose-gc' : undefined].filter(Boolean),
    setup: async () => {
      // Call setUp
      if (fs.existsSync(path.join(process.cwd(), 'setup.js'))) {
        await import(path.join(process.cwd(), 'setup.js')).then((x) => x.default());
      }
    }
  });

  // Log test failures to console
  stream.on('test:fail', (testFail) => {
    console.error(testFail);

    process.exitCode = 1; // must be != 0, to avoid false positives in CI pipelines
  });

  // Call tearDown
  finished(stream, async () => {
    if (fs.existsSync(path.join(process.cwd(), 'teardown.js'))) {
      await import(path.join(process.cwd(), 'teardown.js')).then((x) => x.default());
    }

    process.exit = 0;
  });

  stream
    .compose(reporters[values.reporter ?? (process.stdout.isTTY ? 'spec' : 'tap')])
    .pipe(process.stdout);

  // If we're running in a GitHub action, adds the gh reporter
  // by default so that we can report failures to GitHub
  if (process.env.GITHUB_ACTION) {
    stream.compose(githubReporter).pipe(process.stdout);
  }

  process.exit = 0;
} catch (err) {
  console.error(err);

  process.exitCode = 1;
}

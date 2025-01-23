import {tap, junit, spec} from 'node:test/reporters';
import  process from 'node:process';
import {run} from 'node:test';
import  {finished} from 'node:stream';
import { parseArgs } from 'node:util';
import { argv } from 'node:process';
import path from 'node:path';

/**
 * Determine reporter
 * 
 * @param {string} reporter 
 */
function determineReporter(reporter){
    switch(reporter){
        case 'tap':
            return tap;
        case 'junit':
            return junit;
        case 'spec':
            return spec;
    }
}

const help = `
    Node test runner

    Options:
        -h, --help                      Help
        --file <string>                 File name
        --watch                         Watch mode
`;

const { values } = parseArgs({ args: argv.slice(2), strict: true, options: {
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
        type: 'string' 
    },
    coverage: { 
        default: false,
        short: 'c',
        type: 'boolean' 
    },
    reporter: {
        default: 'tap',
        short: 'r',
        type: 'string'
    }
}});

if (values?.help) {
    console.log(help);

    process.exit(0);
}

const stream = run({
    files: values.file ? [path.resolve(values.file)] : undefined,
    concurrency: false,
    coverage: values.coverage,
    watch: values.watch,
    setup:  () => {
        console.log('setup');
    }
}).compose(determineReporter(values.reporter));

finished(stream, () => {
    console.log('teardown');
});

stream.pipe(process.stdout);
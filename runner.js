import {tap} from 'node:test/reporters';
import  process from 'node:process';
import {run} from 'node:test';
import  {finished} from 'node:stream';

const stream = run({
    files: ['./sync.test.js'],
    concurrency: false,
    setup:  () => {
        console.log('setup');
    }
}).compose(tap);

finished(stream, () => {
    console.log('teardown');
});

stream.pipe(process.stdout);
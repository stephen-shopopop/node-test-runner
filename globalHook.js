import { after, before } from 'node:test';

before(async () => {
  // It's OK
  console.log('test started');
});

after(async () => {
  // Don't operational
  console.log('test stopped')
});

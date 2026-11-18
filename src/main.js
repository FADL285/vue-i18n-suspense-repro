import { runRepro } from './repro.js';

const output = document.querySelector('#result');
const result = await runRepro(document.createElement('div'));
output.textContent = `${JSON.stringify(result)}\nExpected afterDiscard: 0`;

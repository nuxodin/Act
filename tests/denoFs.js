
import {Act} from '../Act.js';

const fs = new Act.fs('./').$proxy;
fs.$set('holla', 'tobias');

const x = await fs.holla;

console.log(x)

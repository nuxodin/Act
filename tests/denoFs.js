
import {Act} from '../Act.js';

const fs = new Act.fs('./');
//fs.$set('holla', 'tobias');
fs.holla = 'xyz';

const x = await fs.holla;

console.log(x)

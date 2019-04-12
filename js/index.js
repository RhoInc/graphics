import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import publications from './publications';
import releases from './releases';
import blog from './blog';

publications();
releases();
blog();

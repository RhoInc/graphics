import 'promise-polyfill/src/polyfill';
import 'whatwg-fetch';
import addPublications from './addPublications';
import addReleases from './addReleases';
import addBlogPosts from './addBlogPosts';

addPublications();
addReleases();
addBlogPosts();

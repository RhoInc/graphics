const fs = require('fs');
const fetch = require('node-fetch');
const defineHeaders = require('./defineHeaders');
const getRepos = require('./getRepos');
const getBlogPosts = require('./getBlogPosts');

defineHeaders(headers => {
    Promise.all([getBlogPosts(headers, false), getRepos(headers, false)])
        .then(() => {
            const getReleases = require('./getReleases');
            const getBranches = require('./getBranches');
            return Promise.all([getReleases(headers, false), getBranches(headers, false)]);
        })
        .then(() => {
            process.exit();
        });
});

const fs = require('fs');
const fetch = require('node-fetch');
const repos = require('../data/repos.json');
const defineHeaders = require('./defineHeaders');

if (require.main === module)
    defineHeaders(headers => {
        module.exports(headers);
    });

module.exports = function(headers, exit = true) {
    const releases = Promise.all(
        repos.map(repo => fetch(repo.releases_url.replace('{/id}', ''), { headers }))
    ); // fetch each repo's releases

    return releases
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(json => {
            const byRepo = json.reduce((acc, cur, i) => {
                acc[repos[i].name] = cur;
                return acc;
            }, {});

            //Save releases.
            fs.writeFileSync('./data/releases.json', JSON.stringify(byRepo, null, 4), 'utf8');
            console.log('All releases successfully saved to ./data/releases.json!');
            if (exit) process.exit();
        })
        .catch(error => {
            console.log(`Error fetching releases: ${error}`);
        });
};

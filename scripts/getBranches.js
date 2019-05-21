const fs = require('fs');
const fetch = require('node-fetch');
const repos = require('../data/repos.json');
const defineHeaders = require('./defineHeaders');

if (require.main === module)
    defineHeaders(headers => {
        module.exports(headers);
    });

module.exports = function(headers, exit = true) {
    const branches = Promise.all(
        repos.map(repo => fetch(repo.branches_url.replace('{/branch}', ''), { headers }))
    ); // fetch each repo's branches

    return branches
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(json => {
            const byRepo = json.reduce((acc, cur, i) => {
                acc[repos[i].name] = cur;
                return acc;
            }, {});

            //Save branches.
            fs.writeFileSync('./data/branches.json', JSON.stringify(byRepo, null, 4), 'utf8');
            console.log('All branches successfully saved to ./data/branches.json!');
            if (exit) process.exit();
        })
        .catch(error => {
            console.log(`Error fetching branches: ${error}`);
        });
};

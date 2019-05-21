const fs = require('fs');
const fetch = require('node-fetch');
const defineHeaders = require('./defineHeaders');

if (require.main === module)
    defineHeaders(headers => {
        module.exports(headers);
    });

module.exports = function(headers, exit = true) {
    const repos = fetch('https://api.github.com/users/RhoInc/repos?per_page=1000', { headers }); // fetch RhoInc repos

    return repos
        .then(response => response.json())
        .then(json => {
            //Save repos.
            fs.writeFileSync('./data/repos.json', JSON.stringify(json, null, 4), 'utf8');
            console.log('All repos successfully saved to ./data/repos.json!');
            if (exit) process.exit();
        })
        .catch(error => {
            console.log(`Error fetching repos: ${error}`);
        });
};

const fs = require('fs');
const fetch = require('node-fetch');
const defineHeaders = require('./defineHeaders');

if (require.main === module)
    defineHeaders(headers => {
        module.exports(headers);
    });

module.exports = function(headers, exit = true) {
    const blogPosts = fetch('https://api.github.com/repos/RhoInc/blog/contents/_posts', {
        headers
    }); // fetch RhoInc repos

    return blogPosts
        .then(response => response.json())
        .then(json => {
            //Save blog post metadata.
            fs.writeFileSync('./data/blogPosts.json', JSON.stringify(json, null, 4), 'utf8');
            console.log('All blog post metadata successfully saved to ./data/blogPosts.json!');

            return Promise.all(json.map(blogPost => fetch(blogPost.download_url)));
        })
        .catch(error => {
            console.log(`Error fetching blog post metadata: ${error}`);
        })
        .then(responses => Promise.all(responses.map(response => response.text())))
        .then(text => {
            //Read in blog post metadata (yeah, it's kind of a roundabout way to about it).
            const blogPosts = require('../data/blogPosts.json');

            //Merge blog post contents onto blog post metadata.
            blogPosts.forEach((blogPost, i) => {
                blogPost.md = text[i];
            });

            return blogPosts;
        })
        .then(blogPosts => {
            //Save blog posts.
            fs.writeFileSync('./data/blogPosts.json', JSON.stringify(blogPosts, null, 4), 'utf8');
            if (exit) process.exit();
        })
        .catch(error => {
            console.log(`Error fetching blog posts: ${error}`);
        });
};

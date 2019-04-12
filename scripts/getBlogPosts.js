const fs = require('fs');
//const read = require('read');
const fetch = require('node-fetch');
//const base64 = require('base-64');
//global.Headers = fetch.Headers;

exports.getBlogPosts = function(headers) {
    //Fetch list of blog posts.
    fetch('https://api.github.com/repos/RhoInc/blog/contents/_posts') //, { headers } )
        .then(response => response.json())
        .then(json => {
            //Save blog post metadata.
            fs.writeFile('./data/blogPosts.json', JSON.stringify(json, null, 4), error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Blog post metadata successfully saved to ./data/blogPosts.json!');
                }
            });

            //Fetch contents of each blog post.
            return Promise.all(json.map(blogPost => fetch(blogPost.download_url)));
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
            fs.writeFile('./data/blogPosts.json', JSON.stringify(blogPosts, null, 4), error => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('All blog posts successfully saved to ./data/blogPosts.json!');
                }
            });

            return blogPosts;
        })
        .catch(error => {
            console.log(error);
        });
};

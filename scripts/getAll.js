const read = require('read');
const base64 = require('base-64');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
const getRepos = require('./getRepos').getRepos;
const getBlogPosts = require('./getBlogPosts').getBlogPosts;

const pw = process.argv[2];
const headers = new Headers();

if(pw){
  headers.append('Authorization', 'Basic ' + base64.encode("jwildfire@gmail.com" + ':' + pw));
  getRepos(headers); // calls getReleases
  getBlogPosts(headers);
}else{
  read({ prompt: 'Username: ' }, function(error, username) {
      if (error) {
          console.log('Error: ' + error);
          return;
      }

      read({ prompt: 'Password: ', silent: true }, function(error, password) {
          if (error) {
              console.log('Error: ' + error);
              return;
          }

          //Define fetch headers.

          headers.append('Authorization', 'Basic ' + base64.encode(username + ':' + password));

          //Download data from GitHub.
          getRepos(headers); // calls getReleases
          getBlogPosts(headers);
      });
  });
}

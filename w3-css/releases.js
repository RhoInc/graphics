const reposPromise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.ontimeout = function() {
        console.error(`The request for ${url} timed out.`);
    };
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        } else {
            reject(xhr.statusText);
        }
    };
    xhr.open('GET', 'https://api.github.com/users/RhoInc/repos', true);
    xhr.send(null);
});

reposPromise.then(value => {
    const repos = JSON.parse(value);
    console.log(repos);
    //const repoPromises = repos
    //    .map(repo => {
    //        const repoPromise = new Promise((resolve,reject) => {
    //            const xhr = new XMLHttpRequest();
    //            xhr.ontimeout = function() {
    //                console.error(`The request for ${url} timed out.`);
    //            };
    //            xhr.onload = function() {
    //                if (xhr.readyState === 4) {
    //                    if (xhr.status === 200) {
    //                        resolve(xhr.response);
    //                    }
    //                } else {
    //                    reject(xhr.statusText);
    //                }
    //            };
    //            xhr.open('GET', repo.releases_url.replace('{/id}', ''), true);
    //            xhr.send(null);
    //        });

    //        return repoPromise;
    //    });
    //Promise.all(repoPromises).then(function(values) {
    //    console.log(values);
    //});
});

function buildPubList(meta, parentElement) {
  var parentDiv = d3.select(parentElement);
  var list = parentDiv.append("ul").attr("class", "pubs");
  var items = list
    .selectAll("li")
    .data(meta.slice(0,3))
    .enter()
    .append("li")
    .attr("class", "pub");

  //thumb
  items.append("img").attr("src", d => "https://raw.githubusercontent.com/RhoInc/publication-library/master/img/" + d.thumbnail);
  //    .text(d => (d.description ? d.description : "<no description available>"));

  var wraps = items.append("div").attr("class", "pub-wrap");

  //title
  wraps
    .append("p")
    .attr("class", "title")
    .text(d => d.title);

  //description
  wraps
    .append("p")
    .attr("class", "reference")
    .text(d => d.reference);

  //author
  wraps
    .append("p")
    .attr("class", "author")
    .text(d => d.authors);

  //tags
  function cap1(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  var taglist = wraps.append("ul").attr("class", "tags");
  taglist
    .selectAll("li")
    .data(d => d.links)
    .enter()
    .append("li")
    .append("a")
    .attr(
      "href",
      d => (d.href.indexOf("http") > -1 ? d.href : "./pubs/" + d.href)
    )
    .attr("class", d => d.type)
    .html(function(d) {
      return d.type == "github" ? d.type : cap1(d.type);
    });
    parentDiv.append('p')
        .html('<a target = "_blank" href = "https://rhoinc.github.io/publication-library/">View all ' + meta.length + ' publications</a>')
}

//Get repo list.
fetch('https://api.github.com/users/RhoInc/repos?per_page=100')
    .then(response => response.json())
    .then(json => {
        buildReleaseList(json, '.releases');
    });

function buildReleaseList(repos, element) {
    const selection = d3.select(element);
    const converter = new showdown.Converter(); // converts markdown to html
    const releases = repos.map(repo => fetch(repo.releases_url.replace('{/id}', ''))); // fetch each repo's releases

    Promise.all(releases)
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(json => {
            //Capture latest releases.
            const latestReleases = json
                .filter(releases => releases.length > 0)
                .map(releases => {
                    releases.forEach(release => {
                        release.date = new Date(release.created_at);
                        release.repo = release.url.split('/')[5];
                        release.repo_url = 'https://github.com/RhoInc/' + release.repo;
                        release.html = converter.makeHtml(release.body);
                    });

                    return releases.sort((a,b) => b.date.getTime() - a.date.getTime())[0]; // get latest release
                })
                .sort((a,b) => b.date.getTime() - a.date.getTime())
                .slice(0,5); // get latest five releases

            selection
                .selectAll('div.release')
                    .data(latestReleases)
                    .enter()
                .append('div')
                .classed('release', true)
                .each(function(d) {
                    const release = d3.select(this);
                    release
                        .append('h3')
                        .classed('release__repo', true)
                        .attr('title', 'View repository')
                            .append('a')
                            .attr({
                                'href': d.repo_url,
                                'target': '_blank'
                            })
                            .text(d.repo)
                                .append('span')
                                .attr('title', 'View release')
                                .classed('release__date', true)
                                    .append('a')
                                    .attr({
                                        'href': d.html_url,
                                        'target': '_blank'
                                    })
                                    .text(`Released ${d.created_at.substring(0,10)}`);
                    release
                        .append('p')
                        .classed('release__body', true)
                        .html(d.html);
                });
                selection
                    .append('p')
                    .html('<a target = "_blank" href = "https://github.com/RhoInc/">View all repositories</a>');
        });
}

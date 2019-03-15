fetch('https://api.github.com/users/RhoInc/repos')
    .then(response => response.json())
    .then(json => {
        buildReleaseList(json, '.release-list');
    });

function buildReleaseList(data, element, nReleases = 1) {
    const selection = d3.select(element);
    const converter = new showdown.Converter();
    const latestReleases = data
        .map(repo => fetch(repo.releases_url.replace('{/id}', '/latest')));
    Promise.all(latestReleases)
        .then(responses => {
            return Promise.all(
                responses
                    .filter(response => reponse.status === 200)
                    .map(response => response.json())
            );
        })
        .then(json => {
            const data = json
                .map(d => {
                    d.date = new Date(d.created_at);
                    d.repo = d.url.split('/')[5];
                    d.html = converter.makeHtml(d.body);
                    return d;
                })
                .sort((a,b) => a.date.getTime() - b.date.getTime())
            const releases = selection
                .selectAll('div.release')
                    .data(data)
                    .enter()
                .append('div')
                .classed('release', true);
            releases.each(function(d) {
                const release = d3.select(this);
                release.append('h3').text(d.repo);
                release.append('p').html(d.html);
            });
        });
}

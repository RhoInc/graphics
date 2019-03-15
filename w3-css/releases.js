fetch('https://api.github.com/users/RhoInc/repos')
    .then(response => response.json())
    .then(json => {
        buildReleaseList(json, '.releases');
    });

function buildReleaseList(data, element, nReleases = 3) {
    const selection = d3.select(element);
    const list = selection
        .append('ul')
        .attr('class', 'releases');
    const latestReleases = data
        //.sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0,nReleases)
        .map(repo => fetch(repo.releases_url.replace('{/id}', '/latest')));
    Promise.all(latestReleases)
        .then(responses => {
            return Promise.all(responses.map(response => response.json()));
        })
        .then(json => {
            console.log(json);
        });
}

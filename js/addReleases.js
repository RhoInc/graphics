export default function releases() {
    const selection = d3.select('.releases');
    const converter = new showdown.Converter(); // converts markdown to html

    fetch('data/releases.json')
        .then(response => response.json())
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

                    return releases.sort((a, b) => b.date.getTime() - a.date.getTime())[0]; // get latest release
                })
                .sort((a, b) => b.date.getTime() - a.date.getTime());
            var numShown = 5;
            selection
                .selectAll('div.release')
                .data(latestReleases)
                .enter()
                .append('div')
                .classed('hidden', function(d, i) {
                    return i >= numShown;
                })
                .classed('release', true)
                .each(function(d) {
                    const release = d3.select(this);
                    release
                        .append('h5')
                        .html(
                            `<a href='${d.html_url}'><i class="fa fa-tag" aria-hidden="true"></i> ${
                                d.name
                            }</a> of <a href='${d.repo_url}'>${
                                d.repo
                            }</a> released on ${d.created_at.substring(0, 10)}`
                        );
                    release
                        .append('span')
                        .classed('release__body', true)
                        .html(d.html);
                });

            selection
                .append('p')
                .append('a')
                .html('Show 5 more releases')
                .style('text-decoration', 'underline')
                .style('cursor', 'pointer')
                .on('click', function() {
                    numShown = numShown + 5;
                    selection.selectAll('div.release').classed('hidden', function(d, i) {
                        return i >= numShown;
                    });
                });
        });
}

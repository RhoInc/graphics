export default function publications() {
    fetch(
        'https://raw.githubusercontent.com/RhoInc/publication-library/master/publicationMetadata.json'
    )
        .then(response => response.json())
        .then(json => {
            buildPubList(json, '.publications');
        });

    function buildPubList(meta, parentElement) {
        var parentDiv = d3.select(parentElement);
        var list = parentDiv.append('ul').attr('class', 'pubs');
        var items = list
            .selectAll('li')
            .data(meta.slice(0, 3)) // get latest three publications
            .enter()
            .append('li')
            .attr('class', 'pub');

        //thumb
        items
            .append('img')
            .attr(
                'src',
                d =>
                    'https://raw.githubusercontent.com/RhoInc/publication-library/master/img/' +
                    d.thumbnail
            );
        //    .text(d => (d.description ? d.description : "<no description available>"));

        var wraps = items.append('div').attr('class', 'pub-wrap');

        //title
        wraps
            .append('p')
            .attr('class', 'title')
            .text(d => d.title);

        //description
        wraps
            .append('p')
            .attr('class', 'reference')
            .text(d => d.reference);

        //author
        wraps
            .append('p')
            .attr('class', 'author')
            .text(d => d.authors);

        //tags
        function cap1(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        var taglist = wraps.append('ul').attr('class', 'tags');
        taglist
            .selectAll('li')
            .data(d => d.links)
            .enter()
            .append('li')
            .append('a')
            .attr('href', d =>
                d.href.indexOf('http') > -1
                    ? d.href
                    : 'https://rhoinc.github.io/publication-library/pubs/' + d.href
            )
            .attr('class', d => d.type)
            .html(function(d) {
                return d.type == 'github' ? d.type : cap1(d.type);
            });
        parentDiv
            .append('p')
            .html(
                '<a target = "_blank" href = "https://rhoinc.github.io/publication-library/">View all ' +
                    meta.length +
                    ' publications</a>'
            );
    }
}

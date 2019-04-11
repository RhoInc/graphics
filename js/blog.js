export default function blog() {
    function md2html(text) {
        const converter = new showdown.Converter();
        let dashes = false;
        let title;
        let author;
        const split = text
            .split('\n')
            .map(line => line.replace(/\{\{ site\.baseurl \}\}/g, 'https://raw.githubusercontent.com/RhoInc/blog/master/'))
            .filter(line => {
                if (/^---\s*$/.test(line)) {
                    dashes = !dashes;
                    return false;
                }
                if (dashes && /^\s*title\s*:\s*/.test(line))
                    title = line.replace(/\s*title\s*:\s*/, '');
                if (dashes && /^\s*author\s*:\s*/.test(line))
                    author = line.replace(/\s*author\s*:\s*/, '');
                return !dashes;
            });
        split.unshift(
            `### ${title}`
        );
        split.push(
            `_Written by ${author} on month xx, xxxx_`
        );
        const html = converter.makeHtml(split.join('\n'));
        return html;
    }

    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    fetch('https://api.github.com/repos/RhoInc/blog/contents/_posts')
        .then(response => response.json())
        .then(json => {
            const post = json.sort((a,b) => a.name < b.name ? 1 : -1)[0];
            return fetch(`${corsProxy}${post.download_url}`);
        })
        .then(response => response.text())
        .then(text => {
            const html = md2html(text);
            const blogPost = d3.select('.blog-post')
            blogPost
            .append("div")
            .style("background","white")
            .style("border","1px solid #999")
            .style("padding","0.5em")
            .html(html);
            blogPost
                .append('p')
                .html('<a target = "_blank" href = "https://rhoinc.github.io/blog/">View all blog posts</a>');
        });
}

import md2html from './addBlogPosts/md2html';

export default function blogPosts() {
    fetch('data/blogPosts.json')
        .then(response => response.json())
        .then(json => {
            const latestBlogPost = json.sort((a, b) => (a.name < b.name ? 1 : -1))[0];
            const html = md2html(latestBlogPost.md);
            const blogPost = d3.select('.blog-post');
            blogPost
                .append('div')
                .style('background', 'white')
                .style('border', '1px solid #999')
                .style('padding', '0.5em')
                .html(html);
            blogPost
                .append('p')
                .html(
                    "<a target = '_blank' href = 'https://rhoinc.github.io/blog/'>View all blog posts</a>"
                );
        });
}

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

//const text = `
//---
//layout: post
//title: Embracing Open Source as Good Science
//author: Ryan Bailey
//---
//<img src="{{ site.baseurl }}/images/open.png" align="right" /> Sharing.  It's one of the earliest lessons your parents try to teach you - don't hoard, take turns, be generous.  Sharing is a great lesson for life.  Sharing is also a driving force behind scientific progress and software development.  Science and software rely on communal principles of transparency, knowledge exchange, reproducibility, and mutual benefit.
//
//The practice of open sharing or open sourcing has advanced these fields in several ways:
//* [promoting better science](https://opensource.com/education/11/10/default-open-scientific-method) through transparency, peer review, and knowledge promotion
//* increasing [community engagement](https://opensource.com/open-organization/16/5/appreciating-full-power-open) by inviting scrutiny, feedback, mutual sharing, and collaboration
//* aligning with [government policy](https://open.usa.gov/) on openness and visibility in publicly-funded work
//
//We also feel strongly that the impetus for open sharing is reflected in [Rho's core values](http://www.rhoworld.com/rho/about/our-values) - especially team culture, innovation, integrity, and quality.  Given our values, and given our role in conducting science and creating software, we've been exploring ways that we can be more active in the so-called "sharing economy" when it comes to our work.
//
//One of the ways we have been fulfilling this goal is to release our statistical and data visualization tools as freely-accessible, open source libraries on GitHub.  GitHub is one of the world's largest open source platforms for virtual collaboration and code sharing.  GitHub allows users to actively work on their code online, from anywhere, with the opportunity to share and collaborate with other users.  As a result, we not only share our code for public use, we also invite feedback, improvements, and expansions of our tools for other uses.
//
//We released our first open source tool - the openFDA Adverse Event Explorer - in June 2015.  Now we have 26 team members working on 28 public projects, and that number has been growing rapidly.  The libraries and tools we've been sharing have a variety of uses: monitor safety data, track project metrics, visualize data, summarize every data variable for a project, aid with analysis, optimize SAS tools, and explore population data.
//
//Most repositories include examples and wikis that describe the tools and how they can be used.  An example of one of these tools, the Population Explorer is shown below.
//
//## Interactive Population Explorer
//<img src="{{ site.baseurl }}/images/population-explorer.png"/>
//
//*Access summary data on study population and subpopulations of interest in real time.*
//
//One of over 50 public projects on Rho's GitHub page - available at: [https://github.com/RhoInc/](https://github.com/RhoInc)
//
//In the coming months, we plan to use the blog to highlight a few of our different open source tools.  We invite you to check back/subscribe to learn more about the tools we're making available to the public.  We also encourage you to peruse the work for yourself on our [GitHub page](https://github.com/RhoInc).
//
//We are excited to be hosting public code and instructional wikis in a format that allows free access and virtual collaboration, and hope that an innovative platform like GitHub will give us a way to share our tools with the world and refine them with community feedback.  As science and software increasingly embrace open source code, we are changing the way we develop tools and optimizing the way we do clinical research while staying true to our core purpose and values.
//
//If you have any questions or want to learn more about one of our projects, email us at: [graphics@rhoworld.com](mailto:graphics@rhoworld.com).
//
//*This post [originally appeared](http://resources.rhoworld.com/blog/embracing-open-source-as-good-science) on [Rho's Corporate Blog](http://resources.rhoworld.com/blog).*
//`;

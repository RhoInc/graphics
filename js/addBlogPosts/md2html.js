export default function md2html(text) {
    const converter = new showdown.Converter();
    let dashes = false;
    let title;
    let author;
    const split = text
        .split('\n')
        .map(line =>
            line.replace(
                /\{\{ site\.baseurl \}\}/g,
                'https://raw.githubusercontent.com/RhoInc/blog/master/'
            )
        )
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
    split.unshift(`### ${title}`);
    split.push(`_Written by ${author} on month xx, xxxx_`);
    const html = converter.makeHtml(split.join('\n'));
    return html;
}

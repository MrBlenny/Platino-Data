const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const fm = require('front-matter');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

const parseFolder = (folderPath) => {

    // This will parse a folder with front matter
    const parseFile = (path) => fs.readFileAsync(path, 'utf8').then((data) => {
        const content = fm(data);
        content.attributes.id = getFileName(path);
        content.attributes.body = md.render(content.body);
        return content.attributes;
    })

    const parseFiles = (files) => Promise.map(files, (fileName) => parseFile(folderPath+'/'+fileName));
    return fs.readdirAsync(folderPath).then(parseFiles);
};

const getFileName = (fullPath) => {
    const nameAndExt = fullPath.replace(/^.*[\\\/]/, '');
    const name = nameAndExt.substr(0, nameAndExt.lastIndexOf('.'));
    return name;
};

const outputFolder = (path, content) => {
    const summaryWithoutBody = content.map(item => {
      const itemCopy = Object.assign({}, item);
      delete itemCopy.body;
      return itemCopy;
    })

    // Output summary
    fs.writeFile(`${path}.json`, JSON.stringify(summaryWithoutBody));

    // Output each file
    content.forEach(file => {
      fs.writeFile(`${path}/${file.id}.json`, JSON.stringify(file));
    });
};

// Remove old output
rimraf('./output', () => {
    // Create folders
    mkdirp('./output');
    mkdirp('./output/projects');
    mkdirp('./output/news');
    // Parse folders
    parseFolder('./src/news').then(items => outputFolder('./output/news', items));
    parseFolder('./src/projects').then(items => outputFolder('./output/projects', items));
});


//parseFile('./src/news/chatswood-place-1.md');

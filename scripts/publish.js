const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const fm = require('front-matter');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');


const parseFolder = (folderPath) => {
    // This will parse a folder with front matter
    const parseFile = (path) => fs.readFileAsync(path, 'utf8').then((data) => {
        const content = fm(data);
        content.attributes.id = getFileName(path);
        content.attributes.body = content.body;
        return content.attributes;
    });
    const parseFiles = (files) => Promise.map(files, (fileName) => parseFile(folderPath+'/'+fileName));
    return fs.readdirAsync(folderPath).then(parseFiles);
};

const getFileName = (fullPath) => {
    const nameAndExt = fullPath.replace(/^.*[\\\/]/, '');
    const name = nameAndExt.substr(0, nameAndExt.lastIndexOf('.'));
    return name;
};

const outputFolderSummary = (path, parsedContent) => {
    fs.writeFile(path, JSON.stringify(parsedContent));
};

// Remove old output
rimraf('./output', () => {
    // Create folders
    mkdirp('./output');
//    mkdirp('./output/projects');
//    mkdirp('./output/news');
    // Parse folders
    parseFolder('./src/news').then(items => outputFolderSummary('./output/news.json', items));
    parseFolder('./src/projects').then(items => outputFolderSummary('./output/projects.json', items));
});


//parseFile('./src/news/chatswood-place-1.md');

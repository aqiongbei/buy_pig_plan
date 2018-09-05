'use strict';

var config = require('config');
var Logger = require('bunyan');
var fs = require('fs');
var path = require('path');

function createDirectoryIfNecessary(filePath) {
    if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
    }

    filePath = path.normalize(filePath);

    try {
        var pathStats = fs.statSync(filePath);
        if (!pathStats.isDirectory()) {
            console.error(filePath + ' exists but is not a directory.');
            throw(filePath + ' exists but is not a directory.');
            return filePath;
        }
    } catch (e) {
        console.log('Directory ' + filePath + ' does not exist, trying to create it');
        fs.mkdirSync(path.normalize(filePath));
    }
    return filePath;
}

var logs = config.get("logs");
for (let log of logs) {
    if (log.output == 'stdout') {
        log.stream = process.stdout;
    } else if (log.output == 'stderr'){
        log.stream = process.stderr;
    } else {
        log.path = createDirectoryIfNecessary(log.output); 
        if (process.env.name) {
            log.path =  path.join(log.path,  process.env.name);
        } else {
            log.path = path.join(log.path, 'all_in_one');
        }
        log.path += '_' + process.pid + '.log';
        log.type = 'rotating-file';
    }
}

// src === true 会打印文件名和行号
let src = false;
if (process.env.NODE_ENV !== 'production') {
    src = true;
}

module.exports = new Logger({
    name : process.env.name ? process.env.name : "app",
    streams: logs,
    src: src,
});

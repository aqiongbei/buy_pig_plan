'use strict'

const fs = require('fs');
const path = require('path');
const TASK_STATUS = {
    done: 'done',
    locked: 'locked',
    failed: 'failed'
}

function readJSON (filepath, filename) {
    return JSON.parse(fs.readFileSync(path.join('.', 'sources', filepath, `${filename}.json`), 'utf8'));
}

function writeJSON (filepath, filename, data) {
    fs.writeFileSync(path.join('.', 'sources', filepath, `${filename}.json`), JSON.stringify(data, null, 4), 'utf8');
}

function getURLList(task_type, web_type, num) {
    let filename = getFilename(task_type, web_type);
    let url_list = readJSON(task_type, filename);
    let result = url_list.splice(0, num);
    writeJSON(task_type, web_type, url_list);
    return {url_list: result, filename: filename};
}

function getFilename (task_type, web_type) {
    let dir = fs.readdirSync(path.join('.', 'sources', task_type));
    dir = dir.filter(item => {return item.includes(web_type)});
    let rnd = Math.round(Math.random() * (dir.length-1));
    return dir[rnd].replace('.json', '');
}

function writeURLBack(task_type, filename, data) {
    let url_list = readJSON(task_type, filename);
    url_list.push(...data);
    writeJSON(task_type, filename, url_list);
}

module.exports = {
    readJSON: readJSON,
    writeJSON: writeJSON,
    getURLList: getURLList,
    TASK_STATUS: TASK_STATUS,
    writeURLBack: writeURLBack,
}
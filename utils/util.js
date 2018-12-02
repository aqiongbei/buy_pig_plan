'use strict'

const fs = require('fs');
const path = require('path');
const colors = require('colors');
const {WEB_TYPE, TASK_TYPE, TASK_STATUS} = require('./task_const');

function readJson (task_type, web_type) {
    return JSON.parse(fs.readFileSync(path.join('.', 'sources', task_type, `${web_type}.json`), 'utf8'));
}

function writeJson (task_type, web_type, data, bundle) {
    if (bundle) {
        bundle = `_${bundle}`;
    } else {
        bundle = '';
    }
    fs.writeFileSync(path.join('.', 'sources', task_type, `${web_type}${bundle}.json`), JSON.stringify(data, null, 4), 'utf8');
}

function getRandomArray (max, length) {
    var arr = [];

    if (length > max) {
        length = max;
    }

    for (let i = 1; i <= length; i ++) {
        let ran = Math.round(Math.random() * max);
        if (arr.includes(ran)) {
            i --;
        } else {
            arr.push(ran);
        }
    }

    return arr;
}

function getRandomUrl(task_type, web_type, num) {
    let allUrl = readJson(task_type, web_type);

    if (!num) {
        return allUrl;
    }

    let result = [];
    let randomArray = getRandomArray(allUrl.length - 1, num);

    for (let ran of randomArray) {
        result.push(allUrl[ran]);
    }

    return result;
}

function deleteUrl (task_type, web_type, id) {
    let fileContent = readJson(task_type, web_type);
    let deleteItem = {};
    fileContent = fileContent.filter(item => {
        if (item.id == id) {
            deleteItem = item;
            return false;
        }
        return true;
    });
    console.log(`DELETE URL: id: ${id} ${JSON.stringify(deleteItem, null, 4)}`.red)
    writeJson(task_type, web_type, fileContent);
}

module.exports = {
    deleteUrl: deleteUrl,
    taskConst: {
        WEB_TYPE: WEB_TYPE,
        TASK_TYPE: TASK_TYPE,
        TASK_STATUS: TASK_STATUS
    },
    writeJson: writeJson,
    getRandomUrl: getRandomUrl
}
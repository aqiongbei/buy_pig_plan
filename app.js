'use strict'

const config = require('config');
const colors = require('colors');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const events = require('events');
const e = new events();
e.setMaxListeners(0);

const {TASK_STATUS, ...util} = require('./utils/util');
const flow = require('./flow/flow');
const ATTACK = config.get('attack')

let index = 0;
let url_list_to_save = [];
let {filename, url_list} = util.getURLList(ATTACK.task_type, ATTACK.web_type, ATTACK.times);

process.on('uncaughtException', function (err) {
    console.log(err);
});

process.on('unhandledRejection', function(err, p) {
    console.log(err.stack);
});

function beforeExit (code) {
    console.log(`i got ${code}`);
    url_list_to_save.push(...url_list.slice(index));
    util.writeURLBack(ATTACK.task_type, filename, url_list_to_save);
}

process.on('SIGINT', beforeExit);

if (process.env.NODE_ENV == 'debug') {
    return (async () => {
        console.log(config);
        await run(ATTACK);
    })();
}

let cron_job = cron.schedule(ATTACK.time, async function(){
    await run(ATTACK);
}, false);

cron_job.start();

async function run(attack) {
    const {browser, page} = await init(attack);
    let o = {};
    o[TASK_STATUS.done] = 0;
    o[TASK_STATUS.locked] = 0;
    o[TASK_STATUS.failed] = 0;

    for (let item of url_list) {
        index ++;
        let startTime = new Date();
        let sleepTime = attack.interval;

        console.log(`==================TASK TIMES: ${index}==================`.yellow)
        console.log(`TASK INFO:`.yellow, `WEB NAME: ${item.name} WEB TYPE: ${item.web_type}`.green);

        let result = await task(page, item);

        o[result.status] ++;

        if (result.status == TASK_STATUS.failed) {
            sleepTime = 0;
        } else {
            url_list_to_save.push(item);
        }

        console.log(`TASK RESULT:`.yellow, `STATUS: ${result.status} MSG:${result.msg}`.green);
        console.log(`USED TIME: ${(new Date() - startTime) / 1000} S`.red);
        console.log(`SLEEP TIME: ${sleepTime / 1000} S`.red);

        await page.waitFor(sleepTime);
    }

    await browser.close();
    beforeExit();
    console.log(`==================TASK REPORT==================`.yellow)
    console.log(`done: ${o.done} failed: ${o.failed} locked: ${o.locked}`.yellow);
}

async function init (attack) {
    const chromium = config.get('chromium');
    const browser = await puppeteer.launch(chromium);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(chromium.timeout);
    page.setViewport({width: 1024, height: 768});
    return {browser, page};
}

async function task(page, item) {
    let result = {
        status: TASK_STATUS.failed,
        msg: ''
    };

    try {
        await page.goto(item.url);
        result = await flow[item.task_type][item.web_type](page, item, config.get('target'));
    } catch (e) {
        result.msg = `[TIME OUT ERROR] ${e}`;
    }

    return result;
}
'use strict'

const config = require('config');
const colors = require('colors');
const cron = require('node-cron');
const puppeteer = require('puppeteer');

const util = require('./utils/util');
const {WEB_TYPE, TASK_TYPE, TASK_STATUS} = util.taskConst;

const flow = require('./flow/flow');
const TARGET = config.get('targetInfo');

process.on('uncaughtException', function (err) {
    log.error(err);
});

process.on('unhandledRejection', function(err, p) {
    log.error(err.stack);
});

if (config.util.getEnv('NODE_ENV') != 'production') {
    (async () => {
        await puppeteerAttack(TASK_TYPE.call, WEB_TYPE.call.lxb);
        // await puppeteerAttack(TASK_TYPE.comment, WEB_TYPE.comment.shangqiao);
    })();
    return ;
}

let task = cron.schedule(config.get('attackTime'), async function(){
    await puppeteerAttack(TASK_TYPE.call, WEB_TYPE.call.lxb);
    console.log(config);
}, false);

task.start();

async function puppeteerAttack(task_type, web_type) {
    const {url_list, page, browser} = await init(task_type, web_type);
    let done = 0;
    let failed = 0;
    let locked = 0;
    let times = 0;

    for (let item of url_list) {
        times ++ ;
        let startTime = new Date();
        let sleepTime = config.get('everyTaskSleepTime');
        let feedBack = '';

        console.log(`==================TASK TIMES: ${times}==================`.yellow)
        console.log(`TASK INFO:`.yellow, `WEB NAME: ${item.name} WEB TYPE: ${item.web_type}`.green);

        item.result = await puppeteerFlow(page, item);

        if (item.result.status == 'done') {
            done ++;
        }

        if (item.result.status == 'failed') {
            if (item.result.msg.includes('[TYPE ERROR]') || item.result.msg.includes('[TIME OUT ERROR]')) {
                util.deleteUrl(item.task_type, item.web_type, item.id);
            }
            sleepTime = 0;
            failed ++;
        }

        if (item.result.status == 'locked') {
            locked ++;
        }

        console.log(`TASK RESULT:`.yellow, `STATUS: ${item.result.status} MSG:${item.result.msg}`.green);
        console.log(`USED TIME: ${(new Date() - startTime) / 1000} S`.red);
        console.log(`SLEEP TIME: ${sleepTime / 1000} S`.red);

        await page.waitFor(sleepTime);
    }

    await browser.close();
    console.log(`==================TASK REPORT==================`.yellow)
    console.log(`done: ${done} failed: ${failed} locked: ${locked}`.yellow);
}

async function init (task_type, web_type) {
    const url_list = util.getRandomUrl(task_type, web_type, config.get('attackTimes'));
    const browser = await puppeteer.launch({
            executablePath: config.get('chromium').path,
            headless: config.get('chromium').headless,
            slowMo: config.get('chromium').slowMo,
            devtools: false,
            args: ['--ash-host-window-bounds=1024x768'],
          });
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);
    page.setViewport({width: 1024, height: 768});

    console.log(JSON.stringify(url_list, null, 4));
    return {url_list, page, browser};
}

async function puppeteerFlow(page, item) {
    let result = {
        status: '',
        msg: ''
    };

    try {
        await page.goto(item.url, {timeout: 30 * 1000});
    } catch (e) {
        result.msg = `[TIME OUT ERROR] ${e}`;
    }

    if (!result.msg) {
        result = await flow[item.task_type][item.web_type](page, item, TARGET);
    }

    return result;
}
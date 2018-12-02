'use strict'
const {WEB_TYPE, TASK_TYPE, TASK_STATUS} = require('../../utils/task_const');

async function flow(page, item, target) {
    let result = {
        status: '',
        msg: ''
    };

    page.on('dialog', async dialog => {
        await dialog.dismiss();
    });

    try {
        await page.type('.lxb-cb-input', target.phone, {delay: 10});
        await page.click('.lxb-cb-input-btn');
        await page.waitFor(1 * 1000);

        try {
            result.msg = await page.$eval('.lxb-cb-tip', e => e.innerText);
        } catch (e) {
            try {
                result.msg = await page.$eval('.lxb-cb-info-tip-con', e => e.innerText);
            } catch (e) {
                try {
                    result.msg = await page.$eval('.lxb-cb-error-tip', e => e.innerText);
                } catch (e) {
                    result.msg = `[MSG ERROR] ${e}`;
                }
            }
        }
    } catch (e) {
        result.msg = `[TYPE ERROR] ${e}`;
    }

    result.status = getTaskStatus(result.msg);

    return result;
}

function getTaskStatus(text) {
    let status = TASK_STATUS.failed;
    let doneReg = /已短信提醒|正在呼叫|将给您回电|请准备接听/g;
    let lockedReg = /过于频繁|频繁/g;

    if (doneReg.test(text)) {
        status = TASK_STATUS.done;
    } else if (lockedReg.test(text)) {
        status = TASK_STATUS.locked;
    }

    return status;
}

module.exports = flow;
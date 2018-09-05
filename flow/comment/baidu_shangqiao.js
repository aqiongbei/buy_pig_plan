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
        await page.type('#nb-nodeboard-set-content-js', target.comment, {delay: 1});

        let eleArr = await page.$$eval('.nb-nodeboard-input', function (eleList) {
            let result = [];
            for (let item of eleList) {
                result.push({
                    id: item.id,
                    text: item.placeholder
                })
            }
            return result;
        });

        console.log(eleArr)

        for(let item of eleArr) {
            let id = item.id;
            let text = item.text;

            if (text.includes('电话')) {
                await page.type(`#${id}`, target.phone, {delay: 1});
            } else if (text.includes('姓名')) {
                await page.type(`#${id}`, target.name, {delay: 1});
            } else if (text.includes('邮箱')){
                await page.type(`#${id}`, target.email, {delay: 1});
            } else if (text.includes('必填')) {
                await page.type(`#${id}`, target.phone, {delay: 1});
            }
        }

        await page.click('#nb_nodeboard_send');
        await page.waitFor('#nb_nodeboard_success', {timeout: 3000});
        result.msg = await page.$eval('#nb_nodeboard_success', e => e.innerText);
    } catch (e) {
        result.msg = `[TYPE ERROR] ${e}`;
    }

    result.status = getTaskStatus(result.msg);

    return result;
}

function getTaskStatus(text) {
    let status = TASK_STATUS.failed;

    if (text && text.includes('感谢留言')) {
        status = TASK_STATUS.done;
    }

    return status;
}

module.exports = flow;
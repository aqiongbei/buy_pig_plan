'use strict'

async function flow(page, item, target) {
    let result = {
        status: '',
        msg: ''
    };

    if (item.feedBack.type  == 'dialog') {
        page.on('dialog', async dialog => {
            result.msg = dialog.message();
            await dialog.dismiss();
        });
    }

    for(let flow of item.flow) {
        switch (flow.action) {
            case 'type':
                await page.type(flow.ele, target.phone, {delay: 10});
                break;
            case 'click':
                await page.click(flow.ele);
                break;
            default:
                throw new Error('UNKNOW ACTION TYPE');
                break;
        }
    }

    if (item.feedBack.type == 'html') {
        // TODO
        // 企点的提示是通过两个元素的display来实现的
        await page.waitForSelector(item.feedBack.ele);
        result.msg = await page.$eval(item.feedBack.ele, e => e.innerText);
    } else if (item.feedBack.type == 'dialog') {
        await page.waitFor(1 * 1000);
    }

    return result;
}

module.exports = flow;
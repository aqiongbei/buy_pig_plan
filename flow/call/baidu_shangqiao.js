'use strict'

async function flow(page, item, target) {
    let result = {
        status: '',
        msg: ''
    };

    page.on('dialog', async dialog => {
        result.msg = dialog.message();
        await dialog.dismiss();
    });

    await page.type('#telInput', target.phone, {delay: 10});
    await page.click('#callBtn');
    await page.waitFor(1 * 1000);

    return result;
}

module.exports = flow;
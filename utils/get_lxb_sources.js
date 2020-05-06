'use strict'

const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

const util = require('./util');

async function getPage(url) {
    let options = {
        url: url,
        method: 'GET',
        timeout: 5 * 1000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'
        }
    }

    console.log(`url: ${url}`);
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
                if (error) {
                    console.log(`ERROR URL: ${url}`)
                    return resolve('');
                }
                resolve(response.body);
            });
    });
}

function parsePage(html) {
    if (html == '') {
        return null;
    }

    let $ = cheerio.load(html);

    return {
        name: $('.cpy-info').eq(0).text().trim(),
        url: $('.cpy-url a').attr('href')
    };
}

async function start(start_id, end_id) {
    let call_data= [];
    let comment_data = [];
    let call_id = 0;
    let comment_id = 0;
    console.log(`JOB START`);
    let current_id = start_id;
    while (current_id <= end_id) {
        let url = `http://lxbjs.baidu.com/cb/url/show?f=56&id=${current_id}`;
        let lxbPageHTML = await getPage(url);
        let web_info = parsePage(lxbPageHTML);
        if (web_info) {
            let webHTML = await getPage(web_info.url);
            // 判断网站用的是百度商桥还是离线宝,或者两者都在用,亦或者都不在用
            if (webHTML.includes('hm.baidu.com/h.js')) {
                web_info.task_type = 'call';
                web_info.web_type = 'baidu_lxb';
                web_info.id = `call_baidu_lxb_id_${call_id}`;
                call_data.push(web_info);
                call_id ++;
            }

            if (webHTML.includes('hm.baidu.com/hm.js')) {
                web_info = JSON.parse(JSON.stringify(web_info));
                web_info.task_type = 'comment';
                web_info.web_type = 'baidu_shangqiao';
                web_info.id = `comment_baidu_shangqiao_id_${comment_id}`;
                comment_data.push(web_info);
                comment_id ++;
            }
        }
        console.log(web_info)
        current_id ++;
    }
    console.log(JSON.stringify(call_data));
    console.log(JSON.stringify(comment_data));
    util.writeJSON('call', `baidu_lxb_${start_id}`, call_data);
    util.writeJSON('comment', `baidu_shangqiao_${start_id}`, comment_data);
    console.log(`JOB END`);
}

(async function () {
    await start(114000, 114001);
})();
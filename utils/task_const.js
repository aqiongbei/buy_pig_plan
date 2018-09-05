'use strict'

const WEB_TYPE = {
    call: {
        lxb: 'baidu_lxb'
    },
    comment: {
        lxb: 'baidu_lxb',
        shangqiao: 'baidu_shangqiao'
    },
    sms: {
        // TODO
    }
}

const TASK_TYPE = {
    sms: 'sms', // TODO
    call: 'call',
    comment: 'comment' // TODO
}

const TASK_STATUS = {
    done: 'done',
    locked: 'locked',
    failed: 'failed'
}

module.exports = {WEB_TYPE, TASK_TYPE, TASK_STATUS};
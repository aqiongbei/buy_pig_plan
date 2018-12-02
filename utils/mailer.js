'use strict'

const config = require('config');
const mailer = require('nodemailer');
const account = config.get('email').account;
const mailer = config.get('email').mailer;


let accountOptions = {
    host: account.type,
    port: 587,
    secure: false,
    auth: {
        user: account.user,
        pass: account.pass
    }
};

let mailerOptions = {
    from: mailer.from,
    to: mailer.to,
    subject: ,
    html: '<b>Hello world?</b>'
    };
}
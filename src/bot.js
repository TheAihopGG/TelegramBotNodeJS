const { Telegraf } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const { createTables } = require('./database.js');
const fs = require('fs');
const dotenv = require('dotenv');

// init env config
dotenv.config();

// create bot
const bot = new Telegraf(process.env.TOKEN);
// get settings
const settings = JSON.parse(fs.readFileSync('./data/settings.json'));
// open database
const db = new sqlite3.Database(
    settings.paths.database,
    sqlite3.OPEN_READWRITE,
    (err) => {
        if (err) console.error(err);
    }
);

// init commands
const commands = {
    start: {
        name: 'start',
        description: '',
        usage: '/start',
        func: (ctx) => {
            // check user ban
            db.all(
                `SELECT banned, banReason FROM users WHERE id = ?`,
                [ctx.message.from.id],
                (err, rows) => {
                    if (rows) {
                        if (rows.at(0).banned) {
                            ctx.reply(`You have banned with reason ${rows.banReason}`);
                        }
                        else {
                            // add user to users
                            db.run(
                                `INSERT OR REPLACE INTO users (id, userName) VALUES (?, ?)`,
                                [
                                    parseInt(ctx.message.from.id),
                                    ctx.message.from.username
                                ]
                            );
                            // reply
                            ctx.reply(`
                                Welcome!
                                Enter /help to see commands list

                                Authors
                                - [@TheAihopGG](https://github.com/TheAihopGG/)

                                Source code
                                - ops...
                            `);
                        }
                    }
                }
            );
        }
    },
    help: {
        name: 'help',
        description: 'Shows this message',
        usage: '/help',
        func: (ctx) => {
            // check user ban
            db.all(
                `SELECT banned, banReason FROM users WHERE id = ?`,
                [ctx.message.from.id],
                (err, rows) => {
                    if (rows) {
                        if (rows.at(0).banned) {
                            ctx.reply(`You have banned with reason ${rows.banReason}`);
                        }
                        else {
                            let string = 'Commands list\n';
                            for (const commandName in commands) {
                                const command = commands[commandName];
                                string += `- /${command.name} - ${command.description}\n`;
                            }
                            ctx.reply(string);
                        }
                    }
                }
            );
        }
    },
    ticket: {
        name: 'ticket',
        description: 'You have a question? Create a ticket',
        usage: '/ticket <question>[ <image_url1>[ <image_url2>[ <image_urlN>]]]',
        func: (ctx) => {
            // check user ban
            db.all(
                `SELECT banned, banReason FROM users WHERE id = ?`,
                [ctx.message.from.id],
                (err, rows) => {
                    if (rows) {                 
                        if (rows.at(0).banned) {
                            ctx.reply(`You have banned with reason ${rows.banReason}`);
                        }
                        else {
                            if (ctx.args.length == 1) {
                                // add ticket to tickets
                                db.run(
                                    `INSERT OR REPLACE INTO tickets(id, userId, commentary) VALUES (?, ?, ?)`,
                                    [
                                        parseInt(uuid()),
                                        ctx.message.from.id,
                                        ctx.args.at(0) // commentary
                                    ]
                                );
                                // reply
                                ctx.reply('Ticket submitted successfully');
                            }
                            else if (ctx.args.length > 1) {
                                // add ticket to tickets
                                db.run(
                                    `INSERT OR REPLACE INTO tickets(id, userId, commentary, image_urls) VALUES (?, ?, ?, ?)`,
                                    [
                                        parseInt(uuid()),
                                        ctx.message.from.id,
                                        ctx.args.at(0), // commentary
                                        JSON.stringify(ctx.args.slice(1, Infinity)) // image urls
                                    ]
                                );
                                // reply
                                ctx.reply('Ticket submitted successfully');
                            }
                            else {
                                // reply
                                ctx.reply('You must specify at least 1 parameter');
                                ctx.reply('Type /usage admin for more information');
                            }
                        }
                    }
                }
            )
        }
    },
    usage: {
        name: 'usage',
        description: 'Shows command usage',
        usage: '/usage <commandName1>[ <commandName2>[ <commandNameN>]]',
        func: (ctx) => {
            if (ctx.args.length > 0) {
                let string = ctx.args.length == 1 ? 'Command usage\n' : 'Command usages\n';
                ctx.args.forEach((commandName) => {
                    const command = commands[commandName];
                    if (command) {
                        string += `${command.usage}\n`;
                    }
                    else {
                        ctx.reply(`Unknown command ${commandName}`);
                    }
                });
                // reply
                ctx.reply(string);
            }
            else {
                // reply
                ctx.reply('You must specify at least 1 parameter');
                ctx.reply('Type /usage admin for more information');
            }
        }
    },
    loginAsAdmin: {
        name: 'admin',
        description: 'Signs in like admin',
        usage: '/admin <password>',
        func: (ctx) => {
            if (ctx.args.length > 0) {
                if (ctx.args.at(0) == process.env.ADMINPWD) {
                    // add user to admins
                    db.run(
                        `INSERT INTO admins (id, userName) VALUES (?, ?)`,
                        [
                            parseInt(ctx.message.from.id),
                            ctx.message.from.username
                        ]
                    );
                    // reply
                    ctx.reply('Signed in as an admin');
                    // delete user message
                    ctx.deleteMessage(ctx.message.id);
                }
                else {
                    // reply
                    ctx.reply('Incorrect password');
                }
            }
            else {
                // reply
                ctx.reply('You must specify at least 1 parameter');
                ctx.reply('Type /usage admin for more information');
            }
        }
    },
    banUser: {
        name: 'ban',
        description: 'Bans user',
        usage: '/ban <userId>[ <reason>]',
        func: (ctx) => {
            // check user ban
            db.all(
                `SELECT banned, banReason FROM users WHERE id = ?`,
                [ctx.message.from.id],
                (err, rows) => {
                    if (rows) {
                        if (rows.at(0).banned) {
                            ctx.reply(`You have banned with reason ${rows.banReason}`);
                        }
                        else {
                            // check for admin
                            db.all(
                                `SELECT id FROM admins WHERE id=?`,
                                [ctx.message.from.id],
                                (err, rows) => {
                                    if (rows) {
                                        // user is admin
                                        if (ctx.args.length == 1) {
                                            // get params
                                            let userId = ctx.args.at(0);

                                            // ban
                                            db.run(
                                                `UPDATE users SET banned=? WHERE id=?`,
                                                [
                                                    1,
                                                    parseInt(userId)
                                                ]
                                            );
                                            ctx.reply('Successfully banned');
                                        }
                                        else if (ctx.args.length > 1) {
                                            // get params
                                            let userId = ctx.args.at(0);
                                            let banReason = ctx.args.at(1);

                                            // ban with reason
                                            db.run(
                                                `UPDATE users SET banned=?, banReason=? WHERE id=?`,
                                                [
                                                    1,
                                                    banReason,
                                                    parseInt(userId)
                                                ]
                                            );
                                            ctx.reply('Successfully banned');
                                        }
                                        else {
                                            // reply
                                            ctx.reply('You must specify at least 1 parameter');
                                            ctx.reply('Type /usage ban for more information');
                                        }
                                    }
                                    else {
                                        // reply
                                        ctx.reply('You are not an admin');
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    },
    unbanUser: {
        name: 'unban',
        description: 'Unbans user',
        usage: '/ban <userId>',
        func: (ctx) => {
            // check user ban
            db.all(
                `SELECT banned, banReason FROM users WHERE id = ?`,
                [ctx.message.from.id],
                (err, rows) => {
                    if (rows) {
                        if (rows.at(0).banned) {
                            ctx.reply(`You have banned with reason ${rows.banReason}`);
                        }
                        else {
                            // check for admin
                            db.all(
                                `SELECT id FROM admins WHERE id=?`,
                                [ctx.message.from.id],
                                (err, rows) => {
                                    if (rows) {
                                        // user is admin
                                        if (ctx.args.length > 0) {
                                            // get params
                                            let userId = ctx.args.at(0);

                                            // ban
                                            db.run(
                                                `UPDATE users SET banned=? WHERE id=?`,
                                                [
                                                    0,
                                                    parseInt(userId)
                                                ]
                                            );
                                            ctx.reply('Successfully unbanned');
                                        }
                                        else {
                                            // reply
                                            ctx.reply('You must specify at least 1 parameter');
                                            ctx.reply('Type /usage unban for more information');
                                        }
                                    }
                                    else {
                                        // reply
                                        ctx.reply('You are not an admin');
                                    }
                                }
                            );
                        }
                    }
                }
            );
        }
    }
};

uuid = () => {
    return Date.now() * Math.random(1, 100);
}

main = () => {
    // create tables
    createTables(db);

    // link commands
    for (const commandName in commands) {
        const command = commands[commandName];
        bot.command(command.name, command.func);
    }

    // launch and graceful stop
    bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main();
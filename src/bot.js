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
            // add user to users
            db.run(
                `INSERT OR REPLACE users(id, userName) VALUES (?, ?)`,
                [
                    ctx.message.from.id,
                    ctx.message.from.username,
                ]
            );
            // reply
            ctx.reply(`
                **Welcome!**
                Enter /help to see commands list
                
                **Authors**
                - [@TheAihopGG](https://github.com/TheAihopGG/)

                **Source code**
                - ops...
            `);
        }
    },
    help: {
        name: 'help',
        description: 'Shows this message',
        usage: '/help',
        func: (ctx) => {
            let string = '';
            for (const commandName in exports.commands) {
                const command = exports.commands[commandName];
                string += `${command.name} - ${command.description}`;
            }
            ctx.reply(string);
        }
    }
};

function main() {
    // create tables
    createTables(db);

    // link commands
    for (const commandName in commands) {
        const command = commands[commandName];
        bot.command(command.name, command.func);
    }
    bot.on('message', (ctx) => {
        console.log(ctx);
    });

    // launch and graceful stop
    bot.launch();

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main();
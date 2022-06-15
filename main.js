const Bot = require("discord.js");

const client = new Bot.Client({
    intents: [
        Bot.Intents.FLAGS.GUILDS,
        Bot.Intents.FLAGS.GUILD_MESSAGES
    ]
});


// const unzip = require("unzip")

process.on("uncaughtException", (err) => {
    console.error(err)
})

const fs = require("fs");
const config = require("./config.js")

const pydoc = JSON.parse(fs.readFileSync(__dirname + "/docs/dpy.json").toString()).classes;
const jsdoc = JSON.parse(fs.readFileSync(__dirname + "/docs/djs.json").toString()).classes;
const jdadoc = fs.readFileSync(__dirname + "/docs/jda.txt").toString().split("\n");

client.on("ready", () => {
    console.log("ready");
    client.user.setActivity({name: ">help", type: "LISTENING"})
});


const whitelist = config.whitelist

client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    const args = [message.content.split(" ")[0], message.content.split(" ")[1], message.content.split(" ").slice(2).join(" ")];
    if (args[0] == ">help") {
        const help = new Bot.MessageEmbed()
        .setTitle("HELP")
        .setDescription("Docs Bot | prefix: `>`")
        .addField(">docs (py|js|jda) [word]", "各discord用ライブラリのdocsを検索します\n[word]を指定しない場合はドキュメントのリンクを表示します")
        .addField(">eval (py|js|java) [code]", "プログラムを実行します。コンソールの内容を出力できます。\n第二引数にコードを指定するか(改行可能)、コードを添付してください\n(仕様上ファイル操作もできますがしてほしくないですw)")
        if (whitelist.includes(message.guild.id)) return message.channel.send({embeds: [help]})
        message.channel.send({embeds: [help.spliceFields(1, 1)]})
    }
    let result = [];
    if (args[0] == ">eval" && args.length >= 2) {
        if (!whitelist.includes(message.guild.id)) {
            message.channel.send("このサーバーでは`>eval`が許可されていません。")
        }
        setTimeout(() => {
            require("./modules/eval")(message, args, (msg) => {
                const embed = new Bot.MessageEmbed()
                .setTitle("Eval")
                .setDescription(msg.replace(new RegExp(config.whitelist, "g"), ""));
                message.channel.send({embeds: [embed]});
            });
        }, 500);
    }
    if (args[0] == ">docs") {
        switch(args[1]) {
            case "py":
                if (!args[2]) {
                    const embed = new Bot.MessageEmbed()
                    .setTitle("Discord.py Docs")
                    .setDescription(`[discord.py APIドキュメント](https://discordpy.readthedocs.io/ja/latest/api.html)`);
                    message.channel.send({embeds: [embed]});
                    return
                }
                pydoc.forEach(elm => {
                    elm.props ? elm.props.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase())) {
                            result.push(" [:regional_indicator_p: " + elm.name + "." + e.name + "](" + e.link + ") ");
                        }                        
                    }) : null;
                    elm.methods ? elm.methods.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase().replace(/(\(|\))/g, ""))) {
                            result.push(" [:regional_indicator_m: " + elm.name + "." + e.name + "](" + e.link + ") ");
                        }
                    }) : null;
                    if (!args[2].includes(".") && elm.name.toLowerCase().includes(args[2].toLowerCase())) {
                        result.unshift(" [:regional_indicator_c: " + elm.name + "." + e.name + "](" + e.link + ") ");
                    }
                });
                setTimeout(() => {
                    result = Array.from(new Set(result));
                    const embed = new Bot.MessageEmbed()
                    .setTitle("Discord.py Docs")
                    .setURL("https://discordpy.readthedocs.io/ja/latest/api.html")
                    .setDescription(`${result.slice(0, 10).join("\n")}`)
                    .setFooter({text: "C: classes | P: properties | M: methods"})
                    message.channel.send({embeds: [embed]});
                }, 100);
                break
            case "js":
                if (!args[2]) {
                    const embed = new Bot.MessageEmbed()
                    .setTitle("Discord.js Docs")
                    .setDescription(`[discord.js APIドキュメント](https://discord.js.org/#/docs)`);
                    message.channel.send({embeds: [embed]});
                    return
                }
                jsdoc.forEach(elm => {
                    elm.props ? elm.props.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase())) {
                            result.push(" [:regional_indicator_p: " + elm.name + "." + e.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + "?scrollTo=" + e.name + ") ");
                        }                        
                    }) : null;
                    elm.methods ? elm.methods.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase())) {
                            result.push(` [:regional_indicator_m: ${elm.name}.${e.name}(${e.params ? e.params.map(fn => `${fn.name}${fn.optional ? "?" : ""}: ${fn.type[0][0].join("|")}`).join(",") : ""}): ${e.returns.types ? e.returns.types.flat(2).join("") : "void"}](https://discord.js.org/#/docs/discord.js/stable/class/${elm.name}?scrollTo=${e.name}) `);
                        }
                    }) : null;
                    elm.events ? elm.events.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase())) {
                            result.push(" [:regional_indicator_e: " + elm.name + "." + e.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + "?scrollTo=" + e.name + ") ");
                        }
                    }) : null;
                    if (!args[2].includes(".") && elm.name.toLowerCase().includes(args[2].toLowerCase())) {
                        result.unshift(" [:regional_indicator_c: " + elm.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + ") ");
                    } else if (!args[2].includes(".")) {
                        result.push(` [:regional_indicator_p: ${elm.name}.${e.name}(${e.params ? e.params.map(fn => `${fn.name}${fn.optional ? "?" : ""}: ${fn.type[0][0].join("|")}`).join(",") : ""}): ${e.returns.types ? e.returns.types.flat(2).join("") : "void"}](https://discord.js.org/#/docs/discord.js/stable/class/${elm.name}?scrollTo=${e.name}) `);
                        elm.props ? elm.props.find(fn => fn.name.toLowerCase().includes(args[2].toLowerCase())) : null
                    }
                });
                setTimeout(() => {
                    result = Array.from(new Set(result));
                    const embed = new Bot.MessageEmbed()
                    .setTitle("Discord.js Docs")
                    .setURL("https://discord.js.org/#/docs")
                    .setDescription(`${result.slice(0, 10).join("\n")}`)
                    .setFooter({text: "C: classes | P: properties | M: methods | E: events"})
                    message.channel.send({embeds: [embed]});
                }, 100);
                break
            case "jda":
                let tmp = []
                if (!args[2]) {
                    const embed = new Bot.MessageEmbed()
                    .setTitle("JDA Docs")
                    .setDescription(`[JDA Javadoc](https://ci.dv8tion.net/job/JDA/javadoc/index.html)`);
                    message.channel.send({embeds: [embed]});
                    return
                }
                jdadoc.forEach(elm => {
                    let elmt = elm.replace("https://ci.dv8tion.net/job/JDA/javadoc/net/dv8tion/jda/", "").replace(".html", "").replace("/package-tree", "")
                    elmt = elmt.split("/").join(".")
                    elmt.split(".").forEach((e, i) => {
                        if (!tmp[i]) tmp[i] = []
                        if (e.toLowerCase().includes(args[2].toLowerCase()) && !tmp[i].includes(e.replace("\"", ""))) {
                            result.push(" [" + elmt.match(/"(.+)"/)[1] + "](" + elm.match(/"(.+)"/)[1] + ") ");
                            tmp[i].push(e.replace("\"", ""))
                        }
                    })
                });
                setTimeout(() => {
                    result = Array.from(new Set(result));
                    const embed = new Bot.MessageEmbed()
                    .setTitle("JDA Docs")
                    .setDescription(`${result.slice(0, 10).join("\n")}`);
                    message.channel.send({embeds: [embed]});
                }, 100);
                break
        }
    }
});

client.login(config.token);
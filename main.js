const Bot = require("discord.js");

const client = new Bot.Client({
    intents: [
        Bot.Intents.FLAGS.GUILDS,
        Bot.Intents.FLAGS.GUILD_MESSAGES
    ]
});

const iconv = require("iconv-lite")

const { exec } = require("child_process")
const psTree = require("ps-tree")
// const unzip = require("unzip")

process.on("uncaughtException", (err) => {
    console.error(err)
})

const fs = require("fs");
const request = require("request-promise")

const pydoc = JSON.parse(fs.readFileSync(__dirname + "/dpy.json").toString()).classes;
const jsdoc = JSON.parse(fs.readFileSync(__dirname + "/djs.json").toString()).classes;
const jdadoc = fs.readFileSync(__dirname + "/jda.txt").toString().split("\n");

client.on("ready", () => {
    console.log("ready");
    client.user.setActivity({name: ">help", type: "LISTENING"})
});

const whitelist = ["968323582323196053", "971043823985758229"]
const appPath = ["node", "C:/Users/akihi/AppData/Local/Programs/Python/Python310/python.exe"]

function unlink(filename) {
    fs.unlinkSync(`${__dirname}/proc/${filename}`)
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return
    const args = [message.content.split(" ")[0], message.content.split(" ")[1], message.content.split(" ").slice(2).join(" ")];
    console.log(args)
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
        console.log(message.content)
        let file = `/proc/run.${args[1]}`
        if (message.attachments.first() && ["py", "js", "java"].includes(args[1])) {
            const data = await request.get(message.attachments.first().url)
            file = `/proc/${message.attachments.first().name}`
            fs.writeFileSync(`${__dirname}/proc/${message.attachments.first().name}`, data)
        } else if (!message.attachments.first() && message.attachments.first().name.endsWith(".zip")) {
            /* const data = await request.get(message.attachments.first().url)
            fs.writeFileSync("./tmp.zip", data)
            fs.createReadStream('./tmp.zip').pipe(unzip.Extract({path: './proc/'}));
            if (args[1] == "java") {
                
            } */
        } else if (!message.attachments.first() && args[1] != "java") {
            fs.writeFileSync(__dirname + "/proc/run." + args[1], args[2])
        }
        let ms = ""
        setTimeout(() => {
            switch(args[1]) {
                case "py":
                    ms = `> python ./proc/${file}\n`
                    timeout = setTimeout(() => {
                        if (!j.connected) {
                            psTree(j.pid, (err, child) => {
                                child.forEach(ch => {
                                    process.kill(ch.PID)
                                });
                            });
                            b.removeAllListeners("exit")
                            const embed = new Bot.MessageEmbed()
                            .setTitle("node.js Eval")
                            .setDescription("```プログラムが10秒間終了または応答しなかった為、強制停止しました。```");
                            message.channel.send({embeds: [embed]});
                        }
                    }, 10000)
                    const b = exec(`"C:/Users/akihi/AppData/Local/Programs/Python/Python310/python.exe" ./proc/${file}`)
                    b.on("exit", () => {
                        const embed = new Bot.MessageEmbed()
                        .setTitle("Python Eval")
                        .setDescription("```" + ms.slice(0, 100).replace(/akihi/g, "<User>") + `${ms.length > 100 ? "...more " + (ms.length - 100) + " charactors" : ""}` + "```");
                        message.channel.send({embeds: [embed]});
                        unlink(file);
                        clearTimeout(timeout);
                    })
                    .on("error", (e) => {
                        console.log(e)
                    })
                    b.stdout.on("data", (chunk) => {
                        // console.log(chunk.toString())
                        ms += chunk
                    })
                    b.stderr.on("data", (chunk) => {
                        // console.log(chunk.toString())
                        ms += chunk
                    })
                    break;
                case "js":
                    ms = "node.js "
                    exec(`node --version`)
                    .stdout.on("data", (c) => {
                        ms += c
                    })
                    .on("end", () => {
                        timeout = setTimeout(() => {
                            if (!j.connected) {
                                psTree(j.pid, (err, child) => {
                                    child.forEach(ch => {
                                        process.kill(ch.PID)
                                    });
                                });
                                j.removeAllListeners("exit")
                                const embed = new Bot.MessageEmbed()
                                .setTitle("node.js Eval")
                                .setDescription("```プログラムが10秒間終了または応答しなかった為、強制停止しました。```");
                                message.channel.send({embeds: [embed]});
                            }
                        }, 10000)
                        ms += "\n"
                        ms += `> node ./proc/${file}\n`
                        const j = exec(`node ./proc/${file}`)
                        j.on("exit", () => {
                            const embed = new Bot.MessageEmbed()
                            .setTitle("node.js Eval")
                            .setDescription("```" + ms.slice(0, 100).replace(/akihi/g, "<User>") + `${ms.length > 100 ? "...more " + (ms.length - 100) + " charactors" : ""}` + "```");
                            message.channel.send({embeds: [embed]});
                            unlink(file);
                            clearTimeout(timeout);
                        })
                        .on("error", (e) => {
                            console.log(e);
                        })
                        j.stdout.on("data", (chunk) => {
                            // console.log(chunk.toString())
                            ms += chunk
                        })
                        j.stderr.on("data", (chunk) => {
                            // console.log(chunk.toString())
                            ms += chunk
                        })
                    });
                    break
                case "java":
                    ms = ""
                    // ok: console.log(args[2])
                    const jv = exec(`C:/jdk-17.0.2/bin/java.exe -version`)
                    .on("exit", () => {
                        timeout = setTimeout(() => {
                            if (!j.connected) {
                                psTree(j.pid, (err, child) => {
                                    child.forEach(ch => {
                                        process.kill(ch.PID)
                                    });
                                });
                                j.removeAllListeners("exit")
                                const embed = new Bot.MessageEmbed()
                                .setTitle("Java Eval")
                                .setDescription("```プログラムが10秒間終了または応答しなかった為、強制停止しました。```");
                                message.channel.send({embeds: [embed]});
                            }
                        }, 10000)
                        ms += "\n"
                        
                        const filename = `${args[2].match(/.+class (.+?) \{/) ? args[2].match(/.+class (.+?) \{/)[1] : ""}`
                        if (!filename) {
                            const embed = new Bot.MessageEmbed()
                            .setTitle("Java Eval")
                            .setDescription("```" + "ファイルからクラス名を検出できませんでした。\n実行を停止します。" + "```");
                            message.channel.send(embed)
                            clearTimeout(timeout)
                            return
                        }
                        fs.writeFileSync(__dirname + `/${filename}.java`, iconv.encode(args[2], "utf-8"))
                        ms += `> javac ./proc/${filename}.java\n`
                        ms2 = null
                        const j = exec(`C:/jdk-17.0.2/bin/javac.exe ./proc/${filename}.java -J-Dfile.encoding=UTF-8`)
                        j.on("exit", (code) => {
                            setTimeout(() => {
                                if (code == 0) {
                                    ms += `\n> cd ./proc \n/proc> java ${filename}\n`
                                    const j2 = exec(`cd /proc & :/jdk-17.0.2/bin/java.exe ${filename} -J-Dfile.encoding=UTF-8`)
                                    j2.on("exit", () => {
                                        const embed = new Bot.MessageEmbed()
                                        .setTitle("Java Eval")
                                        .setDescription("```" + ms.slice(0, 300).replace(/akihi/g, "<User>") + `${ms.length > 300 ? "...more " + (ms.length - 300) + " charactors" : ""}` + "```");
                                        message.channel.send({embeds: [embed]});
                                        clearTimeout(timeout)
                                        unlink(filename + ".java")
                                        unlink(filename + ".class")
                                    })
                                    .stdout.on("data", (chunk) => {
                                        ms += iconv.decode(Buffer.from(chunk), "utf-8")
                                    })
                                    j2.stderr.on("data", (chunk) => {
                                        ms += iconv.decode(Buffer.from(chunk), "utf-8")
                                    })
                                } else {
                                    const embed = new Bot.MessageEmbed()
                                    .setTitle("Java Eval")
                                    .setDescription("```" + ms.slice(0, 300).replace(/akihi/g, "<User>") + `${ms.length > 300 ? "...more " + (ms.length - 300) + " charactors" : ""}` + "```");
                                    message.channel.send({embeds: [embed]});
                                    clearTimeout(timeout)
                                    // console.log(require("jschardet").detect(Buffer.from(ms2)), ms2)
                                }
                            }, 10)                     
                        })
                        .on("error", (e) => {
                            console.log(e)
                        })
                        j.stdout.on("data", (chunk) => {
                            // console.log(chunk.toString())
                            ms += iconv.decode(Buffer.from(chunk), "utf-8")
                            
                        })
                        j.stderr.on("data", (chunk) => {
                            // console.log(chunk.toString())
                            ms += iconv.decode(Buffer.from(chunk), "utf-8")
                            
                        })
                        
                    })
                    .on("error", (e) => {
                        console.log(e)
                    })
                    jv.stdout.on("data", (c) => {
                        ms += c
                    })
                    jv.stderr.on("data", (c) => {
                        ms += c
                    })
                break
            }
        }, 500)
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
                            result.push(" [:regional_indicator_p: " + elm.name + "." + e.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + "?scrollTo=" + e.name + ") ");
                        }                        
                    }) : null;
                    elm.methods ? elm.methods.forEach(e => {
                        if (args[2].includes(".") && `${elm.name}.${e.name}`.toLowerCase().includes(args[2].toLowerCase())) {
                            result.push(" [:regional_indicator_m: " + elm.name + "." + e.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + "?scrollTo=" + e.name + ") ");
                        }
                    }) : null;
                    if (!args[2].includes(".") && elm.name.toLowerCase().includes(args[2].toLowerCase())) {
                        result.unshift(" [:regional_indicator_c: " + elm.name + "](https://discord.js.org/#/docs/discord.js/stable/class/" + elm.name + ") ");
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

client.login("");
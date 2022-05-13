const iconv = require("iconv-lite"),
    { exec } = require("child_process"),
    fs = require("fs"),
    config = require("./../../config.js"),
    psTree = require("ps-tree")

module.exports = async (args, callback) => {
    let ms = ""
    const jv = exec(`${config.paths.java}/java.exe -version`)
    .on("exit", () => {
        ms += "\n";
        const filename = `${args[2].match(/.+class (.+?) \{/) ? args[2].match(/.+class (.+?) \{/)[1] : ""}`;
        if (!filename) {
            return callback("```" + "ファイルからクラス名を検出できませんでした。\n実行を停止します。" + "```");
        }
        fs.writeFileSync(`./proc/${filename}.java`, iconv.encode(args[2], "utf-8"));
        ms += `> javac ./proc/${filename}.java\n`;
        const j = exec(`${config.paths.java}/javac.exe ./proc/${filename}.java -J-Dfile.encoding=UTF-8`);
        const timeout = setTimeout(() => {
            if (!j.connected) {
                psTree(j.pid, (err, child) => {
                    child.forEach(ch => {
                        process.kill(ch.PID);
                    });
                });
                j.removeAllListeners("exit");
                return callback("```プログラムが10秒間終了または応答しなかった為、強制停止しました。```");
            }
        }, 10000);
        j.on("exit", (code) => {
            setTimeout(() => {
                if (code == 0) {
                    ms += `\n> cd ./proc \n/proc> java ${filename}\n`;
                    const j2 = exec(`cd ./proc & ${config.paths.java}/java.exe ${filename} -J-Dfile.encoding=UTF-8`);
                    j2.on("exit", () => {
                        clearTimeout(timeout);
                        fs.unlinkSync("./proc/" + filename + ".java");
                        fs.unlinkSync("./proc/" + filename + ".class");
                        return callback("```" + ms.split("\n").slice(0, 15).join("\n").replace(/akihi/g, "<User>") + `${ms.split("\n").length > 15 ? "\n...more " + (ms.split("\n").length - 15) + " line(s)" : ""}` + "```")
                    });
                    j2.stdout.on("data", (chunk) => {
                        ms += iconv.decode(Buffer.from(chunk), "utf-8");
                    });
                    j2.stderr.on("data", (chunk) => {
                        ms += iconv.decode(Buffer.from(chunk), "utf-8");
                    });
                } else {
                    clearTimeout(timeout);
                    return callback("```" + ms.split("\n").slice(0, 15).join("\n").replace(/akihi/g, "<User>") + `${ms.split("\n").length > 15 ? "\n...more " + (ms.split("\n").length - 15) + " line(s)" : ""}` + "```")
                }
            }, 10);
        })
        .on("error", (e) => {
            console.log(e);
        });
        j.stdout.on("data", (chunk) => {
            ms += iconv.decode(Buffer.from(chunk), "utf-8");
        });
        j.stderr.on("data", (chunk) => {
            ms += iconv.decode(Buffer.from(chunk), "utf-8");
        });
    })
    .on("error", (e) => {
        console.log(e);
    });
    jv.stdout.on("data", (c) => {
        ms += c;
    });
    jv.stderr.on("data", (c) => {
        ms += c;
    });
}
const iconv = require("iconv-lite"),
    { exec } = require("child_process"),
    fs = require("fs"),
    config = require("./../../config.js"),
    psTree = require("ps-tree")

let ms = "";

module.exports = (file, callback) => {
    ms = "node.js ";
    exec(`node --version`)
    .stdout.on("data", (c) => {
        ms += c;
    })
    .on("end", () => {
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
        ms += "\n";
        ms += `> node ./proc/${file}\n`;
        const j = exec(`node ./proc/${file}`);
        j.on("exit", () => {
            fs.unlinkSync("./proc/" + file);
            clearTimeout(timeout);
            return callback("```" + ms.split("\n").slice(0, 15).join("\n").replace(/akihi/g, "<User>") + `${ms.split("\n").length > 15 ? "\n...more " + (ms.split("\n").length - 15) + " line(s)" : ""}` + "```")
        });
        j.on("error", (e) => {
            console.log(e);
        });
        j.stdout.on("data", (chunk) => {
            ms += chunk;
        });
        j.stderr.on("data", (chunk) => {
            ms += chunk;
        });
    });
}
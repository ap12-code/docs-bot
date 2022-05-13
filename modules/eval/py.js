const { exec } = require("child_process"),
    config = require("./../../config.js"),
    psTree = require("ps-tree"),
    fs = require("fs")

module.exports = (file, callback) => {
    ms = `> python ./proc/${file}\n`
    const b = exec(`${config.paths.python}/python.exe ./proc/${file}`);
    const timeout = setTimeout(() => {
        if (!b.connected) {
            psTree(b.pid, (err, child) => {
                child.forEach(ch => {
                    process.kill(ch.PID);
                });
            });
            j.removeAllListeners("exit");
            return callback("```プログラムが10秒間終了または応答しなかった為、強制停止しました。```");
        }
    }, 10000);
    b.on("exit", () => {
        fs.unlinkSync("./proc/" + file);
        clearTimeout(timeout);
        return callback("```" + ms.split("\n").slice(0, 15).join("\n") + `${ms.split("\n").length > 15 ? "\n...more " + (ms.split("\n").length - 15) + " line(s)" : ""}` + "```");
    });
    b.on("error", (e) => {
        console.log(e)
    });
    b.stdout.on("data", (chunk) => {
        // console.log(chunk.toString())
        ms += chunk
    });
    b.stderr.on("data", (chunk) => {
        // console.log(chunk.toString())
        ms += chunk
    });
}
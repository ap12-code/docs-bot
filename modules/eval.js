const java = require("./eval/java"),
    py = require("./eval/py"),
    js = require("./eval/js"),
    fs = require("fs"),
    request = require("request-promise")

module.exports = async (message, args, callback) => {
    let file = "run." + args[1]
    if (message.attachments.first() && ["py", "js", "java"].includes(args[1])) {
        const data = await request.get(message.attachments.first().url);
        file = `${message.attachments.first().name}`;
        fs.writeFileSync(`./proc/${message.attachments.first().name}`, data);
    } else if (!message.attachments.first() && args[1] != "java") {
        fs.writeFileSync("./proc/run." + args[1], args[2]);
    }
    switch (args[1]) {
        case "js":
            js(file, callback);
            break;
        case "py":
            py(file, callback);
            break;
        case "java":
            java(args, callback);
            break;
        default:
            callback("```言語が使用できません。```")
    }
}
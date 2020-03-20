const discord = require("discord.js");
const fs = require("fs");
const config = require("./config.json")

if (!config.token) {
	console.error("Error: Missing token!");
	return;
}

const client = new discord.Client();

for (const file of fs.readdirSync("./modules").filter(file => file.endsWith(".js"))) {
	require(`./modules/${file}`)();
}

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);
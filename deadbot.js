const discord = require("discord.js");
const fs = require("fs");

var client = new discord.Client();

client.config = require("./config.json");
if (!client.config.token) {
	console.error("Error: Missing token!");
	return;
}

if (!client.config.prefix) {
	console.error("Error: Missing prefix!");
	return;
}

client.commands = new discord.Collection();
client.registerChatcommand = function(definition) {
	client.commands.set(command.name, command);
}

for (const file of fs.readdirSync("./modules").filter(file => file.endsWith(".js"))) {
	require(`./modules/${file}`)(client);
}

client.on("message", async message => {
	if (message.author.bot) return;

	const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		command.execute(message, args, client);
	} catch(error) {
		console.error(error);
		message.channel.send(":warning: Yikes, something broke.");
	}
});

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.login(client.config.token);
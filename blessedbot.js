const discord = require("discord.js");
const request = require("request");
const config = require("./config.json")

if (!config.token) {
	console.error("Error: Missing token!");
	return;
}

if (!config.channelID) {
	console.error("Error: Missing channel ID!");
	return;
}

const client = new discord.Client();

function getImage(message) {
    request("https://www.reddit.com/r/Blessed_Images/top.json?count=1&t=day", async function (err, res, body) {
		if (err || res.statusCode != 200) {
            return;
		}

		const post = JSON.parse(body).data.children[0].data;

		const embed = {
			title: post.title,
			url: `https://www.reddit.com${post.permalink}`,
			image: {
				url: post.url
			}
		};

		client.channels.fetch(config.channelID).then((channel) => {
			channel.send({embed: embed});
		});
	});
}

client.once("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);

	let run = false;
	setInterval(() => {
		let date = new Date();
		if (date.getHours() >= 12) {
			if (!run) {
				getImage();
				run = true;
			}
		} else {
			run = false;
		}
	}, 30000);
});

client.login(config.token);
const request = require("request");
const config = require("../config.json");

module.exports = function(client) {
	if (!config.blessed_channel) {
		console.error("Error: Missing blessed_channel config!");
		return;
	}

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

			client.blessed_hook.send({
				username: "BlessedBot",
				avatarURL: config.blessed_avatar,
				embeds: [embed]
			});
		});
	}

	client.once("ready", () => {
		client.channels.fetch(config.blessed_channel).then((channel) => {
			channel.fetchWebhooks().then(hooks => {
				let hook = hooks.find(val => val.owner == client.user);
				if (!hook) {
					channel.createWebhook("BlessedBot", config.blessed_avatar).then(newHook => {
						client.blessed_hook = newHook;
						console.log("Created new relay webhook.");
					});
				} else {
					client.blessed_hook = hook;
				}
			});
		});

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
}
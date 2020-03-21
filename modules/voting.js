module.exports = function(client) {
	let voting = {
		voted: [],
		desc: "",
		yes: 0,
		no: 0,
		abstain: 0,
		recount: false,
		old_topic: "",
	};

	function updateTopic(channel) {
		channel.setTopic(`Current Vote: ${voting.desc} | Aye: ${voting.yes} | Nay: ${voting.no} | Abstain: ${voting.abstain} | Remaining: ${client.config.needed_votes - voting.voted.length}`);
	}

	function finishVote(channel) {
		const results = `Aye: ${voting.yes} | Nay: ${voting.no} | Abstain: ${voting.abstain}`;
		const majority = Math.ceil(client.config.needed_votes / 2);
		let outcome = "";

		if ((voting.yes > majority) || (voting.yes == majority && voting.no < majority)) {
			outcome = "The vote passes!";
		} else if (voting.yes < majority || voting.recount) {
			outcome = "The vote fails!";
			voting.recount = false;
		} else {
			outcome = "Recount required!";
			voting.recount = true;
		}

		channel.send(`Vote results for ${voting.desc}:\n${results}\n**${outcome}**`);

		voting.voted = [];
		voting.yes = 0;
		voting.no = 0;
		voting.abstain = 0;

		if (!voting.recount) {
			channel.setTopic(voting.old_topic);
			voting.desc = "";
			voting.old_topic = "";
		}
	}

	function vote(message, decision) {
		if (voting.desc !== "") {
			if (!voting.voted.includes(message.author.id)) {
				voting.voted.push(message.author.id);
				voting[decision]++;
				message.channel.send("Your vote has been cast! :ballot_box:");

				updateTopic(message.channel);
				if (voting.voted.length == client.config.needed_votes) finishVote(message.channel);
			} else {
				message.channel.send("You have already voted!");
			}
		} else {
			message.channel.send("No vote in progress!");
		}
	}

	const commands = [
		{
			name: "vote",
			usage: "<Description>",
			description: "Start a vote",
			execute: function(message, args) {
				const channel = message.channel;
				if (voting.desc === "") {
					const p = client.config.prefix;
					if (!args[0]) {
						channel.send(`Missing vote proposal! (Usage: \`${p}vote <proposal>\`)`);
						return;
					}
					voting.desc = args.join(" ");
					channel.send(`:ballot_box: ${message.author} has started a vote to ${voting.desc}!\nUse \`${p}aye\`, \`${p}nay\`, or \`${p}abstain\` to cast your vote!`);

					voting.old_topic = channel.topic;
					updateTopic(channel);
				} else {
					channel.send("A vote is already in progress!");
				}
			}
		},
		{
			name: "aye",
			description: "Support a vote.",
			aliases: ["yay", "yes"],
			execute: function(message) {
				vote(message, "yes");
			}
		},
		{
			name: "nay",
			description: "Oppose a vote.",
			aliases: ["no"],
			execute: function(message) {
				vote(message, "no");
			}
		},
		{
			name: "abstain",
			description: "Abstain to a vote.",
			aliases: ["abs"],
			execute: function(message) {
				vote(message, "abstain");
			}
		},
	];

	for (command of commands) {
		client.registerChatcommand(command);
	}
}
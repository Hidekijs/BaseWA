import { msg } from "../lib/simple.js";
import { removeAcents } from "../lib/functions.js";

export async function upsert(sock, m) {
	try {
		m = await msg(sock, m);

		const prefix = "!";
		const isCmd = m.body.startsWith(prefix);
		const command = isCmd ? removeAcents(m.body.slice(1)) : "";

		const args = m.body.trim().split(/ +/).slice(1);
		const text = args.join(" ");
		const senderNumber = m.sender.split("@")[0];
		const botNumber = sock.decodeJid(sock.user.id);

		const isMe = (botNumber === m.sender) || m.fromMe;


		switch(command) {
			case "hola":
				await m.reply(`Hola @${senderNumber} :D`);
			break;
		}
	} catch(e) {
		console.log("Error en messages.upsert: ", e);
	}
};
import Pino from "pino";
import fs from "node:fs";
import { upsert } from "./messages/upsert.js";
import { WAConnection } from "./lib/whatsapp.js";
import { useMultiFileAuthState, makeCacheableSignalKeyStore } from "baileys";

const logger = Pino({ level: "silent" }).child({ level: "silent" });
const { state, saveCreds } = await useMultiFileAuthState("auth_session");

function connectToWA() {
	let sock = WAConnection({
		printQRInTerminal: true,
		logger,
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger)
		},
		generateHighQualityLinkPreview: true,
		browser: [ "Ubuntu", "Edge", "20.0.04" ]
	})

	sock.ev.on("creds.update", saveCreds);

	sock.ev.on("connection.update", ({ qr, connection, lastDisconnect }) => {
		if (qr) console.log("¡Escanee el siguiente QR con su WhatsApp actualizado!");
		if (connection === "close") {
			if (lastDisconnect?.error?.output?.statusCode !== 401) {
				connectToWA();
			} else {
				console.log("¡La sesion esta corrupta!");
				fs.rmSync("auth_session", { recursive: true });
				connectToWA();
			}
		} else if (connection === "open") {
			console.log("Bot iniciado");
		}
	})

	sock.ev.on("messages.upsert", async ({ type, messages }) => {
		if (type === "notify") {
			let m = messages[0];
			if (m.key.remoteJid === "status@broadcast") return;

			if (m.message) {
				m.message = m.message?.ephemeralMessage ? m.message.ephemeralMessage.message : m.message;
				await upsert(sock, m);
			}
		}
	})
}

connectToWA()
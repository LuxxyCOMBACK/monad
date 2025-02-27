require('./config')
const { default: makeWASocket, makeCacheableSignalKeyStore, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, getAggregateVotesInPollMessage, proto, delay } = require("@whiskeysockets/baileys");
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const moment = require('moment-timezone');
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, await, sleep, reSize } = require('./lib/myfunc')
const NodeCache = require("node-cache")
const readline = require("readline")

const store = makeInMemoryStore({
    logger: pino().child({
        level: 'silent',
        stream: 'store'
    })
})

const phoneNumber = ownerNumber;
const welcomeDB = JSON.parse(fs.readFileSync('./database/welcome.json'));
const groupEventDB = JSON.parse(fs.readFileSync('./database/groupevent.json'));
const admineventDB = JSON.parse(fs.readFileSync('./database/adminevent.json'));
const contacts = JSON.parse(fs.readFileSync('./database/contacts.json'));
const usePairingCode = true;
const session = `./lib/${sessionName}`;

const question = (text) => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	return new Promise((resolve) => {
		rl.question(text, resolve)
	});
};

async function startHaruka() {
	const { state, saveCreds } = await useMultiFileAuthState(session);
	const haruka = makeWASocket({
		printQRInTerminal: !usePairingCode,
		syncFullHistory: true,
		markOnlineOnConnect: true,
		connectTimeoutMs: 60000, 
		defaultQueryTimeoutMs: 0,
		keepAliveIntervalMs: 10000,
		generateHighQualityLinkPreview: true, 
		patchMessageBeforeSending: (message) => {
			const requiresPatch = !!(
				message.buttonsMessage 
				|| message.templateMessage
				|| message.listMessage
			);
			if (requiresPatch) {
				message = {
					viewOnceMessage: {
						message: {
							messageContextInfo: {
								deviceListMetadataVersion: 2,
								deviceListMetadata: {},
							},
							...message,
						},
					},
				};
			}

			return message;
		},
		version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
		browser: ["Ubuntu", "Chrome", "20.0.04"],
		logger: pino({ level: 'fatal' }),
		auth: { 
			creds: state.creds, 
			keys: makeCacheableSignalKeyStore(state.keys, pino().child({ 
				level: 'silent', 
				stream: 'store' 
			})), 
		}
	});

	if (!haruka.authState.creds.registered) {
		const phoneNumber = await question('\n\n\nSilahkan masukin nomor Whatsapp Awali dengan 62:\n');
		const code = await haruka.requestPairingCode(phoneNumber.trim())
		console.log(chalk.white.bold(` Kode Pairing Bot Whatsapp kamu :`), chalk.red.bold(`${code}`))
	}
haruka.ev.on('call', async (call) => {
    if (!anticallDB.enabled) return; // Jika AntiCall tidak aktif, abaikan

    for (let caller of call) {
        if (caller.isGroup == false) {
            let user = caller.from;
            console.log(`📞 Panggilan dari ${user}, memblokir...`);
            await haruka.updateBlockStatus(user, "block");
            await haruka.sendMessage(user, { text: "⚠️ Anda telah *diblokir* karena menelpon bot! Kirim pesan ke owner jika ingin dibuka kembali." });
        }
    }
});
	haruka.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

        if (reason === DisconnectReason.badSession) {
            console.log("❌ Aduh, sesi-nya bermasalah nih, kak! Hapus sesi dulu terus coba lagi ya~ 🛠️");
            process.exit();
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log("🔌 Yahh, koneksinya putus... Sabar ya, Mora coba sambungin lagi! 🔄");
            startHaruka();
        } else if (reason === DisconnectReason.connectionLost) {
            console.log("📡 Oops, koneksi ke server hilang, kak! Tunggu bentar, Mora sambungin lagi ya~ 🚀");
            startHaruka();
        } else if (reason === DisconnectReason.connectionReplaced) {
            console.log("🔄 Hmm, sesi ini kayaknya lagi dipakai di tempat lain deh... Coba restart bot-nya ya, kak! 💻");
            process.exit();
        } else if (reason === DisconnectReason.loggedOut) {
            console.log("🚪 Kak, perangkatnya udah keluar... Hapus folder sesi terus scan QR lagi ya! 📲");
            process.exit();
        } else if (reason === DisconnectReason.restartRequired) {
            console.log("🔄 Sebentar ya, Mora lagi mulai ulang koneksinya biar lancar lagi! ♻️");
            startHaruka();
        } else if (reason === DisconnectReason.timedOut) {
            console.log("⏳ Hmm, koneksinya timeout nih, kak! Mora coba sambungin ulang ya~ 🌐");
            startHaruka();
        } else {
            console.log(`❓ Eh, alasan disconnect-nya gak jelas nih, kak... (${reason} | ${connection}) 🤔 Tapi tenang, Mora coba sambungin lagi ya! 💪`);
            startHaruka();
        }
    } else if (connection === "open") {
        console.log(
            chalk.white.bold('\n🎉 Horeee! Berhasil terhubung ke nomor:'),
            chalk.yellow(JSON.stringify(haruka.user, null, 2))
        );
        console.log('✅ Semua sudah siap, kak! Selamat menjalankan bot-nya ya~ 🥳🎈');

        // Mengirim pesan ke nomor 6285655636044
        const nomorTujuan = "6285655636044@s.whatsapp.net"; // Format ID WhatsApp
        function runtime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = "";

    if (hours > 0) {
        result += `${hours} jam`;
    }
    if (minutes > 0) {
        result += (result ? ", " : "") + `${minutes} menit`;
    }
    if (secs > 0 || (!hours && !minutes)) {
        result += (result ? ", " : "") + `${secs} detik`;
    }

    return result;
}

const pesan = `Halo Developer! Bot telah berhasil terhubung! 🎉\n\nBot aktif selama: *${runtime(process.uptime())}*`;

console.log(pesan);

        try {
            await haruka.sendMessage(nomorTujuan, { text: pesan });
            console.log("✅ Pesan berhasil dikirim ke nomor tujuan!");
        } catch (error) {
            console.error("❌ Gagal mengirim pesan:", error);
        }
    }
});

    haruka.ev.on('messages.upsert', async chatUpdate => {
        try {
            const msg = chatUpdate.messages[0]
            if (!msg.message) return
            msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message
            if (msg.key && msg.key.remoteJid === 'status@broadcast'){
                await haruka.readMessages([msg.key]) 
            }

            if (!global.isPublic && !msg.key.fromMe && chatUpdate.type === 'notify') return;
            if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return
            const m = smsg(haruka, msg, store)
            require("./case")(haruka, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })

    haruka.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    haruka.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = haruka.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    haruka.getName = (jid, withoutContact = false) => {
        id = haruka.decodeJid(jid)
        withoutContact = haruka.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = haruka.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === haruka.decodeJid(haruka.user.id) ?
         haruka.user :
         (store.contacts[id] || {})
         return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

haruka.serializeM = (m) => smsg(haruka, m, store)

haruka.ev.on('creds.update', saveCreds)
haruka.ev.on("messages.upsert",() => { })

haruka.sendText = (jid, text, quoted = '', options) => haruka.sendMessage(jid, {
text: text,
...options
}, {
quoted,
...options
})
haruka.sendTextWithMentions = async (jid, text, quoted, options = {}) => haruka.sendMessage(jid, {
text: text,
mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
...options
}, {
quoted
})
haruka.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}

await haruka.sendMessage(jid, {
sticker: {
url: buffer
},
...options
}, {
quoted
})
return buffer
}
haruka.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}

await haruka.sendMessage(jid, {
sticker: {
url: buffer
},
...options
}, {
quoted
})
return buffer
}
haruka.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
// save to file
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

	haruka.ev.on('group-participants.update', async (update) => {
    const { id, author, participants, action } = update;
    try {
        if (!welcomeDB.enabledGroups.includes(id)) return; // Cek apakah welcome aktif di grup ini

        const metadata = await haruka.groupMetadata(id);
        const groupName = metadata.subject;

        const qtext = {
            key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
            message: { "extendedTextMessage": { "text": "[ Group Notification ❗ ]" } }
        };

        for (let n of participants) {
            if (action === 'add') {
                const teks = author !== n 
                    ? `Selamat datang @${n.split('@')[0]}! Kamu telah ditambahkan oleh @${author.split('@')[0]} ke grup *${groupName}*.` 
                    : `Selamat datang @${n.split('@')[0]}! Kamu bergabung melalui link grup *${groupName}*.`;  

                await haruka.sendMessage(id, { text: teks, mentions: [author, n] }, { quoted: qtext });

            } else if (action === 'remove') {
                const teks = author !== n 
                    ? `@${author.split('@')[0]} telah mengeluarkan @${n.split('@')[0]} dari grup *${groupName}*.` 
                    : `@${n.split('@')[0]} telah meninggalkan grup *${groupName}*.`;  

                await haruka.sendMessage(id, { text: teks, mentions: [author, n] }, { quoted: qtext });
            }
        }
    } catch (e) {
        console.error(e);
    }
});
        
   haruka.ev.on('group-participants.update', async (update) => {
    const { id, author, participants, action } = update;
    try {
        if (!admineventDB.enabledGroups.includes(id)) return; // Cek apakah grup ini mengaktifkan Admin Event

        const qtext = {
            key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
            message: { "extendedTextMessage": { "text": "[ Admin Notification ❗ ]" } }
        };

        for (let n of participants) {
            let teks = "";

            if (action === 'promote') {
                teks = author === n 
                    ? `@${n.split('@')[0]} telah *menjadi admin* grup`
                    : `@${author.split("@")[0]} telah *menjadikan* @${n.split('@')[0]} sebagai *admin* grup`;

            } else if (action === 'demote') {
                teks = author === n 
                    ? `@${n.split('@')[0]} telah *berhenti* menjadi *admin*`
                    : `@${author.split("@")[0]} telah *menghentikan* @${n.split('@')[0]} sebagai *admin* grup`;
            }

            if (teks) {
                await haruka.sendMessage(id, {
                    text: teks,
                    mentions: [author, n]
                }, { quoted: qtext });
            }
        }
    } catch (e) {
        console.error(e);
    }
});

haruka.ev.on('groups.update', async (update) => {
    try {
        const res = update[0];

        if (!groupEventDB.enabledGroups.includes(res.id)) return; // Hanya aktif jika Group Event diaktifkan

        const qtext = {
            key: {
                remoteJid: "status@broadcast",
                participant: "0@s.whatsapp.net"
            },
            message: {
                "extendedTextMessage": { "text": "[ 𝗚𝗿𝗼𝘂𝗽 𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 ❗ ]" }
            }
        };

        let participant = res.author || "Admin"; // Jika tidak ada author, gunakan "Admin"

        if (res.announce === true) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🔒 *Oops, Gerbang Grup Ditutup!* 🔒\n\nSekarang cuma *admin* yang bisa ngobrol di sini. Jangan sedih ya, tunggu admin buka lagi! 🥺✨`,
            }, { quoted: qtext });
        } else if (res.announce === false) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🔓 *Yay, Gerbang Grup Terbuka!* 🔓\n\nSekarang semua anggota bebas ngobrol seru lagi di sini. Ayo ramein! 🎉😄`,
            }, { quoted: qtext });
        }

        if (res.restrict === true) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🔐 *Info Grup Dikunci!* 🔐\n\nHanya *admin* yang bisa edit info grup sekarang. Tetap tertib ya! 😇📚`,
            }, { quoted: qtext });
        } else if (res.restrict === false) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🔓 *Info Grup Dibuka!* 🔓\n\nSemua anggota bisa ikut edit info grup. Jangan lupa sopan dan bijak ya! 😊📢`,
            }, { quoted: qtext });
        }

        if (res.desc) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `📝 *Deskripsi Baru Nih!* 📝\n\nGrup ini punya deskripsi baru lho:\n\n${res.desc}\n\nKeren gak? 😍✨`,
            }, { quoted: qtext });
        }

        if (res.subject) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🖊️ *Nama Grup Baru!* 🖊️\n\nSekarang grup kita punya nama baru:\n\n*${res.subject}*\n\nGimana, kece kan? 😎🔥`,
            }, { quoted: qtext });
        }

        if (res.memberAddMode === true) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🛡️ *Tambah Anggota? Tertutup Dulu!* 🛡️\n\nSekarang cuma *admin* yang bisa nambah anggota baru. Yuk, patuhi aturan ya! 👀✨`,
            }, { quoted: qtext });
        } else if (res.memberAddMode === false) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `✅ *Tambah Anggota Bebas!* ✅\n\nSekarang semua anggota bisa ngajak teman-temannya masuk grup ini. Ayo tambah rame! 🥳🎈`,
            }, { quoted: qtext });
        }

        if (res.joinApprovalMode === true) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `🛡️ *Pintu Masuk Dijaga Ketat!* 🛡️\n\nCalon anggota baru harus dapet *persetujuan admin* dulu ya sebelum bisa gabung. Tetap aman dan tertib! 🤝🔒`,
            }, { quoted: qtext });
        } else if (res.joinApprovalMode === false) {
            await sleep(2000);
            haruka.sendMessage(res.id, {
                text: `✅ *Pintu Masuk Terbuka Lebar!* ✅\n\nAnggota baru bisa langsung gabung tanpa nunggu persetujuan admin. Yuk, tambah rame di sini! 🎊😊`,
            }, { quoted: qtext });
        }

    } catch (e) {
        console.error(e);
    }
});

haruka.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await (const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

return buffer
}
}
return startHaruka()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("Socket connection timeout")) return
if (e.includes("item-not-found")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})
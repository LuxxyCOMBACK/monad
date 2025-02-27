const fs = require('fs')
const chalk = require('chalk')
const { version } = require("./package.json")

global.ownerNumber = '6285655636044';
global.ownerName = '©Luxxy.core';
global.botName = '©Luxxy.core';

global.packName = '©by';
global.author = 'Luxxy.core';
global.themeemoji = '🧩';
global.footer = 'TH-AI';
global.prefa = ['.'];

global.website = 'https://jangan lupa join saluran';
//masukan id ch mu ketik dibot .idch
global.saluran = '120363393132770871@newsletter'
//nama ch/nama saluran lu
global.saluranName = 'INFO BOT STIKER BRAT'
global.versi = version
//untuk fitur .chat
global.idch = "120363385593347079@newsletter"
global.sessionName = '.sampah';

global.isPublic = true

global.mess = {
	admin: 'Fitur ini khusus buat admin aja ya, Kak! 🫢',
	botAdmin: 'TH-Ai harus jadi admin dulu biar bisa jalanin ini! 😭',
	done: 'Sudah selesai! ✨',
	error: 'Eh, ada yang salah nih... coba lagi ya, Kak! 😖',
	group: 'Eits, fitur ini cuma bisa dipakai di grup~ 🫡',
	noCmd: 'Hmm... perintahnya gak ada di daftar Mora nih. Coba cek lagi ya, Kak! 🤔',
	nsfw: 'Fitur NSFW dimatikan di grup ini, coba minta izin ke admin dulu ya~ 🫣',
	owner: 'Hanya pemilik bot yang dapat menggunakan perintah ini!',
	premium: 'Fitur ini khusus pengguna premium 🌟! Mau upgrade? Hubungi kami di wa.me/6285655636044',
	success: 'Yeay, berhasil! 🎉',
	wait: 'Tunggu sebentar ya, Kak... Luxxy lagi proses nih! ⏳🤗'
};

global.thumb = fs.readFileSync('./Media/TH-AI.png');
global.thumbUrl = 'https://files.catbox.moe/y95cgr.jpg';

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update'${__filename}'`))
delete require.cache[file]
require(file)
})
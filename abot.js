require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const express = require('express');

// 🛑 1. TRẠM GÁC RENDER
const app = express();
app.get('/', (req, res) => res.send('Ám Vệ Quách Linh Chi đang canh gác Tiêu Dao Các!'));
app.listen(process.env.PORT || 3000, () => console.log('Trạm gác đã lên sóng!'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// 🛑 THIẾT LẬP ID LÃNH ĐỊA & QUYỀN LỰC
const PREFIX = 'tn';
const ROLE_TU_NHAN_ID = '1537469644993208412';   // Role Hắc Địa Lao
const ROLE_TAP_DICH_ID = '1550432222027321374'; // Role Tạp Dịch
const CATEGORY_TIEU_DAO_ID = '1369689684997050431'; // ID bị nghi là sai

// Bộ nhớ đệm giữ dữ liệu
const activeJails = new Map(); 
const laborQuotas = new Map(); 

// 🛑 KHO VĂN TẾ
const vanTe = [
    "Ê {user}, nghe đồn nếp nhăn trên não ngươi còn ít hơn số lần ngươi được người khác khen ngợi trong đời.",
    "Tiết kiệm tiền ăn sáng của mẹ mấy tháng mới thuê được cái tool rách này thế nhóc {user}? Mỏi tay chưa?",
    "Sự tồn tại của {user} trong server này đúng là minh chứng cho việc: Không phải ai có bàn phím cũng biết cách làm người.",
    "Nếu sự thiếu hiểu biết mà có thể phát điện, chắc {user} đủ sức thắp sáng cả cái server này rồi đấy.",
    "Tưởng hacker thế nào, hóa ra {user} cũng chỉ là linh trưởng múa phím dọa khỉ. Uống sữa rồi đi ngủ đi mai còn đi học.",
    "Mỗi lần {user} gõ phím, ta lại thấy xót xa cho những nơ-ron thần kinh đang phải chết mòn vì cố hiểu logic của ngươi.",
    "Chắc hồi bé {user} bị rơi mất sách Đạo Đức, giờ lớn lên mới hành xử như một hệ điều hành bị lỗi win thế này.",
    "Khóc to lên {user}! Gào thét đi! Ở trong này vách cách âm tốt lắm, gõ gãy bàn phím cũng chẳng ai thèm đọc đâu."
];

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    // 🛑 KIỂM TRA LÃNH ĐỊA (ĐÃ LẮP THÊM MÁY ÉP CUNG)
    if (message.channel.parentId !== CATEGORY_TIEU_DAO_ID) {
        if (['phattu', 'thathu', 'hardmode', 'tu'].some(cmd => message.content.includes(cmd))) {
            return message.reply(`❌ Sai ID Danh Mục rồi Lão Bản ơi!\n- ID Lão Bản cài trong code: \`${CATEGORY_TIEU_DAO_ID}\`\n- ID THỰC TẾ của khu vực này là: **\`${message.channel.parentId}\`**\n👉 Lão Bản copy cái dãy số in đậm kia, chèn lại vào dòng số 20 trong file abot.js là code chạy mượt luôn!`);
        }
        return; 
    }

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase(); 

    // ==========================================
    // KHU VỰC 1: DÀNH CHO TỘI NHÂN (TỰ GÕ LỆNH)
    // ==========================================
    if (['laudon', 'xamhoi'].includes(command)) {
        if (!laborQuotas.has(message.author.id)) {
            return message.reply("Ngươi có tội tình gì đâu mà giành việc quét rác? Rảnh quá thì ra sảnh uống trà đi!");
        }

        let count = laborQuotas.get(message.author.id);
        count -= 1; 

        if (count > 0) {
            laborQuotas.set(message.author.id, count);
            return message.reply(`🧹 Đã quét xong 1 chổi! Ngươi còn nợ **${count} lần** nữa mới được thả! Cố lên con trai!`);
        } else {
            laborQuotas.delete(message.author.id);
            await message.member.roles.remove(ROLE_TAP_DICH_ID);
            return message.channel.send(`🕊️ Lão Bản ân chuẩn! <@${message.author.id}> đã cải tà quy chính, rửa sạch nghiệp chướng, chính thức được tháo gông!`);
        }
    }

    // ==========================================
    // KHU VỰC 2: DÀNH CHO LÃO BẢN (ADMIN)
    // ==========================================
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return message.reply("Cút! Trình độ tép riu mà đòi xài ấn lệnh của Lão Bản à?");
    }

    const targetMember = message.mentions.members.first();
    if (!targetMember) return message.reply("Mắt để trưng à? Phải ping (tag) xanh lè cái thằng tội đồ vào lệnh chứ!");

    try {
        if (command === 'tu') {
            const amount = parseInt(args[1]) || 50; 
            await targetMember.roles.add(ROLE_TAP_DICH_ID);
            laborQuotas.set(targetMember.id, amount);
            return message.channel.send(`🧹 Đã tống <@${targetMember.id}> vào Tạp Dịch Phòng! \nPhạt gõ lệnh \`tnlaudon\` hoặc \`tnxamhoi\` đủ **${amount} lần** mới được Lão Bản tha mạng! Bắt đầu đi con!`);
        }
        if (command === 'phattu') {
            await targetMember.roles.add(ROLE_TU_NHAN_ID);
            return message.channel.send(`⛓️ Đã gông cổ tống <@${targetMember.id}> vào Hắc Địa Lao! Hết đường múa mép!`);
        }
        if (command === 'thathu') {
            await targetMember.roles.remove(ROLE_TU_NHAN_ID);
            await targetMember.roles.remove(ROLE_TAP_DICH_ID);
            
            if (activeJails.has(targetMember.id)) {
                clearInterval(activeJails.get(targetMember.id));
                activeJails.delete(targetMember.id);
            }
            if (laborQuotas.has(targetMember.id)) laborQuotas.delete(targetMember.id);
            
            return message.channel.send(`🕊️ Lão Bản từ bi đặc xá, đã mở gông tha mạng cho <@${targetMember.id}>. Liệu hồn mà sống!`);
        }
        if (command === 'hardmode') {
            const action = args[0]; 
            if (action === 'on') {
                if (activeJails.has(targetMember.id)) return message.reply("Nó đang bị chửi vuốt mặt không kịp rồi!");
                message.channel.send(`🔥 BẬT MODE HỦY DIỆT! Chào mừng <@${targetMember.id}> đến với Lôi Đài!`);
                const intervalId = setInterval(() => {
                    const cauChui = vanTe[Math.floor(Math.random() * vanTe.length)].replace('{user}', `<@${targetMember.id}>`);
                    message.channel.send(cauChui);
                }, 3000); 
                activeJails.set(targetMember.id, intervalId);
            } else if (action === 'off') {
                if (!activeJails.has(targetMember.id)) return message.reply("Nó có bị xích đâu mà thả?");
                clearInterval(activeJails.get(targetMember.id));
                activeJails.delete(targetMember.id);
                message.channel.send(`Đã thu công lực, ngừng vả mõm <@${targetMember.id}>. Sống sao cho bớt rác đi con!`);
            }
        }
    } catch (error) {
        console.error(error); 
        message.channel.send(`⚠️ **Lỗi:** ${error.message}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
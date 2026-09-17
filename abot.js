require('dotenv').config();

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const express = require('express');

// 🛑 1. TRẠM GÁC ĐỂ BOT KHÔNG NGỦ TRÊN RENDER
const app = express();
app.get('/', (req, res) => res.send('Ám Vệ đang canh gác! Thằng nào ho he là vả mõm ngay!'));
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => console.log(`Trạm gác Ám Vệ đã lên sóng cổng ${port}!`));

// 🛑 2. KHỞI TẠO ÁM VỆ
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Cuốn sổ tử thần: Ghi nhớ những thằng đang bị spam để còn biết mà tắt
const activeJails = new Map();

// 🛑 3. KHO VĂN TẾ ĐÁ XÉO TÂM LÝ (KHÔNG CHỬI BẬY - NÉ BOT DISCORD)
const vanTe = [
    "Ê {user}, bộ não của ngươi chắc được bảo quản trong lồng kính kỹ lắm nhỉ, vì có vẻ từ lúc đẻ ra chưa từng được đem ra sử dụng.",
    "Tiết kiệm tiền ăn sáng của mẹ mấy tháng mới thuê được cái tool rách này thế nhóc {user}? Mỏi tay chưa?",
    "{user} à, sự tồn tại của ngươi trong server này đúng là minh chứng hùng hồn cho việc: Không phải ai có bàn phím cũng biết cách làm người.",
    "Gào to lên {user}! Khóc to nữa lên! Ở trong cái chuồng này vách cách âm tốt lắm. Cứ tận hưởng sự bất lực đi con.",
    "Tưởng hacker thế nào, hóa ra {user} cũng chỉ là linh trưởng múa phím dọa khỉ. Uống sữa rồi đi ngủ đi mai còn đi học.",
    "Thật sự quan ngại cho hệ sinh thái khi phải chia sẻ oxy với một cá thể tiến hóa lùi như {user}.",
    "Nhìn {user} gõ phím mà ta thấy tội nghiệp thay cho cái bàn phím. Mất công sản xuất ra lại để cho một đứa không có tư duy sử dụng."
];

client.on('messageCreate', async (message) => {
    // Bỏ qua tin nhắn của bot khác kẻo 2 con bot tự chửi nhau
    if (message.author.bot) return;

    // 🛑 4. LỆNH CHẾT CHÓC: tnhardmode
    if (message.content.startsWith('tnhardmode')) {
        
        // KIỂM TRA QUYỀN LỰC: Chỉ những người có quyền "Manage Server" (Lão Bản & Admin) mới được xài lệnh này
        if (!message.member?.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply("Trình độ tép riu mà đòi cầm lệnh bài của Lão Bản à? Cút về sảnh chính!");
        }

        const args = message.content.split(' ');
        const command = args[1]; // 'on' hoặc 'off'
        const targetMember = message.mentions.members.first();

        if (!targetMember) return message.reply("Mắt để trưng à? Phải tag cái thằng cần xích vào lệnh chứ!");

        try {
            // BẬT CHẾ ĐỘ ĐỤNG LÀ CHẠM
            if (command === 'on') {
                if (activeJails.has(targetMember.id)) {
                    return message.reply("Thằng này đang bị treo mỏ rồi, xích gì tới 2 lần?");
                }

                message.channel.send(`⛓️ Đã gông cổ thằng ranh con <@${targetMember.id}>! Bắt đầu tụng kinh siêu độ!`);

                // (LÃO BẢN LƯU Ý: Nếu muốn gán role Tù Nhân, ngài bỏ // ở dòng dưới và điền ID role vào)
                // await targetMember.roles.add('ĐIỀN_ID_ROLE_TÙ_NHÂN_VÀO_ĐÂY');

                // Bắt đầu nhịp điệu tra tấn tâm lý (3 giây 1 nhát để né Anti-Spam của Discord)
                const intervalId = setInterval(() => {
                    // Random 1 câu chửi và gắn tag tên nạn nhân
                    const cauChui = vanTe[Math.floor(Math.random() * vanTe.length)].replace('{user}', `<@${targetMember.id}>`);
                    message.channel.send(cauChui);
                }, 3000); 

                // Ghi tên nó vào Sổ Tử Thần
                activeJails.set(targetMember.id, intervalId);

            } 
            // TẮT CHẾ ĐỘ THA MẠNG
            else if (command === 'off') {
                if (!activeJails.has(targetMember.id)) {
                    return message.reply("Nó có bị xích đâu mà thả? Ngáo à?");
                }

                // Dừng vòng lặp spam
                clearInterval(activeJails.get(targetMember.id));
                activeJails.delete(targetMember.id);
                
                // (LÃO BẢN LƯU Ý: Nếu lúc nãy có add role Tù Nhân, thì giờ gỡ ra ở đây)
                // await targetMember.roles.remove('ĐIỀN_ID_ROLE_TÙ_NHÂN_VÀO_ĐÂY');

                message.channel.send(`Đã ngừng vả mõm <@${targetMember.id}>. Sống sao cho bớt rác đi con!`);
            }
        } catch (error) {
            // 🛑 5. KHI LỖI XẢY RA CŨNG PHẢI CHỬI
            console.error(error); // Ghi log ngầm
            message.channel.send(`Đờ mờ, thằng ranh này mọc lông mọc cánh hay sao mà xích đéo đứt! \n⚠️ **Lỗi hệ thống:** ${error.message} \nLão Bản đợi xíu, để tui mài lại dao rồi vả nó sau!`);
        }
    }
});

process.on('uncaughtException', (error) => {
    console.error('⚠️ uncaughtException:', error);
});

process.on('unhandledRejection', (reason) => {
    console.error('⚠️ unhandledRejection:', reason);
});

client.on('error', (error) => {
    console.error('⚠️ Discord client error:', error);
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error('❌ Thiếu DISCORD_TOKEN trong file .env hoặc biến môi trường của máy chủ.');
    server.close();
    process.exitCode = 1;
} else {
    client.login(token).catch((error) => {
        console.error('❌ Không thể đăng nhập Discord:', error.message);
        server.close();
        process.exitCode = 1;
    });
}

const shutdown = async (signal) => {
    console.log(`Đang tắt Ám Vệ (${signal})...`);
    for (const intervalId of activeJails.values()) {
        clearInterval(intervalId);
    }
    activeJails.clear();
    client.destroy();
    server.close(() => process.exit(0));
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
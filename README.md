# Am Ve Discord Bot

Bot Discord moderation dùng `discord.js` và Express.

## Chạy local

1. Cài Node.js 18.17 trở lên.
2. Điền token vào `.env`:

   ```env
   DISCORD_TOKEN=token_cua_bot
   PORT=3000
   ```

3. Cài dependency và chạy bot:

   ```bash
   npm ci
   npm start
   ```

Không commit file `.env`. File này đã được thêm vào `.gitignore`.

## Discord Developer Portal

Trong phần **Bot > Privileged Gateway Intents**, bật **Message Content Intent**. Bot cần quyền đọc tin nhắn, gửi tin nhắn và thêm reaction nếu mở rộng chức năng sau này.

## GitHub Actions

Workflow tại `.github/workflows/node.yml` tự chạy `npm ci` và kiểm tra cú pháp khi push hoặc mở pull request vào `main`. Token Discord không cần đưa vào workflow kiểm tra; khi cần deploy, lưu token trong **Settings > Secrets and variables > Actions** với tên `DISCORD_TOKEN`.
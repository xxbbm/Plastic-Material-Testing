# VPS 部署指南

## 部署架构

```
用户浏览器 → Nginx (80/443端口, SSL) → Next.js (localhost:3000) → DeepSeek API
                                                           → data/*.json
                                           PM2 进程守护，崩溃自动重启
```

---

## 准备工作

### 1. 服务器要求

- Ubuntu 20.04+ / CentOS 7+ / Debian 11+
- 1核 1G 内存起步（Next.js 构建需要 1G 以上内存，不够的话在本地构建好再传）
- 推荐：腾讯云/阿里云轻量应用服务器，几十块/月

### 2. 域名（可选）

有域名可以配 SSL。没有的话直接用 IP 访问。

### 3. 安装 Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # 确认 >= 18
```

---

## 部署步骤

### Step 1: 上传项目

把本地打包好的 zip 传到服务器：

```bash
# 本地执行
scp plastic-material-id.zip root@你的服务器IP:/opt/

# 服务器上执行
cd /opt
unzip plastic-material-id.zip -d plastic-material-id
cd plastic-material-id
```

### Step 2: 创建环境变量

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_DEEPSEEK_API_KEY=你的真实Key
ADMIN_PASSWORD=你的后台口令
EOF
```

### Step 3: 安装依赖 + 构建

```bash
npm install
npm run build
```

### Step 4: 安装 PM2（进程守护）

```bash
npm install -g pm2

# 启动应用
pm2 start npm --name "plastic-id" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### Step 5: 验证

```bash
curl http://localhost:3000
# 有 HTML 返回就对了
```

---

## 安装 Nginx（可选但推荐）

### 安装

```bash
sudo apt install -y nginx
```

### 配置反向代理

```bash
sudo nano /etc/nginx/sites-available/plastic-id
```

写入：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 上传文件大小限制（拍照存样）
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/plastic-id /etc/nginx/sites-enabled/
sudo nginx -t          # 检查配置
sudo systemctl reload nginx
```

---

## 配置 SSL（有域名的话）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

---

## 安全加固

### 1. 隐藏 API Key

当前 DeepSeek Key 用了 `NEXT_PUBLIC_` 前缀暴露在浏览器端。生产环境建议改为服务端中转：

创建 `app/api/chat/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.DEEPSEEK_API_KEY  // 不用 NEXT_PUBLIC_ 前缀
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: body.messages,
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  const data = await response.json()
  return NextResponse.json(data)
}
```

然后修改 `lib/deepseek.ts` 的 `BASE_URL` 指向 `/api/chat`，`.env.local` 改为用 `DEEPSEEK_API_KEY`（不带前缀）。

### 2. 设防火墙

```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

### 3. data 目录写权限

```bash
chmod 755 data/
chmod 644 data/*.json
```

---

## 更新部署

以后代码有更新：

```bash
# 本地打包
zip -r plastic-material-id.zip . -x "node_modules/*" ".next/*" ".git/*"

# 上传到服务器
scp plastic-material-id.zip root@服务器IP:/opt/

# 服务器上执行
cd /opt/plastic-material-id
pm2 stop plastic-id
unzip -o /opt/plastic-material-id.zip -d .
npm install
npm run build
pm2 start plastic-id
```

---

## 常用命令

```bash
pm2 status              # 查看运行状态
pm2 logs plastic-id     # 查看日志
pm2 restart plastic-id  # 重启
pm2 stop plastic-id     # 停止

nginx -t                # 检查 Nginx 配置
systemctl restart nginx # 重启 Nginx
```

---

## 成本估算

| 项目 | 配置 | 月费用 |
|------|------|--------|
| 腾讯云轻量 | 2核2G | ~50元 |
| 阿里云轻量 | 2核1G | ~60元 |
| 域名 | .com/.cn | ~5元/月均摊 |
| DeepSeek API | 免费额度 | 0元 |

总月成本约 50-60 元，首次部署耗时约 30 分钟。

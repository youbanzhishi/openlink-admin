# openlink-admin 部署指南

> 静态HTML管理后台，部署到任意静态托管服务

## 部署方式

### 方式一：Cloudflare Pages（推荐）

1. 登录 Cloudflare Dashboard
2. 进入 Pages → Create a project
3. 选择 GitHub，授权仓库 `youbanzhishi/openlink-admin`
4. 设置：
   - Production branch: `main`
   - Build command: (留空)
   - Output directory: (留空)
5. 点击 Save and Deploy

**访问地址**：`https://openlink-admin.pages.dev`

### 方式二：Vercel

```bash
npm i -g vercel
cd openlink-admin
vercel --prod
```

### 方式三：GitHub Pages

1. 进入仓库 Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Save

**访问地址**：`https://youbanzhishi.github.io/openlink-admin/`

### 方式四：自建 Nginx

```bash
# 方式A：克隆部署
git clone https://github.com/youbanzhishi/openlink-admin.git /var/www/openlink-admin
# 配置nginx
server {
    listen 80;
    server_name admin.openlink.example.com;
    root /var/www/openlink-admin;
    index index.html;
}
```

## 配置说明

首次使用需要配置 API 地址：

1. 打开管理后台
2. 进入「系统设置」
3. 填写 API Base URL（如 `http://localhost:3000` 或外网地址）
4. 填写 API Key
5. 保存

## 环境要求

- 任意静态Web服务器
- 现代浏览器（支持ES6+）
- 无需后端环境

## 注意事项

- 管理后台与后端分离部署，通过API通信
- 确保后端已配置CORS允许管理后台域名

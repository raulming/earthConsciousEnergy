# 蓝星能量星图

一个用于展示蓝星意识能量里程碑、重大突破与五项核心准则的星际主题站点。访客只读，默认管理员账号 `admin` 登录后可新增或删除共享进度。

## 本地开发

环境要求：Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

常用命令：

- `npm run build`：生成生产构建。
- `npm test`：运行权限与页面结构回归测试。
- `npm run lint`：运行代码检查。
- `npm run db:generate`：数据库结构变化后生成迁移。

## 数据与权限

- 进度记录保存在 D1 兼容数据库中。
- 密码使用 PBKDF2-SHA-256 哈希保存，不存储明文。
- 管理会话使用 HttpOnly、Secure、SameSite=Strict Cookie。
- `ADMIN_SETUP_TOKEN` 只用于首次设置管理员密码。
- `ADMIN_SESSION_SECRET` 用于签署管理会话，必须为高强度随机值。

## 部署

- OpenAI Sites 部署继续使用 `.openai/hosting.json`。
- 自有 Linux 服务器部署请阅读 [自有服务器部署说明](./自有服务器部署说明.md)。

自托管配置包括 Node.js 源码构建、本地 D1 持久化、systemd 服务以及 Nginx 反向代理示例。

# MagicStream

MagicStream 是一个前后端分离的全栈示例项目：

- 后端：Go + Gin
- 前端：React + Vite
- 数据库：MongoDB
  

## 目录说明

- `Server/MagicStreamServer`：Go API 服务
- `Client/magic-stream-client`：React 前端
- `magic-stream-seed-data`：MongoDB 初始化数据
- `docker-compose.yml`：本地和服务器统一编排入口
- `.github/workflows/ci-cd.yml`：CI/CD 流水线

## Docker 部署

### 1. 准备环境变量

在仓库根目录复制一份环境变量文件：

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

至少需要按实际情况修改这些值：

- `SECRET_KEY`
- `SECRET_REFRESH_KEY`
- `OPENAI_API_KEY`
- `ALLOWED_ORIGINS`
- `VITE_API_BASE_URL`
- `BACKEND_IMAGE`
- `FRONTEND_IMAGE`

说明：

- 本地使用 Docker Compose 时，`MONGODB_URI` 默认就是 `mongodb://mongodb:27017`
- 前端在容器里是静态文件，调用 API 的地址通过 `VITE_API_BASE_URL` 构建进去
- 如果只做本地验证，`BACKEND_IMAGE` 和 `FRONTEND_IMAGE` 可以保持默认值
- 如果要在服务器上通过 GHCR 拉取镜像，改成对应的 `ghcr.io/<owner>/magicstream-backend:latest` 和 `ghcr.io/<owner>/magicstream-frontend:latest`

### 2. 本地启动

只启动前端、后端、MongoDB：

```bash
docker compose up -d --build
```

如果还想一并导入仓库里的测试数据：

```bash
docker compose --profile seed up -d --build
```

启动完成后：

- 前端：http://localhost
- 后端：http://localhost:8080/health
- MongoDB：localhost:27017

### 3. 停止服务

```bash
docker compose down
```

如果要连同数据库卷一起删除：

```bash
docker compose down -v
```

## 容器设计

### 后端镜像

- 基于 `golang:1.24-alpine` 多阶段构建
- 产出单一 Go 二进制
- 容器内监听 `8080`

### 前端镜像

- 基于 `node:22-alpine` 构建
- 使用 `nginx:alpine` 提供静态资源
- 已配置 SPA 路由回退，刷新页面不会 404

### 数据库

- 直接使用 `mongo:8.0`
- `mongo-seed` 服务是可选 profile
- 只有在显式指定 `--profile seed` 时才导入种子数据，避免覆盖生产数据

## GitHub Actions CI/CD

工作流文件：[`/.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml)

### CI 做什么

在 `push` 和 `pull_request` 时执行：

1. `go test ./...`
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `docker compose config` 校验编排文件

### CD 做什么

在 `main` 分支推送，或手动触发 `workflow_dispatch` 时：

1. 构建后端镜像
2. 构建前端镜像
3. 推送到 GitHub Container Registry（GHCR）
4. 可选通过 SSH 登录服务器执行 `docker compose pull && docker compose up -d`

## 需要配置的 GitHub 仓库变量和 Secrets

### Repository Variables

- `VITE_API_BASE_URL`
  说明：前端生产构建时注入的 API 地址，例如 `http://your-server-ip:8080`
- `ENABLE_DEPLOY`
  说明：设置为 `true` 时才会执行 SSH 部署阶段

### Repository Secrets

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PORT`
- `DEPLOY_PATH`
- `GHCR_PULL_USERNAME`
- `GHCR_PULL_TOKEN`

说明：

- `GHCR_PULL_TOKEN` 需要至少具备 `read:packages`
- 服务器上的 `DEPLOY_PATH` 应该指向这个仓库的部署目录
- 这个目录里需要有 `.env` 和 `docker-compose.yml`

## 推荐的服务器部署步骤

第一次在服务器上部署时：

1. 安装 Docker 和 Docker Compose
2. 克隆仓库到部署目录
3. 复制 `.env.example` 为 `.env`
4. 修改 `.env` 中的镜像名、域名、密钥和 API Key
5. 先手动执行一次：

```bash
docker compose pull
docker compose up -d
```

之后只要 GitHub Actions 的 deploy job 被触发，服务器就会自动拉取新镜像并更新容器。

## 适合这个项目的最简流程

如果你想先跑通，不需要一开始就上 K8s 或复杂平台，建议直接按下面这条线：

1. 本地开发继续用当前前后端目录结构
2. 用 `docker compose` 做统一部署
3. 用 GitHub Actions 做 CI
4. 镜像推到 GHCR
5. 服务器用 SSH + `docker compose pull && up -d` 做 CD

这套方案对当前项目已经够用，而且后续迁移到阿里云、腾讯云、AWS、Railway、Render 或自建 Linux 主机都比较顺滑。

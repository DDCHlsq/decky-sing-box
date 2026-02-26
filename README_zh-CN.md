# Sing-Box Manager - Steam Deck Decky 插件

一个功能完整的 Decky Loader 插件，用于在 Steam Deck 上管理 sing-box 网络代理服务。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> [English README](README.md) | [中文文档](README_zh-CN.md)

## 功能特性

- **服务控制**: 启动、停止和重启 sing-box 服务
- **配置管理**: 从任意 URL 下载配置文件
- **节点选择**: 浏览并选择代理节点
- **实时状态**: 服务状态实时监控
- **快速访问**: 集成到 Steam Deck 的快速访问菜单

## 系统要求

- 已安装 Decky Loader 的 Steam Deck
- Python 3.8+（Steam Deck 已预装）
- sing-box 二进制文件（提供安装脚本）
- Node.js 18+（用于构建插件）

## 安装

### 快速安装

1. 克隆此仓库：
   ```bash
   git clone https://github.com/DDCHlsq/decky-sing-box.git
   cd decky-sing-box
   ```

2. 构建插件：
   ```bash
   npm install
   npm run build
   ```

3. 在 Steam Deck 上运行安装脚本：
   ```bash
   ./scripts/install.sh
   ```

4. 安装 sing-box（如未安装）：
   ```bash
   ./scripts/install-singbox.sh
   ```

### 手动安装

1. **安装 sing-box**：

   从 AUR 安装：
   ```bash
   yay -S sing-box
   ```

   或下载 [官方二进制文件](https://github.com/SagerNet/sing-box/releases)：
   ```bash
   wget https://github.com/SagerNet/sing-box/releases/download/v1.8.0/sing-box-1.8.0-linux-amd64.tar.gz
   tar -xzf sing-box-1.8.0-linux-amd64.tar.gz
   sudo mv sing-box-1.8.0-linux-amd64/sing-box /usr/local/bin/
   sudo chmod +x /usr/local/bin/sing-box
   ```

2. **复制插件文件**：
   ```bash
   # 使用 npm run build 构建后
   cp -r dist/* /home/deck/homebrew/plugins/singbox-manager/
   ```

3. **安装后端**：
   ```bash
   mkdir -p /home/deck/.config/singbox-manager
   cp backend/main.py /home/deck/.config/singbox-manager/
   pip install fastapi uvicorn pydantic --user
   ```

4. **安装 systemd 服务**：
   ```bash
   sudo cp systemd/sing-box.service /etc/systemd/system/
   sudo cp systemd/singbox-manager.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable singbox-manager
   sudo systemctl start singbox-manager
   ```

5. **安装 polkit 规则**：
   ```bash
   sudo cp systemd/50-singbox-manager.polkit /usr/share/polkit-1/rules.d/
   ```

## 使用方法

1. **打开插件**：按 Steam 按钮 → 快速访问 → Sing-Box Manager

2. **下载配置**：
   - 进入 "配置" 标签页
   - 输入你的 sing-box 配置 URL
   - 点击 "下载配置" 按钮

3. **选择节点**：
   - 进入 "节点" 标签页
   - 选择你偏好的代理节点

4. **启动服务**：
   - 进入 "状态" 标签页
   - 点击 "启动服务" 按钮

## 项目结构

```
decky-sing-box/
├── src/
│   ├── index.tsx              # 插件入口和主界面
│   ├── components/
│   │   ├── StatusCard.tsx     # 服务状态显示
│   │   ├── Settings.tsx       # 配置设置
│   │   └── NodeSelector.tsx   # 节点选择界面
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   └── utils/
│       ├── api.ts             # 后端 API 客户端
│       └── decky.ts           # Decky API 工具
├── backend/
│   └── main.py                # FastAPI 后端服务
├── systemd/
│   ├── sing-box.service       # sing-box systemd 服务
│   ├── singbox-manager.service # 后端服务
│   ├── singbox-manager.desktop # 桌面入口
│   └── 50-singbox-manager.polkit # Polkit 规则
├── scripts/
│   ├── install.sh             # 安装脚本
│   ├── uninstall.sh           # 卸载脚本
│   └── install-singbox.sh     # sing-box 安装器
├── plugin.json                # 插件元数据
├── package.json
├── tsconfig.json
└── webpack.config.ts
```

## API 参考

后端服务在 `http://localhost:5555` 上暴露以下端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 健康检查 |
| `/status` | GET | 获取服务状态 |
| `/start` | POST | 启动 sing-box 服务 |
| `/stop` | POST | 停止 sing-box 服务 |
| `/restart` | POST | 重启 sing-box 服务 |
| `/config/fetch` | POST | 从 URL 下载配置 |
| `/config/nodes` | GET | 获取可用节点列表 |
| `/config/select` | POST | 选择代理节点 |
| `/config/logs` | GET | 获取服务日志 |
| `/singbox/version` | GET | 获取 sing-box 版本 |

## 配置路径

| 文件 | 路径 |
|------|------|
| 插件目录 | `/home/deck/homebrew/plugins/singbox-manager/` |
| sing-box 配置 | `/home/deck/.config/sing-box/config.json` |
| 后端服务 | `/home/deck/.config/singbox-manager/` |
| 后端日志 | `journalctl -u singbox-manager -f` |
| sing-box 日志 | `journalctl -u sing-box -f` |

## 故障排除

### 插件未在快速访问菜单中显示

1. 重启 Steam UI：
   ```bash
   systemctl restart steam
   ```

2. 查看 Decky Loader 日志：
   ```bash
   journalctl -u decky-loader -f
   ```

### 后端服务未运行

1. 检查服务状态：
   ```bash
   systemctl status singbox-manager
   ```

2. 查看日志：
   ```bash
   journalctl -u singbox-manager -f
   ```

3. 重启服务：
   ```bash
   sudo systemctl restart singbox-manager
   ```

### sing-box 无法启动

1. 验证配置：
   ```bash
   sing-box check -c /home/deck/.config/sing-box/config.json
   ```

2. 查看日志：
   ```bash
   journalctl -u sing-box -f
   ```

### 连接被拒绝错误

确保后端服务正在运行：
```bash
sudo systemctl start singbox-manager
```

测试 API：
```bash
curl http://localhost:5555/health
```

## 卸载

运行卸载脚本：
```bash
./scripts/uninstall.sh
```

或手动卸载：
```bash
# 停止服务
sudo systemctl stop singbox-manager sing-box
sudo systemctl disable singbox-manager sing-box

# 删除文件
sudo rm -f /etc/systemd/system/singbox-manager.service
sudo rm -f /etc/systemd/system/sing-box.service
sudo rm -rf /home/deck/homebrew/plugins/singbox-manager
sudo rm -rf /home/deck/.config/singbox-manager

# 清理（可选）
rm -rf /home/deck/.config/sing-box
```

## 开发

### 构建

```bash
npm install
npm run build
```

### 监听模式

```bash
npm run build:watch
```

### 部署到远程 Steam Deck

配置 SSH 访问后：
```bash
npm run deploy
```

或手动：
```bash
scp -r dist/* deck@192.168.1.100:/home/deck/homebrew/plugins/singbox-manager/
```

## 许可证

MIT License - 详见 LICENSE 文件

## 致谢

- [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader)
- [sing-box](https://github.com/SagerNet/sing-box)
- [FastAPI](https://fastapi.tiangolo.com/)

## 免责声明

本插件仅供教育用途。请负责任地使用，并遵守所有适用的法律法规。

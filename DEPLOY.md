# 部署说明

由于GitHub API认证问题，请手动部署游戏到GitHub Pages：

## 方法1：通过GitHub网页界面上传

1. 访问 https://github.com/wlkqyang-star/green-land
2. 点击"Add file" -> "Upload files"
3. 将以下文件拖拽上传：
   - index.html
   - style.css
   - game.js
   - game-data.js
   - minigames.js
   - README.md
   - assets/ 文件夹（包含所有角色和背景图）

4. 提交更改
5. 进入仓库Settings -> Pages
6. Source选择"main"分支
7. 保存后等待几分钟，访问 https://wlkqyang-star.github.io/green-land/

## 方法2：使用git命令行（需要正确的token）

```bash
cd /home/ubuntu/green-land
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/wlkqyang-star/green-land.git
git push -u origin main
```

## 方法3：下载整个项目文件夹

所有文件都在 /home/ubuntu/green-land/ 目录下，可以打包下载后手动上传。

## 启用GitHub Pages

1. 进入仓库 Settings
2. 左侧菜单找到 Pages
3. Source 选择 main 分支
4. 点击 Save
5. 等待1-2分钟后访问生成的URL

游戏将部署在：https://wlkqyang-star.github.io/green-land/

# u2饮食日历

一个零依赖的饮食记录网页应用，带健康评分和小人亲密度养成机制。

用户可以记录早餐、午餐、晚餐和加餐，使用快速标签补充信息。每条饮食会得到一个轻量健康分，页面会根据当天平均分实时更新小人的亲密度、等级、情绪和建议。

## Run

Install Node.js 18 or later, then run:

```bash
npm run dev
```

也可以直接运行：

```bash
node server.mjs
```

Build for production:

```bash
npm run build
```

## GitHub Pages

这个项目已经准备好发布到 GitHub Pages。发布后的公网页面可以让任何人通过链接打开。

1. 在 GitHub 新建一个公开仓库，例如 `u2-diet-calendar`。
2. 把本文件夹推送到仓库的 `master` 或 `main` 分支。
3. 打开仓库的 `Settings` -> `Pages`，将发布源选择为 `GitHub Actions`。
4. 等待 Actions 运行完成，页面地址通常是：

```text
https://你的GitHub用户名.github.io/仓库名/figma-import.html
```

iPhone 打开该地址后，使用 Safari 分享按钮里的“添加到主屏幕”，就能像小程序一样出现在桌面。

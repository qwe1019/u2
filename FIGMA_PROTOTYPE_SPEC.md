# 中华美食地图 · Figma Demo 原型规格

## 产品定位

一个覆盖中国省级地区的双语美食推荐小程序。用户点击某个地区后，立即按市/区看到当地完整美食清单、热度标签和收藏入口。页面支持中文/English 切换，面向本国和外国用户。

推荐内容参考抖音生活服务吃喝玩乐榜单/心动榜的表达口径：真实好吃、有地方特色、适合打卡传播、匹配具体消费场景。当前 demo 为静态样例数据，不接入抖音实时榜单接口。

## 画板

### 1. 首页 / 默认状态

Frame name: `01 Home - Sichuan Selected`

建议尺寸：

- Desktop: `1440 × 960`
- Mobile: `390 × 844`

结构：

- 左侧栏：品牌 `中华美食地图`、导航 `美食推荐 / 地区榜单 / 我的收藏`
- 顶部：标题 `点一个地方，马上知道当地吃什么`
- 搜索框：`搜索地区、美食、城市`
- 语言切换：`中文 / EN`
- 数据概览：`34 省级地区`、`155 市/区点位`、`484 道美食`、`当前可见`、`已收藏`
- 地区选择面板：大区筛选 + 省级地区卡片
- 推荐面板：默认选中 `四川`
- 收藏夹：空状态提示

默认推荐展示：

- 成都市：麻婆豆腐、回锅肉、担担面、龙抄手、钵钵鸡、三大炮
- 自贡市：自贡冷吃兔、自贡盐帮菜、跳水鱼
- 乐山市：乐山甜皮鸭、钵钵鸡、跷脚牛肉
- 宜宾市：宜宾燃面、李庄白肉
- 绵阳市：绵阳米粉、江油肥肠

### 2. 点击地区 / 推荐切换

Frame name: `02 Region - Guangdong Selected`

交互：

- 用户点击 `广东`
- 右侧推荐面板切换为 `广东美食推荐`
- 顶部热度显示 `99`
- 展示推荐：
  - 广州市：广式早茶、虾饺、凤爪、糯米鸡、肠粉、煲仔饭、白切鸡
  - 佛山市（顺德）：顺德鱼生、双皮奶、均安蒸猪、烧鹅
  - 潮州市/汕头市：潮汕牛肉火锅、卤鹅、生腌、蚝烙、粿条汤
  - 深圳市：沙井生蚝、公明烧鹅
  - 湛江市：湛江生蚝、沙虫粥、徐闻羊粥

动效建议：

- 地区卡片选中态：`Smart Animate`，180ms
- 推荐卡片内容切换：`Dissolve`，160ms

### 3. 大区筛选

Frame name: `03 Filter - Northwest`

交互：

- 用户点击 `西北`
- 地区列表只显示：陕西、甘肃、青海、宁夏、新疆
- 当前可见数量变为 `5`
- 自动选中西北列表第一个地区 `陕西`

### 4. 地区榜单

Frame name: `04 Region Ranking`

交互：

- 用户点击左侧 `地区榜单`
- 主内容切换为榜单页
- 顶部展示 `TOP 1 / TOP 2 / TOP 3`
- 下方展示 34 个地区全量排行
- 点击任一榜单项，回到该地区推荐详情

榜单字段：

- 排名
- 地区
- 大区与风味摘要
- 代表美食与市/区数量
- 热度进度条
- 热度值

### 5. 搜索状态

Frame name: `05 Search - Hotpot`

交互：

- 用户输入 `火锅`
- 地区列表保留包含火锅推荐的地区
- 推荐区自动指向第一个匹配地区

搜索范围：

- 地区名称
- 大区名称
- 代表城市
- 美食名称
- 推荐理由

### 6. 收藏状态

Frame name: `06 Favorite Added`

交互：

- 用户点击某道菜右上角心形按钮
- 收藏夹出现 `四川 · 成都火锅`
- 数据概览中 `已收藏` 数量增加
- 再次点击心形取消收藏

### 7. English Mode

Frame name: `07 English Mode`

交互：

- 用户点击 `EN`
- 标题切换为 `Tap a place and know what to eat there`
- 地区显示为英文，例如 `Sichuan`、`Guangdong`
- 菜名显示为英文，例如 `Chengdu hot pot`
- 搜索框提示切换为 `Search regions, dishes, or cities`

## 设计 Tokens

### 颜色

- 页面背景：`#EEF4EF`
- 主卡片：`#F7FAF7`
- 文字：`#17211D`
- 次要文字：`#65756D`
- 边框：`#DDE6DF`
- 主绿色：`#2F7D55`
- 辅助蓝：`#347D93`
- 番茄红：`#D55C4A`
- 金色：`#D79B34`

### 圆角

- App 图标：8
- 卡片：8
- 按钮：6-8
- 标签：5

### 组件

- `Sidebar`
- `LanguageToggle`
- `SearchBox`
- `StatsRow`
- `RegionFilterChips`
- `ProvinceCard`
- `RecommendationHero`
- `DishCard`
- `FavoriteButton`
- `FavoriteBar`

## Prototype Connections

1. `01 Home - Sichuan Selected` → 点击 `广东` → `02 Region - Guangdong Selected`
2. `01 Home - Sichuan Selected` → 点击 `西北` → `03 Filter - Northwest`
3. `01 Home - Sichuan Selected` → 点击 `地区榜单` → `04 Region Ranking`
4. `01 Home - Sichuan Selected` → 输入 `火锅` → `05 Search - Hotpot`
5. `02 Region - Guangdong Selected` → 点击推荐菜心形按钮 → `06 Favorite Added`
6. `06 Favorite Added` → 点击收藏项 → 回到对应地区推荐
7. 任意页面 → 点击 `EN` → `07 English Mode`

## Demo 演示顺序

1. 展示首页，说明覆盖 34 个省级地区。
2. 点击四川、广东、北京，展示“点地区出推荐”的核心交互。
3. 用大区筛选展示全国内容结构。
4. 打开地区榜单，展示热度排行和榜单跳转。
5. 搜索 `火锅`，说明可按美食反查地区。
6. 切换 `EN`，展示外国用户可读版本。
7. 收藏一道菜，展示用户留存入口。

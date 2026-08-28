import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

DOC_PATH = pathlib.Path(r"C:\Users\35981\Downloads\区县精准特色美食大全.docx")
OUT_PATH = pathlib.Path(__file__).resolve().parents[1] / "src" / "food-data.js"

AREA_NAMES = {
    "华北地区": "north",
    "东北地区": "northeast",
    "华东地区": "east",
    "华中地区": "central",
    "华南地区": "south",
    "西南地区": "southwest",
    "西北地区": "northwest",
    "港澳台地区": "hmt",
}

REGION_META = {
    "北京市（辖区）": ("beijing", "北京", "Beijing", "京", 98, "宫廷小吃、胡同烟火、夜宵涮肉", "Imperial snacks, hutong comfort food, and hot-pot nights"),
    "天津市（辖区）": ("tianjin", "天津", "Tianjin", "津", 90, "早点铺、码头味、海河风味", "Breakfast stalls, port flavors, and Haihe comfort food"),
    "河北省": ("hebei", "河北", "Hebei", "冀", 87, "驴火、熏肉、北方面食", "Donkey burgers, smoked meat, and northern wheat staples"),
    "山西省": ("shanxi", "山西", "Shanxi", "晋", 91, "面食宇宙、陈醋、碳水快乐", "A noodle universe powered by aged vinegar and wheat"),
    "内蒙古自治区": ("neimenggu", "内蒙古", "Inner Mongolia", "蒙", 89, "草原奶香、手把肉、硬核早餐", "Grassland dairy, lamb feasts, and hearty breakfasts"),
    "辽宁省": ("liaoning", "辽宁", "Liaoning", "辽", 92, "烧烤海鲜、鸡架、锅包肉", "Barbecue, seafood, chicken frames, and crisp-sauced classics"),
    "吉林省": ("jilin", "吉林", "Jilin", "吉", 86, "朝鲜族风味、冷面、锅包肉", "Korean-Chinese flavors, chilled noodles, and winter comfort food"),
    "黑龙江省": ("heilongjiang", "黑龙江", "Heilongjiang", "黑", 93, "俄式面包、烧烤、冰城甜味", "Russian-style bakery culture, grilled meat, and ice-city sweets"),
    "上海市（辖区）": ("shanghai", "上海", "Shanghai", "沪", 96, "本帮菜、海派点心、老街小吃", "Benbang cuisine, Shanghainese dim sum, and old-street snacks"),
    "江苏省": ("jiangsu", "江苏", "Jiangsu", "苏", 94, "鸭香、苏式面、早茶", "Duck dishes, Suzhou noodles, and refined morning tea"),
    "浙江省": ("zhejiang", "浙江", "Zhejiang", "浙", 95, "江南湖鲜、海鲜、小吃江湖", "Lake delicacies, seafood, and Jiangnan snack culture"),
    "安徽省": ("anhui", "安徽", "Anhui", "皖", 88, "徽菜、臭鳜鱼、牛肉汤", "Huizhou cuisine, fermented fish, and hearty beef soup"),
    "福建省": ("fujian", "福建", "Fujian", "闽", 94, "海味、古早味、沙茶香", "Seafood, old-school snacks, and satay aromas"),
    "江西省": ("jiangxi", "江西", "Jiangxi", "赣", 90, "鲜辣、瓦罐汤、拌粉", "Fresh heat, clay-pot soups, and rice noodles"),
    "山东省": ("shandong", "山东", "Shandong", "鲁", 97, "鲁菜、烧烤、海鲜啤酒", "Lu cuisine, barbecue, seafood, and beer culture"),
    "河南省": ("henan", "河南", "Henan", "豫", 92, "汤汤水水、面食、夜市", "Soups, noodles, and historic night markets"),
    "湖北省": ("hubei", "湖北", "Hubei", "鄂", 95, "过早、江湖菜、藕汤", "Breakfast culture, bold river cuisine, and lotus-root soup"),
    "湖南省": ("hunan", "湖南", "Hunan", "湘", 98, "鲜辣、夜市、茶饮小吃", "Fresh chili heat, night markets, and snack culture"),
    "广东省": ("guangdong", "广东", "Guangdong", "粤", 99, "早茶、潮汕牛肉、糖水", "Morning tea, Chaoshan beef, roast meats, and desserts"),
    "广西壮族自治区": ("guangxi", "广西", "Guangxi", "桂", 96, "嗦粉、酸嘢、夜市", "Rice noodles, sour snacks, and lively night markets"),
    "海南省": ("hainan", "海南", "Hainan", "琼", 93, "椰香、海鲜、清补凉", "Coconut aromas, seafood, and tropical desserts"),
    "重庆市（辖区）": ("chongqing", "重庆", "Chongqing", "渝", 99, "麻辣火锅、小面、江湖菜", "Numbing-spicy hot pot, street noodles, and bold river cuisine"),
    "四川省": ("sichuan", "四川", "Sichuan", "川", 100, "川菜、小吃、火锅串串", "Sichuan cuisine, street snacks, hot pot, and skewers"),
    "贵州省": ("guizhou", "贵州", "Guizhou", "黔", 91, "酸汤、蘸水、糯米饭", "Sour soups, dipping sauces, and sticky-rice snacks"),
    "云南省": ("yunnan", "云南", "Yunnan", "滇", 96, "菌子、米线、民族风味", "Wild mushrooms, rice noodles, and ethnic flavors"),
    "陕西省": ("shaanxi", "陕西", "Shaanxi", "陕", 98, "碳水天堂、肉夹馍、夜市", "A carb heaven of flatbreads, noodles, and night markets"),
    "甘肃省": ("gansu", "甘肃", "Gansu", "甘", 93, "牛肉面、麻辣烫、河西风味", "Beef noodles, spicy bowls, and Silk Road flavors"),
    "青海省": ("qinghai", "青海", "Qinghai", "青", 82, "牦牛、羊肉、青稞奶香", "Yak, lamb, highland barley, and dairy flavors"),
    "宁夏回族自治区": ("ningxia", "宁夏", "Ningxia", "宁", 86, "滩羊、早茶、枸杞甜味", "Tan lamb, morning tea, and goji-berry sweetness"),
    "新疆维吾尔自治区": ("xinjiang", "新疆", "Xinjiang", "新", 97, "烤肉、抓饭、大盘鸡", "Lamb skewers, pilaf, big-plate chicken, and bazaar snacks"),
    "香港特别行政区": ("xianggang", "香港", "Hong Kong", "港", 94, "茶餐厅、烧腊、街头甜品", "Cha chaan teng classics, roast meats, and street desserts"),
    "澳门特别行政区": ("aomen", "澳门", "Macao", "澳", 89, "葡式蛋挞、茶餐厅、葡国菜", "Portuguese egg tarts, cafes, and Macanese fusion cuisine"),
    "台湾省": ("taiwan", "台湾", "Taiwan", "台", 95, "夜市、小吃、甜品饮料", "Night markets, snacks, desserts, and drinks"),
}

PLACE_EN = {
    "东城区/西城区": "Dongcheng / Xicheng",
    "朝阳区": "Chaoyang District",
    "通州区": "Tongzhou District",
    "延庆区": "Yanqing District",
    "房山区": "Fangshan District",
    "和平区": "Heping District",
    "河西区": "Hexi District",
    "武清区": "Wuqing District",
    "滨海新区": "Binhai New Area",
    "黄浦区": "Huangpu District",
    "静安区": "Jing'an District",
    "闵行区": "Minhang District",
    "浦东新区": "Pudong New Area",
    "渝中区": "Yuzhong District",
    "江北区": "Jiangbei District",
    "南岸区": "Nan'an District",
    "江津区": "Jiangjin District",
    "油尖旺": "Yau Tsim Mong",
    "新界": "New Territories",
    "澳门半岛": "Macao Peninsula",
    "氹仔": "Taipa",
}

CITY_EN = {
    "石家庄": "Shijiazhuang", "保定": "Baoding", "沧州": "Cangzhou", "唐山": "Tangshan", "承德": "Chengde", "秦皇岛": "Qinhuangdao", "张家口": "Zhangjiakou",
    "太原": "Taiyuan", "大同": "Datong", "晋中": "Jinzhong", "运城": "Yuncheng", "长治": "Changzhi", "临汾": "Linfen",
    "呼和浩特": "Hohhot", "包头": "Baotou", "呼伦贝尔": "Hulunbuir", "鄂尔多斯": "Ordos", "赤峰": "Chifeng",
    "沈阳": "Shenyang", "大连": "Dalian", "锦州": "Jinzhou", "鞍山": "Anshan", "抚顺": "Fushun",
    "长春": "Changchun", "延吉": "Yanji", "吉林": "Jilin City", "通化": "Tonghua",
    "哈尔滨": "Harbin", "齐齐哈尔": "Qiqihar", "佳木斯": "Jiamusi", "牡丹江": "Mudanjiang",
    "南京": "Nanjing", "苏州": "Suzhou", "扬州": "Yangzhou", "无锡": "Wuxi", "镇江": "Zhenjiang", "徐州": "Xuzhou", "淮安": "Huai'an",
    "杭州": "Hangzhou", "宁波": "Ningbo", "嘉兴": "Jiaxing", "金华": "Jinhua", "台州": "Taizhou", "温州": "Wenzhou",
    "黄山": "Huangshan", "合肥": "Hefei", "淮南": "Huainan", "阜阳": "Fuyang", "安庆": "Anqing",
    "福州": "Fuzhou", "厦门": "Xiamen", "泉州": "Quanzhou", "漳州": "Zhangzhou", "龙岩": "Longyan",
    "南昌": "Nanchang", "九江": "Jiujiang", "萍乡": "Pingxiang", "赣州": "Ganzhou", "吉安": "Ji'an",
    "济南": "Jinan", "青岛": "Qingdao", "德州": "Dezhou", "淄博": "Zibo", "临沂": "Linyi", "烟台": "Yantai",
    "郑州": "Zhengzhou", "开封": "Kaifeng", "洛阳": "Luoyang", "周口": "Zhoukou", "信阳": "Xinyang",
    "武汉": "Wuhan", "宜昌": "Yichang", "襄阳": "Xiangyang", "荆州": "Jingzhou", "恩施": "Enshi",
    "长沙": "Changsha", "湘潭": "Xiangtan", "衡阳": "Hengyang", "湘西": "Xiangxi", "岳阳": "Yueyang",
    "广州": "Guangzhou", "佛山": "Foshan", "潮州": "Chaozhou", "汕头": "Shantou", "深圳": "Shenzhen", "湛江": "Zhanjiang",
    "柳州": "Liuzhou", "桂林": "Guilin", "南宁": "Nanning", "梧州": "Wuzhou", "百色": "Baise",
    "海口": "Haikou", "三亚": "Sanya", "文昌": "Wenchang", "万宁": "Wanning",
    "成都": "Chengdu", "自贡": "Zigong", "乐山": "Leshan", "宜宾": "Yibin", "绵阳": "Mianyang",
    "贵阳": "Guiyang", "遵义": "Zunyi", "黔东南": "Qiandongnan", "黔南": "Qiannan",
    "昆明": "Kunming", "大理": "Dali", "西双版纳": "Xishuangbanna", "腾冲": "Tengchong",
    "西安": "Xi'an", "宝鸡": "Baoji", "咸阳": "Xianyang", "渭南": "Weinan", "榆林": "Yulin",
    "兰州": "Lanzhou", "天水": "Tianshui", "白银": "Baiyin", "敦煌": "Dunhuang",
    "西宁": "Xining", "海西": "Haixi", "海东": "Haidong",
    "银川": "Yinchuan", "中卫": "Zhongwei", "吴忠": "Wuzhong",
    "乌鲁木齐": "Urumqi", "喀什": "Kashgar", "伊犁": "Ili", "吐鲁番": "Turpan",
    "台北": "Taipei", "台南": "Tainan", "高雄": "Kaohsiung", "彰化": "Changhua",
}

TIBET = {
    "id": "xizang",
    "zh": "西藏",
    "en": "Tibet",
    "short": "藏",
    "group": "southwest",
    "heat": 84,
    "moodZh": "牦牛肉、藏面、酥油茶",
    "moodEn": "Yak meat, Tibetan noodles, and butter tea",
    "places": [
        {"zh": "拉萨市", "en": "Lhasa", "foods": ["藏面", "甜茶", "酥油茶", "牦牛肉火锅", "藏包子"]},
        {"zh": "林芝市", "en": "Nyingchi", "foods": ["石锅鸡", "松茸炖鸡", "藏香猪", "青稞饼"]},
        {"zh": "日喀则市", "en": "Shigatse", "foods": ["糌粑", "风干牦牛肉", "朋必", "青稞酒"]},
        {"zh": "阿里地区", "en": "Ngari Prefecture", "foods": ["酥油糌粑", "羊肉汤", "风干羊肉"]},
    ],
}


def read_paragraphs():
    root = ET.fromstring(zipfile.ZipFile(DOC_PATH).read("word/document.xml"))
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    result = []
    for para in root.findall(".//w:p", ns):
        text = "".join(t.text or "" for t in para.findall(".//w:t", ns)).strip()
        if not text:
            continue
        if text.startswith("要不要") or text.startswith("|") or "AI 生成" in text:
            continue
        result.append(text)
    return result


def split_foods(raw):
    chunks = []
    buf = ""
    depth = 0
    for ch in raw:
        if ch == "（":
            depth += 1
        elif ch == "）" and depth:
            depth -= 1
        if ch in "、，," and depth == 0:
            if buf.strip():
                chunks.append(buf.strip())
            buf = ""
        else:
            buf += ch
    if buf.strip():
        chunks.append(buf.strip())

    result = []
    for chunk in chunks:
        match = re.fullmatch(r"(.+?)（(.+?)）", chunk)
        if match:
            base, inside = match.group(1).strip(), match.group(2).strip()
            if base:
                result.append(base)
            if "、" in inside and "/" not in inside:
                result.extend(part.strip() for part in inside.split("、") if part.strip())
        else:
            clean = re.sub(r"（.*?）", "", chunk).strip()
            if clean:
                result.append(clean)

    deduped = []
    for item in result:
        if item and item not in deduped:
            deduped.append(item)
    return deduped


def tags_for(name):
    tags = []
    if any(word in name for word in ["火锅", "锅", "涮", "麻辣烫"]):
        tags.append("火锅")
    if any(word in name for word in ["面", "粉", "米粉", "河粉", "粿条", "馍", "饼", "包", "饺", "馄饨", "抄手", "烧卖", "馓子", "糕", "粑"]):
        tags.append("面食")
    if any(word in name for word in ["鱼", "虾", "蟹", "蚝", "蛤", "贝", "螺", "海鲜", "鲶", "鲤", "鹅块"]):
        tags.append("海鲜")
    if any(word in name for word in ["烤", "烧烤", "烧鹅", "烧鸡", "熏", "腊", "红肠"]):
        tags.append("烧烤")
    if any(word in name for word in ["糕", "糖", "甜", "冰", "奶", "茶", "布甸", "蛋挞", "饼", "桃", "芒", "粽", "汤圆", "元宵", "麻糍", "醅"]):
        tags.append("甜品")
    if any(word in name for word in ["辣", "椒", "酸", "剁椒", "胡辣", "麻辣"]):
        tags.append("辣")
    return tags[:2] or ["必吃"]


def place_to_en(place):
    if place in PLACE_EN:
        return PLACE_EN[place]
    if "/" in place:
        return " / ".join(place_to_en(part) for part in place.split("/"))
    base = place.replace("市", "").replace("地区", "").replace("县", "")
    base = base.replace("州", "")
    return CITY_EN.get(base, place)


def make_food(name):
    return {"zh": name, "en": name, "tags": tags_for(name)}


def main():
    if not DOC_PATH.exists():
        raise FileNotFoundError(DOC_PATH)

    region_data = []
    current_area = None
    current_region = None
    for line in read_paragraphs():
        if line.startswith("中国34"):
            continue
        if line in AREA_NAMES:
            current_area = AREA_NAMES[line]
            continue
        if "：" not in line:
            if line not in REGION_META:
                continue
            region_id, zh, en, short, heat, mood_zh, mood_en = REGION_META[line]
            current_region = {
                "id": region_id,
                "zh": zh,
                "en": en,
                "short": short,
                "group": current_area,
                "heat": heat,
                "moodZh": mood_zh,
                "moodEn": mood_en,
                "places": [],
            }
            region_data.append(current_region)
            continue
        if not current_region:
            continue
        place, raw_foods = line.split("：", 1)
        current_region["places"].append({
            "zh": place.strip(),
            "en": place_to_en(place.strip()),
            "foods": [make_food(name) for name in split_foods(raw_foods)],
        })

    tibet = dict(TIBET)
    tibet["places"] = [
        {"zh": place["zh"], "en": place["en"], "foods": [make_food(name) for name in place["foods"]]}
        for place in TIBET["places"]
    ]
    region_data.insert(25, tibet)

    for region in region_data:
        region["citiesZh"] = "、".join(place["zh"] for place in region["places"][:4]) + ("…" if len(region["places"]) > 4 else "")
        region["citiesEn"] = ", ".join(place["en"] for place in region["places"][:4]) + ("..." if len(region["places"]) > 4 else "")

    OUT_PATH.write_text(
        "window.CHINA_FOOD_REGIONS = " + json.dumps(region_data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({
        "regions": len(region_data),
        "places": sum(len(region["places"]) for region in region_data),
        "foods": sum(len(place["foods"]) for region in region_data for place in region["places"]),
        "output": str(OUT_PATH),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Failed to import food document: {error}", file=sys.stderr)
        raise

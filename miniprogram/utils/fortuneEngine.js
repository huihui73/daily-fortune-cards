// miniprogram/utils/fortuneEngine.js
// MVP: 周易卦象 + 五行 + 幸运要素推算引擎

// FNV-1a hash function for generating deterministic seeds
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

// Life path number calculation (1-9)
function lifePathFromBirthday(birthday) {
  const digits = birthday.replace(/[^0-9]/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);

  while (sum > 9) {
    sum = String(sum).split("").reduce((a, ch) => a + Number(ch), 0);
  }
  return sum;
}

// Five elements strength distribution (-2 .. 2)
function fiveElementsFromBirthday(birthday) {
  const s = hashString(birthday);
  const base = [-2, -1, 0, 1, 2];
  const wood = base[(s + 0) % 5];
  const fire = base[(s + 1) % 5];
  const earth = base[(s + 2) % 5];
  const metal = base[(s + 3) % 5];
  const water = base[(s + 4) % 5];
  return { wood, fire, earth, metal, water };
}

// Lucky color mapping
function colorFromSeed(seed) {
  const colors = [
    { code: "#FF6B6B", name: "热情红" }, // Red - Passion, energy
    { code: "#4ECDC4", name: "平静青" }, // Teal - Balance, calm
    { code: "#45B7D1", name: "智慧蓝" }, // Blue - Trust, wisdom
    { code: "#FFA07A", name: "温暖橙" }, // Coral - Warmth, creativity
    { code: "#98D8C8", name: "生机绿" }, // Mint - Growth, harmony
    { code: "#F7DC6F", name: "快乐黄" }, // Yellow - Joy, optimism
    { code: "#BB8FCE", name: "神秘紫" }, // Purple - Spirituality, mystery
    { code: "#85C1E9", name: "自由天蓝" }, // Sky - Freedom, clarity
    { code: "#F8C471", name: "活力金橙" }  // Orange - Enthusiasm, adventure
  ];
  const color = colors[seed % colors.length];
  return { code: color.code, name: color.name };
}

// Life path descriptions
function lifePathDesc(n) {
  const ds = {
    1: "独立、创新，天生的领导者",
    2: "合作、和谐，善于与人共事",
    3: "表达、沟通，富有创造力",
    4: "坚持、务实，脚踏实地",
    5: "行动、灵活，热爱冒险",
    6: "责任、照顾，富有同理心",
    7: "分析、直觉，善于思考",
    8: "目标、成就，注重结果",
    9: "规划、理想，有远见卓识"
  };
  return ds[n] || "独特的生命道路";
}

// Lucky number calculation
function luckyNumber(lifePath, hexId) {
  return ((lifePath * 7) + hexId) % 9 + 1;
}

// Get today's date string
function getTodayDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

// Generate hexagram from date and birthday
function generateHexagram(birthday, date = null) {
  const today = date || getTodayDate();
  const seedStr = birthday + today;
  const seed = hashString(seedStr);

  // Generate 6 lines (0 = yin, 1 = yang)
  const lines = Array.from({ length: 6 }, (_, i) => ((seed >> i) & 1) ? 1 : 0);
  const hexId = seed % 64;

  return { hexId, lines, seed };
}

// Hexagram name (simplified - can be expanded to full 64 hexagram names)
function hexagramName(hexId) {
  const names = [
    "乾为天", "坤为地", "水雷屯", "山水蒙", "水天需", "天水讼", "地水师", "水地比",
    "风天小畜", "天泽履", "地天泰", "天地否", "天火同人", "火天大有", "地山谦", "雷地豫",
    "泽雷随", "山风蛊", "地泽临", "风地观", "火雷噬嗑", "山火贲", "山地剥", "地雷复",
    "天雷无妄", "山天大畜", "山雷颐", "泽风大过", "坎为水", "离为火", "泽山咸", "雷风恒",
    "天山遁", "雷天大壮", "火地晋", "地火明夷", "风火家人", "火泽睽", "水山蹇", "雷水解",
    "山泽损", "风雷益", "泽天夬", "天风姤", "泽地萃", "地风升", "泽水困", "水风井",
    "泽火革", "火风鼎", "震为雷", "艮为山", "风山渐", "归妹", "雷泽丰", "火山旅",
    "巽为风", "兑为泽", "风水涣", "水泽节", "风泽中孚", "雷山小过", "水火既济", "火水未济"
  ];
  return names[hexId] || `卦象-${hexId}`;
}

// Hexagram interpretation (simplified version)
function hexagramInterpretation(hexId, lines) {
  const interpretations = [
    "刚健中正，自强不息。保持进取心，适合开始新项目。",
    "厚德载物，包容万物。保持耐心，以柔克刚。",
    "万事起头难。保持冷静，按部就班处理事务。",
    "蒙以养正。保持学习的态度，不要急于求成。",
    "等待时机。保持耐心，等待最佳时机行动。",
    "讼不可长。避免冲突，寻求和解与合作。",
    "师出以律。统一目标，团结协作，以德服人。",
    "亲密无间。加强沟通，建立信任关系。",
    "积蓄力量。保持谦逊，稳步前进。",
    "履行承诺。诚实守信，言行一致。",
    "泰然处之。保持乐观，顺应时势。",
    "否极泰来。保持信念，等待转机。",
    "齐心协力。团结一致，共同努力。",
    "大有作为。把握机遇，展示才华。",
    "谦谦君子。保持谦逊，虚心学习。",
    "乐天知命。保持乐观，享受生活。",
    "顺其自然。保持灵活，随遇而安。",
    "整顿秩序。发现问题，及时纠正。",
    "渐入佳境。稳步前进，越来越好。",
    "观察思考。保持冷静，多观察多思考。",
    "惩前毖后。接受教训，改进方法。",
    "光彩照人。展现才华，追求美好。",
    "顺势而为。顺应时势，避免强求。",
    "否极泰来。困难只是暂时的。",
    "光明正大。保持正直，坚持原则。",
    "大畜德性。积累品德，提升自己。",
    "颐养身心。注意健康，保持平衡。",
    "非常时期。勇于面对，化危为机。",
    "刚柔并济。保持平衡，不要偏激。",
    "依附柔顺。保持真诚，相互依存。",
    "互相感应。建立默契，增进感情。",
    "持之以恒。保持毅力，长期坚持。",
    "明哲保身。保持清醒，避免风险。",
    "锐意进取。抓住机会，奋勇向前。",
    "光明显现。展现光芒，照亮前路。",
    "韬光养晦。保持低调，等待时机。",
    "艰难险阻。克服困难，继续前进。",
    "化险为夷。勇敢面对，转危为安。",
    "损益平衡。有所取舍，保持平衡。",
    "积极进取。把握机会，努力向前。",
    "决断有力。果断行动，抓住机会。",
    "相遇良机。珍惜机会，把握当下。",
    "聚集力量。团结合作，共同前进。",
    "稳步上升。脚踏实地，步步为营。",
    "坚守原则。保持初心，不放弃。",
    "革新求变。勇于创新，突破常规。",
    "革故鼎新。除旧布新，开创未来。",
    "雷厉风行。迅速行动，果断有力。",
    "稳如泰山。保持稳定，沉着冷静。",
    "循序渐进。稳步前进，不急不躁。",
    "欢喜快乐。保持快乐，享受生活。",
    "丰功伟绩。取得成就，展现价值。",
    "旅途通达。顺利前进，一路畅通。",
    "风行水上。保持灵活，顺势而为。",
    "喜悦满怀。保持心情，享受生活。",
    "涣然冰释。消除隔阂，增进理解。",
    "节制有度。保持平衡，不要过度。",
    "诚信为本。保持诚信，建立信任。",
    "小过无伤。小问题不影响大局。",
    "水火既济。事业有成，圆满完成。",
    "未济之时。继续努力，追求完美。"
  ];

  return interpretations[hexId] || "保持平和心态，顺应自然规律。";
}

// Get advice based on five elements
function getElementsAdvice(elements) {
  const advice = [];

  if (elements.wood < 0) {
    advice.push("木弱：多吃绿色蔬菜，接触自然，养肝护肝");
  }
  if (elements.fire < 0) {
    advice.push("火弱：多吃红色食物，适当运动，养心安神");
  }
  if (elements.earth < 0) {
    advice.push("土弱：多吃黄色食物，保持规律作息，健脾养胃");
  }
  if (elements.metal < 0) {
    advice.push("金弱：多吃白色食物，深呼吸锻炼，润肺养气");
  }
  if (elements.water < 0) {
    advice.push("水弱：多吃黑色食物，充足饮水，补肾固精");
  }

  if (advice.length === 0) {
    advice.push("五行平衡，继续保持良好生活习惯。");
  }

  return advice;
}

// Get clothing advice based on elements and date
function getClothingAdvice(elements, date = null) {
  const advice = [];

  // Seasonal advice based on date
  const today = date || getTodayDate();
  const month = parseInt(today.split('-')[1]);

  if (month >= 3 && month <= 5) {
    advice.push("春季：以轻便透气为主，注意保暖防风");
  } else if (month >= 6 && month <= 8) {
    advice.push("夏季：以清爽透气为主，选择棉麻材质");
  } else if (month >= 9 && month <= 11) {
    advice.push("秋季：注意分层穿搭，随时增减衣物");
  } else {
    advice.push("冬季：注意保暖，选择厚实面料");
  }

  // Element-based color suggestions
  const strongestElement = Object.keys(elements).reduce((a, b) =>
    elements[a] > elements[b] ? a : b
  );

  const colorMap = {
    wood: "绿色、青色系",
    fire: "红色、粉色系",
    earth: "黄色、棕色系",
    metal: "白色、金色系",
    water: "黑色、蓝色系"
  };

  advice.push(`五行色：${colorMap[strongestElement]}与今日运势相合`);

  return advice;
}

// Get diet advice based on elements
function getDietAdvice(elements) {
  const advice = [];

  const foodMap = {
    wood: { foods: "绿叶蔬菜、豆类、绿色水果", note: "有助于疏肝解郁" },
    fire: { foods: "红枣、红豆、西红柿、苹果", note: "有助于养心安神" },
    earth: { foods: "小米、山药、南瓜、红薯", note: "有助于健脾养胃" },
    metal: { foods: "雪梨、百合、白萝卜、银耳", note: "有助于润肺养气" },
    water: { foods: "黑豆、黑芝麻、核桃、黑木耳", note: "有助于补肾固精" }
  };

  // Sort elements by strength (strongest first)
  const sortedElements = Object.entries(elements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2); // Top 2

  sortedElements.forEach(([element, strength]) => {
    if (strength >= 0) {
      advice.push(`${foodMap[element].foods}：${foodMap[element].note}`);
    }
  });

  advice.push("建议：均衡饮食，适量饮水，避免暴饮暴食");

  return advice;
}

// Generate daily micro tasks
function generateDailyTasks(hexId, lifePath) {
  const taskTemplates = [
    "联系一位久未联系的朋友或亲人",
    "写下今日三件感恩的事情",
    "花10分钟冥想或深呼吸",
    "整理一件困扰你的事情",
    "赞美或帮助一位身边的人",
    "完成一件你拖延已久的任务",
    "尝试一种新的食物或活动",
    "整理手机里的照片或文件",
    "给自己写一段鼓励的话",
    "观察周围的美好事物"
  ];

  const selectedTasks = [];
  const seed = (hexId + lifePath) % taskTemplates.length;

  selectedTasks.push(taskTemplates[seed]);
  selectedTasks.push(taskTemplates[(seed + 3) % taskTemplates.length]);
  selectedTasks.push(taskTemplates[(seed + 7) % taskTemplates.length]);

  return selectedTasks;
}

// Generate journal prompts
function generateJournalPrompts(hexId, lifePath) {
  const prompts = [
    "今天你学到了什么？",
    "什么事情让你感到开心？",
    "你今天帮助了谁？",
    "什么挑战你今天克服了？",
    "你今天如何照顾了自己？",
    "今天最难忘的瞬间是什么？",
    "你今天为未来做了什么？",
    "今天你发现了什么新事物？",
    "你今天的心情如何？",
    "今天你想改变什么？"
  ];

  const selectedPrompts = [];
  const seed = (hexId + lifePath) % prompts.length;

  selectedPrompts.push(prompts[seed]);
  selectedPrompts.push(prompts[(seed + 5) % prompts.length]);

  return selectedPrompts;
}

// Main fortune generation function
const fortune = {
  generateFortune: function (birthday, date = null) {
    const { hexId, lines, seed } = generateHexagram(birthday, date);
    const hexName = hexagramName(hexId);
    const hexInterpret = hexagramInterpretation(hexId, lines);
    const lifePath = lifePathFromBirthday(birthday);
    const elements = fiveElementsFromBirthday(birthday);
    const luckyColor = colorFromSeed(seed);
    const luckyNum = luckyNumber(lifePath, hexId);

    return {
      hexagramId: hexId,
      hexagramName: hexName,
      hexagramInterpretation: hexInterpret,
      lines,
      lifePathNumber: lifePath,
      lifePathDesc: lifePathDesc(lifePath),
      elements,
      luckyColor: luckyColor.name,
      luckyColorCode: luckyColor.code,
      luckyNumber: luckyNum,
      date: date || getTodayDate()
    };
  },

  buildCards: function (fortune) {
    const el = fortune.elements;
    const clothingAdvice = getClothingAdvice(el, fortune.date);
    const dietAdvice = getDietAdvice(el);
    const elementsAdvice = getElementsAdvice(el);
    const dailyTasks = generateDailyTasks(fortune.hexagramId, fortune.lifePathNumber);
    const journalPrompts = generateJournalPrompts(fortune.hexagramId, fortune.lifePathNumber);

    const cards = [
      {
        id: 'c1',
        title: '本日卦象',
        content: `${fortune.hexagramName}\n${fortune.hexagramInterpretation}`,
        color: fortune.luckyColor,
        icon: '🔮'
      },
      {
        id: 'c2',
        title: '生命路径',
        content: `生命路径数：${fortune.lifePathNumber}\n${fortune.lifePathDesc}`,
        color: '#667eea',
        icon: '🌟'
      },
      {
        id: 'c3',
        title: '五行平衡',
        content: `木 ${el.wood} / 火 ${el.fire} / 土 ${el.earth} / 金 ${el.metal} / 水 ${el.water}\n\n${elementsAdvice.join('\n')}`,
        color: '#4ECDC4',
        icon: '☯️',
        elements: el
      },
      {
        id: 'c4',
        title: '幸运要素',
        content: `幸运色：${fortune.luckyColor}\n幸运数字：${fortune.luckyNumber}`,
        color: fortune.luckyColorCode,
        icon: '🍀',
        luckyColorCode: fortune.luckyColorCode,
        luckyColorName: fortune.luckyColor
      },
      {
        id: 'c5',
        title: '穿衣灵感',
        content: clothingAdvice.join('\n'),
        color: '#45B7D1',
        icon: '👔'
      },
      {
        id: 'c6',
        title: '饮食建议',
        content: dietAdvice.join('\n'),
        color: '#52c41a',
        icon: '🍲'
      },
      {
        id: 'c7',
        title: '每日微任务',
        content: dailyTasks.map((task, i) => `${i + 1}. ${task}`).join('\n'),
        color: '#FFA07A',
        icon: '✅',
        tasks: dailyTasks.map((task, i) => ({
          id: `task_${i}`,
          text: task,
          completed: false
        }))
      },
      {
        id: 'c8',
        title: '日记 Prompts',
        content: journalPrompts.map((prompt, i) => `思考 ${i + 1}: ${prompt}`).join('\n'),
        color: '#BB8FCE',
        icon: '📝'
      },
      {
        id: 'c9',
        title: '健康提醒',
        content: '记得多喝水，保持规律作息，适当运动。\n今日建议饮水量：1.5-2.5升',
        color: '#85C1E9',
        icon: '💧'
      },
      {
        id: 'c10',
        title: '隐私说明',
        content: '本应用优先本地存储，推算结果仅基于您的生日。\n手机号仅用于身份识别，已脱敏处理。',
        color: '#999',
        icon: '🔒'
      }
    ];

    return cards;
  },

  // Check if today's fortune is already cached
  getCacheKey: function (birthday, date = null) {
    const today = date || getTodayDate();
    return `fortune_${birthday}_${today}`;
  }
};

module.exports = fortune;

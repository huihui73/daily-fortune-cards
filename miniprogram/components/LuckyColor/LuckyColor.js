Component({
  properties: {
    colorCode: {
      type: String,
      value: '#667eea'
    },
    colorName: {
      type: String,
      value: ''
    }
  },

  observers: {
    'colorCode, colorName': function(colorCode, colorName) {
      if (colorCode && colorName) {
        const { meaning, tips } = this.getColorMeaning(colorCode, colorName);
        this.setData({ meaning, tips });
      }
    }
  },

  data: {
    meaning: '',
    tips: []
  },

  methods: {
    getColorMeaning(colorCode, colorName) {
      const colorMeanings = {
        '#FF6B6B': {
          meaning: '热情红象征活力与激情，今日适合开展新项目、表达情感、展现领导力。',
          tips: ['适合穿红色系服装', '适合进行体能锻炼', '适合与热情的人交流']
        },
        '#4ECDC4': {
          meaning: '平静青代表平衡与和谐，今日适合处理复杂事务、调解纠纷、寻求内心平静。',
          tips: ['适合绿色系装饰', '适合阅读思考', '适合与家人交流']
        },
        '#45B7D1': {
          meaning: '智慧蓝寓意信任与理性，今日适合做决策、签订合同、学习新知识。',
          tips: ['适合蓝色系穿搭', '适合深度思考', '适合处理重要事务']
        },
        '#FFA07A': {
          meaning: '温暖橙代表温暖与创意，今日适合艺术创作、社交活动、展现个性。',
          tips: ['适合橙色系配饰', '适合参加聚会', '适合尝试新事物']
        },
        '#98D8C8': {
          meaning: '生机绿象征成长与和谐，今日适合健康管理、自然活动、规划未来。',
          tips: ['适合绿色系服装', '适合户外活动', '适合制定计划']
        },
        '#F7DC6F': {
          meaning: '快乐黄寓意喜悦与乐观，今日适合社交娱乐、展现才华、传递正能量。',
          tips: ['适合黄色系配饰', '适合与朋友相聚', '适合表达快乐情绪']
        },
        '#BB8FCE': {
          meaning: '神秘紫代表灵性与直觉，今日适合冥想反思、艺术欣赏、探索未知。',
          tips: ['适合紫色系装饰', '适合独自思考', '适合欣赏艺术作品']
        },
        '#85C1E9': {
          meaning: '自由天蓝象征自由与清晰，今日适合旅行规划、释放压力、追求理想。',
          tips: ['适合天蓝系穿搭', '适合户外运动', '适合规划未来']
        },
        '#F8C471': {
          meaning: '活力金橙代表热情与冒险，今日适合挑战自我、探索新领域、展现勇气。',
          tips: ['适合金色系配饰', '适合尝试新挑战', '适合展现领导力']
        }
      };

      return colorMeanings[colorCode] || {
        meaning: `${colorName}为您今日的幸运色彩，适合展现个性、追求梦想、创造美好。`,
        tips: ['适合穿此色系服装', '适合作为装饰元素', '适合展现个性']
      };
    }
  }
});
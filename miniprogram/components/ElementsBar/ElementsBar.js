Component({
  properties: {
    elements: {
      type: Object,
      value: {}
    }
  },

  observers: {
    'elements': function(elements) {
      if (elements && Object.keys(elements).length > 0) {
        const elementsList = this.formatElements(elements);
        this.setData({ elements: elementsList });
      }
    }
  },

  data: {
    elements: []
  },

  methods: {
    formatElements(elements) {
      const elementConfig = {
        wood: { name: '木', color: '#52c41a', advice: '多吃绿色蔬菜，接触自然，养肝护肝' },
        fire: { name: '火', color: '#ff4d4f', advice: '多吃红色食物，适当运动，养心安神' },
        earth: { name: '土', color: '#faad14', advice: '多吃黄色食物，保持规律作息，健脾养胃' },
        metal: { name: '金', color: '#bfbfbf', advice: '多吃白色食物，深呼吸锻炼，润肺养气' },
        water: { name: '水', color: '#1890ff', advice: '多吃黑色食物，充足饮水，补肾固精' }
      };

      return Object.entries(elements).map(([key, value]) => {
        const config = elementConfig[key];
        
        let percent = ((value + 2) / 4) * 100;
        percent = Math.max(10, Math.min(100, percent));

        return {
          name: config.name,
          value: value,
          percent: percent,
          color: config.color,
          advice: value < 0 ? config.advice : null
        };
      });
    }
  }
});
Component({
  properties: {
    tasks: {
      type: Array,
      value: []
    }
  },

  observers: {
    'tasks': function(tasks) {
      if (tasks && tasks.length > 0) {
        this.updateProgress();
      }
    }
  },

  data: {
    completedCount: 0,
    progressPercent: 0,
    allCompleted: false
  },

  lifetimes: {
    attached() {
      this.loadTaskStatus();
    }
  },

  methods: {
    updateProgress() {
      const { tasks } = this.properties;
      const completedCount = tasks.filter(task => task.completed).length;
      const progressPercent = tasks.length > 0 
        ? Math.round((completedCount / tasks.length) * 100) 
        : 0;
      const allCompleted = completedCount === tasks.length && tasks.length > 0;

      this.setData({
        completedCount,
        progressPercent,
        allCompleted
      });

      if (allCompleted) {
        wx.vibrateShort({ type: 'light' });
      }
    },

    loadTaskStatus() {
      const today = this.getTodayDate();
      const taskStatus = wx.getStorageSync(`taskStatus_${today}`) || {};
      
      const tasks = this.properties.tasks.map(task => ({
        ...task,
        completed: !!taskStatus[task.id]
      }));

      this.setData({ tasks });
      this.updateProgress();
    },

    saveTaskStatus() {
      const today = this.getTodayDate();
      const taskStatus = {};
      
      this.properties.tasks.forEach(task => {
        if (task.completed) {
          taskStatus[task.id] = true;
        }
      });

      wx.setStorageSync(`taskStatus_${today}`, taskStatus);
    },

    toggleTask(e) {
      const { id } = e.currentTarget.dataset;
      const tasks = this.properties.tasks.map(task => {
        if (task.id === id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });

      this.setData({ tasks });
      this.updateProgress();
      this.saveTaskStatus();

      if (this.data.allCompleted) {
        wx.showToast({
          title: '🎉 全部完成！',
          icon: 'success',
          duration: 2000
        });
      }
    },

    getTodayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
});
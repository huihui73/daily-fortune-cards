// miniprogram/components/CardCard/CardCard.js
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    content: {
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: '#667eea'
    },
    icon: {
      type: String,
      value: ''
    },
    expandable: {
      type: Boolean,
      value: true
    },
    isOpen: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isExpanded: false
  },

  observers: {
    'isOpen': function(isOpen) {
      if (isOpen) {
        this.setData({ isExpanded: true });
      }
    }
  },

  methods: {
    toggle() {
      if (this.data.expandable) {
        this.setData({
          isExpanded: !this.data.isExpanded
        });
        this.triggerEvent('toggle', {
          id: this.properties.title,
          expanded: !this.data.isExpanded
        });
      }
    },

    copyContent() {
      wx.setClipboardData({
        data: this.properties.content,
        success: () => {
          wx.showToast({
            title: '已复制',
            icon: 'success'
          });
        }
      });
    }
  }
});

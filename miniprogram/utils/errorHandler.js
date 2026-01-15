class ErrorHandler {
  constructor() {
    this.errorCodes = {
      NETWORK_ERROR: 'NETWORK_ERROR',
      TIMEOUT_ERROR: 'TIMEOUT_ERROR',
      AUTH_ERROR: 'AUTH_ERROR',
      DATA_ERROR: 'DATA_ERROR',
      STORAGE_ERROR: 'STORAGE_ERROR',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    };

    this.errorMessages = {
      [this.errorCodes.NETWORK_ERROR]: {
        title: '网络连接失败',
        message: '请检查网络连接后重试',
        icon: '❌'
      },
      [this.errorCodes.TIMEOUT_ERROR]: {
        title: '请求超时',
        message: '网络请求超时，请稍后重试',
        icon: '⏰'
      },
      [this.errorCodes.AUTH_ERROR]: {
        title: '认证失败',
        message: '登录已过期，请重新登录',
        icon: '🔐'
      },
      [this.errorCodes.DATA_ERROR]: {
        title: '数据错误',
        message: '数据处理失败，请稍后重试',
        icon: '⚠️'
      },
      [this.errorCodes.STORAGE_ERROR]: {
        title: '存储错误',
        message: '本地存储访问失败',
        icon: '💾'
      },
      [this.errorCodes.UNKNOWN_ERROR]: {
        title: '发生错误',
        message: '操作失败，请稍后重试',
        icon: '⚡'
      }
    };
  }

  showError(errorCode, customMessage = null) {
    const errorInfo = this.errorMessages[errorCode] || this.errorMessages[this.errorCodes.UNKNOWN_ERROR];
    
    wx.showModal({
      title: errorInfo.title,
      content: customMessage || errorInfo.message,
      showCancel: false,
      confirmText: '我知道了'
    });
  }

  showToast(errorCode, customMessage = null) {
    const errorInfo = this.errorMessages[errorCode] || this.errorMessages[this.errorCodes.UNKNOWN_ERROR];
    
    wx.showToast({
      title: customMessage || errorInfo.title,
      icon: 'none',
      duration: 2000
    });
  }

  handle(error, options = {}) {
    const { showType = 'toast', customMessage = null, callback = null } = options;
    
    console.error('Error:', error);

    let errorCode;
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('Network')) {
        errorCode = this.errorCodes.NETWORK_ERROR;
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorCode = this.errorCodes.TIMEOUT_ERROR;
      } else if (error.message.includes('auth') || error.message.includes('Auth')) {
        errorCode = this.errorCodes.AUTH_ERROR;
      } else if (error.message.includes('storage') || error.message.includes('Storage')) {
        errorCode = this.errorCodes.STORAGE_ERROR;
      } else {
        errorCode = this.errorCodes.UNKNOWN_ERROR;
      }
    } else {
      errorCode = this.errorCodes.UNKNOWN_ERROR;
    }

    if (showType === 'modal') {
      this.showError(errorCode, customMessage);
    } else {
      this.showToast(errorCode, customMessage);
    }

    if (callback) {
      callback(errorCode, error);
    }
  }

  async safeExecute(fn, options = {}) {
    const { 
      showType = 'toast', 
      customMessage = null, 
      errorMessage = '操作失败' 
    } = options;

    try {
      return await fn();
    } catch (error) {
      this.handle(error, { showType, customMessage });
      throw new Error(errorMessage);
    }
  }
}

const errorHandler = new ErrorHandler();

module.exports = errorHandler;
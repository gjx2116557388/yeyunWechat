// index.js
// 获取应用实例
const app = getApp()

Page({
  //判断小程序的是否隐藏
  onShow(){
    wx.getSystemInfo({
      success: function(res) {
        if (res.platform === 'android') {
          wx.onMemoryWarning(function () {
            console.log('内存不足');
          })
        }
      }
    })

    wx.onAppHide(function() {
      console.log('小程序隐藏');
    });

    wx.onAppShow(function() {
      console.log('小程序显示');
    });

    wx.onPageNotFound(function() {
      console.log('页面不存在');
    });
  
  },

  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  
  connectBtn(){
    console.log(1)
    wx.openBluetoothAdapter({
      success:(res)=>{
        console.log("初始化蓝牙模块成功",res);
        //蓝牙适配器初始化成功，开始搜索蓝牙设备
        wx.startBluetoothDevicesDiscovery({
          services: [], // 发现所有设备
          success: function (res) {
            console.log(res,2333);
            // 搜索蓝牙设备成功，遍历设备列表连接目标设备
            for (var i = 0; i < res.devices.length; i++) {
              var device = res.devices[i];
              console.log(device,2333);
            }
          }
        })
      },
      fail:(res)=>{
        console.log("初始化失败！！！",res);
      }
    })
  }

})

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
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    //蓝牙信息
    inputValue: 'Redmi Buds 3',
    deviceId:'',
    services:'',
    uuid:''
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
    console.log("测试开始233");
    // 蓝牙初始化
    wx.openBluetoothAdapter({
      success: (res) => {
        console.info(`蓝牙初始化成功！！！${res}`);
        wx.showToast({
          title: '蓝牙初始化成功',
          icon: "success",
          duration: 800
        })
        // 开始搜索蓝牙
        this.findBlue()

      },
      fail:(res) =>{
        console.log(`蓝牙初始化失败！！！${res}`);
        wx.showToast({
          title: '请开启蓝牙',
          icon: "fails",
          duration: 1000
        })

      }
    })

  },
  // 搜索蓝牙方法
   findBlue(){
     var that = this
     // 开始搜索蓝牙
     wx.startBluetoothDevicesDiscovery({
       allowDuplicatesKey: false,
       interval: 0,
       success: (res) =>{
        console.log(`这里是数据${res}233`);
         wx.showLoading({
           title: '正在搜索设备',
         })
        // 获取搜索到的蓝牙设备
        this.getBlue()
       }
     })
   },
  //  获取蓝牙搜索到的设备
  getBlue(){
    var that = this
    wx.getBluetoothDevices({
      success: (res) => {
        wx.hideLoading()
        for(var i = 0; i < res.devices.length; i++){
          console.log(res.devices[i]);
          // 这里就可以判断一下想要连接的蓝牙设备名字
          if (res.devices[i].name == that.data.inputValue || res.devices[i].localName == that.data.inputValue) {
            console.log(`连接成功了哦代码酱！！！`);
            // 保存deviceId
            that.setData({
              deviceId: res.devices[i].deviceId
            })
            that.data.deviceId = res.devices[i].deviceId //一样的用法做个小兼容
            that.connectBlue(res.devices[i].deviceId)
            return 
          }
        }  
      },
      fail: () =>{
        console.log('搜索蓝牙失败！！！');
      }
    })
  },
  // 连接蓝牙
  connectBlue(deviceId){
    var that = this
    wx.createBLEConnection({
      // 这里的deviceId 需要已经通过 createBLEConnection 与对应设备建立连接
      deviceId: deviceId, // 设备id
      success: (res)=>{
        wx.showToast({
          title: '连接成功',
          icon: 'fails',
          duration: 1000
        })
      wx.stopBluetoothDevicesDiscovery({
        success: (res) => {
          console.log('连接蓝牙成功后关闭搜索');
        },
      })
      // 后续还要获取蓝牙设备的所有服务开发中
      }
    })
  }

})

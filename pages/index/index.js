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
    error: '',  //顶部错误提示信息
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    connectData:'未连接',
    //测试数据
    blueAllData:[],
    blueAlluuid:[],
    //蓝牙信息
    // 测试硬件 红米蓝牙耳机 Redmi Buds 3
    // 真实名字 FFBO  RC20 YMW_YE2
    inputValue: 'YMW_YE2',
    // localName: 'icomon',
    // localName:'ZYCom_C6C036',
    localName:'YMW_YE2',
    deviceId:'',
    services:'',
    uuid:'',
    propertiesuuId:'', //监听值
    writeId: "", //写入值
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
    this.connectBtn()
  },
  
  connectBtn(){
    var that = this
    console.log("测试开始233");
    // 蓝牙初始化
    wx.openBluetoothAdapter({
      success: (res) => {
        console.info(`蓝牙初始化成功！！！${res}`);
        wx.showToast({
          title: '蓝牙初始化成功',
          icon: "success",
          duration: 1000
        })
        // 开始搜索蓝牙
        that.findBlue()

      },
      fail:(res) =>{
        console.log(`蓝牙初始化失败！！！${res}`);
        // 顶部提示下
        this.setData({
          error: '这是一个错误提示'
      })
        // wx.showToast({
        //   title: '请开启蓝牙',
        //   icon: "fail",
        //   duration: 1000
        // })

      }
    })

  },
  //按钮的点击事件
  btn(){
    wx.showToast({
      title: "请给开发者反馈UUID的排列顺序",
      icon: 'success',
      duration: 1500
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
        that.setData({
          connectData: "搜索中"
        })
        // that.data.connectData = "搜索中"
        // 获取搜索到的蓝牙设备
        setTimeout(()=>{
          that.getBlue()
        },1000)
       }
     })
   },
  //  获取蓝牙搜索到的设备
  getBlue(){
    var that = this
    wx.getBluetoothDevices({
      success: (res) => {
        res.devices.forEach((ele,index)=>{
          let array0 = that.data.blueAllData
          array0.push(`${index}.${ele.name}`)
          console.log(array0);
         that.setData({
          blueAllData: array0
         })
          if (ele.name == that.data.inputValue || ele.localName == that.data.localName) {
            wx.hideLoading()
            console.log(`连接成功了哦代码酱！！！,${ele.deviceId}`);
            that.setData({
              deviceId: ele.deviceId
            })
            // 连接之前要先停止搜素 
            wx.stopBluetoothDevicesDiscovery({
              success: (res) => {
                console.log('连接蓝牙成功后关闭搜索');
                that.connectBlue(ele.deviceId)
                console.log(ele.deviceId);
              },
            })
            return
          }
        })
      },
      fail: () =>{
        console.log('搜索蓝牙失败！！！');
        wx.showToast({
          title: '搜索失败',
          icon: 'error',
          duration: 1500
        })
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
        that.setData({
          connectData: "连接成功"
        })
        wx.showToast({
          title: '连接成功',
          icon: 'fails',
          duration: 1000
        })
      console.log('代码酱',that.data.blueAllData);
      // 后续还要获取蓝牙设备的所有服务
      that.getServiceId()
      }
    })
  },
  // 获取uuid
  getServiceId(){
    var that = this
    wx.getBLEDeviceServices({
      deviceId: that.data.deviceId,
      success: (res)=>{
         // 真实代码 这里是需要根据硬件修改的
         let item = res.services[0];
         that.setData({
           services: item.uuid  
         })
        res.services.forEach((ele,index)=>{ 
          // 获取所有特征值
          that.getCharacteId(that.data.deviceId,that.data.services)

          // 页面显示
          let servicesAll =  that.data.blueAlluuid
          servicesAll.push(`第${index},${ele.uuid}`)
          console.log(servicesAll);
          that.setData({
            blueAlluuid: servicesAll
          })
        })
        console.log(res,"获取设备所有服务");
      },
      fail: (err)=>{
        console.log(err);
      }
    })
  },

  // 获取所有特征值
  getCharacteId(){
    console.log('获取所有特征值成功233');
    var that = this 
    wx.getBLEDeviceCharacteristics({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
      deviceId:that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId:that.data.services,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; i++) {//2个值
          var item = res.characteristics[i];
          console.log(`所有特征值都在这里${JSON.stringify(res.characteristics[i].properties)}`);
          if(item.properties.indicate||item.properties.notify){
            that.setData({
              propertiesuuId: item.uuid,
            })
            console.log(`我是大傻逼${that.data.propertiesuuId}`);
            that.startNotice(that.data.propertiesuuId)//7.0
          }
          if (item.properties.write){
            // 发送数据
            that.writeFn(item.properties.write)
            that.setData({
              writeId: item.uuid//用来写入的值
            })
          }
        }
        
      },
      fail(err){
        console.log("getBLEDeviceCharacteristics",err);
      }
    })
  },
  //写入数据
  writeFn(uuid){
    var that = this;
    console.log(`写入数据ID${that.data.writeId}`);

    const buffer = new ArrayBuffer(2) // 构造发送数据的ArrayBuffer
    const dataView = new DataView(buffer)
    dataView.setUint8(0, 0xFF);
    dataView.setUint8(1, 0x0); // 设置发送的数据，这里假设是一个字节的数据0x01
    console.log(`这里是发送出去的数据${buffer},${that.data.writeId}`);
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.services,
      characteristicId: that.data.writeId,
      value: buffer.buffer,
      success(res) {
        console.log('发送数据成功')
      },
      fail(res) {
        console.log('发送数据失败：', res)
      }
    })
  },


  startNotice(uuid){
    var that = this;
   setTimeout(()=>{

    wx.notifyBLECharacteristicValueChange({
      state: true, // 启用 notify 功能
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: that.data.deviceId,
      // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
      serviceId: that.data.services,
      // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
      characteristicId: that.data.propertiesuuId, 
      success (res){
        console.log(res,'启用低功能蓝牙监听成功');
        const buffer = new ArrayBuffer(1) // 构造发送数据的ArrayBuffer
        const dataView = new DataView(buffer)

        // wx.showToast({
        //   title: '请截个图给我谢谢',
        //   icon: "success",
        //   duration: 1000
        // })
        // 监听获取数据
        // ArrayBuffer转16进制字符串示例
        function ab2hex(buffer) {
          let hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function(bit) {
              return ('00' + bit.toString(16)).slice(-2)
            }
          )
          return hexArr.join('');
        }
        
         // 16进制转中文字符串
         function hexCharCodeToStr(hexCharCodeStr) {
          　　var trimedStr = hexCharCodeStr.trim();
          　　var rawStr = 
          　　trimedStr.substr(0,2).toLowerCase() === "0x"
          　　? 
          　　trimedStr.substr(2) 
          　　: 
          　　trimedStr;
          　　var len = rawStr.length;
          　　if(len % 2 !== 0) {
          　　　　alert("Illegal Format ASCII Code!");
          　　　　return "";
          　　}
          　　var curCharCode;
          　　var resultStr = [];
          　　for(var i = 0; i < len;i = i + 2) {
          　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
          　　　　resultStr.push(String.fromCharCode(curCharCode));
          　　}
          　　return resultStr.join("");
          }


      },
      fail(err){
        console.log(err,"这里是最后一步")
      }

      
    })

   },1000)
  }

})

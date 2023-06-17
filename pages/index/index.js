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
      // 监听蓝牙连接状态变化
      // wx.onBLEConnectionStateChange(function(res) {
      //   console.log('设备连接状态变化', res);
      //   var isConnected = res.connected; // 连接状态，true表示已连接，false表示断开连接
      //   var deviceId = res.deviceId; // 设备ID

      //   if (isConnected) {
      //     // 设备已连接
      //     console.log('设备已连接');
      //     // 进行相应的操作
      //   } else {
      //     // 设备已断开连接
      //     console.log('设备已断开连接');
      //     // 进行相应的操作
      //   }
      // });
      
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
    connectState:false,
    shakState: false, //震动的状态
    //测试数据
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
    //连续发码测试
    timer: null,
    // shakData:null,
    
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
    // this.authorizationFn()
    this.connect()
  },
  // 判断用户是否授权蓝牙权限
  authorizationFn(){
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.bluetooth']) {
          // 用户未授权蓝牙权限，需要进行处理
          // 显示一个提示框或者其他方式告知用户需要蓝牙权限
          wx.showModal({
            title: '提示',
            content: '需要蓝牙权限才能使用该功能，请授权蓝牙权限。',
            success(res) {
              if (res.confirm) {
                // 用户点击确定，跳转到微信小程序的授权设置页面
                wx.openSetting({
                  success(res) {
                    // 用户在设置页面进行了操作后的回调
                    // 检查蓝牙权限是否被重新授权，根据情况进行相应处理
                    if (res.authSetting['scope.bluetooth']) {
                      // 蓝牙权限已被重新授权，进行连接等操作
                    } else {
                      // 蓝牙权限仍未被授权，可以继续提示用户或进行其他处理
                    }
                  }
                });
              } else if (res.cancel) {
                // 用户点击取消，可以继续提示用户或进行其他处理
              }
            }
          });
        } else {
          // 蓝牙权限已被授权，进行连接等操作
        }
      }
    });
  },

  // 连接按钮
  connectBtn(){
    var that = this
    console.log("这里是断开模块",that.data.connectState);
    // 点击震动
    wx.vibrateShort({
      success: function() {
        console.log("短震动成功");
      },
      fail: function() {
        console.log("短震动失败");
      }
    });
    if (that.data.connectState) {
      console.log("这里是断开模块",that);
      // 断开与蓝牙设备的连接
      wx.closeBLEConnection({
        deviceId: that.data.deviceId,
        success: function(res) {
          console.log('断开蓝牙连接成功', res);
          that.setData({
            connectState: false
          })
          that.setData({
            connectData: "未连接"
          })
          console.log(this.data.connectState);
        },
        fail: function(res) {
          console.log('断开蓝牙连接失败', res);
        }
      });
     
    }else{
      this.authorizationFn()
      this.connect()
    }
     
    
  },

  // 连接方法函数
  connect(){
    var that = this
    // 蓝牙初始化
    wx.openBluetoothAdapter({
      success: (res) => {
        console.info(`蓝牙初始化成功！！！${res}`);
        // 开始搜索蓝牙
        that.findBlue()
      },
      fail:(res) =>{
        console.log(`蓝牙初始化失败！！！${res}`);
        // 顶部提示下
        this.setData({
          error: '这是一个错误提示'
        })
      }
    })

  },

  // 点击发码版本
  shakBtn(e){
    let shakData = this.data.shakState;
    let value = e
    // 判断是否授权蓝牙功能
    this.authorizationFn()

    wx.vibrateShort({
      success: function() {
        console.log("短震动成功");
      },
      fail: function() {
        console.log("短震动失败");
      }
    });
    this.setData({
      shakState: !shakData,
    });
    this.writeFn(value)
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
        // that.setData({
        //   connectData: "搜索中"
        // })

        // 搜索10s后关闭搜索
        setTimeout(()=>{
            wx.stopBluetoothDevicesDiscovery({
              success: (res) => {
                console.log('搜索10秒后关闭搜索');
              },
            })
            wx.hideLoading()
        },10000)

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
    console.log("啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦啦里去了");
    var that = this
    wx.createBLEConnection({
      // 这里的deviceId 需要已经通过 createBLEConnection 与对应设备建立连接
      deviceId: deviceId, // 设备id
      success: (res)=>{

        that.setData({
          connectData: "已连接",
        })
        that.setData({
          connectState: true
        })

        wx.showToast({
          title: '连接成功',
          icon: 'fails',
          duration: 1000
        })
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
            // that.writeFn(item.properties.write)
            that.setData({
              writeId: item.uuid//用来写入的值
            })
            // that.writeFn(0x18e7)
            // 连续发码
            // setTimeout(function(){
              clearInterval(that.data.timer)
              const buffer = new ArrayBuffer(2);
              const dataView = new DataView(buffer);
              dataView.setUint16(0,0x18e7,false);
              let time = setInterval(()=>{
                wx.writeBLECharacteristicValue({
                  deviceId: that.data.deviceId,
                  serviceId: that.data.services,
                  characteristicId: that.data.writeId,
                  value: buffer,
                  success(res) {
                    console.log(`发送数据成功,${JSON.stringify(res)}`,'连续发码')
                  },
                  fail(res) {
                    console.log('发送数据失败：', res)
                  }
                })
              },500)
              that.setData({
                timer: time
              })
            // }.bind(this),1000)




          }
        }
        
      },
      fail(err){
        console.log("getBLEDeviceCharacteristics",err);
      }
    })
  },
  //写入数据
  // btn1(e){
  //   var value = e.currentTarget.dataset.value;
  //   console.log(value);
  // },

  writeFn(e){
    var that = this;
    // var order = e.currentTarget.dataset.value;
    var order = e.currentTarget.dataset.value;
    const buffer = new ArrayBuffer(2);
    const dataView = new DataView(buffer);
    // dataView.setUint8(0, 0x0f); // 设置第一个字节为 00001111
    // dataView.setUint8(1, 0xf0); // 设置第二个字节为 11110000
    dataView.setUint16(0, order,false);
    console.log(order);

    // 判断是否授权蓝牙功能
    that.authorizationFn()

    // 按钮震动
    wx.vibrateShort({
      success: function() {
        console.log("短震动成功");
      },
      fail: function() {
        console.log("短震动失败");
      }
    });
    console.log(`这里是发送出去的数据${buffer},${that.data.writeId}`);
  //  setInterval(() => {
    for(var i = 0;i<3;i++){
      wx.writeBLECharacteristicValue({
        deviceId: that.data.deviceId,
        serviceId: that.data.services,
        characteristicId: that.data.writeId,
        value: buffer,
        success(res) {
          console.log(`发送数据成功,${JSON.stringify(res)}`,1)
        },
        fail(res) {
          console.log('发送数据失败：', res,i)
        }
      })
    }
  //  }, 1000);
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

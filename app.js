//app.js
App({
  onLaunch: function () {
    //知晓云
    require('./libs/sdk-v1.1.1')
    // 初始化 SDK
    let clientID = 'd3ca097c6d7a90a15aed'
    wx.BaaS.init(clientID)
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      // wx.login({
      //   success: function () {
      //     wx.getUserInfo({
      //       success: function (res) {
      //         that.globalData.userInfo = res.userInfo
      //         typeof cb == "function" && cb(that.globalData.userInfo)
      //       }
      //     })
      //   }
      // })
      wx.BaaS.login().then((res)=>{
        // console.log(res)
        that.globalData.userInfo = res
        typeof cb == "function" && cb(that.globalData.userInfo)
      })
    }
  },
  setEstate: function(estate){
    this.globalData.estate = estate
  },
  getEstate: function(){
    return this.globalData.estate
  },
  globalData:{
    userInfo:null,
    estate: null
  }
})
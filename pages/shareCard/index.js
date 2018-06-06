// var Data = require('../../utils/data');
var Estate = require('../../utils/estate');
Estate = new Estate();
var Util = require('../../utils/util.js');
var UserEstateSubway = require('../../utils/userEstateSubway');
UserEstateSubway = new UserEstateSubway(false);
var UserEstate = require('../../utils/userEstate');
UserEstate = new UserEstate(false);
var UserEstateImage = require('../../utils/userEstateImage');
UserEstateImage = new UserEstateImage(false);
var Subway = require('../../utils/subway');
Subway = new Subway();
var Distance = require('../../utils/distance');
Distance = new Distance();

Page({ 
  data:{
    title: '',
    price_num: '',
    price_unit: '',
    imageList:[],
    subwayArray: [],//地铁列表
    sellerName: '',
    sellerMobile: '',
    subway: [],
    hasMall: false,
    mall: '',
    hasNursery: false,
    nursery: '',
    hasPrimarySchool: false,
    primarySchool: '',
    hasJuniorSchool: false,
    juniorSchool: '',
    hasViaduct: false,//有高架桥
    viaduct: '',
    hasTrain: false,//有火车
    train: '',
    hasFactory: false,//有工程
    factory: '',
    hasGrave: false,//有坟景
    hasMainRoad:false,//有主干道
    grave: '',
    price: '',
    openDate: '',

  },
  onLoad: function (option) {
    this.userId = option.userId;
    this.newCode = option.newCode;
    this.cityCode = option.cityCode;
    
    Estate.getEstateByNewCodes(this.cityCode,[option.newCode]).then((estate) => {
      estate = estate[option.newCode]
      this.setData({
        title: estate.title,
        price_num: estate.price_num,
        price_unit: estate.price_unit,
      })
      wx.setNavigationBarTitle({
        title: estate.title,
      })
    })
  },
  onReady: function () {
    this.initSubwayArray().then((res) => {
      this.initUserEstateSubway(res[0], res[1])
    });
    this.initUserEstate();
    this.initImages();
  },
  //初始化户型图
  initImages: function () {
    
    UserEstateImage.query(this.userId, this.newCode).then((data) => {
      
      this.setData({
        imageList: data
      })
    })
  },
  //初始化地铁选择器
  initSubwayArray: function () {
     return new Promise((resolve,reject)=>{
      Subway.query(this.cityCode).then((subwayArray)=>{
        Distance.query().then((distanceArray)=>{
          this.setData({
            subwayArray: [subwayArray, distanceArray]
          })
          resolve([subwayArray, distanceArray]);
        });
      })
    })
  },
  //初始化用户填写的地铁信息
  initUserEstateSubway(subwayArray, distanceArray) {
    let subway = [];
    UserEstateSubway.query(this.userId, this.newCode).then((res) => {
      
      res.map((item, i) => {
        subway.push([Util.getIndexById(subwayArray, item.subwayId),
        Util.getIndexById(distanceArray, item.distanceId), item.id])
      })
      if (subway.length == 0) {
        subway.push([]);
      }
      this.setData({
        subway
      })
    })
  },
  initUserEstate: function () {
    UserEstate.query(this.userId, this.newCode).then((data) => {
      this.infoId = data.id;
      let newData = Util.assignLeft(this.data, data)
      this.setData(newData)

    })
  },
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: '/pages/shareCard/index?newCode=' + this.newCode + '&userId=' + this.userId
    }
  },
  backToHome: function(){
    wx.redirectTo({
      url: '../map/index'
    })
  },
  makeCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.sellerMobile
    })
  },
})
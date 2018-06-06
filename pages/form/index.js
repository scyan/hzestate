// var Data=require('../../utils/data');
var Estate = require('../../utils/estate');
Estate = new Estate();
var Util = require('../../utils/util.js');
var Subway = require('../../utils/subway');
Subway = new Subway();
var Distance = require('../../utils/distance');
Distance = new Distance();
var UserEstateSubway=require('../../utils/userEstateSubway');
UserEstateSubway = new UserEstateSubway();
var UserEstate = require('../../utils/userEstate');
UserEstate = new UserEstate();
var UserEstateImage = require('../../utils/userEstateImage');
UserEstateImage = new UserEstateImage();

var app = getApp();

//TODO  地铁线路可删除，添加地铁改为图标
Page({
  data:{
    title: '',
    price_num:'',
    price_unit: '',
    imageList:[],
    subwayArray: [],//地铁列表
    sellerName:'',
    sellerMobile:'',
    subway:[],
    hasMall:false,
    mall:'',
    hasNursery:false,
    nursery:'',
    hasPrimarySchool:false,
    primarySchool:'',
    hasJuniorSchool:false,
    juniorSchool:'',
    hasViaduct: false,//有高架桥
    viaduct:'',
    hasTrain: false,//有火车
    train:'',
    hasFactory: false,//有工程
    factory:'',
    hasGrave:false,//有坟景
    hasMainRoad:false,//有主干道
    grave:'',
    price: '',
    openDate:'',

  },
  onLoad: function(option){
    this.newCode = '';
    this.userId = '';
    this.infoId = null;
    app.getUserInfo((user) => {
      this.userId = user.id
      //TODO  如果拿不到userId,回到首页
    });
    Estate.getEstateByNewCodes(option.cityCode,[option.newCode]).then((estate) => {
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
    this.newCode = option.newCode;
    this.cityCode = option.cityCode;
  },

  onUnload: function(){
    UserEstateSubway.destroy(this.userId,this.newCode);
    UserEstate.destroy(this.userId, this.newCode);
    UserEstateImage.destroy(this.userId, this.newCode)
  },
  onReady: function(){
    this.initSubwayArray().then((res)=>{
      this.initUserEstateSubway(res[0], res[1])
    });
    this.initUserEstate()
    this.initImages();
  },
  initUserEstate: function(){
    UserEstate.query(this.userId, this.newCode).then((data)=>{
      this.infoId=data.id;
      let newData = Util.assignLeft(this.data,data)
      this.setData(newData)
      
    },(err)=>{
      
    })
  },
  //初始化地铁选择器
  initSubwayArray:function(){
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
  initUserEstateSubway(subwayArray,distanceArray){
    let subway=[];
    UserEstateSubway.query(this.userId, this.newCode).then((res)=>{
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
    },(err)=>{
      
    })
  },

  //初始化户型图
  initImages: function(){
    UserEstateImage.query(this.userId,this.newCode).then((data)=>{
      this.setData({
        imageList: data
      })
    })
  },
  removeSubway: function(e){
    let index = e.target.dataset.index;
    let recordId = e.target.dataset.recordId;
    let {subway}=this.data;
    UserEstateSubway.remove(recordId, this.newCode).then((res)=>{
      subway.splice(index, 1);
      this.setData({
        subway
      })
    })

  },
  //选择地铁时触发
  bindMultiPickerChange: function (e) {
    let error=false;
    let value = e.detail.value,//value是一个二维数组[0,0]
      index = e.target.dataset.index;//当前修改的是第几条地铁
    let subway=this.data.subway;
    subway.some((item,i)=>{
      if(i!=index&&item[0]==value[0]){
        error=true;
        return true;
      }
    })
    if(error){
      wx.showToast({
        title: '这条线路已经添加过了哦',
        // icon: 'cancel',//TODO 用image替代
        image:'../../resources/error.png',
        duration: 3000
      })
      return ;
    }
    
    if(subway[index].length>0){
      UserEstateSubway.update(subway[index][2], this.newCode, this.data.subwayArray[0][value[0]].id, this.data.subwayArray[1][value[1]].id).then((data)=>{
        value.push(data.id)
        subway[index]=value;
        this.setData({
          subway
        })
      })
      
    }else{
     
      UserEstateSubway.add(this.userId, this.cityCode, this.newCode, this.data.subwayArray[0][value[0]].id, this.data.subwayArray[1][value[1]].id).then((data)=>{
        
        value.push(data.id)
        subway[index] = value;       
        this.setData({
          subway
        })
      })
    }

  },
  bindMultiPickerColumnChange: function (e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    // var data = {}
  },

  //添加一条地铁线路
  addsubway: function(){
    let {subway}=this.data;
    if(subway.length>=5){
      wx.showToast({
        title: '最多添加5条哦',
        // icon: 'fail',//TODO 用image替代
        image: '../../resources/error.png',
        duration: 3000
      })
      return ;
    }
    subway.push([]);
    
    this.setData({
      subway
    })
  },
  toggle: function(e){
    let obj={};
    obj[e.target.dataset.index] = e.detail.value
    this.setData(obj)
    UserEstate.update(this.userId, this.infoId, this.cityCode,this.newCode,obj).then((data)=>{
      this.infoId = data.id
      
    },()=>{})
  },
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: '/pages/shareCard/index?newCode=' + this.newCode + '&userId=' + this.userId+'&cityCode='+this.cityCode,
      // imageUrl: '/pages/shareCard/index?newCode=' + newCode + '&userId=' + userId,
    }
  },
  selectPic: function(){
    wx.chooseImage({
      count: 8 - this.data.imageList.length,
      sizeType: ['compressed'],//['original', 'compressed']
      success: (res)=>{
        
        res.tempFilePaths.map((path)=>{
          let param = {}
          param.filePath = path
          wx.BaaS.uploadFile(param).then((res) => {
            
            if(res && res.statusCode == 200){
              let data = JSON.parse(res.data);
              
              UserEstateImage.add(this.userId,this.cityCode,this.newCode,data.path).then((res)=>{
                
                let imageList = [].concat(this.data.imageList);
                imageList.push(res);
                this.setData({
                  imageList
                })
              });
            }
          },(err)=>{
            // console.log(err)
          })
        })
      }
    })
  },
  removeImage: function(e){
    let {index , recordId} = e.target.dataset;
    // console.log(index,recordId)
    UserEstateImage.remove(recordId).then((res)=>{
      let imageList = [].concat(this.data.imageList);
      imageList.splice(index,1);
      this.setData({imageList});
    })
  },
  previewImage: function(e){
    let path = e.target.dataset.path;
    let list = [];
    this.data.imageList.map((item,i)=>{
      list.push(item.path);
    })
    wx.previewImage({
      current: path, // 当前显示图片的http链接
      urls: list // 需要预览的图片http链接列表
    })

  },
  makeCall: function(){
    if(!this.data.sellerMobile){
      wx.showToast({
        title: '请先输入销售电话',
        // icon: 'fail',//TODO 用image替代
        image: '../../resources/error.png',
        duration: 3000
      })
      return;
    }
    wx.makePhoneCall({
      phoneNumber: this.data.sellerMobile
    })
  },
  test: function(){
    wx.navigateTo({
      url: '../shareCard/index?newCode=' + this.newCode + '&userId=' + this.userId+'&cityCode='+this.cityCode,
    })
  }



})
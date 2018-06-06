var data = require("../../utils/data");
var Util = require('../../utils/util');
var City = require('../../utils/city');
City = new City();
var Estate = require('../../utils/estate');
Estate = new Estate();
var UserEstateSubway = require('../../utils/userEstateSubway');
UserEstateSubway = new UserEstateSubway();
var UserEstateImage = require('../../utils/userEstateImage');
UserEstateImage = new UserEstateImage();
var UserEstate = require('../../utils/userEstate');
UserEstate = new UserEstate();
var app = getApp();
var getControls = require('./controls');
Page({ 
  data:{
    scale:14,//地图缩放等级
    showSearch:false,//是否显示搜索框
    latitude: null,//30.27415,
    longitude: null,//120.15515,
    markers:[],//地图地标
    circles:[],
    actionSheetHidden:false,
    items:[//多选框
      { name: '住宅', value: '住宅', checked:true},
      { name: '商住', value: '商住',checked:false },
      { name: '写字楼', value: '写字楼', checked: false },
      { name: '商铺', value: '商铺', checked: false}
    ],
    controls: []
  },
  getLocation(){
    
    wx.getLocation({
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度
      success:  (res) => {
        const {latitude,longitude} = res;
        this.setData({
          latitude,
          longitude
        })
        data.getCityByLocation({ latitude, longitude}).then((res)=>{
          let cityCode = res.cityCode;
          let found = false;
          this.cityList.some((city,i)=>{
            if(city.cityCode == cityCode){
              found = true;
              this.switchCity(city);
              return true;
            }
          })
          if(!found){
            wx.showToast({
              title: '当前城市暂时不支持哦，请从左下角城市图标选择城市',
              // icon: 'cancel',//TODO 用image替代
              image: '../../resources/error.png',
              duration: 3000
            })
          }
        })
      }
    })
    
  },
  onLoad: function(){
    City.queryAll().then((res)=>{
      this.cityList = res;
      this.getLocation();
      // this.switchCity(res[0])
      // this.setMarkers();
    })

    app.getUserInfo((user) => {
      this.userId = user.id
      //TODO  如果拿不到userId,回到首页
    });
    let checkedArr=[];
    this.data.items.map((item)=>{
      if(item.checked){
        checkedArr.push(item.value)
      }
    })
    this.filter = {
      cityCode:0,
      newCodes:null,
      checkedArr
    }
    let _this = this;
    this.proxy = new Proxy(this.filter,{
      get:(target,property)=>{
        return target[property]
      },
      set:(target,property,value)=>{
        target[property]=value;
        this.setMarkers();
        return true;
      }
    });
  },
  onReady: function() {
    this.initControles()
    this.mapCtx = wx.createMapContext('myMap');
    
    
  },
  //切换城市
  switchCity(city){
    if (this.proxy.cityCode == city.cityCode){
      return ;
    }
    this.proxy.cityCode = city.cityCode;
    this.setData({
      latitude: city.latitude,
      longitude: city.longitude,
    })
  },
  initControles: function(){
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          mapHeight: (res.windowHeight - 40) + 'px',
          controls: getControls(res.windowWidth,res.windowHeight)
        })
      }
    })
  },
  //获取单个marker
  getMarker: function(estate, bySearch = false){
    return {
      iconPath: data.getIcon(estate),
      id: estate.newCode,//markerId为原始数组中的索引，初始化后就不再变化
      latitude: estate.y,
      longitude: estate.x,
      title: estate.title,
      width: 30,
      height: 30,
      alpha: !!parseFloat(estate.price_num) ? 1 : 0.4,
      callout: {
        content: data.getCallout(estate) +' [✎]',
        borderRadius: 10,
        padding: 10,
        color: '#ffffff',
        bgColor: '#00aeed',
        display:'BYCLICK',//showCallout ?'ALWAYS':'BYCLICK',
        fontSize: 20
      },
      label:bySearch?{
        content: estate.title,
        color: '#ffffff',
        bgColor: '#fb711e',
        fontSize: 16,
        x:3,
        y:5
      }:{}
    }
  },
  //重置markers
  setMarkers: function(){
    let newCodes = this.proxy.newCodes;
    let bySearch = false;
    if (newCodes){
      if (newCodes.length && newCodes[0] =='bySearch'){
        this.proxy.newCodes.shift();
        bySearch = true;
      }
      Estate.getEstateByNewCodes(this.proxy.cityCode,this.proxy.newCodes).then((data)=>{
      
      this.generateMarkers(data, bySearch)
      })
    }else{
      Estate.getEstate(this.proxy.cityCode).then((data) => {  
        this.generateMarkers(data)
      })
    }
  },
  generateMarkers: function(data,bySearch = false){
    var markers = [];
    let checkedArr = [].concat(this.proxy.checkedArr);
    
    Object.keys(data).map((key)=>{
      let estate = data[key];
      if(!estate){
        return;
      }
      var purpose = Util.isString(estate.purpose) ? estate.purpose : estate.purpose.join(',');
      checkedArr.some((v) => {
        if (purpose.indexOf(v) > -1) {
          markers.push(this.getMarker(estate, bySearch));
          return true;
        }
      })
    })
    if(bySearch && markers.length){
      this.setData({
        markers,
      },()=>{
        //手机端有bug,移动地图坐标可能导致marker不显示，所以等markers显示后再移动
        this.setData({
          latitude: markers[0].latitude,
          longitude: markers[0].longitude,
          scale: 12
        })
      })
      
      return;
    }
    this.setData({
      markers: markers,
    })
    
  },
  //筛选楼盘
  checkboxChange: function(e){ 
    // console.log(e.detail.value)
    this.proxy.checkedArr = [e.detail.value]
  },
  //点击地图控件
  controltap: function(e){
    if (e.controlId=='location'){
      this.mapCtx.moveToLocation();
      return ;
    }
    if(e.controlId == 'filter'){
      wx.showActionSheet({
        itemList: ['只显示我记录过的','显示所有'],
        success:(res)=>{
          if(res.tapIndex == 0){
            let newCodes = []
            UserEstate.queryAll(this.userId,this.proxy.cityCode).then((res)=>{
              res.map((estate)=>{
                if (!(estate.newCode in newCodes)){
                  newCodes.push(estate.newCode)
                }
                
              })
              return UserEstateSubway.queryAll(this.userId, this.proxy.cityCode)
            }).then((res)=>{
              res.map((estate) => {
                if (!(estate.newCode in newCodes)) {
                  newCodes.push(estate.newCode)
                }
              })
              return UserEstateImage.queryAll(this.userId, this.proxy.cityCode);
            }).then((res)=>{
              res.map((estate) => {
                if (!(estate.newCode in newCodes)) {
                  newCodes.push(estate.newCode)
                }
              })
              newCodes.unshift('bySearch');
              this.proxy.newCodes = newCodes;
            })

          }else{
            this.proxy.newCodes = null;
          }
        }
      })
      return ;
    }
    //筛选城市
    if(e.controlId == 'city'){
      let itemList = []
      this.cityList.map((item)=>{
        itemList.push(item.cityName);
      })
      wx.showActionSheet({
        itemList,
        success: (res)=>{
          this.switchCity(this.cityList[res.tapIndex])
        }
      })
      return ;
    }
    //搜索之后用于显示全部
    if(e.controlId == 'refresh'){
      this.proxy.newCodes=null;
    }
    if(e.controlId =='zoomout'){
      this.setData({
        scale: --this.data.scale
      })
    }
  },
  //点击marker
  callouttap: function(e){
    let newCode = e.markerId;
    Estate.getEstateByNewCodes(this.proxy.cityCode, [newCode]).then((estate)=>{
      estate = estate[newCode]  
      wx.showActionSheet({
        itemList: ['去记录' + estate.title],
        success:  (res)=> {
          wx.navigateTo({
            url: '../form/index?newCode=' + estate.newCode +'&cityCode=' +this.proxy.cityCode
          })
        },
        fail:  (res) => {
          // console.log(res.errMsg)
        }
      })
    });
  },
  //移动到当前位置
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  //显示搜索框
  showSearch: function(){
    if(!this.data.showSearch){
      this.setData({
        showSearch: true
      })
    }
  },
  hideSearch: function(){
    if(this.data.showSearch){
      this.setData({
        showSearch: false
      })
    }
  },
  //搜索
  search: function(e){
    
    let value = e.detail.value;
    if(!value){return}
    let newCodes=[]
    let find = false;
    Estate.getEstate(this.proxy.cityCode).then((data) => {
      // console.log(data)
      Object.keys(data).map((key)=>{
        let item = data[key];
        if(!item.title){
          return;
        }
        if(item.title.indexOf(value)>-1||value.indexOf(item.title)>-1){
          newCodes.push(item.newCode)
          if(!find){
            // this.setData({
            //   latitude: item.y,
            //   longitude: item.x,
            // })
            find = true;
          }

        }
      })
      if (!newCodes.length) {
        wx.showToast({
          title: '暂未搜索到该楼盘哦。',
          // icon: 'cancel',//TODO 用image替代
          image: '../../resources/error.png',
          duration: 3000
        })
        return;
      }
      newCodes.unshift('bySearch');
      this.proxy.newCodes = newCodes;
    })
  }
})
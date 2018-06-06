var Util = require('./util');
var City = require('./city');
City = new City();
var app = getApp();
class Estate  {
  constructor() {
    this.estateMap={}
  }
  getCache(cityCode, filePath) {
    let cachePath = wx.getStorageSync('estate_filepath_'+ cityCode);
    if (!cachePath){
      return false;
    }
    if (cachePath != filePath){
      return false;
    }
    return wx.getStorageSync('estate_' + cityCode);
  }
  setCache(cityCode,filePath, data) {
    wx.setStorage({
      key: 'estate_filepath_' + cityCode,
      data: filePath,
    })
    wx.setStorage({
      key: 'estate_' + cityCode,
      data: data,
    })
  }

  initEstateMap(cityCode,list) {
    this.estateMap[cityCode] = {}
    list.map((estate, i) => {
      this.estateMap[cityCode][estate.newCode] = estate
    })
  }
  getMap(list){
    let map ={};
    list.map((estate, i) => {
      map[estate.newCode] = estate
    })
    return map;
  }
  getEstate(cityCode){ 
    return new Promise((resolve, reject)=>{
      City.getFilePath(cityCode).then((filePath)=>{
        let data = this.getCache(cityCode, filePath);
        if (data) {
          resolve(data)
          return;
        }
        wx.request({
          url: filePath,
          dataType: 'json',
          success: (res) => {

            data = res.data;
            let map = this.getMap(data);
            this.setCache(cityCode, filePath, map)
            // this.initEstateMap(cityCode, data);
            resolve(map)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    })
  }
  getEstateByNewCodes(cityCode,newCodes) {
    // let arr = [];
    let map = {};
    return new Promise((resolve, reject) => {
      City.getFilePath(cityCode).then((filePath) => {
        this.getEstate(cityCode, filePath).then((res)=>{
          newCodes.map((newCode) => {
            map[newCode]=res[newCode];  
          })
          resolve(map);
        })
      })
      
      // if (!this.estateMap[cityCode]) {
      //   City.getFilePath(cityCode).then((filePath)=>{
      //     this.getEstate((cityCode, filePath) => {
      //       newCodes.map((newCode) => {
      //         arr.push(this.estateMap[cityCode][newCode])
      //       })
      //       resolve(arr)
      //     })
      //   })
      // } else {
      //   newCodes.map((newCode) => {
      //     arr.push(this.estateMap[cityCode][newCode])
      //   })
      //   resolve(arr)
      // }
    })

  }
}
module.exports = Estate;
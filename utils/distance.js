var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
class Distance extends Dao {
  constructor() {
    super(2623);
  }
  getCache(){
     //TODO 增加时间戳，有变更时可清楚缓存
    return wx.getStorageSync('subway_distance');
  }
  setCache(data){
    wx.setStorage({
      key: 'subway_distance',
      data: data
    })
  }
  query(){
    return new Promise((resolve, reject)=>{
      let data = this.getCache();
      if (data) {
        resolve(data);
        return;
      }
      this.andQuery().then((res)=>{
        res.data.objects.map((item) => {
          item.name = item.distance + '(米)'
        })
        resolve(res.data.objects);
        this.setCache(res.data.objects)
      },(err)=>{
        reject(err)
      })
    })
  }
}
module.exports = Distance;
var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
class Subway extends Dao {
  constructor() {
    super(2624);
  }
  getCache(cityCode){
     //TODO 增加时间戳，有变更时可清楚缓存
    return wx.getStorageSync('subway_' + cityCode);
  }
  setCache(cityCode,data){
    wx.setStorage({
      key: 'subway_' + cityCode,
      data: data,
    })
  }
  add(){
    
    //temp
    // for(let i=1;i<=21;i++){
    //   if(i==10|| i==12 ||i==15||(i>=17&&i<=20)){
    //     continue;
    //   }

    //   this.addRow({
    //    path:i+'号线',
    //    cityCode:'257',
       
    //   }).then((res) => {
    //    console.log('succe',i)
    //     resolve(res.data);
    //   }, (err) => {
    //     reject(err)
    //     console.log('fail', i)
    //   })
    // }

  }
  query(cityCode){
    return new Promise((resolve, reject)=>{
      let data = this.getCache(cityCode);
      if(data){
        resolve(data);
        return ;
      }
      this.andQuery({ cityCode}).then((res)=>{
        res.data.objects.map((item) => {
          item.name = item.path 
        })
        res.data.objects.sort((a,b)=>{
          return parseInt(a.path+999) - parseInt(b.path+999)
        })
        resolve(res.data.objects)
        this.setCache(cityCode, res.data.objects)
      },(err)=>{
        reject(err);
      })
    })
  }
}
module.exports = Subway;
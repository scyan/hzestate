var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
var list = null;
class City extends Dao {
  constructor() {
    super(4112);
  }
  queryAll() {
    return new Promise((resolve, reject) => {
      if(list){
        resolve(list);
        return ;
      }
      this.andQuery({show:true}).then((res) => {
        list = res.data.objects;
        resolve(res.data.objects);
      }, (err) => { })
    })
  }
  getFilePath(cityCode){
    return new Promise((resolve,reject)=>{
      this.queryAll().then((list)=>{
        list.some((item)=>{
          if(item.cityCode == cityCode){
            resolve(item.file.path);
            return true;
          }
        })
      })
    })
  }
}
module.exports = City;
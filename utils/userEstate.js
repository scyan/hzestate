var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
class UserEstate extends Dao{
  constructor(useCache = true){
    super(2528, useCache);
    this.hasChange = false;
  }
  destroy(userId, newCode){
    if(this.hasChange){
      this.removeCache(userId, newCode);
    }
  }
  removeCache (userId, newCode) {
    wx.removeStorage({
      key: 'user_estate_' + userId + '_' + newCode,
    })
  }
  setCache(userId,data){
    if(this.useCache){
      data.map((item, i) => {
        wx.setStorage({
          key: 'user_estate_' + userId + '_' + item.newCode,
          data: item,
        })
      })
    }
  }
  getCache(userId,newCode){
    if(!this.useCache){
      return false;
    }
    return wx.getStorageSync('user_estate_' + userId + '_' + newCode);
  }
  queryAll(userId, cityCode) {
    return new Promise((resolve, reject) => {
      this.andQuery({ userId, cityCode}).then((res)=>{
        resolve(res.data.objects);
      },(err)=>{
        reject();
      })  
    })
  }
  query (userId, newCode) {
    return new Promise((resolve, reject)=>{
      let data = this.getCache(userId,newCode)
      if (data) {
        resolve(data);
        return;
      }
      this.andQuery({ newCode, userId}).then((res)=>{
        if (res.data.objects.length > 0) {
          this.setCache(userId, res.data.objects)
          // wx.setStorage({
          //   key: userId + '_' + newCode + '_info',
          //   data: res.data.objects[0],
          // })
          resolve(res.data.objects[0]);
          return ;
        }
        reject()
      },(err)=>{
        reject(err)
      })
    })
  }
  update(userId, infoId, cityCode,newCode, data) {
    return new Promise((resolve, reject) => {
      let Table = this.getTable();
      if (infoId) {//更新
        this.updateById(infoId,data).then((res) => {
          this.hasChange = true;
          resolve(res.data)
          console.log('update user_estate success', res)
        }, (err) => {
          reject(err)
          console.log('update user_estate fail', err)
        })
      } else {//新增
        this.addRow({cityCode, newCode, userId, ...data
        }).then((res)=>{
          this.hasChange = true;
          resolve(res.data);
        },(err)=>{
          reject(err)
          console.log('add info fail', err)
        })
      }
    })
  }
}
module.exports = UserEstate;

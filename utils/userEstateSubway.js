var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
class UserEstateSubway extends Dao{
  constructor(useCache = true){
    super(2531,useCache)
    this.hasChange = false;
  }
  destroy(userId, newCode) {
    if (this.hasChange) {
      this.removeCache(userId, newCode);
    }
  }
  removeCache(userId, newCode) {
    wx.removeStorage({
      key: 'user_estate_subway' + userId + '_' + newCode
    })
  }
  setCache(userId,newCode,data){
    if(this.useCache){
      wx.setStorage({
        key: 'user_estate_subway' + userId + '_' + newCode,
        data: data,
      })
    }
  }
  getCache(userId, newCode){
    return wx.getStorageSync('user_estate_subway' + userId + '_' + newCode)
  }
  queryAll(userId, cityCode){
    return new Promise((resolve, reject)=>{
      this.andQuery({ userId, cityCode }).then((res) => {
        resolve(res.data.objects);
      },(err)=>{})
    })
  }
  //获取用户存储的楼盘地铁信息
  query (userId, newCode) {
    return new Promise((resolve, reject) => {
      let data = this.getCache(userId, newCode)
      if (data) {
        resolve(data)
      } else {
        this.andQuery({newCode,userId}).then((res)=>{
          if (res.data.objects.length > 0) {
            this.setCache(userId, newCode, res.data.objects)
            resolve(res.data.objects)
            return ;
          }
          reject();
        },(err)=>{
          reject(err);
        })
      }
    })
  }
  //增加地铁信息  TODO 增加后记录storage
  add(userId, cityCode, newCode, subwayId, distanceId) {
    return new Promise((resolve, reject) => {
      let Table = this.getTable();
      let table = Table.create();
      let data = {
        cityCode,
        newCode,
        userId,
        subwayId,
        distanceId
      }
      table.set(data).save().then((tableRes) => {
        this.hasChange = true;
        resolve(tableRes.data);

      }, (err) => {
        reject(err)
        // console.log('add subway fail', err)
      })

    })
  }
  update(id, newCode, subwayId, distanceId) {
    return new Promise((resolve, reject) => {
      this.updateById(id, { subwayId, distanceId}).then((res)=>{
        this.hasChange = true;
        resolve(res.data);
        console.log('update user_estate_subway success', res)
      }, (err) => {
        reject(err)
        console.log('update user_estate_subway fail', res)
      })
      return true;
    })
  }
  remove(id, newCode) {
    return new Promise((resolve, reject) => {
      let Table = this.getTable();
      Table.delete(id).then((res) => {
        this.hasChange = true;
        // console.log('remove success', res)
        resolve(res.data)

      }, (err) => {
        reject(err)

      })
    })
  }

}
module.exports = UserEstateSubway;

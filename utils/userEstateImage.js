var Util = require('./util');
var Dao = require('./dao');
var app = getApp();
class UserEstateImage extends Dao {
  constructor(useCache = true) {
    super(3998, useCache);
    this.hasChange = false;
  }
  destroy(userId, newCode) {
    if (this.hasChange) {
      this.removeCache(userId, newCode);
    }
  }
  getCache(userId, newCode) {
    if (!this.useCache) {
      return false;
    }
    return wx.getStorageSync('user_estate_image' + userId + '_' + newCode)
  }
  removeCache(userId, newCode) {
    wx.removeStorage({
      key: 'user_estate_image' + userId + '_' + newCode
    })
  }
  setCache(userId, newCode, data) {
    if (this.useCache) {
      wx.setStorage({
        key: 'user_estate_image' + userId + '_' + newCode,
        data: data,
      })
    }
  }
  queryAll(userId, cityCode){
    return new Promise((resolve, reject) => {
      this.andQuery({ userId, cityCode}).then((res) => {
        resolve(res.data.objects);
      }, (err) => { })
    })
  }
  query(userId, newCode) {
    return new Promise((resolve, reject) => {
      let data = this.getCache(userId, newCode)
      if (data) {
        resolve(data)
      } else {
        this.andQuery({ newCode, userId }).then((res) => {
          if (res.data.objects.length > 0) {
            this.setCache(userId, newCode, res.data.objects)
            resolve(res.data.objects)
            return;
          }
          reject();
        }, (err) => {
          reject(err);
        })
      }
    })
  }
  add(userId, cityCode, newCode, path) {
    return new Promise((resolve, reject) => {
      let Table = this.getTable();
      let table = Table.create();
      let data = {
        cityCode,
        newCode,
        userId,
        path,
      }
      table.set(data).save().then((tableRes) => {
        this.hasChange = true;
        resolve(tableRes.data);
      }, (err) => {
        console.log('add image fail', err)
      })

    })
  }
  update(id, path) {
    return new Promise((resolve, reject) => {
      this.updateById(id, { path }).then((res) => {
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
  remove(id) {
    return new Promise((resolve, reject) => {
      this.removeById(id).then((res) => {
        this.hasChange = true;
        console.log('remove success', res)
        resolve(res.data)
      }, (err) => {
        console.log('remove fail', err)
        // err
      })
    })
  }
}
module.exports = UserEstateImage;
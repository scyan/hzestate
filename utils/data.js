var Util = require('./util');

var app=getApp();

module.exports = {
  getCityByLocation(location){
    return new Promise((resolve,reject)=>{
      wx.request({
        url: 'https://api.map.baidu.com/geocoder/v2/',
        data: {
          ak: 'TQWVCZPW9FGY7eSuK11554UCDa8ik6SH',
          // lng: location.longitude,
          // lat: location.latitude,
          location: location.latitude + ',' + location.longitude,
          output: 'json',
          coordtype: 'wgs84ll'
        },
        success: (res) => {
          if (res && res.statusCode == 200) {
            const { cityCode } = res.data.result;
            const { city } = res.data.result.addressComponent;
            resolve({ cityCode,city})
          }else{
            reject(res)
          }
        },
        fail: (err) =>{
          reject(err)
        }
      })
    })
  },
  markers: [
    { icon: 'pos10', price: 10000 },
    { icon: 'pos9', price: 15000 },
    { icon: 'pos8', price: 20000 },
    { icon: 'pos7', price: 25000 },
    { icon: 'pos6', price: 30000 },
    { icon: 'pos5', price: 35000 },
    { icon: 'pos4', price: 40000 },
    { icon: 'pos3', price: 45000 },
    { icon: 'pos2', price: 50000 },
    { icon: 'pos1', price: 55000 },
    { icon: 'pos0', price: 60000 }
  ],
  //获取对应图标
  getIcon: function (estate) {
    var icon = null;

    var price = parseFloat(estate.price_num)
    if (!price) {
      return '../../resources/pos_temp.png';
    }
    this.markers.some((marker) => {
      if (price < marker.price) {
        icon = marker.icon;
        return true
      }
    })
    if (!icon || estate.price_unit.match(/套/g)) {
      icon = this.markers[this.markers.length - 1].icon;

    }
    return '../../resources/' + icon + '.png';
  },
  //获取气泡款显示内容
  getCallout: function (estate) {
    var purpose = Util.isString(estate.purpose) ? estate.purpose : estate.purpose.join(',');
    return estate.title + "," + estate.price_num + ' ' + estate.price_unit + " ," + purpose;
  },


}
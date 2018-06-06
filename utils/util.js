function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function isString(str){
	return typeof str==='string';
}
function getIndexById(arr,id){
  let index = 0;
  arr.some((item, i) => {
    if (item.id == id) {
      index = i
      return true;
    }
  })
  return index;
}
function filter(keys,obj){
  let newObj={};
  obj.map((item,i)=>{
    if(keys.indexOf(item)>-1){
      newObj[item]=obj[item]
    }
  })
  return newObj;
}
function assignLeft(leftObj,rightObj){
  let leftKeys = Object.keys(leftObj);
  let newObj = {};
  leftKeys.map((key,i)=>{
    if(key in rightObj){
      newObj[key] = rightObj[key]
    }else{
      newObj[key] = leftObj[key]
    }
  })
  return newObj;
}
module.exports = {
  formatTime: formatTime,
  isString: isString,
  getIndexById: getIndexById,
  assignLeft: assignLeft
}

let getControls=(windowWidth,windowHeight)=>{
  return  [
    {
      id: 'location',
      iconPath: '/resources/dingwei.png',
      position: {
        left: 20,
        top: windowHeight - 40 - 70,
        width: 45,
        height: 45
      },
      clickable: true
    },
    {
      id: 'filter',
      iconPath: '/resources/filter.png',
      position: {
        left: 20,
        top: windowHeight - 40 - 120,
        width: 45,
        height: 45
      },
      clickable: true
    },
    {
      id: 'city',
      iconPath: '/resources/city.png',
      position: {
        left: 20,
        top: windowHeight - 40 - 170,
        width: 45,
        height: 45
      },
      clickable: true
    },
    {
      id: 'refresh',
      iconPath: '/resources/refresh.png',
      position: {
        left: windowWidth -60,
        top: windowHeight - 40 - 70,
        width: 40,
        height: 40
      },
      clickable: true

    },
    // {
    //   id: 'zoomout',
    //   iconPath: '/resources/help.png',
    //   position: {
    //     left: res.windowWidth - 50,
    //     top: res.windowHeight - 40 - 100,
    //     width: 40,
    //     height: 40
    //   },
    //   clickable: true

    // }
  ]
}
module.exports = getControls;
export default defineAppConfig({
  pages: [
    'pages/activity/index',
    'pages/cloudmap/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '口碑云图',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f7f8fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#4f6ef7',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/activity/index',
        text: '活动'
      },
      {
        pagePath: 'pages/cloudmap/index',
        text: '云图'
      },
      {
        pagePath: 'pages/review/index',
        text: '复盘'
      }
    ]
  }
})

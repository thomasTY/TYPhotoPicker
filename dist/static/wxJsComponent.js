'use strict'
// 微信js sdk鉴权组件
var wx = require('weixin-js-sdk')
import tyService from './tyService.js'
var EXIF = require('exif-js')
var MegaPixImage = require('./megapic-image.js')

var wxJsComponent = new function () {
  // 记录配置成功的信息历史
  this.configHistory = {}

  // 获取访问接口授权
  this.initConfig = function (configData, callback) {
    console.warn('initConfig1' + JSON.stringify(configData))
    if (configData.activeStatus) { // 返回值有效且为激活状态
      console.warn('initConfig2')
      var appid = configData.appId
      var timestamp = configData.timestamp
      var nonceStr = configData.nonceStr
      var signature = configData.signature
      wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: appid, // 必填，企业号的唯一标识，此处填写企业号corpid
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature, // 必填，签名，见附录1
        jsApiList: ['chooseImage', 'previewImage']
        // jsApiList: ['checkJsApi'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      })
    }
    var hasError = false
    wx.error(function (res) {
      hasError = true
      console.warn('wx.error:' + JSON.stringify(res))
      if (callback) {
        // 如果报错，直接返回false
        callback(false)
        callback = null
      }
      // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    })
    wx.ready(function () {
      console.warn('wx.ready hasError:' + hasError)
      if (callback) {
        callback(!hasError)
      }
    })
  }

  this.hasAuthorized = function (pageUrl) {
    var currentTime = Math.round(new Date().getTime() / 1000)
    if (navigator.userAgent.toLowerCase().indexOf('iphone os') !== -1) {
      for (var pageKey in this.configHistory) {
        if (this.configHistory[pageKey] && this.configHistory[pageKey].lastTime && this.configHistory[pageKey].success) {
          // 如果这个页面已经获取过config
          if ((currentTime - this.configHistory[pageKey].lastTime) < 60 * 60 * 1.5) {
            // 距离上次获取config不超过1.5小时，直接调用接口
            console.log('wxJSConfig ios has history:' + pageKey)
            return true
          } else {
            this.configHistory[pageKey] = null
          }
        }
        break
      }
    } else {
      // android
      var pageConfig2 = this.configHistory[pageKey]
      if (pageConfig2 && pageConfig2.lastTime && pageConfig2.success) {
        // 如果这个页面已经获取过config
        if ((currentTime - pageConfig2.lastTime) < 60 * 60 * 1.5) {
          // 距离上次获取config不超过1.5小时，直接调用接口
          console.log('wxJSConfig android has history:' + pageUrl)
          return true
        } else {
          this.configHistory[pageKey] = null
        }
      }
    }
    return false
  }

  // 访问微信jssdk鉴权
  this.wxJSConfig = function (callback) {
    var pageUrl = window.location.href.split('#')[0]
    console.log('wxJSConfig window.location.href1:' + pageUrl)
    if (this.hasAuthorized(pageUrl)) {
      if (callback) {
        callback(true)
      }
      return
    }
    var that = this
    var signURL = pageUrl.replace(/&/g, '%26') // 给链接中所有的&uri编码 encodeURIComponent
    var appid = 'wxcfd35355d34a1894'
    var secret = 'c99b4935724d9b4f3c725a94d59a7640'
    // 获取AccessToken(有效期7200秒，每日200次): 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET'
    // 用AccessToken获取tikcet(有效期7200秒)： 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi'
    // 用用AccessToken获取tikcet生成signature：
    // noncestr=Wm3WZYTPz0wzccnW
    // jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg
    // timestamp=1414587457
    // url=http://mp.weixin.qq.com?params=value
    // jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value
    // 进行sha1签名: 得到0f9de62fce790f9a083d5c99e95740ceb90c27ed
    var accessToken = ''
    tyService.getWXConfigAccessToken(appid, secret, function (isSuccess, result) {
      if (isSuccess) {
        accessToken = result
        console.debug(result)
      }
    })
    var ticket = ''
    tyService.getWXConfigTicket(accessToken, function (isSuccess, result) {
      if (isSuccess) {
        console.debug(result)
        ticket = result
      }
    })
    var noncestr = 'Wm3WZYTPz0wzccnW'
    var timestamp = new Date()
    tyService.getWXConfigSignature(ticket, noncestr, timestamp, signURL, function (isSuccess, result) {
      if (isSuccess) {
        console.log('获取签名 success:' + JSON.stringify(result))
        // 请求config
        that.initConfig(result, function (success) {
          console.log('initConfig 11:' + success)
          if (success) {
            // 签名成功，缓存获取配置记录
            if (pageUrl) {
              var pageConfig = {}
              pageConfig.success = true
              pageConfig.lastTime = Math.round(new Date().getTime() / 1000)
              that.configHistory[pageUrl] = pageConfig
            }
          } else {
            // 如果签名失败，删除记录
            var pageConfig2 = that.configHistory[pageUrl]
            if (pageConfig2 && pageUrl) {
              that.configHistory[pageUrl] = null
            }
          }
          // 调用回调
          if (callback) {
            callback(success)
          }
        })
      } else {
        console.log('获取签名 fail:' + result)
        if (callback) {
          callback(false)
        }
      }
    })
  }

  // 选择照片
  this.pickPhoto = function (callback, count) {
    if (!count || count > 9) {
      count = 9
    }
    console.log('pickPhoto:' + count)
    this.wxJSConfig(function (success) {
      console.log('pickPhoto wxJSConfig2:' + success)
      wx.chooseImage({
        count: count, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          if (callback) {
            callback(true, res.localIds)
          }
        },
        error: function () {
          console.warn('####chooseImage error')
        },
        complete: function () {
          console.warn('####chooseImage complete')
        },
        fail: function () {
          console.warn('####chooseImage fail')
        },
        failed: function () {
          console.warn('####chooseImage failed')
        }
      })
    })
  }

  // 查看图片大图
  this.previewImage = function (photoUrl, photoUrlList) {
    photoUrlList = photoUrlList || [photoUrl]
    wx.previewImage({
      current: photoUrl, // 当前显示图片的http链接
      urls: photoUrlList // 需要预览的图片http链接列表
    })
  }

  // 读取本地图片数据
  this.loadLocalPhotoData = function (localId, callback) {
    this.wxJSConfig(function (success) {
      if (success) {
        wx.getLocalImgData({
          localId: localId, // 图片的localID
          success: function (res) {
            var localData = res.localData // localData是图片的base64数据，可以用img标签显示
            if (callback) {
              callback(true, localData)
            }
          }
        })
      } else {
        if (callback) {
          callback(false)
        }
      }
    })
  }

  // 读取本地图片数据
  this.loadLocalPhotoListData = function (localIds, callback, dataList) {
    if (localIds && localIds.length) {
      dataList = dataList || []
      var that = this
      var loadItem = localIds[0]
      this.loadLocalPhotoData(loadItem, function (success, data) {
        var resItem = {}
        resItem.localId = loadItem
        resItem.data = data
        dataList.push(resItem)
        if (localIds.length > 1) {
          if (callback) {
            callback(false, resItem) // 转完一个走一次
          }
          that.loadLocalPhotoListData(localIds.slice(1), callback, dataList)
        } else {
          if (callback) {
            callback(true, resItem) // 全部转换完
          }
        }
      })
    } else { // localId不存在
      if (callback) {
        callback(false)
      }
    }
  }

  // 获取input file的文件地址
  this.getLocalFileURL = function (file) {
    var url = null
    if (window.createObjectURL !== undefined) { // basic
      url = window.createObjectURL(file)
    } else if (window.URL !== undefined) { // mozilla(firefox)兼容火狐
      url = window.URL.createObjectURL(file)
    } else if (window.webkitURL !== undefined) { // webkit or chrome
      url = window.webkitURL.createObjectURL(file)
    }
    return url
  }

  // 读取图片base64数据，和图片宽高
  this.loadImageWithUrl = function (url, callback) {
    var sourceImage = new Image()
    sourceImage.onload = function () {
      if (callback) {
        callback(sourceImage)
      }
      sourceImage = null
    }
    sourceImage.src = url
  }

  // 读取图片base64数据，和图片宽高
  this.getImageBase64Data = function (url, callback) {
    this.loadImageWithUrl(url, function (sourceImage) {
      var imageWidth = sourceImage.width
      var imageHeight = sourceImage.height
      console.info('resizeImage width:' + imageWidth)
      console.info('resizeImage height:' + imageHeight)
      var canvas = document.createElement('canvas')
      canvas.width = imageWidth
      canvas.height = imageHeight

      canvas.getContext('2d').drawImage(sourceImage, 0, 0, imageWidth, imageHeight)
      var dataURL = canvas.toDataURL('image/jpeg')
      if (callback) {
        callback(dataURL, imageWidth, imageHeight)
      }
      canvas = null
      dataURL = null
    })
  }
  // 加载input选取的图片信息，压缩图片
  this.loadAndCompressInputImageData = function (file, callback) {
    console.warn('loadAndCompressInputImageData:' + file.name + ', size:' + file.size)
    var orientation
    var that = this
    EXIF.getData(file, function () {
      orientation = EXIF.getTag(file, 'Orientation')
      console.warn('EXIF.getData orientation:' + orientation)
    })
    var reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function (e) {
      var image = new Image()
      image.src = e.target.result
      image.onload = function () {
        var expectWidth = this.naturalWidth
        var expectHeight = this.naturalHeight
        // 适当压缩图片，规范尺寸
        if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
          expectWidth = 800
          expectHeight = expectWidth * this.naturalHeight / this.naturalWidth
        } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
          expectHeight = 1200
          expectWidth = expectHeight * this.naturalWidth / this.naturalHeight
        }
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext('2d')
        canvas.width = expectWidth
        canvas.height = expectHeight
        ctx.drawImage(this, 0, 0, expectWidth, expectHeight)
        // 修复ios上传图片的时候 被旋转的问题
        var base64 = null
        if (orientation && orientation !== 1) {
          var mpImg = new MegaPixImage(image)
          mpImg.render(canvas, {
            maxWidth: 800,
            maxHeight: 1200,
            quality: 0.8,
            orientation: orientation
          })
        }
        base64 = canvas.toDataURL('image/jpeg', 0.8)
        var fileLength = parseInt(base64.length - (base64.length / 8) * 2)
        if (fileLength / 1024000 > 1) { // 如果图片仍然大于1M，压缩图片
          // 压缩图片
          that.imgScale(base64, 4, callback)
        } else {
          if (callback) {
            callback(base64, canvas.width, canvas.height)
          }
        }
      }
    }
  }
  // 压缩图片
  this.imgScale = function (imgUrl, quality, callback) {
    console.warn('imgScale')
    var img = new Image()
    var canvas = document.createElement('canvas')
    var cxt = canvas.getContext('2d')
    img.src = imgUrl
    img.onload = function () {
      // 缩放后图片的宽高
      var width = img.naturalWidth / quality
      var height = img.naturalHeight / quality
      canvas.width = width
      canvas.height = height
      cxt.drawImage(this, 0, 0, width, height)
      if (callback) {
        callback(canvas.toDataURL('image/jpeg'), width, height)
      }
    }
  }
  // 选择图片方向
  this.rotateImg = function (img, direction, canvas) { // 图片旋转
    console.warn('rotateImg1:' + direction)
    var minStep = 0
    var maxStep = 3
    if (img === null) return
    var height = img.height
    var width = img.width
    var step = 2
    if (step === null) {
      step = minStep
    }
    if (direction === 'right') {
      step++
      step > maxStep && (step = minStep)
    } else {
      step--
      step < minStep && (step = maxStep)
    }
    console.warn('rotateImg2')
    var degree = step * 90 * Math.PI / 180
    var ctx = canvas.getContext('2d')
    console.warn('rotateImg3')
    switch (step) {
      case 0:
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0)
        break
      case 1:
        canvas.width = height
        canvas.height = width
        ctx.rotate(degree)
        ctx.drawImage(img, 0, -height)
        break
      case 2:
        canvas.width = width
        canvas.height = height
        ctx.rotate(degree)
        ctx.drawImage(img, -width, -height)
        break
      case 3:
        canvas.width = height
        canvas.height = width
        ctx.rotate(degree)
        ctx.drawImage(img, -width, 0)
        break
    }
    console.warn('rotateImg6')
  }
}

export default wxJsComponent

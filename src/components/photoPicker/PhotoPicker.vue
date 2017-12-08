<!-- 图片选择控件 -->
<template>
  <div class="photo-picker-container">
    <input id="photo-picker-input" hidden="true" name="file" type="file" v-on:change="onPickedPhotos($event)" accept="image/*">
  </div>
</template>

<script>
// var wxJsComponent = require('../../../static/wxJsComponent.js')
import wxJsComponent from '../../../static/wxJsComponent.js'
import {Toast} from 'mint-ui'

export default {
  name: 'PhotoPicker',
  data () {
    return {
      iosWeixin: false, // ios是否使用微信js sdk选取图片
      isAndroid: navigator.userAgent.toLowerCase().indexOf('android') !== -1,
      isIOS: navigator.userAgent.toLowerCase().indexOf('iphone os') !== -1,
      isSafari: navigator.userAgent.toLowerCase().indexOf('safari') !== -1,
      selectedPhotoNum: 0, // 已经选取的图片张数
      maxPhotoNum: 9, // 最大图片张数限制 默认9张，参考微信的最大限制
      photoList: []
    }
  },
  methods: {
    // 设置已经选择的图片张数
    setCurrentPhotoNum: function (num) {
      if (num) {
        this.selectedPhotoNum = num
      }
    },
    // 设置最大可选张数
    setLimitPhotoNum: function (num) {
      if (num) {
        this.maxPhotoNum = num
      }
    },
    // 选取图片点击事件
    pickPhoto: function () {
      // 清空图片列表
      this.photoList = []
      // android使用微信js接口选图片
      if (this.isAndroid || this.iosWeixin) {
        console.warn('pickPhoto1')
        this.showWeixinPicker()
      } else {
        // 使用系统input选图片
        console.warn('pickPhoto3')
        document.getElementById('photo-picker-input').click()
      }
    },
    // 加载图片信息
    loadPhotoInfo: function (localIdOrFile, isWeixinJs, callback) {
      if (!isWeixinJs) {
        if (this.isIOS || this.isSafari) {
          wxJsComponent.loadAndCompressInputImageData(localIdOrFile, function (photoData, imageWidth, imageHeight) {
            if (callback) {
              console.warn('wxJsComponent.loadAndCompressInputImageData imageWidth:' + imageWidth + ', imageHeight:' + imageHeight)
              callback({'isWeixinJs': false, 'fileName': localIdOrFile.name, 'localData': photoData, 'originWidth': imageWidth, 'originHeight': imageHeight})
            }
          })
        } else {
          wxJsComponent.loadAndCompressInputImageData(localIdOrFile, function (photoData, imageWidth, imageHeight) {
            if (callback) {
              console.warn('wxJsComponent.loadAndCompressInputImageData imageWidth:' + imageWidth + ', imageHeight:' + imageHeight)
              callback({'isWeixinJs': false, 'fileName': localIdOrFile.name, 'localData': photoData, 'originWidth': imageWidth, 'originHeight': imageHeight})
            }
          })
        }
      } else {
        if (this.isAndroid) {
          wxJsComponent.loadImageWithUrl(localIdOrFile, function (sourceImage) {
            if (callback) {
              callback({'isWeixinJs': true, 'localId': localIdOrFile, 'originWidth': sourceImage.width, 'originHeight': sourceImage.height})
            }
          })
        } else {
          wxJsComponent.getImageBase64Data(localIdOrFile, function (photoData, imageWidth, imageHeight) {
            if (callback) {
              callback({'isWeixinJs': true, 'localId': localIdOrFile, 'localData': photoData, 'originWidth': imageWidth, 'originHeight': imageHeight})
            }
          })
        }
      }
    },
    // 加载图片信息
    loadPhotoListInfo: function (photoUrlList, isWeixinJs, callback) {
      if (photoUrlList && photoUrlList.length) {
        var that = this
        var loadItem = photoUrlList[0]
        this.loadPhotoInfo(loadItem, isWeixinJs, function (photoItem) {
          that.photoList.push(photoItem)
          if (photoUrlList.length > 1) {
            that.loadPhotoListInfo(photoUrlList.slice(1), isWeixinJs, callback)
          } else {
            if (callback) {
              callback() // 全部加载完
            }
          }
        })
      } else {
        if (callback) {
          callback()
        }
      }
    },
    // 微信Js选图片
    showWeixinPicker: function () {
      console.log('onTapShowMore')
      var that = this
      var avaiNum = this.maxPhotoNum - this.selectedPhotoNum
      wxJsComponent.pickPhoto(function (success, localIds) {
        if (success) {
          if (localIds && localIds.length) {
            that.loadPhotoListInfo(localIds, true, function () {
              that.$emit('onLoadLocalIds', that.photoList)
              that.photoList = null
            })
          }
        } else {
          Toast({
            message: '添加图片失败',
            duration: 600
          })
        }
      }, avaiNum)
    },
    // 系统input选取图片
    onPickedPhotos: function (event) {
      var files = event.currentTarget.files
      console.log('onPickedPhotos')
      var that = this
      if (files && files.length) {
        // 限制图片张数
        if (files.length + this.selectedPhotoNum > this.maxPhotoNum) {
          // alert('最多可以选取' + this.maxPhotoNum + '张图片')
          Toast({
            message: '最多可以选取' + this.maxPhotoNum + '张图片',
            duration: 600
          })
          return
        }
        var photos = []
        var fileItem
        for (fileItem of files) {
          photos.push(fileItem)
        }
        this.loadPhotoListInfo(photos, false, function () {
          that.$emit('onLoadLocalIds', that.photoList)
        })
      }
    }
  },
  mounted: function () {
  },
  created: function () {
  }
}
</script>

<style scoped>
.photo-picker-container {
}
</style>

<template>
  <div class="demo">
    <div class="title">
      TYPhotoPicker
    </div>
    <div class="tip">
      1. 能够在微信之外运行，但主要还是为了在微信页面内调用相册选择器而设计的 <br>
      2. 在微信中使用，由于iOS平台中的图片转码缓慢，所以弃用调用微信js<br>
      3. 调整PhotoPicker.isIosWeixin是够调用微信JS的，要看调用微信JS的效果，可以通过Android识别以下二维码，页面打开后在最下方可以看到 <br>
      <img :src="qrImg" width="200" height="200"> <br>
      4. 本组件的依赖有weixin-js-sdk、exif-js、mint-ui，调用之前要先安装 <br>
      5. 实际开发中可以先申请申请测试账号做调试，当然获取AccessToken、jsapi_ticket和申请签名的活，必须还是要服务器来做，前端实现不了 <br>
      6. 申请微信测试公众号地址：https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login <br>
    </div>
    <div class="item">
      <div class="question">
        请选择图片：
      </div>
      <div class="display-flex-box flex-wrap">
        <div v-for="(item, index) in imgs" class="img-box">
          <img :src="item" class="img shrink-none" @click="deleteImg(index)">
        </div>
        <div v-if="imgs.length < 10" class="img-box background-none">
          <img :src="addMoreImg" class="img shrink-none" @click="addImg">
        </div>
        <photo-picker ref="tyPhotoPicker" hidden="true" @onLoadLocalIds="onLoadLocalIds"></photo-picker>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoPicker from './photoPicker/PhotoPicker.vue'
import { MessageBox } from 'mint-ui'

export default {
  name: 'Demo',
  data () {
    return {
      isWeixinJs: false, // 是否在调用微信Js
      addMoreImg: require('./photoPicker/icon_content_n_pc.png'),
      imgs: [], // 界面展示的图片本地地址
      imgData: [], // 需要上传图片的数据
      // http://mmbiz.qpic.cn/mmbiz_jpg/52qI3slqMgEQ0sucicop1LAYAjTTc7GBecpTxGYn6jBXpw3P8xoh2O1AwsPrAgHzSqmgk8EQnjicAhm0OTJ2M9tA/0
      qrImg: require('../assets/1512745266.png')
    }
  },
  components: {
    'photo-picker': PhotoPicker
  },
  methods: {
    deleteImg: function (index) {
      var that = this
      MessageBox({
        title: '提示',
        message: '是否删除图片',
        showCancelButton: true
      }).then(action => {
        if (action === 'cancel') {
          return
        }
        that.imgs.splice(index, 1)
        that.imgData.splice(index, 1)
      }, function (error) {
        console.log(error)
      })
    },
    addImg: function () {
      console.log('addImg')
      // 设置最多选10张图片
      this.$refs.tyPhotoPicker.setLimitPhotoNum(10)
      // 已经选择的图片张数
      this.$refs.tyPhotoPicker.setCurrentPhotoNum(this.imgs.length)
      this.$refs.tyPhotoPicker.pickPhoto()
    },
    onLoadLocalIds: function (photos) { // 图片选择完毕走这里
      console.debug('onLoadLocalIds====')
      console.debug(photos)
      this.imgData = this.imgData.concat(photos)
      this.isWeixinJs = photos[0].isWeixinJs
      if (this.isWeixinJs) {
        // console.debug('使用微信SDK')
        var localIds = []
        for (var j = 0; j < photos.length; j++) {
          localIds.push(photos[j].localId)
        }
        this.imgs = this.imgs.concat(localIds) // 安卓是localId，iOS是base64
        console.debug('this.imgs----')
        console.debug(this.imgs)
      } else {
        // console.debug('不使用微信SDK')
        var localDataList = []
        for (var i = 0; i < photos.length; i++) {
          if (photos[i].localData) {
            localDataList.push(photos[i].localData)
          }
        }
        this.imgs = this.imgs.concat(localDataList) // 安卓是localId，iOS是base64
        console.debug('this.imgs----')
        console.debug(this.imgs)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.demo {

}
.title {
  font-size: 20px;
  font-weight: bold;
  height: 30px;
  line-height: 30px;
  background-color: rgb(215, 215, 215);
}
.tip {
  text-align: left;
  background-color: rgb(215, 215, 215);
}
.item {
  padding: 20px 0px;
  border-bottom: dashed 1px #e5e5e5;
  /*background-color: rgb(254, 88, 183);*/
  /*border-bottom: solid 1px red;*/
}
.question {
  text-align: left;
  font-size: 15px;
  color: #666;
}
.img-box {
  margin-top: 10px;
  margin-left: 9px;
  margin-right: 9px;
  width: 64px;
  height: 64px;
  background-color: rgb(204,204,204);
}
.background-none {
  background: none;
}
.img {
  width: 100%;
  height: 100%;
  object-fit: scale-down !important;
  cursor: pointer;
}
.display-flex-box {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: box;
  display: flex;
}
.flex-wrap {
  -ms-flex-wrap: wrap;
      flex-wrap: wrap;
    -webkit-flex-wrap: wrap;
}
/*空间不足的时候不压缩*/
.shrink-none {
  -ms-flex-negative: 0;
  -webkit-flex-shrink: 0;
  -webkit-box-shrink: 0;
      flex-shrink: 0;
}
</style>

# TYPhotoPicker

> 1. 包含图片的选择、展示、压缩、判断图片方向、识别图片实际尺寸
> 2. 能够在微信之外运行，但主要还是为了在微信页面内调用相册选择器而设计的 
> 3. 由于我自己没有搭建服务器，不能获取到weixinJSSDK的签名，本Demo只能展示调用系统相册选择图片，PC端和移动端都可以
> 4. 调整PhotoPicker.isIosWeixin是够调用微信JS的，要看调用微信JS的效果，可以通过Android识别以下二维码，页面打开后在最下方可以看到 
>   ![Android中调用微信相册选择图片](./src/assets/1512745266.png)
> 5. 本组件的依赖有weixin-js-sdk、exif-js、mint-ui，调用之前要先安装
>   5.实际开发中可以先申请申请测试账号做调试，当然获取AccessToken、jsapi_ticket和申请签名的活，必须还是要服务器来做，前端实现不了 
>    申请微信测试公众号地址：https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
## Demo地址
https://thomasty.github.io/TYPhotoPicker/dist/#/

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

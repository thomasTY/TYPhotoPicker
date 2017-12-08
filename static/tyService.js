'use strict'

var $ = require('jquery')

var tyService = new function () {
  var appId = ''
  // 接口前半段
  var baseUrl = 'https://api.weixin.qq.com'
  // 获取AccessToken
  var accessTokenUrl = '/cgi-bin/token'
  // 获取jsapi_ticket
  var jsapiTicketUrl = '/cgi-bin/ticket/getticket'
  // 发送请求
  this.commonRequest = function (requestType, isAsync, addtionalUrl, jsonData, callback) {
    var url = baseUrl + addtionalUrl
    console.log('commonRequest #url:' + url + '#isAsync:' + isAsync + '#jsonData:' + jsonData)
    $.ajax({
      type: requestType,
      url: url,
      async: isAsync,
      data: jsonData,
      dataType: 'JSON',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (result) {
        console.log('commonRequest success url:' + url + ' 结果：' + JSON.stringify(result))
        if (result && result.errcode === 0) {
          if (callback) {
            callback(true, result)
          }
        } else {
          if (callback) {
            callback(false, result)
          }
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log('commonRequest error url:' + url + ' 失败：' + XMLHttpRequest.status)
        console.log(XMLHttpRequest)
        console.log(textStatus)
        console.log(errorThrown)
        if (callback) {
          callback(false)
        }
      }
    })
  }
  // 获取微信AccessToken（实际开发中，应该由后台获取AccessToken）
  this.getWXConfigAccessToken = function (appid, secret, callback) {
    appId = appid
    console.warn('getWXConfigAccessToken')
    this.commonRequest('GET', true, (accessTokenUrl + '?grant_type=client_credential' + '&appid=' + appid + '&secret=' + secret), '', function (success, result) {
      if (success) {
        if (callback) {
          callback(true, result.data)
        }
      } else {
        if (callback) {
          callback(false)
        }
      }
    })
  }

  // 获取微信jsapi_ticket（实际开发中，应该由后台获取jsapi_ticket）
  this.getWXConfigTicket = function (accessToken, callback) {
    console.warn('getWXConfigTicket')
    this.commonRequest('GET', true, (jsapiTicketUrl + '?type=jsapi' + '&access_token=' + accessToken), '', function (success, result) {
      if (success) {
        if (callback) {
          callback(true, result.data)
        }
      } else {
        if (callback) {
          callback(false)
        }
      }
    })
  }

  // 获取微信config签名（实际开发中，应该由后台实现生成签名的逻辑）
  this.getWXConfigSignature = function (ticket, noncestr, timestamp, pageUrl, callback) {
    console.warn('getWXConfigSignature:' + pageUrl)
    var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + pageUrl
    var sha1 = this.sha1(str)
    if (sha1) {
      var response = {
        'activeStatus': true,
        'appId': appId,
        'timestamp': timestamp,
        'nonceStr': noncestr,
        'signature': sha1
      }
      callback(true, response)
    } else {
      callback(false)
    }
  }

  // SHA-1算法（实际开发中，应该由后台实现SHA-1算法）
  this.sha1 = function (str) {
    hexSha1(str)

    var hexcase = 0  /* hex output format. 0 - lowercase 1 - uppercase */
    function hexSha1 (s) {
      return binb2hex(coreSha1(alignSHA1(s)))
    }

    /*
     *
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     *
     */
    function coreSha1 (blockArray) {
      var x = blockArray // append padding
      var w = Array(80)
      var a = 1732584193
      var b = -271733879
      var c = -1732584194
      var d = 271733878
      var e = -1009589776
      for (var i = 0; i < x.length; i += 16) { // 每次处理512位 16*32
        var olda = a
        var oldb = b
        var oldc = c
        var oldd = d
        var olde = e
        for (var j = 0; j < 80; j++) { // 对每个512位进行80步操作
          if (j < 16) {
            w[j] = x[i + j]
          } else {
            w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1)
          }
          var t = safeAdd(safeAdd(rol(a, 5), sha1Ft(j, b, c, d)), safeAdd(safeAdd(e, w[j]), sha1Kt(j)))
          e = d
          d = c
          c = rol(b, 30)
          b = a
          a = t
        }
        a = safeAdd(a, olda)
        b = safeAdd(b, oldb)
        c = safeAdd(c, oldc)
        d = safeAdd(d, oldd)
        e = safeAdd(e, olde)
      }
      return [a, b, c, d, e]
    }

    /*
     *
     * 返回对应F函数的值
     *
     */
    function sha1Ft (t, b, c, d) {
      if (t < 20) {
        return (b & c) | ((~b) & d)
      }
      if (t < 40) {
        return b ^ c ^ d
      }
      if (t < 60) {
        return (b & c) | (b & d) | (c & d)
      }
      return b ^ c ^ d // t<80
    }

    /*
     * 返回对应的Kt值
     *
     */
    function sha1Kt (t) {
      return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514
    }

    /*
     *
     * 将32位数拆成高16位和低16位分别进行相加，从而实现 MOD 2^32 的加法
     *
     */
    function safeAdd (x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF)
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
      return (msw << 16) | (lsw & 0xFFFF)
    }

    /*
     *
     * 32位二进制数循环左移
     *
     */
    function rol (num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt))
    }

    /*
     *
     * The standard SHA1 needs the input string to fit into a block
     * This function align the input string to meet the requirement
     *
     */
    function alignSHA1 (str) {
      var nblk = ((str.length + 8) >> 6) + 1
      var blks = new Array(nblk * 16)
      for (var i = 0; i < nblk * 16; i++) {
        blks[i] = 0
      }
      for (i = 0; i < str.length; i++) {
        blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8)
      }
      blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8)
      blks[nblk * 16 - 1] = str.length * 8
      return blks
    }

    /*
     *
     * Convert an array of big-endian words to a hex string.
     *
     */
    function binb2hex (binarray) {
      var hexTab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
      var str = ''
      for (var i = 0; i < binarray.length * 4; i++) {
        str += hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hexTab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF)
      }
      return str
    }
  }
}

export default tyService

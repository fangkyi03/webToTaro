import Taro from '@tarojs/taro';
/**
 * Using a custom _app.js with next-seo you can set default SEO
 * that will apply to every page. Full info on how the default works
 * can be found here: https://github.com/garmeeh/next-seo#default-seo-configuration
 */import { Container } from "next/app";
import Head from "next/head";
import "./app.less";
import apiTool from "../command/apiTool";
import BottomBar from "../components/BottomBar";
import HeaderTitle from "../components/HeaderTitle";
import Router from 'next/router';

class AppComponent extends React.Component {
  getRouter = () => {
    const {
      router
    } = this.props;

    if (typeof window == "object") {
      if (window.location.search.indexOf("?") !== -1) {
        const obj = {};
        const searchArr = window.location.search.split("?")[1].split("&");
        searchArr.forEach((e, index) => {
          const splitArr = e.split("=");
          obj[splitArr[0]] = splitArr[1];
        });
        return obj;
      } else {
        return {};
      }
    } else {
      return router.query;
    }
  };

  constructor(props) {
    super(props);
    const url = this.props.router.route;
    this.state = {
      isShow: false
    };
  }

  componentDidMount() {
    apiTool.getIsWxClient({
      fail: () => {
        this.setState({
          isShow: true
        });
      }
    });
    fetch(`/api/mini/project/wechat/getNewAccessToken`, {
      method: "POST",
      body: JSON.stringify({
        url: location.href.split('#')[0]
      }),
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      }
    }).then(e => e.json()).then(e => {
      const config = {
        debug: false,
        appId: e.appid,
        timestamp: e.timestamp,
        nonceStr: e.noncestr,
        signature: e.signature,
        jsApiList: ["chooseImage", "uploadImage", "previewImage", "checkJsApi", "translateVoice", "startRecord", "stopRecord", "translateVoice", "scanQRCode", "openCard"] // 必填，需要使用的JS接口列表

      };
      wx.config(config);
      wx.error(function (res) {// alert(JSON.stringify(res));
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      });
    }); // ${location.href.split('#')[0]}
    // getNewAccessTokenUsingPOST LoginController_MINIPROJECT
    //
    //  fetch(`/wechatApi/getToken?url=${location.href.split('#')[0]}`)
    // fetch(`/getToken?url=${location.href.split('#')[0]}`, {
    //   method: "GET",  
    // })
    //   .then(e => e.json())
    //   .then(e => {
    //     console.log('输出签名',e)
    //     const config = {
    //       debug:true,
    //       ...e.data,
    //       // appId: e.appId,
    //       // timestamp: e.timestamp,
    //       // nonceStr: e.nonceStr,
    //       // signature: e.signature,
    //       jsApiList: [
    //         "chooseImage",
    //         "uploadImage",
    //         "previewImage",
    //         "checkJsApi",
    //         "translateVoice",
    //         "startRecord",
    //         "stopRecord",
    //         "translateVoice",
    //         "scanQRCode",
    //         "openCard"
    //       ] // 必填，需要使用的JS接口列表
    //     };
    //     wx.config(config);
    //     wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
    //       wx.chooseImage({
    //         count: 1, // 默认9
    //         sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //         sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    //         success: function (res) {
    //           var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
    //         }
    //       });
    //     });
    //     wx.error(function(res) {
    //       console.log('输出错误',res)
    //       // alert(JSON.stringify(res));
    //       // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    //     });
    //   });
  }

  onScan = () => {
    alert('扫描被点击');
    wx.scanQRCode({
      needResult: 1,
      // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ["qrCode", "barCode"],
      // 可以指定扫二维码还是一维码，默认二者都有
      success: function (res) {
        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
        // window.location.href = result;//因为我这边是扫描后有个链接，然后跳转到该页面
      },
      error: function (res) {
        alert(res);
      }
    });
  };
  getRouterData = () => {
    const {
      route,
      asPath
    } = this.props.router; // let url = asPath.split('?')[0]   bug  路径后加上/后界面底部导航栏加载不出

    let url = route;

    if (asPath.indexOf('/index') === 0 || asPath.indexOf('/index/') === 0) {
      url = '/index';
    }

    if (['/', '/commonIndex', '/commonClass', '/my'].indexOf(url) !== -1) {
      return [{
        name: '首页',
        key: 'commonIndex',
        icon: 'index',
        isFocus: url == '/' || url == '/commonIndex'
      }, {
        name: '分类',
        key: 'commonClass',
        icon: 'class',
        isFocus: url == '/commonClass'
      }, // {
      //     name:'扫描',
      //     key:'scan',
      //     icon: 'scan',
      //     isFocus:url == '/scan',
      //     onClick:this.onScan
      // },
      {
        name: '我的',
        key: 'my',
        icon: 'my',
        isFocus: url == '/my'
      }];
    } else if (['/index', '/classify'].indexOf(url) !== -1) {
      return [{
        name: '馆首页',
        key: 'index',
        icon: 'index',
        isFocus: url == '/index'
      }, {
        name: '馆分类',
        key: 'class',
        icon: 'class',
        isFocus: url == '/classify'
      }, // {
      //     name:'扫描',
      //     key:'scan',
      //     icon: 'scan',
      //     isFocus:url == '/scan',
      //     onClick:this.onScan
      // },
      {
        name: '我的',
        key: 'my',
        icon: 'my',
        isFocus: url == '/my'
      }];
    } else {
      return [];
    }
  };

  render() {
    const {
      Component,
      pageProps,
      router,
      ...arg
    } = this.props;
    return <Container>
        <Head>
          {}
          <script src={"https://res.wx.qq.com/open/js/jweixin-1.4.0.js"} />
          <meta name="viewport" content="width=device-width,height=device-height,initial-scale=1,maximum-scale=1, minimum-scale=1" />
          <script src="https://cdn.bootcss.com/fetch/3.0.0/fetch.min.js"></script>
          <script src="https://cdn.bootcss.com/Swiper/4.5.0/js/swiper.min.js"></script>
          <link href="https://cdn.bootcss.com/Swiper/4.5.0/css/swiper.min.css" rel="stylesheet"></link>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="browsermode" content="application" />
          <meta name="full-screen" content="true" />
          <meta name="x5-fullscreen" content="true" />
          <meta name="360-fullscreen" content="true" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta http-equiv="pragma" content="no-cache" />
          <meta http-equiv="cache-control" content="no-cache" />
          <meta http-equiv="expires" content="0" />
          <script type="text/javascript" src={'/static/scroll.js'} />
        </Head>
        <Component {...pageProps} {...arg} routerParams={this.getRouter(arg)} />
        <BottomBar data={this.getRouterData()} url={this.props.router.route} query={router.query} />
      </Container>;
  }

}

export default AppComponent;
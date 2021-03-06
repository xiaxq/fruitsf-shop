// pages/order-payment/order-payment.js
const Http = require('../../utils/request.js');
const app = getApp();
const Util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseSize: true,
    animationData: {},
    payInfo: '',
    ordersn: '',
    goodDetail: '',
    showModal: false,
    commodity: 0,
    orderId: '',
    isClick: true,
    ordinary: 0,
    endTime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.getOrderDetail(options.ordersn)
    if (app.globalData.payInfo == '') {
      this.wxOrderPay(options.ordersn)
    } else {

    }
    if (options.ordinary != undefined) {
      this.setData({
        ordinary: 1
      })
    }
    if (options.status == 0 || options.status == undefined) {
      this.setData({
        chooseSize: true
      })
    }else {
      this.setData({
        chooseSize: false
      })
    }
  },
  purChase() {
    wx.switchTab({
      url: '/pages/class/class'
    })
  },
  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(400).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      chooseSize: true
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 200)
  },
  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(300).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseSize: false
      })
    }, 200)
  },
  immediatePay() {
    let that = this
    if (that.data.isClick) { //防止重复点击
      that.setData({
        isClick: false
      })
      setTimeout(function () {
        that.setData({
          isClick: true
        })
      }, 1500)
    } else {
      return false
    }
    that.chooseSezi()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //取消订单
  cancelOrder(e) {
    var that = this
    var orderId = e.currentTarget.dataset.orderid
    wx.showModal({
      title: '提示',
      content: '确认要取消该订单？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('用户点击主操作')
          that.getCanelOrder(orderId)
        } else {
          console.log('用户点击辅助操作')
        }
      }
    })
  },
  //取消订单
  getCanelOrder(orderId) {
    var that = this
    let params = {
      orderId: orderId
    }
    Http.HttpRequst(false, '/order/cancelOrder', true, '', params, 'post', false, function (res) {
      if (res.state == 'ok') {
        that.getOrderDetail(that.data.orderSn)
      }
    })
  },
  showPayModal() {
    this.setData({
      showModal: true
    })
  },
  hidePayToast() {
    this.setData({
      showModal: false
    })
  },
  //订单支付
  wxOrderPay(orderSn) {
    let that = this
    if (that.data.isClick) { //防止重复点击
      that.setData({
        isClick: false
      })
      setTimeout(function () {
        that.setData({
          isClick: true
        })
      }, 1000)
    } else {
      return false
    }
    Http.HttpRequst(false, '/pay/orderPay?orderSn=' + orderSn, false, '', '', 'post', false, function (res) {
      if (res.state == 'ok') {
        that.setData({
          payInfo: res.data
        })
      }
    })
  },
  wxPayShop() {
    //支付方法
    // wx.navigateTo({
    //   url: '/pages/my-order/order?ordinary=0'
    // })
    wx.requestPayment({
      timeStamp: this.data.payInfo.timeStamp,
      nonceStr: this.data.payInfo.nonceStr,
      package: this.data.payInfo.package,
      signType: 'MD5',
      paySign: this.data.payInfo.paySign,
      success(res) { 
        wx.showToast({
          title: '支付成功!',
          icon: 'nonw',
          duration: 1500,
        })
        setTimeout(()=>{
          wx.navigateTo({
            url: '/pages/my-order/order?ordinary=0'
          })
        },1000)
      },
      fail(res) { }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData.payInfo)
    wx.hideShareMenu()
    if (app.globalData.payInfo == '') {
      
    } else {
      this.setData({
        payInfo: app.globalData.payInfo.payInfo
      })
    }
  },
// 根据订单SN，查询商品订单详情
  getOrderDetail(orderSn) {
    let that = this
    Http.HttpRequst(false, '/order/getOrderInfo?orderSn=' + orderSn, false, '', '', 'post', false, function (res) {
      if (res.state == 'ok') {
        var params = {
          totalPrice: res.data.order.totalAmount,
          walletAmount: res.data.order.walletAmount,
          wxAmount: res.data.order.wxAmount
        }
        var commodity = 0
        commodity = Number(res.data.order.totalAmount) - Number(res.data.order.freightAmount) - Number(res.data.order.packageAmount)
        console.log(res.data,'res.datares.data')
        that.setData({
          goodDetail: res.data,
          
          wxPayInfo: params,
          orderSn: res.data.order.orderSn,
          commodity: commodity.toFixed(2)
        })
        if (res.data.cutDown == undefined) {

        } else{
          that.setData({
            endTime: res.data.cutDown,
          })
          that.countDown()
        }
      }
    })
  },
  logistics() {

  },
  getPhone(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone //仅为示例，并非真实的电话号码
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  countDown() { //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    let newTime = Date.parse(new Date());
    let endTimeList = this.data.endTime;
    let endTime = ''
    let countDownArr = []
    // 对结束时间进行处理渲染到页面
    if (endTimeList == undefined) {
      
    } else {
      endTime = Date.parse(new Date(endTimeList.replace(/-/g, "/")));
    }
    let obj = null;
    // 如果活动未结束，对时间进行处理
    // console.log("endTime=" + endTime);
    // console.log("newTime=" + newTime);
    let time = (endTime - newTime) / 1000;
    obj = Util.parseTimeToDay(time);
    // countDownArr.push(obj);
    // 渲染，然后每隔一秒执行一次倒计时函数
    this.setData({ countDown: obj })
    setTimeout(this.countDown, 1000);
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log(this.data.ordinary)
    if (this.data.ordinary == 1) {

    } else {
      wx.switchTab({
        url: '/pages/shopping-cart/shopping-cart',
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
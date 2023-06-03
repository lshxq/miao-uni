"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
}
const _sfc_main = {
  globalData: {
    loginResp: false,
    userInfoResp: false
  },
  onLaunch: function() {
    common_vendor.wx$1.login({
      success(loginResp) {
        getApp().globalData.loginResp = loginResp;
        common_vendor.wx$1.getUserInfo({
          success(userInfoResp) {
            getApp().globalData.userInfoResp = userInfoResp;
          }
        });
      },
      fail(err) {
        console.error("login failed", err);
      }
    });
  },
  onShow: function() {
  },
  onHide: function() {
  }
};
if (!Array) {
  const _component_router_view = common_vendor.resolveComponent("router-view");
  _component_router_view();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {};
}
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "D:/tian/workspace/HBuilderProjects/miao/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;

"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  props: {
    timeRemain: Number,
    score: Number,
    hidden: Boolean
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($props.timeRemain),
    b: common_vendor.t($props.score),
    c: $props.hidden ? 1 : ""
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-44485c5a"], ["__file", "C:/Users/uu/Documents/HBuilderProjects/miao/pages/index/state-bar.vue"]]);
wx.createComponent(Component);

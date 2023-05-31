<template>
  <view class="state-bar-main">
    <view class="state-item">
      <view class="label">时间</view>
      <view class="time-remain">{{timeRemain}}</view>
    </view>
    
    <view class="state-item">
      <view class="label">得分</view>
      <view class="time-remain">{{score}}</view>
    </view>
  </view>
</template>

<script>


export default {
  props: {
    timeRemain: Number,
    score: Number
  },
}
</script>


<style scoped>

.state-bar-main {
  padding: calc(var(--height) / 100);
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  top: 0;
  left: 0;
  width: var(--width);
  height: var(--card-height);
  box-sizing: border-box;
}
.state-item>.label {
  font-size: calc(var(--card-width) / 5);
  display: block;
  color: white;
}
.time-remain {
  color: white;
  font-size: calc(var(--card-width) * .7);
}



.score {
  color: white;
  font-size: calc(var(--card-width) * .7);
}
</style>
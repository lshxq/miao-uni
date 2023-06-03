<template>
  <div class="tsy-switch-main" :class="switchClassComp" >
    <div class="label off">{{labelOff}}</div>
    <div class="tsy-switch" @click="toggle">
      <div class="ball" ></div>
    </div>
    <div class="label on">{{labelOn}}</div>
  </div>
  
</template>

<script>
export default {
  props: {
    value: Boolean,
    labelOn: String,
    labelOff: String,
  },
  computed: {
    switchClassComp() {
      return {
        on: this.value
      }
    }
  },
  mounted() {

  },
  methods: {
    toggle() {
      this.$emit('toggled', !this.value)
    }
  }
}
</script>

<style scoped>
.tsy-switch-main {
  --bg-color-on: #409eff;
  --bg-color-off: lightgray;
  --height: 50rpx;
  --width: 90rpx;
  --ball-pad: 3rpx;
  --label-font-size: 26rpx; 

  display: flex;
  align-items: center;
  user-select: none;
}

.tsy-switch-main>.label {
  padding: 5rpx;
  font-size: var(--label-font-size);
}

.tsy-switch-main>.tsy-switch {
  --ball-size: calc(var(--height) - 2 * var(--ball-pad));
  
  display: inline-block;
  border-radius: calc(var(--height) / 2) calc(var(--height) / 2) calc(var(--height) / 2) calc(var(--height) / 2) / 50% 50% 50% 50%;
  background: var(--bg-color-off);
  position: relative;
  height: var(--height);
  width: var(--width);
  transition: all .5s;
  cursor: pointer;
}

.tsy-switch-main.on>.tsy-switch{
  background: var(--bg-color-on);
}

.tsy-switch-main>.tsy-switch>.ball {
  transition: all .5s;
  top: var(--ball-pad);
  left: var(--ball-pad);
  position: absolute;
  display: inline-block;
  width: var(--ball-size);
  height: var(--ball-size);
  background: white;
  border-radius: 50%;
}

.tsy-switch-main.on>.tsy-switch>.ball {
  left: calc(var(--width) - var(--ball-size) - var(--ball-pad));
}
</style>
<template>
	<router-view></router-view>
</template>
<script>
	export default {
		globalData: {
			loginResp: false,
			userInfoResp: false,
		},
		
		onLaunch: function() {
			// console.log('App Launch')
			// const that = this
			wx.login({
				success(loginResp) {
					getApp().globalData.loginResp = loginResp
					wx.getUserInfo({
						success(userInfoResp) {
							getApp().globalData.userInfoResp = userInfoResp
						}
					})
				},
				fail(err) {
					console.error('login failed', err)
				}
			})
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>

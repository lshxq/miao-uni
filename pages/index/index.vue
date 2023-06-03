<template>
	<view class="main-panel" :class="mainPanelClass">
		<template v-if='cards' v-for="(layer,layerIdx) in cards">
			<template v-for="(row,rowIdx) in layer">
				<template v-for="(card, cardIdx) in row">
					<view v-if='card && !card.destory' 
					      class="card-item" 
						  :class='{dark: card.dark || pauseTimeStart !== 0}' 
						  :style="[cardStyle(card)]" 
						  @click.prevent.stop="cardClicked(card)"
						  :key='card.id'>
						<image v-if='card.type === 0' src="../../static/0.png" />
						<image v-if='card.type === 1' src="../../static/1.png" />
						<image v-if='card.type === 2' src="../../static/2.png" />
						<image v-if='card.type === 3' src="../../static/3.png" />
						<image v-if='card.type === 4' src="../../static/4.png" />
						<image v-if='card.type === 5' src="../../static/5.png" />
						<image v-if='card.type === 6' src="../../static/6.png" />
						<image v-if='card.type === 7' src="../../static/7.png" />
						<image v-if='card.type === 8' src="../../static/8.png" />
						<image v-if='card.type === 9' src="../../static/9.png" />
						<image v-if='card.type === 10' src="../../static/10.png" />
					</view>
				</template>
			</template>
		</template>

		<view class="xipai-btn control-btn" @click='xipaiClicked'>
			<view class='corner'>{{xipaiLeft}}</view>
			<text>洗牌</text>
		</view>

		<view class="zhanting control-btn" @click="pauseClicked">
			<text>{{pauseTimeStart === 0 ? "暂停" : "继续"}}</text>
			<view class="corner">{{pauseLeft}}</view>
		</view>
		
		<view class="speaker-btn" @click='audioOn = !audioOn'>
			<image v-if='audioOn' src='../../static/speaker-on.png'/>
			<image v-else src='../../static/speaker-off.png'/>
		</view>

		<state-bar :time-remain="timeRemain" :score="score" :hidden='show.welcome' />

		<div class="setting-panel  mask">
			
			<div class="switch">
				<div class="label">声音</div>
				<div class="input">开启<switch-btn :value='audioOn' @toggled='audioSwitch'/>关闭</div>
			</div>
			<div class="switch">
				<div class="label">音乐</div>
				<div class="input">开启<switch-btn :value='bgmOn' @toggled='value => bgmOn = value'/>关闭</div>
			</div>
		</div>

		<view class="welcome  mask">
			<view class="game-name" v-for="(item, idx) of gameNameDisplay" :key="idx" :style="[item.style]">
				{{item.char}}
			</view>
			<view class="start-button button" @click="startGame">开始游戏</view>
			<view class="setting-button button" @click="show.setting = !show.setting">设置</view>
		</view>



		<div class="game-over-mask mask">
			<div class="text">游戏结束</div>
			<div class="restart-button  button" @click="restartGame">重新开始</div>
		</div>

		<div class="bar"></div>

		<div class="water-mark link">
			http://tsy.zone/site/home
		</div>
	</view>
</template>



<script>
	import StateBar from './state-bar.vue'
	import SwitchBtn from './switch-btn.vue'

	const BAR_LENGTH = 8;
	const CARD_TYPE = 11

	let id = 1;
	const createCardsData = (layerCnt, rowCnt, columnCnt, typeCnt) => {
		

		const data = [];
		for (let layerIdx = 0; layerIdx < layerCnt; layerIdx++) {
			const layer = []

			for (let rowIdx = 0; rowIdx < rowCnt - layerIdx % 2; rowIdx++) {
				const row = []
				for (let colIdx = 0; colIdx < columnCnt - layerIdx % 2; colIdx++) {
					row.push({
						id,
						type: Math.floor(Math.random() * typeCnt),
						layerIdx,
						rowIdx,
						colIdx,
						dark: layerIdx !== layerCnt - 1,
					})
					id++;
				}
				layer.push(row)
			}
			data.push(layer)
		}
		return data;
	}


	export default {
		created() {},
		components: {
			StateBar,
			SwitchBtn
		},
		data() {
			return {
				gameName: '喵了个咪',

				gameStartTime: 0,
				pauseTimeStart: 0,
				pauseTime: 0,
				gameTime: 0,
				currentTime: 0,

				cards: false,
				bar: [],
				score: 0,

				audioOn: true,
				bgmOn: true,

				xipaiFlag: false,
				xipaiLeft: 3,

				pauseLeft: 3,

				show: {
					welcome: true,
					gameover: false,
					setting: false
				}
			}
		},
		
		computed: {
			timeRemain() {
				const {
					gameStartTime,
					currentTime,
					pauseTime,
					pauseTimeStart,
					gameTime,
				} = this
				let rv = 0
				if (pauseTimeStart === 0) { // 当前没有暂停
					rv = gameTime - (currentTime - gameStartTime) / 1000 + pauseTime
				} else {
					rv = gameTime - (pauseTimeStart - gameStartTime) / 1000 + pauseTime
				}
				if (rv < 0) {
					rv = 0
				}
				return Math.floor(rv)
			},

			gameNameDisplay() {
				const {
					gameName,
					height,
					width
				} = this;
				const arr = []


				const fs = Math.min(width, height) / (gameName.length)
				const offsetX = width / (gameName.length + 1)
				const centerX = width / 2
				const centerY = height / 2
				const radius = Math.min(width, height) / 2
				const deg = 60
				for (let idx = 0; idx < gameName.length; idx++) {
					const char = gameName.charAt(idx);
					const left = offsetX * (idx + 1)
					const a = centerX - left
					const topOffset = Math.sqrt(radius * radius - a * a)
					let top = centerY - topOffset

					const rot = deg / (gameName.length - 1) * (idx) - deg / 2
					arr.push({
						char,
						style: {
							left: `${left}rpx`,
							top: `${top}rpx`,
							transform: `rotate(${rot}deg) translateX(-50%)`,
							'font-size': `${fs}rpx`
						}
					})
				}
				return arr;
			},
			mainPanelClass() {
				const {
					welcome,
					gameover,
					setting
				} = this.show
				const classes = []
				if (welcome) {
					classes.push('show-welcome')
				}
				if (gameover) {
					classes.push('show-game-over')
				}
				if (setting) {
					classes.push('show-setting')
				}
				return classes
			},
			cardMarginLeft() {
				const {
					cardWidth,
					columnCount,
					width
				} = this
				return (width - cardWidth * columnCount) / 2
			},
			width() {
				return 750;
			},
			height() {
				return 1334;
			},
			cardHeight() {
				// const {
				// 	height
				// } = this
				return 130;
			},
			cardWidth() {
				const {
					cardHeight
				} = this
				return cardHeight * .6
			},
			columnCount() {
				const {
					width,
					cardWidth
				} = this
				return Math.floor(width * 0.95 / cardWidth)
			},
			barMarginLeft() {
				const {
					width,
					cardWidth,
				} = this
				return (width - cardWidth * BAR_LENGTH) / 2;
			}
		},
		watch: {
			audioOn(value) {
				if (this.bgmOn) {
					if (value) {
						this.audio.bgm.play()
					} else {
						this.audio.bgm.pause()
					}
				}
				
			},
			timeRemain(remain) {
				if (this.show.welcome || this.show.gameover) {
					return false
				}
				if (remain === 6) {
					this.audio.bgm.pause()
				}
				if (remain === 5 || remain === 4 || remain === 3 || remain === 2 || remain === 1) {
					this.audioOn && this.audio.du.play();
				}
				if (remain <= 0) {
					this.gameover()
				}
			}
		},
		onLoad() {
			setTimeout(() => {
				console.log(getApp().globalData)
			}, 5000)
			
			const that = this
			that.timerId = setInterval(() => {
				if (that.show.gameover || that.show.welcome) {
					return false
				}
				that.currentTime = Date.now()
			}, 100)

			const createAudio = (src, loop=false) => {
				const obj = uni.createInnerAudioContext();
				obj.sessionCategory = 'ambient';
				obj.src = src;
				obj.loop = loop;
				return obj
			}

			that.audio = {
				bgm: createAudio("https://img.tukuppt.com/newpreview_music/09/02/07/5c8a31e2c9f0298727.mp3", true),
				failed: createAudio("https://img.tukuppt.com/newpreview_music/09/00/25/5c89106c1b91b30143.mp3"),
				sua: createAudio("https://img.tukuppt.com/newpreview_music/09/00/62/5c893bcaf3c9980553.mp3"),
				du: createAudio("https://img.tukuppt.com/newpreview_music/09/04/04/5c8afef35a2001596.mp3"),
			}

		},
		onUnload() {
			clearTimeout(this.timerId)
			this.show.welcome = true
		},
		methods: {
			audioSwitch(value) {
				this.audioOn = value
			},
			cardInMatrix(layerIdx, rowIdx, colIdx, newValue) {
				const cards = JSON.parse(JSON.stringify(this.cards));
				const layer = cards[layerIdx];
				if (layer) {
					const row = layer[rowIdx];
					if (row) {
						const card = row[colIdx]
						if (newValue !== undefined) {
							row[colIdx] = newValue
							this.cards = cards
							// console.log(`set matrix L[${layerIdx}] R[${rowIdx}] C[${colIdx}] to new value`, newValue)
						}
						if (card) {
							return card
						}
					}
				}
				return false;
			},
			uncover(card) { // 翻开底部, 奇偶错位，分别处理
				const that = this

				const removed = (layerIdx, rowIdx, colIdx) => { // 被destory  或者 在 bar中 都是从 matrix中移除 了
					const card = this.cardInMatrix(layerIdx, rowIdx, colIdx)
					if (card === false) {
						return true
					}

					if (card.destory) {
						return card
					}

					const cardInBar = that.bar.find(cardInBar => {
						return cardInBar.id === card.id
					})

					return cardInBar
				}

				if (card.layerIdx % 2 === 0) { // 偶数层数据多
					const needCheckCards = [{ // 上一层相邻的4张牌
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx - 1,
						colIdx: card.colIdx - 1
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx - 1,
						colIdx: card.colIdx
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx,
						colIdx: card.colIdx - 1
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx,
						colIdx: card.colIdx
					}].map(pos => {
						const currCard = that.cardInMatrix(pos.layerIdx, pos.rowIdx, pos.colIdx)
						return currCard
					})

					const check = currCard => {
						const c1Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx);
						const c2Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx + 1);
						const c3Removed = removed(currCard.layerIdx + 1, currCard.rowIdx + 1, currCard.colIdx)
						const c4Removed = removed(currCard.layerIdx + 1, currCard.rowIdx + 1, currCard.colIdx + 1)
						if (c1Removed && c2Removed && c3Removed && c4Removed) {
							currCard.dark = false
							that.cardInMatrix(currCard.layerIdx, currCard.rowIdx, currCard.colIdx, currCard)
						}
					}

					needCheckCards.forEach(cardNeedCheck => {
						cardNeedCheck && check(cardNeedCheck)
					})


				} else { // 奇数层
					const needCheckCards = [{ // 上一层相邻的4张牌
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx,
						colIdx: card.colIdx
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx + 1,
						colIdx: card.colIdx
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx,
						colIdx: card.colIdx + 1
					}, {
						layerIdx: card.layerIdx - 1,
						rowIdx: card.rowIdx + 1,
						colIdx: card.colIdx + 1
					}].map(pos => {
						const currCard = that.cardInMatrix(pos.layerIdx, pos.rowIdx, pos.colIdx)
						return currCard
					})

					const check = currCard => {
						const c1Removed = removed(currCard.layerIdx + 1, currCard.rowIdx - 1, currCard.colIdx - 1);
						const c2Removed = removed(currCard.layerIdx + 1, currCard.rowIdx - 1, currCard.colIdx);
						const c3Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx - 1)
						const c4Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx)
						if (c1Removed && c2Removed && c3Removed && c4Removed) {
							currCard.dark = false
							that.cardInMatrix(currCard.layerIdx, currCard.rowIdx, currCard.colIdx, currCard)
						}
					}

					needCheckCards.forEach(cardNeedCheck => {
						cardNeedCheck && check(cardNeedCheck)
					})
				}
			},
			cardClicked(card) {
				if (card.dark) { // 黑牌不能点击
					return false
				}

				if (this.xipaiFlag) {
					return false
				}

				if (this.pauseTimeStart !== 0) {
					return false;
				}

				if (this.show.gameover) {
					return false
				}

				const that = this

				const cardInBarBeforePush = that.bar.find(cib => {
					return cib.id === card.id
				})

				if (cardInBarBeforePush) { // 已经在bar中的不能点击
					return false
				}

				if (that.bar.length === BAR_LENGTH) {
					return false
				}
				/*
				if (card.layerIdx === 1) { // 点击到了倒数第2层，数据扩充
					const newCards = [...createCardsData(2, 7, this.columnCount, CARD_TYPE), ...JSON.parse(JSON.stringify(this.cards))];
					for (let layerIdx=0; layerIdx<newCards.length; layerIdx++) {
						const layer = newCards[layerIdx]
						for (const row of layer) {
							for(const card of row) {
								card.layerIdx = layerIdx
							}
						}
					}
					this.cards = newCards
					console.log(this.cards)
				}
				*/

				that.audioOn && that.audio.sua.play();

				that.bar.push(card)
				that.bar.sort((a, b) => {
					return a.type - b.type
				})

				that.uncover(card)

				const destoryQueue = []
				const grouped = []
				for (const cardInBar of that.bar) {
					if (!grouped[cardInBar.type]) {
						grouped[cardInBar.type] = []
					}
					grouped[cardInBar.type].push(cardInBar)
				}
				for (const key in grouped) {
					const cardGroup = grouped[key]
					if (cardGroup.length >= 3) {
						for (let destoryIdx = 0; destoryIdx < 3; destoryIdx++) {
							destoryQueue.push(cardGroup[destoryIdx])
						}
						that.gameTime += 5
						setTimeout(() => {
							that.score += 1;
							destoryQueue.forEach(cardInGroup => {
								cardInGroup.destory = true
								that.cardInMatrix(cardInGroup.layerIdx, cardInGroup.rowIdx, cardInGroup
									.colIdx, cardInGroup)
								that.deleteCardInBar(cardInGroup.id)

							})
						}, 1000)
					}
				}

				let barItemCnt = 0
				that.bar.forEach(cardInBar => {
					const needDestory = destoryQueue.find(cardInDestory => {
						return cardInBar.id === cardInDestory.id
					})
					if (!needDestory) {
						barItemCnt++
					}
				})
				if (barItemCnt > BAR_LENGTH - 1) {
					that.gameover()
				}
			},
			pauseClicked() {
				if (this.pauseTimeStart === 0) {
					if (this.pauseLeft <= 0) {
						return false
					}
					this.pauseLeft -= 1
					this.pauseTimeStart = Date.now()
				} else {
					this.pauseTime += (Date.now() - this.pauseTimeStart) / 1000
					this.pauseTimeStart = 0
				}
			},
			deleteCardInBar(cardId) {
				const newBar = []

				for (let idx = 0; idx < this.bar.length; idx++) {
					const cardInBar = this.bar[idx];
					if (cardInBar && cardInBar.id !== cardId) {
						newBar.push(cardInBar)
					}
				}

				this.bar = newBar
			},
			getCardPositionInBar(cardId) {
				const {
					bar,
					height,
					cardWidth,
					barMarginLeft
				} = this

				let left = 0;
				for (let idx = 0; idx < bar.length; idx++) {
					if (bar[idx].id === cardId) {
						left = Math.floor(idx * cardWidth + barMarginLeft)
						break;
					}
				}

				return {
					top: Math.floor(height * 0.9),
					left
				}
			},
			cardStyle(card) {
				
				const cardInBar = this.bar.find(cardInBar => {
					return cardInBar && cardInBar.id === card.id
				})
				if (cardInBar) { // 已经加入bar，用bar中的位置
					const pos = this.getCardPositionInBar(card.id)
					const style = {
						top: `${pos.top}rpx`,
						left: `${pos.left}rpx`,
						'z-index': 100000 + card.layerIdx,
					}
					return style;
				}

				const {
					width,
					height,
					cardWidth,
					cardHeight
				} = this

				let offsetX = 0;
				let offsetY = 0;
				if (card.layerIdx % 2 === 1) {
					offsetX = cardWidth / 2
					offsetY = cardHeight / 2
				}
				const leftValue = card.colIdx * this.cardWidth + this.cardMarginLeft + offsetX
				const topValue = card.rowIdx * this.cardHeight + this.cardHeight + offsetY

				let top = topValue
				let left = leftValue

				if (this.xipaiFlag) { // 如果当前正在洗牌，
					const centerX = width / 2
					const centerY = height / 2

					let cx = left + cardWidth / 2
					let cy = top + cardHeight / 2

					if (cy === centerY) {
						cy = +1
					}
					if (cx === centerX) {
						cx += 1
					}
					const b = centerY - cy // >0 上面    <0 下面
					const a = centerX - cx // >0左面     <0 右面

					let tan = b / a

					if (tan > 20) {
						tan = 20
					} else if (tan < -20) {
						tan = -20
					}

					if (cx <= centerX) { // 左面
						left = centerX - width

						if (cy <= centerY) { // 4
							top = left * tan
						} else { // 3
							top = left * tan + centerY
						}

					} else { // 右面
						left = centerX + width

						if (cy <= centerY) { // 1
							top = left * tan
						} else { // 2
							top = left * tan
						}
					}

					return {
						top: `${top}rpx`,
						left: `${left}rpx`,
					}
				}



				return {
					top: `${topValue}rpx`,
					left: `${leftValue}rpx`,
				}
			},
			xipaiClicked() {
				const that = this

				if (that.xipaiLeft <= 0) {
					return false
				}
				if (that.xipaiFlag) {
					return false
				}

				that.xipaiFlag = true
				that.xipaiLeft -= 1

				setTimeout(() => {
					that.xipaiFlag = false
					const {
						cards
					} = that
					for (const layer of cards) {
						for (const row of layer) {
							for (const card of row) {
								const cardInBar = that.bar.find(cardInBar => {
									return cardInBar && cardInBar.id === card.id
								})
								if (!cardInBar && !card.destory) { // 已经加入bar，用bar中的位置, 只能变换不在bar中的card
									card.type = Math.floor(Math.random() * CARD_TYPE)
								}

							}
						}
					}
				}, 1000)
			},
			gameover() {
				const that = this
				that.audio.bgm.pause()
				that.audioOn && that.audio.failed.play()
				that.show.gameover = true
			},
			startGame() {
				this.show.welcome = false
				this.newGame()
			},
			restartGame() {
				this.newGame()
			},
			newGame() {
				const that = this
				const {
					columnCount
				} = that

				that.show.setting = false
				that.cards = createCardsData(8, 7, columnCount, CARD_TYPE);
				that.gameStartTime = Date.now();
				that.pauseLeft = 3;
				that.xipaiLeft = 3;
				that.gameTime = 100;
				that.pauseTime = 0;
				that.pauseTimeStart = 0;
				that.show.gameover = false;
				that.bar = [];
				that.score = 0;
				that.audioOn && that.bgmOn && that.audio.bgm.play();
			}
		}
	}
</script>

<style>
	.main-panel {
		--width: 750rpx;
		--height: 1334rpx;
		--card-height: 130rpx;
		--card-width: calc(var(--card-height) * 0.6);
		--bar-length: 8;
		--bar-left: calc((var(--width) - var(--card-width) * var(--bar-length)) / 2);
		--bar-top: calc(var(--height) * 0.9);
		--welcome-z: 1000000;
		--speaker-z: calc(var(--welcome-z) + 1);
		--game-over-z: calc(var(--speaker-z) + 1);
		--water-mark-z: calc(var(--speaker-z) + 1);

		overflow: hidden;
		height: 100vh;
		width: var(--width);
		position: relative;
		background: linear-gradient(190deg, hsl(250, 100%, 65%), hsl(200, 100%, 65%), hsl(100, 100%, 64%))
	}

	.card-item {
		display: inline-block;
		position: absolute;
		width: var(--card-width);
		height: var(--card-height);
		border: 1rpx solid lightgray;
		transition: all 1s;

	}

	.card-item.dark {
		filter: brightness(.3);
	}

	.card-item>image {
		width: 100%;
		height: 100%;
	}

	.control-btn {
		position: absolute;
		font-size: calc(var(--card-width) * .3);
		padding: calc(var(--card-width) * .15);
		background: linear-gradient(#eee, white, #eee);
		border-radius: calc(var(--card-width) * .2);
		cursor: pointer;
		color: rgb(77, 73, 73);
		border: 1rpx solid gray;
		--box-shadow-size: calc(var(--card-width) * .05);
		box-shadow: var(--box-shadow-size) var(--box-shadow-size) var(--box-shadow-size) gray;
		top: calc(var(--height) * 0.82);
	}

	.xipai-btn {
		right: calc(var(--card-width) * 0.5);
	}

	.zhanting {
		right: calc(var(--card-width) * 2);
	}

	.control-btn>.corner {
		display: flex;
		justify-content: center;
		align-items: center;
		--coner-width: calc(var(--card-width) * .4);
		position: absolute;
		right: 0;
		top: calc(0rpx - var(--coner-width) * .5);
		border-radius: calc(var(--coner-width) / 2);
		background: red;
		color: white;
		width: var(--coner-width);
		height: var(--coner-width);
	}

	.bar {

		height: var(--card-height);
		width: calc(var(--card-width) * var(--bar-length));
		background: lightgray;
		position: absolute;
		left: var(--bar-left);
		top: var(--bar-top);
		border-radius: 10rpx;
	}

	.bar:before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: white;
		filter: blur(20rpx);
	}
	
	.setting-panel {
		top: calc(0rpx - 100vh);
		background: url('data:image/webp;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAGiAooDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9O6KKKACiiigAooooAKKKKAIrltsLH1GKZaz+Yuxj8w/UUzUJNkar6nNUVuDG4dTyK8yvXlSxKa26kt2NmiomuYI4PtMsqpEBuLMcAD3NV9M1ix1dZWsZd4hfYxxjPHUe3+FdcsZh4Vo4eU0pyu0rq7S3styi7RRRXQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVU1LU7TSbb7VeOVj3BOBk5Pt+v4VlXr0sLSlWrSUYxV23okvMC3UNzN5ScfePSi2u7a8hFxazpLGejKcis2W582Uvnjt9K5sRil7FTou/Ns1qrd0Juxo2jFouTkgmp6o6dJuLp7A1erXCS5qMbgtQooorpGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAGVq8uJkTPRc/rXLa14os9EvreG9mSKB43klkY/c/u/mQR+Iqz4o8aeEdN1kaXqHinSLW7VFDQTXsaOuemQTxntnrXxx8evjZLc+KBoSg24eT7ZAwkDLPAhxGB3DDBZlPsQSK+G4pzKrg4R+pNOo5L7otOV/XSPzPIx2YU8LFu92fRNx8QZfETvGWaO1if8AdQ56DsT6nr9K6z4b6ikmqz26NxJAWI91Ix/M180eGvE4lO9ZOJYlkHP4/wBa9z+Bcsup61e3vzGK2tthPbc7DA/JWr4HKsrxtTiOhjqsnKfNdt9rO68la6tskY4HMfrE1Hqz2uiiiv3c90KKKKACiisfxF4x8JeEIbe48WeKNJ0WK6lEMD6jfRWyyyHoiGRgGb2HNGw0m3ZGxRWDb+PfBF3IYrXxjoczjqseowseuOgb1IH41uRyJKiyxuro4DKynIIPQg0k09hyjKPxKw6iiimSFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUU13SNC7sFVQSSTgAetYdx498D2jiK68Y6HC56LJqMKk846FvUGk2luVGMpfCrm9RWN4d8ZeEfF8dxN4U8UaRrUdnL5Nw+nX0VyIZP7jmNjtb2PNbNMTTi7MKKKKBBXC/Eu/WH7FbM2FIeQj1PAH9fzruq8o+OxlsoNL1Nc+Xukgc9gThl/k35V8nxvhqmMyOtRpdeW/pzK5hiansqTn2MGPxzceHd01pJlHIV4yflcd/xxnmuw0bxnp+uahDBp8qvDLb78/xLLnJQ+4FfN/iHxHxFH5nUk9fwrhfhl8a7rTPHj6Vaqbqa/na5giMmxY/LOGZjg4UoMYAJJAA7kfmOT1cxyGjClBt0uZNp62ivi5e1/zPn1nMVVUZbM+9tLl/0oL/AHlIrZrgPD3j7wXe6raWkHirSTc3AHl2/wBtj8wll4Tbn73P3evtXf1+3YKcJ03yNP0PoaFSNSN4u4UUUV2GwUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVk+JbnUbLS3vNNZQ0LBpMrk7O+M/wCcZrWrN1/Vo9GsPtUtv5ys4jKZxkHPt7V5edypwy6tKpVdJcr99XvHzVtdPIT2Pkrxl488U+APB+raZLo+n3cBtr2S5vXETi+kdmbzJFI8zzCG5zkAjg4wK+DfiJ4whvNamk0zzoY7KCG6trd33fZwpIkiQ/8APPDEgdskdhX6U/Ev4WR/EKyvrfwVPHMbqJ1n0yaRY5YwwxmNidrDnuRjj1r4P8Y/sg/GjStdtm17w6NMswJ7ea+uZkFvJD5TsSCpJzhemOCecV8JkeEqSwKrYir7SK2lfmVvJ/po09LI+CzShXjWScXyLZ20+/8ArzPWvBM99cNp1hYQyzyywRRQxoCzuzBQqgDqSSK+1fhl4Jufh9LpFrcOW1DV7Sd9URXJQNGUaPHbKb2TI67z1wMeP/CfUvhR8K7xhpsF74l1uNfs/wDaJjWKCMAYIhDEkA4xuIyR04OK9i8F/FTSPFmoz+IJoJ7a0MYtbEkBwyBsyS5HO1nAC8crGD3r6KtjcqyurH6zUUJ3Wr0S+eyvtv1O7IcLTpe/Oac30Wtl1121207+Z6fRTIZoriJJ4JFeNwGVgeCKdnFfVxlGcVKLumfYC1keKvF3hjwPoV34n8Ya/YaNpNihkuLy+nWGGMe7McZ9B1PavAP2hf23PA3wj+1eGvBlvH4t8WRZR7eGXFlZP/08TDPIP/LNMtwQStfm78R/GXxt/ag8d2un63c6r4x1y4l/4luh2MZFpZ57xwD5IwB1kfLYGSeM15OJzrD0Z+xpvmn2R95k3h/meYUPruLXsaG/NLRtd0t7ef3XPp79oP8A4KpogufD37N+gx3IUMj+KdcgKW69t9tbEhpPUPLtXj7pr5B8D/CP9pj9tXxpL4hsxq/iyfzNl14p8QTMmm2QzykZI2gDORFCucdBivtH9nP/AIJd6PZPa+Mf2kruPWr5Ss0PhizlP2G3bqBcSDmdh3VSF46sDivvnRtE0fw7pdtomg6Xaadp9lGIra1tYVihhQdFRFACj2AranRrYj3q7su39f15HPi8xy3J70MrjzyW83r93T0td9VJbHyR+z3/AMEzfgv8Kvs3iH4konxE8UR4cS6jAF062b0itMlWx/ek3Z4IVa+woYYreJIIIkjjjUIiIoCqoGAABwABT6K74QjTVoo+TxGKrYqfPWk2woooqznCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAa6JIjRyKGVgQQRkEGvkH9oX/gmn8Ffi4934l8AJ/wr/wAVzkyG402ENp9y/X99acKM/wB6PYeckN0r7AoqZwjUVpI6MPiq2Enz0ZNM/Cvx98Gf2mv2LPGKeI7v+1vDEiSGO08WeHJnbT7tQeFlIGAG7xTKCR2xX1n+z3/wVVlRbTw9+0hoCCMqEHivQ4S0Tf7dzaLkpnkl4crnogr9FdW0jSte0640jW9Ntb+xu0MVxbXUKyxSoequjAhh7EV8E/tF/wDBLrQdTkuvGP7OF9FoGosTNN4avJCdPuW6nyJCcwMeeDlcnqoFcFSjWw/vUHddv6/ryPq8JmWW5vahmseWXSa0+/p99n1cuh90+EfGXhTx9oFr4p8F+ItP1vSL1d1ve2Nws0Ug7gMp6joQeQeCBWzX4h/DzxV8bv2XfH1zZ6PNqvgvxBDIBqOj3sRNpfAf89IT8kqkZxIuGAOVPOa/SH9nn9uHwT8WDa+GPHVtF4S8WS4RI5Zc2F8/T9xM33WP/PN8NyAC1YYbOsPVn7Go+WfZnTnHh/mWAofXcGvbUd7x1aXmt/n+h9N1wPxE8KHx5dHw3cTGFIdPku7JizbRd7wiuwHUKuRz2lY4yAR3jOqqXZgFUZJPavPvG/xG0rw/5Gv2cVzef2cX+0JCg/eWzAeZtzySu1XGOuwjvSznMcBgacY46ooqTWjer11st3byPzvFRhKk1U+Hr6Hxn42i1nQ9ak0TWLSW1u7ZjFLE4wQc9R6gjBBHBGCK+UvD/iqOw8YLc3dxcpHcahMjiF9krW0QZBGrfw7iSCewLd6/Rz4q+MPhT8TILY+INOv9MvolX7Nq1qEnCoeQHAIMkfIPTPJxjPPxM37JXxX1X4gahL4K0iPxJpqPKLO7sZV8oK9zOC7lyCuSh/AjnPFeTKhhMTGKoaxlex+d4jBunWlGlLnXS2/zW/6H0x8MfiPr3i74cWvhew8LaSNNltLi1jQiJIYG3sqO2QXJXhgUGcqOQea+vPAVzrF3okUmq3hutiJEkzJh5SqgM5x6n9c188fCD4H33w50PTrTx7dR6dFBGP8ARo5VkuLl85bAUkIuSeSeM44NfSXhfWLXVLV4rKz+zQ2pWNE3Z+XHFeJlVOeH4hVPEYpp8rUaV272XVLRKKu0na71R9jktOrGlzVrp2S1308v8zaooor9KPbCiiigAooooAKKKKACiiigAooooAKKKKACuR+IlzBceHr+ztLuF7+zQXRtlkUy7F5Y7c5xtJPSuurjo/hxpwstQsbhrZ/tFzNeWt4lqEvLe4kdn80zZO5lLAA4HygA5FedmmFeOw08I43jNNPXyMa3tGuWC3Pmy6+Il7oepw6rp9zsuLWQSIexx1B9QRwR6GvUvih4cuvj03h3QNE1BtPsYdOXxDdzlGZC0oUW1u2CM7isjMOwQHHIz5z47+DF7qOmad4n8H31j9p1eMltLuJPLSCVB+/dX5AgQhmYtjaMAEkqK9b8Cx6D4O8IaX4Z1TxNZabbR28bXt7dXaW9xqk21QzxhyHSHjapIDFAoXC4Y/O5Zl1HLsOsNF+63GT1ttZr0vpfy06o+XwkcRVnUoYpfu3brv10fS+l/LzaPBIvgL8T7vUptN0/TIb3S45TDd31peR7JyDh4ULFTjs7Y45Uc5x9BeAPhVqWmRRP4haGCONQotYWDHA6AkcKPYZ49K8u+MXx18SeFfFmh2ngxLCTRrG5zGdLuEkimtigGJSDsVd+BgYIwfXn2rXPippHw5+FA+JnxVu7bSYbayjuLxYTvzI4G2KIHlnYkAD1PoCRzxwuUZ9i5xxMXL2erv8AC7eW+/R7rXU+8Xh7WyPB4XMIyU1ifgSkm/Sy17ffY6bxL4n8N+B/D914i8T6taaTpOnRb5ri4cJHGo6D3PYKMknAAJr4J+O37ZniX4nG68NfD17vw74VbdHJd7vLvtRTuSR/qIj/AHQdxHUgHbXivx0/aN8XfHzxCdb8SyPpfhuxlLaRoYfKQKThZZsf6ycjHXp0AFe4/st/se6n8QEtPiF8XLG40/w6ds+n6M+Um1FeqyzHqkR4wvVvYYJzzHMsZnVX6hli5YbOW2n6L+utj944W4ZyPgXCLPuJmp1VrGGjSfRRj9qfm/djvpbmPM/gx+y343+Ot4kukx/2H4Vik23OtTRHD8/Mluh/1j+p6DuRxn9Dfg38A/hp8C9EOkeA9BSGeZQLzUZ8SXl43rLJjJGedowo7DvXeafp1hpNjBpumWcNpaW0YihghQIkaAYCqo4AHpVmvo8nyKhlNNfan1b/AE/q5+c8beIWYcYV2v4dDpBP8ZP7T+5LouoUUUV7h+fhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHn3xi+BXw3+OXh86D4+0GO5aMH7JfRYS7s3P8UUuMrzztOVOBkGvzw+NP7Kvjf4FXUlzfr/b/AISkk2waxFEcxAnhLlBny29G5B7HPA/VCoL2xs9StJrDULWG5triNopoZkDpIhGCrKeCCOxrxM4yOhm1N392fRr9e599wV4gZhwdiFy/vKDfvQb/ABi/sv70+qZ+evwJ/bI8T/C42vhvx5JdeI/CahY0nLeZfaenYoxP76ID+AncB904GD9bXmi6L8TfDlv4w+F+v2OpadqCedC0cv7t/UKf4WB4KMAVOQcdK+XP2o/2OtS8EJefEX4P2M17oK7p9S0NPmlsV6tLb5OXjHJKdV68jJHgnwN/aI8X/AbxGNe8KytqOgX0oOsaGzYjulBwXjz/AKqcc89+hB6H4apQ5JRy7Poc8Iv3J9Y+afZ9vw0sfo3FnC2Q+IOClnfDbUKr+KGkbvqpR2jPzXuy3d78x9Ta58CviZpl66vokVvobS5M8t3EIrEseT8pJ8kk5zj5CT/D931r4R/DnV/gr4rWLWNWS90/xVZvveJW8m1vofnEYJ6h4hIwOBlkbjkV0U/xz8OeK/g1F8VvhvqOnajZ3qr5Ud7IsR3bsSwspIxKvIK8+2QRnyr4MfEbxD8QdE1nwj4q0yWbTN85U71W+tkJHkPbop+baq7gIwWG3gHPP0U8RhMuxFLA0rt6Si9NN97bqSutvd39PwPB+HlengcTnlOSX1dpSUpWkn1VvPbXq9LsytR+KNz4q8SXeszzELLIRChP+riB+RQPp+pJr6A+FF9bReHobjULyCGfVJS1tFJIqvIi/KCoJycnd0r5/wDh58Drx7i7v/G2vWP2TR4GvGWwkLHUrZAf3sbYARCVKt1ZGBBAypr37T/hvY6j4Jh094rGO51W2jbULiW0E0oygKrCxI8vy+BH1ChQQM81OGyanDMf7TormnaT36vR6+eq+99LP4/J3jXzVKy1167/ANf8H19DopFXaoUEnAxyeaWvtD6gKKKKACiiigAooooAKKKKACiiigAqC+vrPTbSa/1C6it7a3QySyysFRFHUknoKnqlrGk2euabPpd+rGGcAHa2GUghlYHsQwBHuKmfNyvk36Clez5dyvpHifQtdlkttM1BJJ4VDvCytHKqHoxRwG2nscYNP8ReINJ8K6Ld+INbuhb2VlGZZXxk47ADqWJwABySQKxfE+nnTrbSNc+0y3F5pN9ChuZdgkeCeVYplYqFXbtcNjAGY1PUCvN/ir4X8V/Gv4f+I9Q8OTukcduy+F7bzPLF3MjjddtkgfOAyRbuAp3/AMYK+fUxVWCdJK9Tddrd2rvba19XbVX0rARWKxlLB1pqHPKKcntGLaTk9do63117q+nAfCnX9P8Airrq6V4mm1uaFZjDHYaePLt8KzSbJ7jcGfDMXZFIGeSW2qF+m9G8H+FvDygaL4fsLRupkjgUSMfVnxuY+5JNfnr+zn8D/wBo29+OvhvV/F2k+INK0fwtfm9uJ9TEkUKqFIaOEMcOZM7fkyMEk8df0S13XtG8L6Nd6/4i1S207TbCEz3V1cyCOKKMdWZjwBXnZDl8sLSlPEPmlfRtK6Xa/wDSPoeJuDsJwnjYYLC4iOIk1fmjZtXbUVdN3bVnpbfRWtfkPHWgeFPEWna5JFBaWusaHGLj7W8C5jYR+chfPEkTchgeDhujKCPzK/bK/aQuPjV8SRo1pcrB4Q8FqsNrbI/7qXUBGPtNww/i2MTCmc4CMRgsa+n5f+Cgv7KXjX4nWvh3xFoWoLpr+XFZ+Jr62As5V35XzY93mCHcMgyKQCSWVOTXx58AP2dtX+MP7Ut58MPFFu66V4e1K71jxO8T70kgW5YxxrIOGEzsuGB5U7hkCscbQliHJYe3vuz5d3a+r/Lrf5JHv8H4Wrk2NqY/NotRpQvBO9rt2vbo0u2tt+iPoL9hr9lE+PWtPjb8VtIb+xInEnh7SLlflumB/wCPqZT1TP3VPBOc8D5v0VACjAGBUNjY2mm2UGnWFtHb2trEkMMMShUjjUAKqgcAAAAD2qevbwGApZfSVOmvV9/6/rU+b4gz/FcQ4t4nEPRfCukV/m+r/RJIoooruPCCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAQgEYNfnn+3J+yaPBiXnxw+E+lP/ZjuZfEejWyDbBnrdQqOi5PzKOB1+7939DaiurW2vrWayvLeOe3njaKWKVQySIwwysDwQQSCDXFj8BSzCk6dRej7f1/Wp7mQZ9iuHsWsTh3p9pdJL/Ps+npdP8hf2NfjPpfw2+NWk6brltZ3nhTxvOml3gniDraXU3ywXceR8hLlY5MYyr5PKiv1huPAvgq8ga3ufCejyRMqoUayjxhfu9uMZOPTtX5CftO/s3az8Jf2kovhj4NicaZ4vuoNU8LSMwxCHnAkiZm4HkyDJLHhMMSM19wa7/wUy/Z60P4hP4LhbWNU0qzLpe+I7KBJLKNlOC6KG8yaPrl0XB42BwQa8nLaNLC05UsUlo7JtI+r4uw39t14YzK4OSrQ5ppbXWmq2vZddfuNj41S6L8KLq4HhiXWbBp0Yy210Dcae4mQxsRIWMkJccE5KsVXIBVWX3n4aeLNL8aeC9M1vS5twMCRTxn70MyqA8bDsQfzBBGQQa/Pz9tC18Wf8LNs/jL4I8VNe+EPG+m2yadf6bdM0LCGMI8DFTjrlwD13sMZVsfQv7NukeJfAfw4TXrvURd+ItOl87xToaS77hLKVA8IeMfcuY03SKuAWVmjPONvNgqVXLsbWmpc1N/ZStyrurb+i3SutdH8/mnB+AyLJaedUcbCU6jinRVlKN03P3eZu8GrPRK3S7R9K6v4g0fQVhOq3yQNcMUhjwWklYDJCIoLMQOTgHFTaXqun61ZJqGl3cdzbyFgHQ8ZUkMD3BBBBB5BBBrnPDa2niLVdc8TW90XE3l6fYXUZU7LUQxyFoycj5pJGYnHO1Mg7RW9oui2uh2slvbySytNNJcTTSkF5ZXOWZsAD06ADAFfRUatWrLmVuTX10dlr577fM+RpznN305df6+ZoUUUV1G4UUUUAFFFFABRRRQAUUUUAFFFFAHlPxi8YeDNQWL4Zan4ht7Z9RmWbVD5hU29jblZpiSB95sRxhRyTLwKsprA1maKy1rxXbeDNOwsdjo0F3Db6hJGMbDMxOYcrjEUYDAEZbOVHlvib4fX/jX9oTxFq3hi3lZvDVlBMS1x5cT35iaREVyp2OzMvPIQrvxlUFe2aXoM+l+C9Psk8C6OJrmCM6vpazK6GRk/egSupEx35y0nLDJLZ6/OwdTGV6taK91Pl668ratpq0nf73pLZeLSlVxFWpNqyTa66qLtbTfW/wDk+mPr0h8GabdeMPDHi3UNRi0m5S31DTL2/a7jn/eKjxKXy8U43jZg4Y4BU7gR+av/AAUe/az8Q+Mvjf8A8KK8Nhx4V8K3aW14iSEfb9RziRyB1EJyiqc4ZXPcY/Sa38OaX4V07w+uvafpY1OGQeXcSbZZEKuxhhjkkG5zHGwRT1wvGK/Kr4r/ALK/7Rvgrxtq3jPxF4Qvdd0eTU7q/fVdEIuUlSV2bMyj5kxuyd23miu6tHDylKPuyXw3ejs/uvorbXV+rPu+BKEKuYXlV9lUXJy6J6t+9pJrW3a+z6s84Pga3v4AsSBl3FxGCFKMerRt0GepU/KfY817v+yT8b7r9lvxbrmo6xoya3o/iVLSPUCg2X9vHbqyx+VuOCAHYlD8rcYZcV514fuLOdliWTZIOsUoKOPwNReN5YJIfJlXPlj5SCQVPqCORX57hs3xmHxKhB2P63xnCOVZtlk/rdPdaWdvy7fgfsh8M/iv4A+L/hyPxT8PfElrq1ixCSeU2JbeTGfLljPzRv7MB6jIwa66v5/fBXxU+KHwZ8Zp4z+GHiybT72MhZATgTx5yY5VwUmT/ZdT6gggGv1A/ZE/bz1P9ozxTB8PdY+FV7ZanBYPcX2r6dMZrBGRc7pEZQ0CuQVUF3+YgZPUfqWDzCOIjFT0kz+WOIOEMRlFSc6N5U497JpffZ/LXukfYVFFFekfHBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFcp8Sfij4D+Efhmfxb8QfEdrpGnQ/KrStmSaTtHEg+aRz/dUE9ScAE183/tc/t33v7N/id/AmmfCjUdR1C5sBcWmrX832fT3d1ODGFUtOEbAdQyHIIyOGr8ufHvxa+Kvxq8ZN4v+J3i+fULksywIDlbeMn/VwpgRwJ0+VF9yScmvOxmYRw8Wo6yR9hkHCOJzacJ1bxpy7Wba++y+evZM+k/2uPjtN+1N4l0GfQ9GXR9E8MtdHT3lXdf3CzoqSGTacKDsUhF4GOWPbwYeBrbToGWSPCkh2jJDNIw5BkPTAPIQcA9cmuj8DS28MYjhTG8fOxO5m+pPJq94guLS3Zo3k3yHpHGpdz/wEc1+WYvN8ZiMU4zbf9eR/VOX8I5XlWVRWEp2stbu/wCffr3O3/Yp+P2peCfiSvw18YeJtSt/BXiC+e1gtobxoEs9SOFinLL8wEjYRlBA+ZGOStfojp2szeEvEs0HhfxTp2qX95MpvtD1G9t/tlywG0eXccSCUAABZi6n7uU6j8yvh3+yJ+0N8W/ENhrvgv4fyaDZpcRzrr2sk2iKFYESR/xsRjgoGI9K/VnRPhN4Yur+C/1jwFptjDYWn2S2tftAuUbdu8wsm3aeWOGJLHOTg191l0K1WlGys+j17bXV1b107pn8oeJGFoLNo1MG05u/O03unu+zt0atorXu7N+E91oWn6nrWgaAGXTtQnfWrFGQq0JZhHdWzL/A0MyjKH7olUdq9MrwjxDpOp/C/wCK/hTVrZ5rjw9rF+NNeWVy7wySxmNUkc8t0j2uSWZYlVsmNWPuwr1MoqS5J4ecbSpu1ulnqreWunkrHw2Am+WVKSs4u3366eXYWiiivWO8KKKKACiiigAooooAKKKQkAEk4Ao2AqXeq2Vjc29pcy7ZLkkRjGenr6VZkkCRNIAWAUnC9T9K8u1bWjqGvm+F5JBGsgSOVCd0cYOMjHOcZP41q6H4ttNNvjoI1A3No8nl2c7rtP0IPY9B7/Xj8yyzxGw+LzKphqySpOfLCSavtpdXvaTT961o3invdZ+0XU4jRfiv4f8ABUGqXDaZNdatrmrXepSwo4A2NIUiLOR8v7uNABgnHOBmui8J/HvRtc1GLTNa0t9Kedgkc/nCSIsTwGOAVz0zgj1xXz/4qiuLPxJfxXIcOJt439SpAZT9MEYqJgWUhQSSMADqa+twGIqQp8v9anzccwr0morZdD7B8Q+E/Dvin7Gdf0yO8+wTi4t97MNkg78EZ7cHivjz4tf8FPfhT8OvEeo+CvAXgjU/FN5plxLaS3PnLZWZnVirCNsPJIAwIzsAOOCQc19k6Q01toWnrqkgS4W2hExdsfvAg3dffNfhp450t9B+K/i7QtQvbqS4sddvrWTO2MsVuHGSygMQRj+LpW2bZhLBQTpW5nv3P1vgfIMFnuJqLFLZJ+t+9mnppseufE79oLxr8d7l73VfBHhXQgDvRNO0iP7Y3pvmkBkP4lR7V4Z4l0/WyJWnungBHypA7DHuT0J+gAr0HQp4LaJYoI1RPRRjJ/rWP8RtS03S9Klv2mVSDsJABIc9FA/ibnp0HU1+ZU8fWxGOu43cn2P6xo5RgcBknsqEnGnTTbvJ2237f1uen/sBfsx6B8evHusav8RtFl1Lwl4btAssRmkiW5v5GHlxs8bKxCosjsAR/Bng4P6veDvAngz4e6QmgeBvC2l6Dp0fIttPtUgQnGNxCgbm9zkn1rif2Yfhl4b+FHwO8J+GfDml/YhNp0Go3+5w8k97PEsk8kjj7zFiRn0VQOAK9Ur9bwWGjh6SXXqz+P8AifO6uc46c02qa0Ub6adfV7hRRRXYfNhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAYni7wV4R8faLL4d8beGtN1zTJ+XtNQtkniJHRtrA4YdiMEdjX5Tf8FBv2YvD3wL8baJ4i+G2gNpXhLxFatD5UckkiW+oRsS6hpGYqHRkZVz/C+BgV+ulebftFfDDwr8Xvg74l8G+LrITWsllLdW8qgeZa3UKM8U8Z/hdWH4gkHgmuPG4aOJpNdejPouGs7q5NjYVLt03o43dtevqt9j8TvDena2BEbe7eYKMNHO7Hd7g9AfqCK9c+H37RfxI+BPiK1bQvAnhnW4WdJnXU9Eje5I/i2XCASLjHG1iBjOK434b6hp2qaZFe+crc7NxwCXHBVh/C3B9j1FbOtajFKr2t7CjoD3HH1x2/Cvyl5jWw2PbUFeNz+t8bkmDzLI40qtWSp1LSVno199tf663+xvgL/wU48JeKPFk/hX4s6VqOjXGtav5elXEMSTWtjFJtSOCVlCyH58/vCh+9zgDNe9ePvjlrkesXOk+ETBbW9nK0LXTRiR5mU4YqD8oXIIHBJxnivyV0HTG1f4heGtK0i+uvtF/rNlaxYKuVZ50UYZlLgc+tfoxr2mXuj61e6dqEDRTRzucEH5lLEq4z1DDBB96+/y/Ma2Loc0tPzP5H8S8locMVqVHANpT5m9W9mrWbbet3u+mh1V58WNX8TaLd+GvFghuS6rc2V3HGI5IbuFxLEWAwCpZAOMH5u4r6cikWWJJUztdQwz6HmvjLwzp0Gv6+uhSWN/cyXiOsTWysUtyCCZZiFYLGBkHJXJKgHNfRWq+MfJ0220KznImW2i898/MAUHy59fU1w43PaOQ0quPxeqskkt21eyX3/JXZ8JllaU+aVR32X3X/zO4g1nTrm/k02C5V5413MF5A5wRn1q9XjumajJp19DfQP80TA4B6juPxGa9et54rmCO4hbdHKodT6gjiubgni98UU6qrxUakHsv5Xtvu1qn8tr2PYjLmJKKKK+6KCiiigAooooAKx/GF+dN8M6heKcFYSoI7FiFB/WtiuG+Mmo21l4Iu4ZLqKOedo/KjZwGk2upbaOpwOT6V52bylHL67jvySt62dvxMq8/Z0pT7I841HzrLS7HVnvbZ47/wAzZHHLmSPYcfOO2e1cfquvOt2VLMhjwB1BHfNZTajM6STxRSMkZHmSKhKrnpuIGB+Ncl4/+J2ra1fya1rM6T30qLCpWIIoVBgZA46fnX4QsioUqbrSXLZLzvpq7+b2Vnva+mvy1fMU1ue16z4U0/4qfDW01m31eHRNdhtUgXVXhEqRmNgGEkZIDgjOOcgtx6Va0Xwb4X0HUIr6yludRntyGilvEVUVh0ZYxxnuNxOPSvD/AIK/EG+8TWV54eluWe3sr1ZIRn7+5QGYj22jHsa90t7r3r9Wy+vPF4CnVho7JN9brR+jLo4inXtU5dbLX0/D9TrRqM1y/mXE7yMe7Nmvz+/b8/Z81vw54nuf2jfDtjJL4c1Xy115kXP2G8UKnnMB0jkAX5sYEmQfvLn7y0G1udXvY7K1ByeXbHCL3J/z1r1D+yrBtNOkTWsU1o8RhkilQOkiEYYMDwwIJyDwc0YHJ3iakqlR2W3qz7fhjPMRkmLWNo69Gns1/Vn6o/IX9mT9nD4qftGXEN/p9pceHvBkbbbjXbqIgz4PKW6nBdvp07leM+N/tMeFtIsP2h/Evw68ENPJpOiatZ+G9PSaQyMZVZBMTwAWaUMTgd/QCv3TvrjRfBnhm5vRbwWOlaLZSTmOGNY44YIULEKoACqFXoOK/FX4C+Gr34xftZeC7jVIDLLr/i2TxNqCHJ3RrK1w4P8AwEGuqWW4bLpQjTXvye/9f1+R+s4DiXMuJaeIr13bD0o/D01urvu1uuy87t/tnounRaPpFlpMAAjsreK3QAkgBECjrz2q7SDpS19Rsfjbbk7sKKKKBBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFVtSsodS0+50+4AMV1C8Lg9CrKVP86s0h6UDTs7o/BX9nrwxo3/DRvhz4e+N3mXSdV1+68L6kkU3lHdJIyxHPIBWQqwzkZHua9l/am/Zo+KX7Okkur3FrP4i8GO+2DWrWMl7cE/KlwoztPYZ4PYt0HE/tKeFNQ+E37WfjqfT4DBNpnieLxTp45ACyOtyu0/QgV+0emXmh+O/CdpqX2aC+0jX7CO4EUyCSOa3mjDAMp4ZSrdDxXy8cuw2YTnGa9+L3/z/AK/yP2HMuI8y4eoYetQd6FaN+XorWSa7NrV90+9mvyz/AGBPgfq/inxpafHvX7SSLw9opd9Ed/l+3X3KiRB1McWWO7oXCgZ2tj9E72/0PWzFB4w0O11SKLhJXQCaMezDBI9sio9d0ZfDEsemW1vHDZRoEtFiQJGsSjARVGAu0cYFc9cXXvWGHpV6FVqOltLdP+CfjnEfEOIzrFvEYhJdFHokvX7zrIZvC3g3w3qmreGbK1tbUQyGTyFwZSMgI5PJOSBg9M143pGqapeJJqiW9zcRW6o15OiFliD8AuRwuT0zWP8AEbxtpnhZY7HxBqV9Z6Lq1/DDqUlkgeZLfli6KQQWDBex4zwelcbpHxFMf9raJ4a128bSrtigLjyze2ysfKeRR0bBBIGOp7cV8txVTpZjiKeGqvSKeit8TV9vu/HqfJV8wXMlsl0Xf07HtEWsf7de1fDnUjqXhaBycmF3hJ+hyP0Ir5atta3IrF+SoJ/Kvf8A4EapbXPhu6tDdRG5F20vk7xvEZVAG29cZBGemRXNwRlssuzZyWilFr8U/wBD0cuxvtqvJfoem0UUV+wnuhRRRQAVnQ6sbjXLjSIbbKWkEcss5fADuTtjAxz8qlic8ZXrk40awovK07xZOkr4/te3R4ST1khBDr9drKwHs3pWVWTi422vr/XrYibat6/1+JrC6TcUf5SDjnpXhGqXmr/EDw1rV5oMUc+s+Lo7qSynmG5dO0e0lKxFV/iaWRdyrkBmlyTtjxXsfiW5OnafdXipIxEL7fLGSG2kA+3ODntXzb8MPife+HNPtbmCxgaC10rRrJ1K/vDCkBlkCnOAWeZznHXGa+LzrPqGDxkMFi5aO+y1s2kn93MvnfdHm5jNc8ac3aLTv+H6XXzOEt/jL4h+HHgjWPhhBDDfX+tXUayDUs/a41mEYkARQu0eV86kgBc55BArK+DfhfwP8X5PiBa+O/Gms6VpPh+zOqxW+nxkqiIrxvduQjbvLXICYyQ7Hsaw/i5430W1+ImpalDptzZ6LrN00ltcyNuMLtyUmwTtBbJBBIA47V4JYeKPE+hWV5ceHfEc1mdWaXR7u3s75knuomUMyvGvLwtkLk8Fsj1reWHpVuRr34K+nS2tvzPhI4yVPEJVvfjC6S6W19PU9Y/ZdvhBqZuZJt0d1dvFHx99ViPzY7da+tvDtnqPiC9W1062bywR5szfcjHqff0HU14j+yr8LdLn1aCe8tpHtdDtWluSZCIzcSAgD9WPXolfS03xF0HTsaZ4cgglSP5Q6DbCD/sgfe+v865Vi6HD2DnUxcuWLk2la7eiWiV30/zPdymgqtJVKjtG+ndnoGi2lpolqLWxt0Xgb3I+Zz6sa1YbtpHCGPr3Brh/BviC/wBaluvtjoyxqjIEUALkn/P4V3NpFsTzGHzN/KvTyDNv7bowxOGbVN33ST0bXnu0fX02uVcux4B+3Z48bwh8ANW0WzuPL1HxdImh24B+bypObhsenlK6k/7Yr5f/AOCbvw1Go/GTxF8QJbf/AEbwxpa2Fu2Pu3FwccH2jWUH6inftkfFm2+JHxYuNEsrkSaJ4LSSxhZTlZLpubiQev3Qg9lz3r6m/Yk+HJ8BfA+wvru3EeoeJ531m4J+9sfAhGfTYoYf75rioYx5tnzjD4KS/L/g/gfv+PymPB3h3GdbSvi5LTquZXt8qa17SlY9/ooor7Y/BAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/OD/gpR8NRY/Fbwt8R7e2/wBH1/TX0u7YLw08DZUsfUo6Af7tfRf7CfxEPib4Cab4bu5RJqPg6Z9FmDH5jAp32zY9PKYKP+uZrb/bT+Gw+IfwO1Oa2hD3/huRdatjjnEQIlH02Fj/AMBFfJP7IfxRtPhx8VrXTr24Eej+MY002dmbCx3IObeQ/iShJ6BjXwmYYyplWcpJ2jUX9fj+B+9ZblK4x8PJujrXwsm0ur5Ve3zpvTvKJ+i+pJb6nataX1tHLG3YjkH1Hoa8b8W6Xf8Ahy8YSwPJZOf3NwOhH91vRv59q9F8Y6xe6PaW81kwRmlKvuUEYA6HP+eK5iH4labI32LxBBEscg2tIq7k/wCBKc8fTP0rOrxVgsPmP9n4mbjUVtWvd1V1r0+dl5n8542lTrK0nZ9z5a+P+jX3iqz1CeysNYuLTQ7Bb67k0+xa4MACyFGkA6Rl8BmzkLuYA7TXGfs3ePPgtomh6/L8YNE1C+vWtANFkt0dwhAcMo2sNrklMO3y4BHHf678WeKNN+FEtzq1n9qh8OeLNNms55dNRJJIL0RsLeWMucAFXb1GUHHBr8zJbm40iaTSbuMo9qTCw9CP556/jXTWy5Rr/WYpSk23qrrXb8NvM+NzCSwVaLjaUtbpq68vXR/efQ1trjajql3b3via6sGjkSK1tbeZId0ZRSsvKkyFiW9htxjOa+lfCMPiLwn8NrOTUo1k1rTLaXxXol8AEe9t1wbm0lUADe0O3IXhg6MAGQ4+d/Afinwbrnha30271rUb3WdCmt0hsfsm6xaF1Vph9o4IYsGBAPXBAOSR71q/xa1XXLfR7jU9O09IbW/8pUt4mXbDLbzQyIMk8bH6f7IrjzLFYLJYOpUk1J9le13181ura3S6FZRZc05S1aVvm9b9mt112Z9JWWsWWo2FtqNhJ50N5Ck8LD+JHUMp/Iik1DVTp9/p1rJalob+V4POD/6uQIXQFe4YK4znghRjnI474L3L3/w28K+YkoeDSLSNzIDyVhXkHuOldLqxiv8AXdK0tGzJayHUZcH7qKrImfTc78eoRvSvqsvx8sfhY4qL0ly2t52ufdRqOdKM+rt+JuUUUV7B0BWZ4g0Vdc0/7Mty9rcwus9pdIuWt51+64HfqQV6MpZTwTWnRUzhGpFxlsxSipKzOb0fXpdXE+j6rapZ67pwDXFrnKSKeFmiJ+/E+Dg9Qcq2GBFeBWXwuifxl4r8GWl99geJYNSsBJHujltJGkUYwcjYdqHGQNvSvo/WdEg1dYpRK9te2pL2t3FjzIWIwcZ4ZT3U5U9xwCPMPia+s6ZeaVrlrDaWuvWRmht3ZT9nvo5FBkiDHlQwUHYeUdQw3AEn43ijD4alh1jMfFyjTa1S1abS8rNXTfR26apeZjKHOoupryv709H8/wA2vM8u8cfs1W2taPpdq0ttZkQtFrMzzPci6ctwYoyFCAAHqR1Hpk+Tah+yFF4a8V21z4JR73T2VCj392gNpJ0ZiuAWH8QwCRnGMivoMfFq4vbE3EkMUsOWSeGaIxyQup+ZGwflZT9R0IyCCeLuvjlP4e8Ial4w8qV5dShCRWc8CtbWULSLsG4EM0zqdxbnHICgLmuDAcUZTiaXNS5ly9HGz+XR39fN6XZz5bwtHiPMKeW5fC9So1bW23Xtbv1KnjjWNO+FuhWHwx8LXQLXMIvNXvFGHuXbgL7Dgnb/AHdo9c4OieIiSoDkn0FYviHQfE3xE8WHxNoWjaleWetkC2ENpI23y1VDk4wBkZB9CCcV7V8I/wBmvV7W5h1fx6Ut7eMhxp6OHllPpIy8KvsCSfauvMMop8QwjWpaprS91p89jxsRl+Z4TM6mX1KTjKm+VrpG3nt57nqXwc0WeHw2NY1BCHv2EkSHtGOFJ+pJP0xTP2h/iUvwl+DfijxykwjurKxaOyz1N1L+7iwO+GYH6Ka9EjjjhjWKJFREAVVUYCgdAB2FfF//AAU88Uzad8PfBPhFJGWPW/EDXMwH8SW0RbafbMoP4V7UMHSyHKXQw+ihHfze7+93P07hTLoYzNMNhKmsXJX80tWvnax8kfB7wRqXxS+Ivhz4eQs8kus3nnajNkkpbqfMncn6A49cYr9grGztdOs4NPsoFht7aJYYY1GAiKAFUewAAr4G/wCCZ3he31TxT468f3Cq0umW9po1qTzt83M0p9j8qD8TX6AVycKYBYXCuu/im7/Jf0z73xZ4iqZtmkMAn7lBW/7elZt/dyr5MKKKK+pPykKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAIrq2gvLaW0uoVlhnRo5I2GQ6MMEEehBIr8gvjX4EvvhX8S/Evw8ZnT+zbr7Tpkx6tbOfMgcH1GQD75FfsFXwR/wAFMvCttYax4E+IlvGEmuxdaHeOF+8oUTQ5PTIPmdefyr5firALFYRV18VN3+T/AKR+q+E3EVTKM2lgW/3ddW/7ejdp/dzL5nvfw38ZTfHH9m/Q/HNqxk1eK0C3qDlmubfMcwI/vMBvx/tCvH9c8QsjMrMQR2NSf8EwfE0194M8e+ES7GHR9dhvIgeii6hJIH4xZr1v4xfs73fiCebXfAzwrLKS82nyNsBY9TE/QZP8LYHoR0rx8Rw3Tzj2WZJe+4pS87dfXuflviDlVTA5riKeDWkZP3V2eqS9L2PMfh14t0/xU9z8K/Fchl0rV43NqxPzW1wvzAoT0zgn0z9TniNX/ZVuvF/ja3HifyY9ItI0t5NQ0944HvLeMYUGMDPmEHBdhnjktgVc8N/DDx9p3xK0SwuNB1Oya2voZ55ZbZvLWNWBdi4+UgDPOepFerfE7VU+GenjVpPHF1e6o7S3cllGqva20OSY4pIsblUoAA+Q24k5IIFe1UnSyvBp1r8sdP8AJf5I+MyHJsXxLiKeChTcqrlaKulfrZ3te2r7nPaF+yfZaToDJ4S8ToJ7e82w2tzB5cf2crks0ihiZM9+h9BWr4i+FFzpcXhvwtcastzqWu6j5axWyELFFHC5llLHkqgdT0Hp3q/4X+N7ah4Zg1qOCOytRbRzySPbk+azLklOTuG47QB82cAgHiuw+Ht9rPiLxHdeIdUsoLjVlsxbWlmBtFlbM+4CVxkIWI3OQCTtVVDBST8jis1yjO8ZDLuSTqNpK607vrd6X6HsY/hxZLjJ5fXhy1Yu0le9uv4rb8tGejXeq2PhDSrS0s7Fri6uAtrpemwYEk2xcKo7KqqAWc/Kq8nsDf8ADmiT6XFPd6ncJc6pfyedeToCFzjCxoDyI0HyqPqx5Y07SdCWxuJNUvp/tmpzp5ctyy7dqZyI41/gQeg5J5Yk81rV+kYfD8lnLRLZdvP1/JaLq36UINvml02Xb/g/l+ZRRRXYbBRRSHmgDjG1XxT4u1K8tPC17baVpOnTvaTajJb+fPczocSLAjEIqocqXbdlgwC4GTT8UfDvxJr+iXWlz+PLi9Ew3LDfaZaPEWA4BCIjDnuGBGc5qbT/AAp4x09n8Oxajpy6AdSe+S5QyLeCF5jO1uUxs++xXzN33Djbnmu4dBIhRuQwwfpXjvAwzGhOljFL3lZ6tLXdJJ2sujtr5nHTpe2T9re/XVr5JJ7L8T8+NV8V2Hh7VdWPirX4PsFvE1vdX6SbfPjxtREjJaSaVcsAwHTAZmHIoxeJNP1LQLK4soY5rCeGKaGKcB8ARlQDjAJAJzgYyB6U7xx/wT2+Leq+OLw6Pruj3GhzTySwXc926ypETkI0ZXO/BxwSuf4gK4f4w+GfF/wlv7XQdF0e7sZpnia5tJbQzrsBCmWILwzPtIYJwcFhznPxeH4Wo5dL3k3DrzbJL7ke74gZTlHB8sFieE8dKpVnzNyi7OCaioq6V1J3mmm726Ld/bn7O/jrSvFfgDTPCOn6YlldeHpViuAJS5kU5YSjPIDfNkEnBXHTFe418DfCXx3qPwh/sbxa8UV3LrthFbXdp5+HSTz3LFkKgJlFQAZOMEkgtivtXwr8QfCvjEFNF1WF7gLva2Z1Eyr6lQTxX1mV51l9eX1KjNKUdEtr2/l722fmEchz6jl1LNs1pybrXk5PV77z7N7673Okr4I/4KxQXUHhr4Z66qH7Laa1e2sz4OFeaFNg9OdjflX3Zc6rpdncwWd5qNrBPcnbDFLMqvKc4woJy34V5V+1f8Cof2iPgjrvw6jmjt9UdVvtIuH+7DfRZMRJ7BsshPYOT2r1cXSWJoTpL+uptw/j45bmdLFP7L+66a19L3PkH/gl18VdJ0/xX4y+FGq3aw3eueRrOlK7YEzRoUnRQer4w2B2Q+gr9Hq/n0Y+Mvh/4uNjqQ1Dwx4y8L3fzgExXNncofvDoSpIBB6dPY19+fs+/wDBSvxrqRtfCXxS+F2qeKdQwEj1Lwjbedcz47vZ8ZY9SYyB/s15WWY2GGgsNW0a2PvOMOGK+YV5Zvl/vxmrtdv8rLRp9urbS/Q+isTwf4nHi/Q4dcGga1oyzdLXWLM2tyowDloySV64554Nbde+mpK6Py6cJU5OEt0FFFFMkKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoorH8V+Iv+EV0SfWzoer6uLcZNrpVobm5cf7MYILfhSbUVdlQg6klGO7Nivzs/4KjfFTSLnWvBfwm027Sa+02WbXNURGz5AMYSBW9GOWOPRlPerH7QH/AAUr8YaSbrwn8MPhXq3hjUtpR9R8XW/kXFvn+JLLn5vQuSPVa+AJJ/GPj7xf9ntP7R8UeMfFF5hAd0tze3LtxxyQuSST255rwMyx0MRB4ajq3v8A1/X+X6hwhwviMBiI5tmHuQhqvO/+fRLr6JP9B/8Agk9ps09r8UfFLCTyLi/06wibPyM0Ucpf8RuXv3r9A68O/ZE+Dek/s8/B/SPhbNqtlc+JQG1PXRFOjO17MAX+UHO1QEQHHIXPevca9TAUlQw8aa6Hw3EOYxzXM62Kg7pv8kl+hyGv2WqXV9cabo11Zw6jdxu1mbsny94X7xUctt64HXHavjfxZqGraf4i1nRvGd1bXtzpkj2d/KjFY5zCxbexG3eevLDpwRxXrv7U13qGoeJdItNF1pbSXRrKW7LwXZilWR3ClflOQ20DGSOGNfPn/COWPjWSDU7ZoodOM8NvLpMt00k9/clsb3ZuDGWBLLkZJH8IxXy+fZlgcRP+z5STk3bdWT6J9m+h87UyDiSVGpnmWUZxhh5JqabTfN1grXfLrdrZE+m+O9D16y0e58GalbxWokIXcyltPuXYtI0kHDZUMyo6hlAAI5OR9ifDv4d+ItH8LWq2/juSz+1qt0w0/T7fa24ZDM8wldyRjLFiTk18X2v/AAT2+MX/AAlMNzY6tottpV2/nm4e9PmW8bNnYyIp3MB/dJU+or9EdB0mDw7oGn6HDMzw6ZZxWiyPwSsaBQT74GayyPhTD4LEvFT5nK2l3a1+1rPbTe2rPueLshyDCQoZhl2OliK1e8p8zfNFWjbmtZqTd7p691przN7qPi3wMy6lruqwa34f3qt1O1ssF3YqxAEp2fJLGCfmAVGUfN82CK7evJINdi+J0XiTw78N/H3hzV9LvJjBqE63DTXGmrIuyVI0UFZFYKxRiygEt94DFesoixosa9FAA+lfV4Ry5pRV+XS13fXW9nu1s/K9vJfCYafO24u8emt9db2fVbf1onUUUV3HWFFFFABRRRQBy+t+KdUGt/8ACLeFNKhv9SjgW5u5bmYxW1lE5YRl2VWZnYq21FGcKSSoxn58+O9v8RdA8TRa/remW19ZXtssX2jR3kSSIqpDgRSZ3HBzhX3EEkA9K+gtT8HX8mvXWu+H/EUmkyanbx29+q2yTeZ5e4RyRlj+7kAcjJDKRjK5Ga2JtA0u80dNC1O3+32ixrGVuyZmfaMBmZuS3fd1zXl1MLVxanCs2k7225bdNN3db367aHDOlXnLnjJxlF3i1smnpbr6367H5y/EDwtc6vfxx+FFvbay0lFuA00BimaOQ+askn+0QeD2GBgV7n8E8+FPDS6zo08k/iXxFM8cE2oylbeyhij3XF7OGwdkaODknBLgDqa9J+Jfw10nwDaz/EjwZpDt9hMM+q2BmkkSe3icEuquxA2ruDL0ZCT95VNeQfHT4m6N4N1m4/sO+0axiuZ4reBbmMtGthbbWVQiq2Ue4Z3Zdp3LBEuMZr8+WT4jKcRzSlzOGqSWrTTs03u9Gk9HGVnqfr2deIea8aZZ/qzl+Fl7Z2d4u7lFJym9k9XHbV62s3a/vfgnTdc+ztqfg7S7OOG8/eTa94gEkt/qxxxL5a7WjiPVAzDC4xGo69X4f8S6xJrk/hPxRp1vBqMdt9tt7izdnt7u33hGYbhujdWKhkOfvKQzc48R/Zt+NWqfHW71jTE1O/1LStNia31G7kiFqTJJzG8JQh0Bw4AzuG3PHFe86L4QsdH1ObWnvr/UL+WBbUXF7P5jRwg7vLQAAAFuScZYgZJwMfc5dGrKjTqU04p7p2+eiv8ALW/8zet/yvEZbi8qxDwmIg4Tg/ejLS10nt6NNde77+U/tFfsc/Bz9pGJL/xZpk2meI7ePy7XX9MYRXkYA4VzgrKg4+VxkDIBXNeI/swfscfHD9lr43LrVn4q0DxZ4H1i0l03UpF32d9Cn+silMLAoxWRFB2vnDtxX3DTWdUXc5AAr1J4elKaqtWa6ntUM7xuHw0sIp3pyVmnqv6XTsKBgdMUiur52nODiqc900mVThf1NTWQ/c/8CNZwxcatX2cNu55FyxRRRXYMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACmsyoNzHAp1RXQzA34fzqKknCDkuiAl60hAI5GaoQ3LxfKfmX09KvJIki7kbIrHD4qGIWm/YVz4k/al/Y/+OH7UvxrTUpvFWheFPAuiWcVhp80m67vZs/PPKsCgIpZ2Kje44jXgV6F8Gv2V/hh+yzLYWnw98OnxL491xJg+v61Lh44UA819yqfJjG9V2RruYsAWxkj6brH17wzZa9NZ3klzd2l5YM7W11aS7JEDjDryCrKwAyrAjKg9QDWVbCWUp0fjbWvzV7dL22PTxmdZhiMHHBwnaEUkktNOvzavfo3ucf4t0fxPfacX8VeHdL16zg/e79GEttqVmw6TWxZmLOvXCujcYG7O0yfDHxxPqdxL4T1nU4tSuYrcX2mapGAF1WwLbRLgAbZUb5JUwMNg4GeML9oD4iaR8B/hSutz6xrEBkvorG3mjYXM8k0pZmLmU8gKrtwRjaAuOBXg/wAHvjdD4p8Xpez+INOvru31SPUreW2iMW+OXbDeL5ZVdvmRuJGAGPMgDZJYmvCxOKq4DHwUYSs1eT0cbdU3dNtbq6bvs0m78UOHM3nhXm2GoTlQim5yteKUbc135Xur6720Ujq/2udC0m21e01HTr+9ttWns3Ypbux2qXK78AYQEk8k4Jz3BryD4MfDi+1DxTF4N1oPFNeSJeQyxxn9wUVlU7s5CFj8wHUkEYwMfWHgrTR4+8Raz4718INF/tOW202CXGy8WAmJJWz1jXa5ROhd5HI4XHoV5aeDtPuYbi+h0i1uRnyZZBHHIpY87GOGBJJ6GvHfDVTMsRPFxmo0pyva2rWmz6KWr21v8z9LyHxWrYHh7+y3TbdpJTutFd8jWl9PX00MjQ9e1XQNQ03wj4p0e0s1u08jTL2xmeS2mdELGFg4DxSbFZgCWDBW+bIxWnrWraPeQXeiXqTyQXET207R8fKylWwc56E8is+28E3k2o6Xc6r4quNU0/RpTdWEEsKeYZdjIjyzA5l2K7BeFJJyxY81Ut/C/i2fxNqz6hNp6aMzI1gY8mbnl9/avtcKqsIOE1peyva9rLtpvdLra1z8k567vzpu762b26/O+u/c86/Zn+BPhv4S694vu9IPiiSX7SumxTatbRwwz26gSLJblCfNUlseYccrjaOa9/pkMawxJCpJCKFGfYU+uqlTjSjyR2LwuGp4SkqVNWS/UKKKK0OgKKKKACiiigArO8QXVxaaRcvaS+VcOhjhk27hG7DCsR3wecd8VZkv7GK5WzlvIEnflYmkUOfoucnoawviJrGpaJ4Rv73RdEh1jUfLK2llNc/Z45psEqrSYOwZHWuXF4uhgqE8RXlywirt9iJy91tFDwTc6xJpUXh/xZfRatcNDIs1wYtolBz8pXuNpx05r51179jfS/i74burG68UXuk6poWuahY2l3Lb/aFlskZViRlLKeAMhgf4iMHjHeeBfjv8OPiP4tk8BeC/EN5pnjewhlLRSo0tjLNEB58IPSZFYMNwCthSVPr6/wCC7hbuHULs2Js5bi786aAkExTGNFkQkdSHRhnvwa85LDZjUpVV7ySdn3TS+d1Zb9/UvIM6xOT4+lmWWVeWrT5kpK0t1Zpp3T03TXU4n9nT9njw3+zx4VutD0jUJdTv9TnW41C/ljEZmZV2oqoCQqKC2BknLMSegHrNRxXEE4YwTJJsYq21gcEdQfeor28Szi3tyzcKvqa9am6caacH7p2ZlmOJzTEzxuNnzVJu7emvyWi7JLRLRD7m6jtlyxyx6L3NZcl1JO25z9AOgqm9w8zmSRss3eq13q9lYMkU8wM0rBY4l5diTgYH9TXlY/FRhBzqyUYLvp/XoeY6lzWV61LZdsC+4zWNCDLIsa9WOK3QAoAHQcVtgKVpOfyNIO4tFFFeoWFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABTJV3RsvqDT6KUkpJpgYxekW4eJt0bYNJdqYZ3Q9M5H0rLi1eynu5bBZgtxE21on4Y+49Rjnivm5ShhpxjOSTbsru132Xn5GMpWOmtb2O5G37rjqvr9Ks1zHmsjB0YhhyCO1ben363ke1iBKv3h6+4r3KFZzVpblQqJ6M4v44/Brw58dfANx4F8RzzWytMl3aXcIDPbXCZCyBTwwwzKVPUMeQcEfOekfsT2HwX8G+IfENv4uu9b1+WGG3sJIbT7MltuuEVm2h2LMVJGcgAE8dx9kTTw28ZlnlSNB1ZmAA/E1keL5LdNHD3SF4FuYJZAFDZVJFkPB6n5OPfFc2YYahiqVSM/i5Wt9rppP/ACPdjxNm2EybEZJQrOOHqp80bLW6s7NrmSfVJpPr1MDxbp9j4K+G+zTBsj0CxWG1UqCGIAjUsO/OCT9fWvma9urrUrl73UbmS6uJOXllO5m/+t7dBX0lq8UU2gXcfj7WZI7vW7Z41sIG/d2isQVVE/jZSBmRjyQcbQdtfOQ0XxC3iiXwlDoGoXV4lsb2N7W3aWKS3D7N+8DCndj5TzzXnVc0wf1mGAU0qjWkOtkuqW2nRnwmZRk+VxVo7W/LT0PS/gJ4s1O28RjwpLPJLYXkUjxxs2RDIg3ZX0BAIIHfBr6DrxX4M/D650HWzrniWSG0vvJMdpYNKvnAMPmd1ByOBgDryScV7VXt4a/JZnp5bGcaFqn9IKKKK6DvCiiigAooooAKpaxq+n6Bpd1rOq3AgtLOJpppCCcKB2A5J7ADkkgCrtZniXw/ZeKdCvdA1BpFgvYjGXjOHQ5BV1J4yrAEZyMjnNZ1XNQk6fxWdr7X6Ez5uV8m/Q5HUbTxP4wsmudQ+G3hyS0nT5bPWLo/a2TnG8pC6xNg9AzbT3z0831/xDrvgrT7/T2TU/7ItUS4udK1KUz32kJuwLi3mBb7TZ9mO4tFxnHK17domi61ZXTXut+Jp9Sk8oQpGsCW8KjIJcoudzkjqTgDgAZOY/GPhS38U6aIldLbULUmawuzGHMEuCDkH70bAlHQ8MjMD2I+fzLJ5ZjhZxbfNJNO/Ldp+mnyba9HqvOq4WpOPtINqfnb9Pyvb0eq+JrPQfBXgfxxcfEjwnpgsteuJHmF0k7sqNIcu0aE7V398DkE9jX1x8OPFEWu6LrHimKMLHcGK8KdArG0jaRfoH3ivB9J+AjeMLXU7bwzqMel6hol69rPpl4zPFCp+ZUWQAsAp3oMg7lVWyM4r2j4UeCL/wAKfDLVPD1xKlxeSXN9H5ibtjMB5Y27ucAqQOB0ziuPKMFPC4WPsW22m++qi1+D0PGyiGKhiG5RtBpvTa+3/DmAnjKTQbhtRguSGBLSZPyuO4I71uXvxQ8OSaRF4k1C/WJJwVjtwd0u5eqKvfB78DkGvmP4nfEiHwzoM1/OS5DbUizgySfwr7c9fYGvnew+NWq2p1M3FwbrUbzbLBvPyQ9QTt9Bxhe5HPevjuEcPmOTUJ04vmjLo9lLuv176djPE59yS5Yq59reLP2ibHTiIzdR6aj8oi/vbmQeuB0Hvx9awPCvxkn1XVX1LT9MVkgORNduWZpD0OAew56ntXxppGq6nrepgNLLd3t0/LO2WY+pPoPyAr6L8GWosLS30yBgzDl3/vMfvN/n2rizXAYzE4iOKxNRycHddk1tZbL7jipZvXrT3sj6Q0D4j+Irx/tDyW8YHygJCOv45rrbf4g6shHnW9tKvspU/nn+lePaJcLFGkSH5VHFeh+E9Ok1+8jtVBEa4aV/7qf4noK+Ynm/Ef12NDBYiblNpJXur+juvU+qwdd1I2vqeraXeSahp8F7LB5LTJv2bs4B6c/TmrdNRFjRY0UKqgAAdgKdX9H4eFSnRhCrLmkkk3td21dlpq9T0wooorYAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCK5leG3lmii8x0QsqZxuIHTNcHcfELVHP+jWlvEv+1lz+eRXoNeV+NdJbRL55Y1P2e4JeI9ge6/h/KvzXxHxOc4DC08VllVxgnadrX1tyu9rpbp69URUbirmX4g+IfiG3H2iOWBtnBDQjGP8AP868w8Z/F68tJ4dUv9JhdOIpXt2KMCPunBJHTjt0rd1i7DK6tyCMEV5R4shjmiuNPuMmKVSAe+OxHuDX55hHj85w/wBXxlWU07P3m3qtnqfN5hjalNtwZ6R4W/aLsr2UW0d6l8QMm2uP3c4Hfaf4v1r1TRPib4av7GbWbPUBG9jGZZ7eTAlUD2z8wPAyPUdK/NLxRPf6Hqb2szvHPC26ORSVyOzqf84qzefGfVrjSLTTprySHVIpw4uUODMiDIJ/2s4yOh/Ov0LJquZYGlyOTmraKWrT6a728jyqefVYP31c/Qq58et4qcXc0myIk+XCDxH7e5967TxHrUI8D6Xq902IEu7NrhuuUSUb/rkKfzr43+EXxRXxPpDSSMsdzAQlxGOgf+8PZhz+Y7V9Y654fuNd+AzabK5hlmsYrgPz+7zIsm445wFJz7Zri4Xy7G4XMsXiMRJy54NtvW7TVvwuke7hcweNoTcNWotnhH/Cyr/xNrdxrOoTEzXMhYIDxGv8KL7AYArt/DXi/WvEunxaZpt5qFno93cvGG0zjUtZlj4eK1Y4EUCH/WXBKgH5Qw61zGufs/XHgbQJtY8XeIUZ5547K2t9MDFnaRuTvdQd2wPtULy23kV9E/DjwNB4S0mKa5tYY9SngiikSPmO0gQfu7SL0jjBx/tMXc8tXtx4dhPN/bxdpJXb/wAV1971/W6unw5bRx1STp4j3er76/59v00eToeieJfDFms+hfDTwvaJGpcWsepMbx+D96dodrSHPVmIOeX712fh3xBY+JtKi1awWWNXZ4pYZk2SwSoxWSKRf4XVgVI9uCRg03W9K1O/kt7nSddm06e33Ar5SzQzK2MiSM4zjHBBBHPOCQaOkWWjeANFMWp60m65uZrq6vLpljM9xK5eRsDCqMngDgAD619bQpTw1Tkj/DS68qV9LWtbzvpbt5/S4ehVVVUqSbXy302S179Do6KZFNFcRJPBKskcihkdDkMD0II6in16B0tNOzCiiigQUUUUAYXiLxp4f8MXNnY6pdsLvUJBFa28UZeWVicAKo5PPFc/8Qfi7oPgTwzaeJ3ja7tby5W2VgWVY+cMz/KWG3nI254PFc18cfgrq/xK1DTNZ0LW2sLvT9oVlkaNkKtuV1ZeQQe/BGK0/D3hKx0Pw5b/AA38aWCXkU2WtL6U+bFPMVyVycFJQQxAP3hyCTuA8+rWrqcoW5V0fn/X6H1sKHD2DwWFxtepKpNytUprRpa7O2nS2urO38JeJbPxf4es/EVgrLBeoXQHPYkZGQOOMjgcY4HStiub0TVdM0DwHpWp37pbWyWFqSI4ycu6qAqIoJZmZgAoBJJwOTUln4006a8gsdQsdR0qW6YJbfb7YxJOx6Krgld/+wSGPOBwa3jiaajFTkrtL8f8+h8niMRh5VZSo+7Fu8U3dpN6Jvv08zLstMttD+I/iTW422RalpFlc3Kg9ZYXnQvj1KbB/wABre0byNF8MQy6ncRWyxx/aLmSVwiI7ku5JPA+Zjya5Hx1rum6LqWo3GoPKI57bT7LEeS7hpbh3RF/idkTaB3ZlFaOj+ELnXZ08S/EKCK6vXO+10tm82001D0UKfllm/vSsCc5CbV68VGfJUdKirtOT8leTbb9WtF19LtefTlyzcKau9fRXet/07/ifDf7bfg+0s7608ReDNc0/VdAurqWWZLG6SY2czqDhwpOEPzlT06jsM/IvhHR9Z8Qa1qM1lZSyuZBAuPuoq9y3QDpX7A/FTTtP8Sabe6C3gW8udah2/2JcCwEkLSnG1/OAKRxg5EiSFcqGGGBGW61+zv8NdbKiXwvptooAGbGI2pX2Ajwpx2yM4rGnQlVqTgraW2TS1vp5NW89Gn1PmcVkNStWqPDta+q9V+H3NH5++DfDMPhm1RPlmvZf9dKB1P91f8AZH69fp6z4cIt0DNy7Dn29q+kov2TPhdDIJUudcB44+1pj6f6vPP1rqfD/wACfhn4ddZoNAF3KnR72Vph/wB8n5f0rPFZPLEw5NEYYbhzGwneTSXr/wAA8h8AeEvEHiyVTp9qyWqnEl1ICIl9cH+I+w/Svorw74esfDenrY2QLE/NJK33pG9T/Qdq0YoooI1hhjWONAFVVAAUegA6U+jKeHMJlVR14rmqP7T6enb8z7DCYOOFja933CiiivoDsCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqlq+k2Wt2EmnX8ZaKQdQcMp7EHsau0VnVpU69N0qqTi1Zp7NCaTVmfOXxD8D694XaS5aB7nT8/LdRrkKPRx/Cf09DXjfiFxcxspOGHKtX3gQGBVgCCMEGuI8RfBf4c+JmaW98OxwTPnMto7QHPrhflJ+or5KHCNDCVefCu0ez6ej/AM/vPn8wyapXu6El6P8AzPzw8WaFbeIbaSxvF8uVM+VLj5o27H3HqO9fPfj/AMPa74d+z3N3aOrWs4ZJF5jkB4O1vy4681+sk/7J/wAL7iTzHuNcAzkKLtMD2z5ef1rR0T9m/wCGmhTh4tAtrwDq19m5Y/8AAXymffbXtxwEl2PBpcN45TvK1vX/AIB8JfsfeDD4k8W3t5rusWmj+HIYovtdxeXCwrKwfIijLEbnIDAkcKMk9gf0yibRvEHh6WDS7y1urC6ha2V7aRZI9pUqQCpxwDXnfgHRdK8HXd7YL4Amj1y41OaNpbbTVS2WyMp8lo5sCNIVh2fuwd24N8pY5PU654HVbhvEPgt4NG11Bu3om22vcHPl3Ua8ODyPMx5iZyp6qYwrmqbnGKfdbS9O1+8dLdz6DKcE8BQdveb37+nbTt36mdrFiPE+peA5b1g6Wd5LqE0ZPBnhtnUfisjZ+q13teZ+GPEcOuaxZoYZbW6s9YnjuLSQ5e1ea1ld4mI4IEscmCOCNjDg12GpeLtOsb99Ktba91K+iCtLb2MBlaFSMgyNkImRyAzAkcgEVtg61LllWv8AE1r3ail+j0PTw9SnyyqX3f6JG5Xmnxt8Anx/p+kaTFrV5pss921pvt3I3xSRs0itg8rtjOR36V1OjeP/AAxruppotnfOmoPbi5FrPC8UhjyRkBhzyGHGR8p9Kq+MJtRvdV0fRfD7xjUY7j7bLLIhZLW38uSMytjgtl8IhxuKn+FWI3xU4VKD6p2WnqvxPZpYvG5DiIYujeFRWcbrWz0ulJWd1c8s+MWp+IPAfhfTPCvhKI6yLCwa3uIvNZHjd1KxTNsOQQQWVTwcH613PwEu/Ft78PbWbxh5xu/MYI0udzR4GDz75qz4o8XeAvgzocL67NJHHf3BLsV82a6mON8shONzdMk+wAAAA7LSdTsdZ0221XTZhLa3UayxOBjKnpWdClau5OetvhXTsfQ4vNMTXyCnRxGFS55yl7bX3ndtpdL66tb2200t0UUV6B8iFFFFAHA/GbxV4u8I+En1TwbZwT3isSTMCQABnaoAOXboM8Z7imeH/FF14q8FWsfjXwlqiT39qpuEhs3dCT0ZSvKsCAQeCCAR2Neg0mB6VzVKE5zb5tGrWtdHoVsZRq5dHBRoxU1Jt1PtNNW5Wtrf13PPdFMOqaf/AMIPq6ajbyaSIZdPuXiME8sETL5U67xzIjBUfggnBxtfFcv4A+I0XxA1zWPhprnhy5a0heZG+1LIztGDuErzE43b8hQoXaQpXGAB6H4v0+5u401DS0B1LS5PtNmP+ehC4eE+0iEp7Eqf4RXgXxx/aEsPhraXl3oF9FZ3HiMQrbX7wFzDEkUbOQi43SbpSCM8FfXp89PEvC1HCS5krq2l5JJ+7r93zVzfhzBrHVKuWU8L7evUi1Ts7OPKnJu20tFa3prqd/4Z0PVNf+Ltxa+JJXuo/A0EDRTuwP2yaWNhbzMP7yxeYW/22JGBivZelfM/7G3xm0j4sz+MUik1O71PTZLJrnUL1huvY3RwrbF4TayOoBLHbt5HKj6B1rxf4W8OSJDrviHTrCWRd6R3FwqOy/3gpOce+MV6GTtUsJ7esuVybbu/OyTfdRSX/BPLxWUYnh+tPCZhHkqJ3abV1zJON/Pla/XU+WPiZ8d/iRfeINQ0mzvZ9AtbS4kgW2txsmG1iMvJ97d9CB7d6r+DPiL4+tpFlXxdqsrHGRPctMv5PkV7n8Svg54V+LtpF4j0XU7e31F4x5OoW5WWG6QdA+0/MOwYHI9wAK8usfgb8QtCuBDJpEd0inAlt50ZW/AkMPxFcOerFrDueH5m+jjf9D4argsxpYt1JSlOL2ab/Jbfkev+CfibPqUcdt4hijVzwLmMbQf95e31H5V6KrBgGUgg8givI/DPw78SKgW8tUtB6ySAn8lya9Q0jTRpNhHYi4km8v8Aif8AkB2HtXlcHY/PsROpRzSk/Zr4Zy0l6WerXW9vVu+n1+Hc/Zrn3LtFFFfem4UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVBe23220ltfOki81Su9Dhh9KirKUIOUFdpaLa77X6XA4/wAZfEMaNHJbaNFHPcLwZXOY0PsB94/p9a+f/GvxH8e3bs7eKdQh2kkC2lMAH4JivZPEXw910RMtjGl4o6FWCtj6E/yJrzTVfgz8QNYnMMGhiIN1kmnjVR+pP5CvyfBY3iTHY+X9oUpwV9IpPlS9VpL1uzwM3jiakeWlf5X/AEOJ8JfHj4meHL+JDrM+s2+8K1pfEzGTnGFc/Op9MHr2NfZ9rM9xbRTyQPC8iK7Rv95CRnafcdK8h+GPwA0L4fz/APCU+J7+G/1K3HmoxGy2s8DJYbvvEc/M2AOwHWvR9I8b+DteuvsOi+KNLvrggssUF2juyjqVAOWHuMiv0+jL2Vo1ZJN7JvUeSUMThKbWMnrLaLd7f8P2PPvibpupeHfH/h7xZ4ZhT7X4gnTRZ933FuAkht53GfmCoZgR1IAFei6T4Y07SNDbRLaSfbKGae580rcTyt9+ZpBg+Yx53duMYAArA+Lt7ZaL4ZtvFV/NDFDoGp2moFppFjTh9hUuxAXcJCoYnAJFY3w/+N2ifEXULzQobK50rUbNcvZ3Yw8i/wB9DgB1xzxXkTxWEy/HTo1L889Yqztqve1tZXa1uz1aOEaqzkotp3a08ve/zZk6D4A8G/D/AMc+IfGsf26e7soIWjDTeY0gnVgFVf7zSAqoAAy1d5pfgfT5oW1LxHaR3Or3xE17KrMAGxxGuD9xB8q+wJ6saydRt7abx1BqF1deVYaTYJeX4bAQyB5BbFj/ALIa4fHqENdP4Z8YeGvGFrJeeGdXgv4YX8t2jz8re4IBrbLVCtzKqlo3Zfm/lt5a9z0sTWzDOr4zGuVSNO0OZq6S6K+y7K+u/cx9d+E3gXxBDbxXujKj2twtzFNCxWVZF5U7jk8EDHpXU2FjbabZxWNomyKFdqgnJ9yT3JOSTVisHVfHngzRbbWrrUvE+mxJ4chFxqqi4Vns0K7lMiKSy7h90EZbtmvapUIxf7uOvkhPEV6lCOF5m6cbtR6K+9l0ub1FebfCv9oX4W/GS/vtK8D67LcXtgnnS29xbPBI0O7b5ihh8y5IBxyMjIGRXpNbVKU6MuSorPzMZwlTfLJWZz3i3x54a8F26y65fbJJQTFbxrvlk9wo7e5wPevMNT/an8DpFfWkS39ldRLiJpI42O7I52bs457ZrwKLSTp76tLp+qahO+o3s16jajcG4aPe2Qm487QPx5JrwD9oq912W1VTo5S+ijKN5LFTNH1Vl6glT6Hocdq+z4f4co5li40Jy3e+n5PddNzteGhCN3qfcGjftdeCpvE2tWNxe+ZblMWRj+YfaEUBovbdnI/3TXvXhvVE1vw/pusRyrIL20in3qMA7lBzj8a/CP4a654213x5Zw6Ro+satM1/FJcwW8ZeQyLkLntnryewPpX7i/C/QNR8K/Dzw/oGr4+22OnxR3AVtwWTGWXPfBOM98V7niHwrl/DlKi8PNe0lZON02rRte26T033ueeqtKrfkeqOH8afF+68NfEXS/B8Oipdx6jMYneN2M0X3SHK4wFO7jk52t0xXnnxf+DHgr4r3N94S1qW6sG0m8fUdPuLIIGVLnJlQqwwy+csnoRxg17H4wvvCGn2Ml74rn0+BGjdY5bhxHIcDOEf7wIODlTkHBryT+1tRh17Sb64vI7+zuop7YairrmVXUSxiQDjdujb51+UgnIU9f5tz320XDkuru9106W+e/yPQr8Rf2VWwmMyeDoV6Ss5qV3KTum7NWSs7NaprR+dn4DeB/B/7Pvw+8aN4Wt3udSTV4rI3V4y+ZdytFD9mRgpwED3B4HOGbr1rs7bVn8IwO3h2wXVdSklWbUb2eRI7jU5M4ZmduET+6nRVAUYxivA9X+JC2/i3UpI3D6UlzYaysIkCvcSQJLAxUY5OfIb2AHrWJefGmbT/ipI0l9cWdkqsZrC5c4R9gATp97byBjORXxOb5/m2MUaGAlyqmvi6yd29Gtk9F3fo2j3+HuFs/8AEV4jOKknJ2k1OVm5yi7WVttLK9rKyS0Z9mfD7RJdKtdU1GS2t7NNb1BtSjsraQPHbK8cakAgAbmZC7Y43OcZ6nphMplMJ6jp71wPwP8AHaePPBkWoRWUkCQO0QZmDBvmPHse+09AV9a7CRyZWcHvkV+rZfmHPl2HrxVnJJtef2l8pX8u2h8xisvrZTWlgsRHlnB2a0dn120+406Kigl85M9xwalr3oTVSKlHZmAUUUVQBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVE8yRusfdjj6U6WQRIXP4fWs4uxfeTznNcOLxXsLRjv+gmyj498Pz+JvDkmmQCCTFxbXL29w22G5SKZZGhkODhXClTwevIIyK4S611fFkVxZeLfDa29mJR9kWG4Rri0K42zwyoB5bgjIwfy6V6R4nvPsfh69ulOMQlQR23YH9a+fPGnj+08IWcN3PDvSaURFgwynBO7b1I4/DNfl/iJnGOwWNoYfLm1Jrml1TV2kmuq+K6emz3Rtgsqr5xjY4TCx5qk9Laa2u+vbX/ACJf2hrXWPil+zZr3hO21HzvEFtqdnph2bY1vZ1uovLZgSAqyoyP2AY46Cvn79lD4S/Gjw18T9M1jxpa6lpejaSz7hdy/wCtfaUVI1ySw+bqPl2g89K0tD+L8epeOtUk1K7vdWtrGQ6hb2lrNhEaP5g+MEMqEDjjpk9K9ytPGEF94Wl8R2atGotJJ0BYEqyoSBkdwRiuijn+MxkIKrFKcYq++tt2m/knvqfqeZVuJfDDJauU1acJ4fERXvtO8JThaSWq15Vo2nqm/I7aC7g8WWWs6Tp8Qu5dbuplvJs/ubK1Q+VHvYHmQpHuWNTnL5bapydXw14I0z4MeB9TGlapdXEVrDJNCbpgVhXLPsUehZ2J9SaseCobaz8KaVZ2sMcSQWqRusahR5gGHY47lgST1JPNX/ifo+reI/hnr2k6EofULrTnFshON8gAYKD6nGB2ya/ROG8NTqYik67Vm43fRJvX/N3PyvA5hi6WDlglUfs5tSlHo2tn667ni/iX9rHR38d6PoPh6ZPJIMM+/wDju3Q4ix6KQM/Wtl/A3wv+KfhXxNoc32LTfFHjy0hTVbyyO+aSWJt0MjIDhdrICy/Lu5z1yPyS1bW/H/hXxpcpqdnrdjqE99LNaQ3MbJPudiCRnoxJxke2K/Qj9iKfxVp+nSBPDQl1e7iSMNcSF/skAzuZ8YCl2IJyeAAOSTX9GcU+HWHyXKKeY4SpZWVrSj72rd+a9mldN2vtbdIVHEQqJyovY9K/Zl/ZEuvgh4tv/GfiDxTb6peSWr2NnFaRPHGkbspZ3LHJY7VAXGBzyTjH0xUFkl1HaxpezLLOF/eOq7QT7D0qevw3FYipiarnVd2VWrTry55vU+PPGPhe/wDCHiC60W+iYCNy0EhHE0JPyuD344PoQRXH+IvC2heLLNbDXrAXMSNuT52RkPqrKQRX234k8JeH/Ftotnr+mx3SISY2OVeM+qsMEfgea4Vvgx8LdIa5vr97t4bCI3NxHPeNsSMAkswUAkYBPXtXqYbNHStUV1KPVfnfodUcXHl988J+Af7PWkaXb6lqPgPSF0uO0nW+R3dpBeX6srKjM56YGDjgbhx1r6J+IPxWtfB/w3vPHFho99qdwli1za6fBHmWaUMFMXoGUk7h1AVsAkYrc03xJ4XsLW2s7S2uNOstoWAyadNbQAdvmZAq59yM1laroWnXF7feFr5WOleKFkurWVD/AKi8C5kCHsWGJV9SsnrXlvH0cbmP1zEy5lJrnd7t9m317eeiPJ5qMa/tYJWla9vwfz2+4/PH9ov9qSx8ZzaXrGl29xptwkESXum3bAGFVAlyp6EksysOoKjrXZp41Nt8DNLlN2HmvdQ8yFVP+phWYFlHqAGx/wACNct8YP8Agnpr8Wu+IPGV14rtDosCCd7bTRIlwz+Zl5WR1KqoXDEKT37A1V+L1jZeDrLTvBWkyStZaVo2I3lYM8rM7s0jEAAsxGTjj0wK9bxJpcNVMFSwmQyc5qK5nZ2V09Lvd9Otu97nhZ7mChTdFLVW+53Nqw1IL4g0nWxJAP7HuDLM08PnILd18uYle5VW3j3QVsy/C+e5uovEJW0OotdbfLLHYse77xwTxjngk9a4/wAISaZcRNfS60DqP2jyF0v7K7ebbtG2+Uy/dADbU2feO4noK9J8L6pciOLRCXlnhCRwd2liPCfVh9w+4HrX8/4rIKkJJ03bTp+R7PA/idmnBFGph8BGDjUak+a7e1mtJK115X0R9b/BWD7D8PYv3caDzZDiP7mQAp298ZB6811Jk965u01bSvA3hKw8OyS+feWsKrNHEQcSn5nyeg+Yn1NYA8e6hPf24cQW9uZkDqBksCcYJP17Yr1sTxJlORUqGXVKnNOCUWo62fW72VnvrfyOiti54ibrVvjk236vV/iekWlx5Uwyflbg1q1yrX9qs7WpuYxKhVSm7kFs7ePfBx9K6S0m8+2jl7kc/WvvsHzQThL1CEr6E1FZuqastmphhIaY/iE+vv7VZ0/f9ihMhJZlDEnqSeadPH0q2JlhaerirvsvL1LuWaKKK7QCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqOdS8MiDqykfpUyfLFtASUVkaTq/nBbW6bEnRXP8AF7H3rUlkEUbSHooJrlwWOo4+iq1F6fivJiuZ2o3aLJtaRVVCFyTgbjwB/SqsN3BOnmQTxyJuKblYEbgcEfXPGK8J/aq+J2r/AA38D3N9FC01rqMYHmIvz2zxyozsp7/IScdRgkdK+OPhl+3j4y1H4iWOj3ype6dYs07Wq8LLOEYGd2HQFtnHc5x1rtxPD9dZR/btX+G5OOmr0i3tddVy/wCaHCDqK6P0w8eMZPAeoyLkmKNX4P8AddSf0FfN2vXB1TT5rBBbs8own2gkIpz94leeBnpXuvg/xTa+JvCZ0jxRL9lvtQgZZ1cDYhlU/Ip6fKDjn0718veLrrVNDvrnw/tMeprO9oo2k7XBwXx3AHI9SVHevynPcNg+IZ08Zg6iqJR5G10abautGr30vZnl182q5LjKGYUdXBprteLvZ+p57pGi+H9C1Oy19r+1true+kivC8LMsSxttdwoI3Lnpzzhq5nxb+0zrFv4b1ax0eWCG1ivQxeKFQZopZPnWNTkRpnleM8j6VL8br3R/h14P1a28V2Wv6VrdpDbQWELwBY0ifeJPOVsSBzujKsOPvZr570qG28Q3MOh3LyC21NkhZ4ztdAWDBlyOCCoPIr2+G+H4YausRi7yT0d+3VfLoevxD4hZpxxOlPNoxSpuSXKmt7XTu3e3Tsme5fCT9uXxjplywu9YfUmNxN5NpOqmErIRIS2MEfNwMHPXpX6MeAPi9ofi7wK/iGFhJd6dDGl7bQ5IFywwsaN0bc2ApHqM81+UfhT9k022sWGuaX4iVtMZN4ivQzTRy78BlCgKwI5GcYNfoP+zX4dtIdbl0qASDT9Lt4rry85WW4Visbv6sNzsPfHoK/auIqWRvBUq+U355JdGreqa6K78++18YTVXDKrGNm7W+f/AANTsbz9lT4U+MtMtZviX4aj1nWI7lr/AO0C4lh+zTsdxEXlsAFHTnOcZx0A9I8FeAPCfw80o6P4S0lLK3Zt8h3s7yN6s7EsfbnA7VifEj4yeGPhr4X1PxTeWGs6zBpSo08WjafJduAzBfvAeWMZycsMAV1GheI9L8RaZp+qafK4j1K1W7hjlQxyhCAfmQ8qRnBB6HIr5iljsT9SjgadWToRbtDmbinu3y3tfW7dt3cmhTp0aahS2/Xr8zUooormNTJ13WrnS9Pmu7DS3v54VL/ZlkCPIB1C56n0HevzW+N/7Z2qaH4zlbwyL7T0gge0lt5p1cMhkJK5HJUqxBBAIK5HIr9JvFHhzQvEOnvHrkEZjiRm81n2GNccncOgwPpxXxN41/Y+8GeIPGdt8To4rO00SyuReQXOvzx2KXjEHYHCo8kiE4ZdyRs3oR1+v4M4nyLhirWrZ7Bz91uKUW+Zr7Ol0r7czSSvqzKtiFh6ba+L+u357Ht/wN/aW03xz4f0TTrzSb03E+nmUXbjasqISFZlYAgMgUgnqfqK7fXrcxaVNqHh6SZdPikW4mthhjpsqnct1AAMlAR+8iBwULFQDlX8It/F3ivwWttpLJ4f1bTUj8u0vorbU4RIM5EPmfZ2UsBnacYIA78V6H8N/ivoN9qBtry8/se8mxDDFNcI0czk9EcHGeOA4QnsDX59jc6wOa1ZVYJUnJtpXva7va+ia6dL2OKeNw2KppP3ZP8AP12PQ3vLLxVpMepNCpttTgaK5iyGCvgpKme/fB7jB718H/tOeDtS8OR2eqNG08Is7jSmcAnbNbuy7WHujowPcNX2dpcieC/GD6FeKw8PeKHL2RUcWGoKpLQgdlkQEqPVCvYV5J+094SbxNqEPgGy1FIF1eL+2zexcyQvEv2cqg9ZAU3c8CNiOcEedmuM+r4GWInpKOj9XbX9V5M8XNKP1qhzP4k7fPT8+nqfL3we8T6r4R1/T/FVusUWpWTxzWRmj3I5A/iX3z7eowcV7j4UudZ1vxHN8RNReOO8+0SXcLhBGss0hzIVA4VBnCn+8AR93J8s+HfwK0q/1rRNNuPGlpoup3kbSpdaiksenhI4yzq7SHEkucFcEYKknOMH1X4WXNv8Qby1sbvxPpmjxNDKTd3LgQb4sjAJIHzYyOen5V8jLG47HYL2FP7TspbX208t1rp+p4GFoThOPNs3orq19PP0O0bx7pdwFijudriQqfNG3kdf1rz743/EPXPCfhy4u7ZGurXUYfIiRAN8NypDqUPcsB0PcHHNcheaqI3d/PVw0rbmU5Vjk/MPY10Xg2XRvF+oReHfFmmjVNDUi4uYC5Vk2/dZGBBVgxGMH1r8vyeFCnmlGrjYfulNc1uiutfVb/gfQYPMv30fabHl3gT9s/xP4h+IOiPfsbwwXAZkyV+0FGbEko7bI8Kfoe5r9CfD3jS9k8PW8Ekm6+kjWW5fGBGzjcUUf7OcfhXy5pP7NHwG8AeNk1Dwv4civTBaQ6hp89zcPLJG0ryBzIcjzCChADDgHkZAr1C717XNO0u8uPDtgb6+CKYodu7e27oeRgcnnnHoa/rnxD4nybPZU48N0JUYJNNvlTau7cvK5K1te+yWyPdwNWeZ4qng6VoylLlvJpLyu+iNW6+JuvQ/Ez/hDzpzrZPEDDN9meU3ExKgJuBwmQWO45A24xzXtmjeL/DOr6pe+HdK1WO4vdJYQ3Uaq2InA+6WI2k45wDmvJdO1qJp/DfiaeF5BBdoZUtV81naSKSNYlA6kzFF9jycYJHovgr4f6XoN9eeLbnTIINf1pmmvjCx8tCxyEUdDtGFL9TgngHFfA5JTVOT9nFJ6Xflb9W9O9mfUVcxynG0/Yqg6dSnBRTg1KM5pq8pPTRq9rN69bHY0UUV9MeKFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWHq/i/RtO07UbyDUbK4k03atwguFAhYsFHmkZ2KCeSRwAfStyvK5vBuhfDjxJrHjC4Fze2viK2a2uZLqUNHbuozFGw4AjYDYGPRgoP3sjnxFV0Y83Tq+3n953YR4GEZ1cbJrls0kvi95XTf2Va+pz3w8+KMPxBttQuIrIWzWNy0BKPvjcAkBkbuOOD3GK7keMBa2n2PUXzG7BFl7r/AL3qPeuD8Yz23ww8PaLdaboIlXUktY5fIQqolZQJJHKgnAzuOB0zx2qtr2pb7e3OcbyW/T/69fG0cPVwVdyo6eXR/Iz4i5FL+08DRdLDVG1BOSb91LmT1b3d9e+h2njrwL4T+J/hi68IeMtNF/pd8uHVZWjdTggOkiEMrYJ5B6Eg5Br408Ffsn/B3wL4vvPFVtoszXlre3FtBb/aX+yskM5Ecjxkne+Uzydo44NfV3gfxZHvOk6jcKiIpkhkdsBVHLKT6AZI+hr56+IPi5mliutOJjsdQa4lDjgu3nvkH04K/nXDx1m+Pp5RTw2GxE4RlJtwUmk7xs9E7dtbHylfG8ijVg3pfr6HeN4702yaYXV2ueC2z5sfWuM+IcN/qVwvi6B3e4RFhkCk+ZFCv3HGOdwwC3cALj7lefR6ssolIbOACFz1POK9F8da14V8OaTYar4X8Ry6up0lbu/EkRj8q425MQ4Hf649TX55wlTxFCvKtSsuW113T6W6/Lbc8TE4j61RlGo9F954d8WPEWs+M7htS16/l1rVWRUme5w5aIKAARjBxgYH1NeZ/Dv4Z+I9Z8Y6d9hsLmazS6G+VIyWT5WYLt6k4Bxj0PSvbPFnw5+GHjPULC48H+P7/W9Wu9Ohur9RYSraWlw5IeJvLAIcMfvHoAOT1r0v9mXwTJ4R+LUPhW61gXappc+rCeUEGK42mJYckklRFJM67ufvegx+lYTOa8syWHqPSbtbtfrfZv8AzscuCo1YYhRk7qTV3e97+d9yvoXhfWZ5oILHRLwxxPHCg8hlUOSFRMkAZJx+tfQHwY8K/aLC4t5Lgpp7v5l1LE//ACFHXK7VYci2Q5GeDK24/wCrwH0NbmXxX4jbw3YSytpmmB4725BK73YbZQh9duYlI+6GnI5ANQ6x8RfBvgSV9Hjujd6girEbKGaNfJUAbUdmKpGAAMLy2AMLX2uOzOFRN1vdgtPV9vNeS3t2un9tUxsJ3dTSK09e/wCW3l2ujT/aG8fxfDT4M+IfEunowTTreONjBGSIYmkVGYBRwAGxx0yK/NP4eftffEHxD8RoNT1HU9WvLiRYLS0s4ZtsYiVwVjK9CmFAxgkkknmvuHxH8QvEvxCsbzw5ax6FpejP8l9dNDqV4TtYEwK6Wypnj52GQowMknjyT4b/ALHfhjQ/Gl38QNPTTtc0i4vHup08O3CXFzZMefLRJURlXqdoBk5OAa+y4N454dweAxOAzSm1OXvQnGLk3olyNJXjtdS272tdvD5rCVVRivd72/Tf57H3FoWtXWpaZb3epaY1hczIHa28wSNHkdGxjn27VrDkVgeDNG8Nado9vc+GYojaXUSSRyoSxdMcElufwPTngV0FfKwk6jc18L20tp97/NnfdPVbCHocjNeaW76Vqd74m+IPiNftD+HLy5sLCJ1D/YooFXcY0PAllbLb+GKlFBA6+mVz134B8J32ry63c6TuuriSKacLPKsU8kX+reWIMI5GXAwWUkYHoK5sbh54hR5LO3R7baPZ7Pp873SOfEU51LcttO/4P5GP410e/wBf8M6toFvfCyu720kht7mWLzlt5iP3cuzI3bW2sOeo4r42/bIv/jP4e8J+G9G1m/tL+xW3cahrdnBtmuZsjAYsC8Sr/st82QWr77urWG5jKyx7iBwRwR+NeG/EmO61q1vNG123VdMb5JLdjgjHQk92HUEfhXg59xFg+EoQr4un7RSdlG2j01TbVl5Xvrqk9RT/AHMlUcVJLo+vk/07PXvfyn4LeMNZ1n4E6RafFTxFODqYdNN1SZc3VnJHIPskj4GWBIBSQ91weHU1h/EP4v6Pq2n3nimeWSDV9AfTP7Qt1hfEew3UN2o4+7mRXHttNJrHxG8PWUlz4T1+4k1CZFaEPBbtKt1Ht5VwowkoH3k4/vDg8eH6r408N6b40eS6knm0vXrJtJvWniwzEf6gurYJYLuiZv4gUPUGvg48W184qv8AdRhTd2oq7VtbK+l7Ju2itta2i+UzHFxnN+zsk76dt7L5X0/ysct8VvH+n67q1vo9hqEU9tp3nNGM9RLIZAcH0BA/CvQfgXo3i3xjoDad4V8P32sXMbTzvHbIG2R7sBmJIAyRgc8npmvmH4geH5Bq1vLotx9rt3VrP5srJHJGx2hwfVTkEZz9a91/Zn+PPxW+Bmozaf4P0Sz1a3vbRIrmHVQ0ccaqxZZA4IbO4vhecgnjjNfaYKjhpUop7PseBGnTdSMq0mk97bnougfDvxF4i+HmveN8sg0mZ7KCxTH2mS8R0BjdDyB8zDHXcB6GvS2+EvjD4L6NZnxbBard6zl2kt5hKqMoH7knA5UHJ7Ek4JxXFeD4WTVNW8U3WoTz6lqeoS3t5Kku2EzSN5uY1U7cfODuI3DocEEV6D8Tfixc+MvCGi2Gs2U8+q6IZ3n1WSUbZ4zkhfLUABsbckjPydeTXwWFymm/rMK7baadPS1krJxl1b3a28z2vaYJUFKEXGajve6k76vy06bfr5t4M+IqP8Ub3Rr67Ijv7cRQFj8okSRsJ7ZB/M/Wtf44fGnxF8JdN0yTwzZWsl7qskqGa6jMiRJGFJATIyx3DqeADx6fNGsa3Ppfipb1HIkUPOjeuJFcEfnX2HpX/CNa/wDDy31vx74Kj8TWjXEfk6fJGzNIxA8qTK8pkM2GyAdhB4PP1eR461L6pV00vF+nT7tV8ysmwGMzzExwGB1qzdlrb8XsaXwL8V/Er4n+CPDHjDQH0nR9Tk8YC28QidG+zXlrbweeZoo8HZJsYowUjcSCTwAPojQ/jJ4U8Q3V/b6al0yadcvaySOgUM643BRnJxuXrjrXBsq6fLp/hPwLo2n6Dp+n6ZI2yCMIto9yRjbGPvylI5PmbgFtzbs4NFbC20i0uEskS0up08v7RKuZJJduFZz1ds4P516VDOYUYy9irJPVvRbL7tbt/wCdz6jLZYfAYatRxKlKrZKLTSipL4rp7311XX1094tL9NQeOaCQNEw3LtPBGKv15J8I38XaB4cey8T36392JS8btIZPLQgfLnAzzk+2a9Pt7tYtNF9qNxHGoQySSOQqqvXJJ4AxXq5PmtLGt04vmlu306L+raHVSqe0gptWLlJ7VwF78c/h5Z3HkLqVxcgHDSwWztGPfJxkfTNWNC8f6H4num1XQdTjuoEwkkYyHRf9pDgg9+ldWPzahl/I5u/M7ei6v5CjiKU3yxkm/U7iikVgyhlOQRkGlr007q6NgooopgFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUmR0rl/FvxK8K+C7uCw1m7l+0TrvEcMRkZEzjc2Og6+5weKF8RwanLbatplws9kyiSB1PEiEdfxrzMxzWjlsYyqattK35v5IzVWDk4p6o6mimxyJLGssZyrDIPtTbjzBBIYmw4UlTjPNeg6iUOdaq19DQr3M5t5t+4BSBnPSud1PxV4V8Sx654KttRhuNRTT5hPZ4+bYyMvGRhhnjjI/I06916Qwj7VCCMFSycEenFcRJ4f0uHxBJ448K/Z21lT5d0s0pZZ4e8OTkwnklSBtyTkEE18j/rBRnUlGk+aMunXz/pXNaU8GqdVYrmvy+5y2+K6+K/S19tTp7PwjL4h8PQaxq18t3q1xZRPasibILQFFOyFDyA2BuYnc3sAqr5B4lmkRog4IZS6MD2PcV11p8WrLwb4JtrvV4rm2OlTHS5IpVG5CshVN2CQBs2EnOMHIyKy/iytje+EB478Psvn3e1zbZyXds5kT+8MAkj2B710Ucxwk6DqtW5Vdvvp97fQ8bH5biHl0MxjBqm21zdG0k2vVdf+AfPfxM+I/wDY+tWWgWF2RKrxz3W08Lz8qH69SPcVt+AvAFx8X/Ckmjw6rb2B0/Tn1b7RJEZGTDE4VAQWzuweRxzXy3qXiOfXvEl9dFy8lxcuQT2UHAP4ACvpH4L/ABH1jwn4OeLRLK0dtb0mK0a9lDedaDaQzRspGCdx49QvpXxGIi81xLq4pWW9tXZWdl06+m72PkMLiaTr/wC0aw6ruv8AgnDfE3w/ffCvUbLwnqcVrNqBgN5JeW1yzi5jkciJdmSIygVhgctnJ7Ctj42fDj4hfDX4dQ3fjDSFs01K0CwmO4WXa6hWaN9v3W25OOnBweKk+IHhnSPE1kt3eecLqLZFHdRuPMUlgAGLEArk85IxycivM/jr8afjb46tNO8L+L7u5udItY5YLC5hRHF0Au12LKikvtAzuBbBPPJrp4UwUaVKUsVrUSim0kk31emmuhnj3hZTqOnFxTtyK90l1vfV/wBXOd+Evj618M+M4pL/AFFIILm3lhlLN2xuBwOeCor3v4Y/FfQrOG58f/ane91PxCLbT1MLECKKzuU3dOQDKpI77cV8N6BoWqQao3nsIFJ8hZGOWdpPlGB1JwWY56AGvoPRfFfh2PX9H0zRp5YtK8NWjQWknkh2EzkbpynV2+U4GOWwTxkV15vXjgpKrRS5lrcwoSeHkuV+nqfcfhbVtP1DSo/CGheJ3spseZq+pKQs8cj8/Z4jIMeaVPL87Bk/ecY6DSPDmgaXcSeGfAOkQaeIjt1TVoxunj3cmJJmy7zsDkkkhAcn5ior5u0L4ieHDHa+GdBurjSwcLLeXcDqIN3PDMMNO5JI3eu454B968CT32mW9vY6C++yQ7RC7F9xJyTz8xcnJJ6knmvBwvHtKhWhSzGl5KUd0v8AC+73s7vz0PqcI44iyW6/DyXbzf8AS9W0qzh0+2g0zTIfIghUJFFGThR/PPck8k5JrnvEh0yz01fifpMTW2raXfC0ncIEe7iF0LeW2lAz5mTkpuyVbYRjJB9C060jgt0cwGOV1BcMQWB7jI4/KsqfwF4TudXXW59K33K3S3oUzy+R9pUYExh3eWZAP4yu7IBzkZr9Uq4OVamnTtrte6t2a0vddtPVHs1KEpQ5Y2/y7NehvqABgCloor1jsCiiori5t7SIzXU8cMY6vI4UD8TQNJydkS15P8VvCNzfXJ1EXL7pFKwStyIm7KR6dx3r1dWVgGUggjIIrjtR+IHhG48YP8NdQkYX00O5g67UGQpX5jxk7gFI6sCO3PyvGPD9LiTLJYOpLlle8X05ul+6e3luaQwVXGxmqcXLlTk7dIrdvyR8da7oGpWmnLoXiLR47JLaFFTbKHaS4BJa4Rx6nBBPzZJz7+HeNohe/afDuvxLK1wjCN1XAuF/vJ/dcHqByDgjivvH4meHLXRY5F1Rre6sG6FgGK+zKOVPvXzvqf8Awh3hTxLYeL9MRrq60ef7VDaXMYlhkbay4+b5hwxwfXFfguDw1bKK06GISVSN/dvZ83k9d++x8RjcDCFWMJztG6u92l3st7LsfEtzc3sV7d6HqUhW9iAYSMpUuyYAkx6ldu4eoPrXp/7N2qjxN43vfB+t+LtF0HT9WtnF1qutldtlHEiuFV3IwxePYOQeSAcEg5Hxz1yD4heONQ8Z3ph0m7luFk8m1t2KCFQE3qxPLAcsCO57V55fz6B4a1CK+vLyTUZ1bbNDbfu0nixw2fvI44O09R0Jr9fyXEyq4enVqxtJpNxTvZ21V1vba54taFKNeUaT54puzs1zK+/dXXnpc+tPCmm6wtvf3Ph2X+0bHTYDdXjoxkW4zJgSqw6sQGYgfwgccYq9qHiqz1bwxqFhbWkaXRjeQS728xUEbAoBnaVJIOcZyPSqH7Hvxn8KalaeIfDnibxbZ6KYfIk8N6RBZO5vZXJV9svQEER5UgH5i3QGuk+IfhTwpPr5/wCET8R6XY61PJl9HlmEYeRv+eTAbYyx/gbAyeMZxXz2IzXFZdm044mCdKfw2191aXfWL0vrp+ZU8E1hY1Kcteqdr79P8t+qPmnVNSh+120zorEpMAPcqD/SvpTwP8QrjTw7TXxRtP0WzvAwO3DRSI2cfRSMV5BrH7P+up4Mn8eal4j03TprTXhpEWhXQKXs8ToCZ05wVAYnoQRGxz0B9p8D/BTw/wCK/B954i8b+JLnQNFvENq00QCu0MZDK28ggKW3A5GPlr0c7wOHqZW8Sm3GKUvdV3ZO+iWt/IeW4XFTxUKNPSUl1dklrq+35+RZuv2q9F0jSZtc2o+raldSPcA/MEcAKkUag/MEjCDJOM7uvWsfwr8efFXi7WBqcjKI4T8hl/eEMfQfdXHoB6V8fjR7q+8Y6vaabfzXWj2upzW9peyIU8y2RyqSKpxywAOB6+le+eAIoNKgijUbEj+6CeSe5NebmWTe1w6nzN7NJ3Xpdd/XW5rVxteFX2c5bPptf16n2L4Y8d63NZoDfq7EZIMa9fTpVv4weMNXurXS/C0ziKP7Ml3dJH8okLE+WpHoAu7Hqw9K4b9nkWXjt7LxFaX8V1ojXDRkoTmVoz8y4PKgcZz1BGOua7/9oHQLi21+z8SQxlrO9t1ty4+6kqZwvtlTkfQ108CZRmGGqYjF4mpLk0iotvvduz2tol6vyPo/bVKuBc15fceM6vdCGERA/NLx+Heq+geLbjwdqkXiG1uBELT55tzYR4Ry6t/skA/Tr2rJ1S/+03sjBvkU7F+gqOx0ybxFeRaFbwCd78+R5ZGQVbhs+wGSfavcx6eKrOT2WiPHjUcZXhufc/gPxVo/jDw5aazoWoQ31lPGJILiF9ySRnoQfqCD6EGtyS5AlWNeecMa83+G1vpXhWK28KeH7OG0sbOz8mGGFcJGqkHgepJY89ya7qNgXX6ivewWPm8LCmt46N+m34bn2VCo5wTlv1NWiiivpDcKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoPtIWcxNwOx96nrHvby0guzDNcxo7H5VZgCa48bWlRjGUe4m7HAfFz4Vr4nv4/EFlrCWdzJGlrJHJEXD4zhlwQQQCeOh46d6Xw+1zwfcaIdC8IeIbXVo/D8p027eGQMY7hcllf0JJJ4464JxXV+LtVMc1lZuxA2s4PvkAVyWj6P4f8AD5vDoWi2OnHULhru7NrAsfnzt1kfH3mPqa+Lzl/XsQ7bK337s82SjSrucEtd/wDgfqek+GtQEoeyZuV+dPp3H+fWtTUXuo7GeSyVWnVCyBhkEjtXnmn6s1jexXQbIRssPVe4/Kuh1fxBeNdPDZzeXEhwCoGW98172TzlWwMsLKTTSsmt0ns16dPRHXGvHl1Pn340fG7Ufhp4K1LxLdZuGt3SGG3jVU3yu21AWIO0Z5J54FfL3hz9sXxb4j1C5vbnS4LG7s0VnNrIwEkZbAOccEcDBBB4r6H/AGj9Em1zQvEUkXhqfxHam3FxLpVopE9wdw5iC85DfMNvIxkA18rQ+BvDnhvRJF0zRLqyuNQhRryC+lMlwnGfKY8Y2kkYAHPPWvyXA5DUoqphcw5p1VP3ZcztZbNa6denXc+RzXF1oVdJNRPYNJ/ag0bW11NdVijV761TzCUA8q4i4Ejr0w0fG5e8Y45roPHfxQk1S98P3MdyoW5ec7YzhAFRdoUDgAZ4xXzB8L/hh4B8U/EKbSfif49ufC+gJbNcQX0Uixs0ysuImdgQMDJxj5scc16t8Pfh1q2sfDTWfE9teSXum+GdVuotHleMrJeWYfaZ9h5VNmGHrzjgV7NPK4Y3GrC80n7Llk7p8rvfrtJrr29bmdSrjpYFVOfmhJuyT1TWrbXS/wB+3dX8dfU4Ga6kKorgyFjjHrzXs3gTxMNF+H2l2tysRW4gilC+Upl43YCseVX5uQODgZ6CuHk+FvhqfwJ4w1ubxDq0Xi+2vV/sbRILBnhu7OTBkleUKdpUM/BK48sfe3ivS/Angnw3Y6jZ2Pj/AMQ6dDcwRRJFoouB5smEG1ZWHyoMY+QHcc44zXq5xjKWSwbguacltvZen+enV+fiUcNVnKPK1r1v8tf8t/IqeI7bW77QrXWb638jRtSM0cCElVZ0AIdm6hfvbTwCykjoK8w/aB8UeErGPwx4f+GnxEvfEFgIY7u6mnt3hks79j+/jTKqCCqAlkHPqe/sP7Vn7QHg7w54Otvh34es70eJftinV1uIVGntp4QkRjByOTEMADgNnIxXxqdU8PeK9SkaBpNMYgJDFNJuibP3nYnDKp7KPmI4AAJNVw7WxLwHNikm5aprXR6pPRarZ9Ox14rDwo1HGD5lZXfZrdb/AH3/AOCSwahfahqKR6aGklEZ8hipYJv4ed/RQucE9cj1r2XwJaCzitvD+ivsmChrm4YbmjU9Xb+857A8d+g5rfAD4py/C7RfFGj2VjpWsXHi9Nslxe2jZtIgjxo+B94ENlY+ORnPWvT/AIT+DvBtjZRNfapfySyHcw8sJu92PLEnv+FfM55jJznVp14qMItcr5k+fRNtq3u2d1Z777G06FDkpexqXk78ys1y66a9brXTY7jwvpc6WkWl6Joq6ikgdLi0LLvuA6nLM7cE7sFi3UE+gFfRfwf8C6lYjT3vLpvttlbxrczxuSqkKAVUn7xPTJ9zWN8MdBsNVCWugC2trZSA8p+X+fLt7c17TPrHhfwTpxtbnUIo2hQyeQp33Ex/2Y1+d2PoB6CvG4S4Seb45ZjipWoU5XvezlJapJ3+9/Ja7fU5dhYUYKrN/wCRr32raZpjQpqF9BbtOSsYkcKWx1x7Duegq3Xj/iLw1pHxJmstY8X2niTzLOXzrW2sLKaOO3j7xu5QGVm/ix8vYcDc3X3PxCj+yuNE8O6zeTRztasGsZVjgdR8xlIVmCj/AGVYnIwCDmv3yOPp6ym7Lp3fy/rzse/WrYGOGpVKVRuo78yaslrpZpu91q9FY617iCOVIJJo1kkzsQsAzfQd6krxLXbPQ7nxdoXjPV/iZdvqCXEdidLsrfyftDmQPHB5bnegDAHLHJI69q9IT4jeCJEV/wDhJLVdwBwWIIrWjio1Lt2XzX6HpTyuVTC0cThFKoppt2i/dabVr6p+q0+d0ulry348eIfA9poUXh7xnqN/aRXrrIDY3IhnZS3lkJnl8hyGUfw7ieBXqVYfiTwR4U8XtbP4k0S3v2s23wGUHKH8CK0xEJVKbjC1332DI8Xh8Dj6eJxXNyRd/caUr9LX03OW0w+JdPtor7w7O1l4ctrfc39vyiQCBUyJIhH+8QADOJHxjoq1Zg07XNf0uLU/EF3pcT38Hz2q6OrHyicqr+Y7H7u3K9jmneOvA9z4l1TRZrbxFc2FlpbAzWEQHk3ChlO11IIYbVIxx1B7YPQy5Zix5JOa8eq1Tm6bba9dPuXRbJep5mJw1OKjVhWcnNNyWqcXfZvRO61076ng3jPVj4e1p/DVv42S6uY7fzJIL3THkkWPIAQOjbnwCoGdzYxkmvHvGfh/TpreW71DSBpjEna1ndrucf3jbS4I5PQNnHavoj4hajYPdOum2kD3IiaKW72hmUNjIjPQHhct14A7V8x+O9A1HSp3u5fMnt3Py3B5P0b0P6elfkWfcPxpZk8Xhl7ktZeUur9H531vtofOZ5UwdoQwsZWUUpczT97q46aR2st13Z84fFfw3ZpFLJpOrxzTyMQkMts9vKrc5YK3t6ZBzXgl3pX2O3b+1L+MyqdqqqktL+f619K/EZoJ1xeqHggiLkHtz29DwK+a/EWm3V3eSXZkYbj8qyEsAOwB6/zr6rJK+nsm7JHy1FrmtsZPhvxdq/g/xBFJot2bbEyyO4zuj2tuG0jlfwr6IsvEN2Ug1N7aQeYqzrLE/mBs857N+lcX8Cv2YL/41aD4w8TTeO9G8OHwzaLciG8w73JKO2cblKRgR4L4PJ6cc3vg3rljrFnpugatceQlv5amZ0YgQ9cHj2I/EVti8ZgcXiKlGi71KXKp6PTmV1raz26N26nXmuAqU6FLFNe7O9nda20e3n3PsSbxVpFt4m8NXWrx2t3bW+pW0kyXEQZcOrAsUcdsg9OtfQl540+CHhVv7O+KN3BYwG3E+mQpDMImHzbvLWFcA4K7ecc8V8j+MfGGmyxrMjTTRQXNs+RbOUCq65yWAUDB9fSrPivxXY/FDRdNt4NJFtJBBEiajcH96NihCEjQ42sFGdze+M125XVp5Ph5RrW5d1pfXrojLD5g6fNypN+a0Ot0rxH8K/FmrpcX2g7zJKyxnULVHATJ25IJwdvX0rX1rxpoHgjXP7P8NeDNF2wxoZJxCFZtwzhGUdMHqc9a8TWz1bwhPDG2q2GpP9mjux9iO9Y1fIVZTjEb5BBUkkEV2llqVlqYt5dYsIJ7plQBI94JHZTyM9e9eBUz+CxMozpv2e90tfuv1CjVklZ2UvQ+pPhdBoWleH31rRdIttN01Lf7RFb28KxKHlG4/KoA3HjJ963NV+ImkX/g/U9M1uxhG6EhBMN8Rycd+hBIIPb14rym78e6ro/g9NLSG0SLcm4Im059ARxgYAHHauQ8Z+IpYtFMoYh2kjzls45yR+leRX4zxMcXThlH8NL31Jbtt/PRJWafqfQ/Wo0KXKuxr2Pwu8O6g8ki6zfwxKwwoCyZ9QGI+nrXY6Fo3hfwVEx0i3ka7lXa1zMd0hX69FHsAPevK/C/xVisp4NGvh5scql4m3YZB/d9++PoRXYxa7Fqg+2QSb0fp/s+x9DX1WDzKlj48tLSaWsXuv8AP1XzsebTq04rmgtT0zwVrEZ8R26kk71kUkjP8JOf0r1WznSeeNY2z8wzXjHwuspb/WJr8giK1iK7u25+MfkDXsen3Gn2Obi9u4baOMcGWQLkn69e9e9l1KcFepZRve7Pfy+blTu+50VFYDeOfDO7bHqIkI6lI2I/PFOTxr4dY4N6y8d4n/wr0JcTZLCXJLF00/8AHH/M9TmT6m7RTY5EmjWWM5V1DKcY4NOr24yUldbDCiiuR1rW/GVxr1xo3hCy0YjTreGe5fUp5VMjSl9qIIwSoxGcu2eSAFODWdatGik3d37asipUVNXZ11FY/hbxHF4m0w3n2SSzuoJXtby0lIL21whw8ZI4bHBDDhlKkda2KqnUjVipw2Y4yU0pR2YUUUVZQUUUUAFFFFABRRRQAUUVFc3VtZxGe7uIoIl6vI4VR+JpNqKu9g2JaK5+Xx34XSQxR6okzD/nkpcfmOD+dS2vjDQrudLeO4kDyMEQGJuSelePLiPKI1fYPFU+ba3PHftuSpRezNuiise/8V6Np1y9pczuJYyAyiJjjP8A9Y1243MMJltNVcZUjCLdryaSv216lN2NiiufXx34Y3hJdR8onoZI2Ufnjitmzv7LUIvPsLyG4j6b4pA4/MVGDzTBZir4StGf+GSf5CUk3ZMnooorvGFFFFABRRRQAUUUUAFFFFABRWd4g1yy8N6Pda3qHmGG2UHZEu55GJCoiDuzMVUDuSK52w8QeO7TVdMXxTo+j21nrEzW8cNrdvJcWknltIocsoSXiNgxTGDjG4ZNc9TEwpTUHe7tstruyv2u/wBezMp1owkov+r6anZ0UUV0GoUUVhy+M/D0bbTeMSCQQIn4/SuHG5ngstSeMqxp325pJXtva713E3Y3K8Y+M/iiLwXeGZDHcXuoDdBA7EbFAALtj+HPTHJPHGCa9I/4Tnw0DiTUCme7ROB/Kvmv466la6r8Qb2e1vormJIbeNNjhsL5YbHtyWrzqua4HMqVsHWhNp/Zkn+TPOzOt7KjeO9zhvG3xp8c3WrRu2tiMLCoVIraMKBk8cgk/ia6j4bfG065dx6B4lVEu5Plt7mNdqynsjL2b0I4PtXj3ji2aI298q5TmJj6dx/WuUi1OSxnivIpCjwOsitnGGBBH614kozjNyl8z5X63VhU5nK59urq1sf+WuPqKwLa91+y1e/1T/hKItTtbsSRR2SytiDDDbnjapA4+XOc815T4m+LMTSjSNOBikmi8x5S3zKO4A7E8/gPeovAviN7m2umZyMTjbz0BUf4V8pm/E+Iw9J/2Ta+zlb8k9/V3X5noQxcZVFFnvNxaK2h2uvggyuTDMF6JzwB+I/UVyur6VoOsfNq+jWF4R/FcW6OR+JGayvD/wAQtWuNGv8ASPLt/KaUqd4LMhwMHP1APSvPPEXxD1l47jS2eGKZCVZGTG4jtkHkHrU4TirDYujGUoylW5VzKySckrb30va+2lx4qtT5U+jG+J9Q+FvhfUZJtP0G3W5hXKtY2qAZxxljjP1Fe1eFPjp8KviPp+m+E/B3hyey1OO3xdxz2iofLVNpXcuRKGJ6k8DrycV8nTaZ4j8TWcev6jKui6NcXL2B1a5t2e0FysZcQ7lH3yAAFOOo5rd+HOq6J8MWfUr+1N1fBTI96g+ZAoyEVCfu5GTzk/kK+gyLPoTjbELllLy/XX79jy6WKq0Kl4pKD306eR2PxP8AFWk3Gua9HpYtokeJ7aV4hzO4Xaztjk+g7AKMV8y+J9burzxBqksVvLcf6XON8n7tSA5GTu57eleuSa1Ff6S02msJ1uDGUMQzvzIuen45/GuA1jwjD4w+Kq/D7SPENlpjeKLyWOPUJjmK2DK7vgAjc/DADI5I5rizGMMG6uOxbstZN72S1e2rsl0OFe0zKtGjSV5SdkvNs+VPHfjvV/FWvzQ6jefaImceU+SSMAKF3HkgBQBn2pbTTEvofJsr1I5WOHR1OUXucjrmtL4v/CW8+FnxR1v4bpr1jrraC6gahZsPKkBjVwCMnaw3AMuTgg81maPaS2lxFd7z56kMEAJOfcDkivdpV8PPCwqYZ+60mtN01daPVfNHqYqh9Uk6L0lHRrfVHu3wj8HzakgXUL+KDyGDOWjZ2kB6McY54xj6V9TeCtA8Fwypa2lzL4j1BR88COIYoj/00J+4PYkseymvmb4fSXF+8E6u9rbzIVdEf96x7hmH3eR259xXvngTw7dai8UGmW4t7eE8yKNqx/THVv1r88zmhUzG8YfFe1l/X6nFhJKNS/Ld/wBfI+lPCHhvWtbdFvPELWNtZ4ZLfT4tsIP8MbMcSSD1wydOAK6vxBZ/E3R4tMtPh5Y+Hrfzbr/Tp7axKExAEgOjFicnjIYkZyenON8OddbTEh0rUW32w4Sdsbw/q57j37V6xEAQGU5B5BH86+w4SyuOTYFQv77d5Naa/wCXS/XV9T9AyXFU8LXhi1BTcb+7NXWqa1Xle66XS9DYh81oYzcKolKjeF5AbHOPbNcH8R7nxD4Mik8X+CdHGpX960VrdWLkLDJjhJ2bI2MoG3dnBBAPRcdvbXO/Ech+bsfWrNfoHuYuneLt59U/6/qx24arSpYiFarTU4xd+V3Sflprb5nnXi74c6T8avB+jjxhZ3Onz+Wl0YUPzROyjcpB/wD1ipbP4IeBLO0gtFtLhhBGsYYzcnAxnp7V6BRV/VqTlzyim+56ceIcypUlhsPWlCkm3GKbsru7t1CiiitzxSA2kTEkliT71578XfFFz4Y0ORdGXfdkZO5W2nv5e5fuFuxP0716LPMlvC88h+VBk15V8Q9Pl13Q7+KTV7rTkuVYTSW0PmylW42KOvtx+leBmeJw2Eq0qMkrzeu/w9drvX/P1IntY+CdQ/bKvvCfxEOkXugzjTri7WKTTUVmaORnwyKHAZDkkjBIzwRX1zNpOkapaC7sZkvrO4XIKMHVlI6ED+Rr5Qn/AGDvEHiT4g2mvrdajpelR38VwtzK8cckMaOGLCMks7kDA4ABPoK+xj8PvB8KLbW3hewReihIRvP1YfMT755r3uOP9XZPCLJOVy5X7Sze+lr767369+jfk4+jea5ErfifNfxx+Deh3kdvLpQbTGuGIlCZZcLzwp6dR0I6V4JH8A77V79oLPV4TGv3pZLdvkX14OMntX238SfgzF9ls7qNL3TYZC6bEvJgx6ZwpYgccc156/gR7NBZaXquqRjcAIy6Skt77kJJr8LzDN45ZmdTDx0ldaW7pPQ+dr4CandxsfIevfs/3kyxWEGqB5HlFv8AJHtVCTgbiT93rniodN0VfA9xPo8qeTcK22XL5JOOCD3GOmOK+4tC+FWoWlrPLqerwyy3UTR+TPYI3lqepyjLh/ccj868F+MPwc8UafcB71bS9tUBMGpQQyK8a9dsigtt/HjuDX1eW4DGVKMZ4p3T1ttb1RwYqhVp09b2PF7rxtq3iTULf4fLqEaxyXEEccs0m1d7SIAsjH+Bcg+wz6CvUv2gNF134GT6P4EtNYtLyeWw82e8tX5x5jDCgE4zkgNnkDivnC48K+KdC1s3uq6T5sCTtvkR22yKc9Dt4BGa3YfC3xd1rQNJ8X3nhrGh69e3emafOdTtzNPLaxmSWIpJKHysYyobAbgLkkA9GZ5bjK9alOhP93FPmjZPm25XfdW7Lfr5a4anRdCdOFPmm7NS5tl193rfT0/PvfBfxc8XaB4a1jwRpmrW8Oka/Lbz6nbtAjmVoW3RYYjcpz6EZ75rt/CPjebR7wahqdokx6xiOT5kB74ORn+VeEeFtS0++by9CjcycNtEf7w578c/j0r1Dw74V1zUh9qvVazhXIDTDDk98L1/E8V8zi6VSdT2L66a723+Su395y884teX4H0dpXivTPGfh28urKdX/s0x3EsLfJKAG5+U9QM5JGRXE+IvG9nqelXMJO0xsHBBzwG7jqOK4K51JNCTyILs2rRKyq8bjPIwT+Of1rF1X4z+I/FPhbQfAGoXGnPb+GEuDYyQ2arLMkzAsZHU5bB4xgdc88Gk+HoYJQqUHrq3pe7uvuVn+HmavGOtFqWjS+//ACJNa8VSW9yz282JIJF2EHpjkfrXs3gjxtH59neTTBbG+RDLk8LuH3vwJ/LNeCX3jHT9b0PQPh3qnhfS9KTQjqV2+sadGf7Q1GWdN0KzhztZVdUU4bhMlQCMNFf+OrLSPBulaBP59vdSQk3MzYMSpuYKispOM45LYOBjHNelTylU60MRSfvJ3+/Vr06eZkqvsvhdz7ii+Mi+HtLOg+EYommdy89+43DceMRqeDgY+Y9ew71BpviGeVW1LV76Wae4bcXkYs7enWvGfhxbaz4rsYrvQ7c6rHbWkVxdeQwYopXuQcc4PB9DVq5+KXhPTla61XXYIGUEiAnMuB2VByfw4960z1rMKksN7RNxteKaur7XS2utr7o7qeLxChCrVTUXfl0aTtvbo7dfxPfLHxW5IEEQ9i5yfyFb2n6rLqF5BatfQxGVwpyyrgdzz7Zr4yv/ANou0u5mhtoNRjtc4CxBULD3JOTXonwx+Jvhjd9r1WC+tZZhtjaWIOFU9ztJIz9On1r4ePCEsRi4e1VoXvL06/fsejSzhL3W/wBD7V1fxTeWEFnBoxjvry/uFtLSJrnZEDsZy7soYhVSNicAk4AA54d4Y8VaxqdzqGka7Yrp+q6Y0ZmihuDPDLDICYpo3KqdrbXBDAFWUg54NeL2WteGruxXV31Owa0smW5+0NMqrAy5w5ORtIyRz61Z0bx7c6c2t+MH1COB7q0ji0yyvZNkksEAcq7I3zL5kkrEA4IXbnGa/TsVn31WanNtR8mtrfLr5+Vj38t+s5nioYfDJylJ7LXTv9/W9j6EjvJ+8mfqBUD21o+px621rH9uiga3WcZVjExDFGwcMMjIBzg5Ixk1498Nf2hNJ8V6c0usxw6fOlwYB5syqGHQHPA+9lenYeua3tf8ejxRLceGPCS3MlrGGTWdWgdUhto+jQRXDERiVuQz5PljOAz4A2w2e0MbpRm2101vf/P8tz3M8yzF8PV3hswpuM07Jd2v5X19Vt1MvRvjp4K0Dx9r2kanfqlvq17Pepch90cKwRw2xDDGRuaLcCMjDDoeK9cv/FPh7TRELnVoTLOgkigiDSTSKRkFY0Bc/gK+fNU+B/w/1vxZb+Lo9VM72Ekbpp2j6dLfQQ26/ehWRF2nPPOAck9zmvRZPi98PPCEEkT+HtZ0VipYLc6JNbeaQpI+ZlG88Y7nmunKsdjKCnHHzhGN9HdPdtvZ7bb2ep28QVOHsNhsN/Y9VuTi3U5tlK97LRX3d7WWmiG+Mv2hPDng3UrTSrvw9rDzXRBPmLHD5MZOA7qz71HfBXJAJxXXXniHX7WFbyXSlW0K7jPbI14ACMhtsZDkY7qp+lfE19eDxvrd/qv9sJd6hcytcXMZJWVCxzzG2GUAcDjGAK+sr3xBf+DvgNb6lLNJFfW3h5QkpA3Ry+QFjPPfcV616mDx0Mfzezq3tr0/y/X5nwWAzSvip1ZVdIRV1/wSh4s+N9n4ZuhZQeINF1O6kiEiWtpbSMYwRkGSTzcKD6Yzz0rBtf2g/Hse2W4+GllqtseWl0zVWEqD18l4tzcf3STX5Zx6t4t07xDPc6hBcLem6keW6guSZBKWJdmyQeWyT9elfdv7MFzrvihYbfxLqMEbRxCaIxuHN7H3xj5VYdz+OODXz2dYnN4uCy2dpPSzs1f/ALeucGFzjEYrEcnNyp7Ws/zufS/h742eG9Y0uPWL/TdU0uyclftksAmtQwOGDTQlhHg9fNCEdwK7uxv7HU7WK+068guraZd0c0MgdHHqGGQR9K4zVNAaGT/hLfAcSWus20YFzZZ2xapCo/1Uvq+PuS/eU8HKllqOx8KaNrFlD44+G18/h281ONbomKL/AEa5JGdtza5CM2chmXbIDn5uK+iwlbHUoqnibTmld20v3cej10s+W3d6H01OpXi+WVpfg2u66fLS3dnf1FdXVtZW8t5eTxwQQoZJJJGCqijkkk9BXJ6V8QY7a/Tw546to9B1lh+6LyZs74Dq1vMQAfeNtsgz0Iwxs+IfE/g2e2bSrvU472WVkZbSxJuJ2ZXDLhI8t95epwODk9a7fr1CUG4zV+zdmn2a3Rv7eDg5Rf36a9mYHxA+Nnhjwh4bt9X0u7t9VudQZ47KKKXKkocOzkcqFPBHXPHHJHgd58Q/EHi68F7rupPOQcpH92OMeiqOB9evqa8M+LPxzj1v4h6/qUOnrJNdX77YhIojtokCxohZch3ITc5HG5iATjNc1Z/Fy+E6wXslpEvHyBWz/PNfKcQYj6xQ5KjduyTs/O36dD4XF51VxWIcU/cW1uvn8/wPrfR9dt12hrlM/wC9mvT/AIfrBq2qR3fmKY7QeYx7bv4R+fP4V8qfDrxHfeMZ47Hw/ZxXF1JNFbIXmMcAkc4G9yPlAAJOATgcAmvq/wCGr3NibvwbqGkpZ6npyx3DtDP50V5DJuCzoxVSPmRkKsAVKjqCDX59k/DUMZmdLGSX7uErrR+9Japferv0sfQZXi3Vsnt+p6b58HTzk/76FeefEaKGzu01UOvlzqEcjs49fqP5Gu5GmqQJGx5oHB7VxXxGvXttPt9Bj0gajqGtz/ZbO3acQrlVLvM0mDtWNVLEgEngAHNfofFeWzzzLJYWvFR1Ti9XaS2++9uu+mp7defJByZ5NrGu2zFgLlM/XFcwnjXWfDd7/aOh6nJazD+JDkMPRgeGHsRXL/E3UdV8BzXNp4ktIEkgmEfm285lgYModDu2hgSp+6yggg9Rg14tqPxcuUuDDYzWjBjjYytz9MkV+e5Jl6y2uqdROM4+T0+f+R8Vj8fNSdtGj9Afhb8ctF8Zaddw+ILi203UtLh8+5Z5AkUkI4Mqk/dwcZHbIxnPHpWm6lYavZRajpl3Hc20wJSSNsqcHB/EEEEdiK/Ljw38am0nX7C/nsooLmyvILqJmctBK0civ5cgIyqttK55xkHtmv0g8M+NfBk0HmR3f9lXGoN9te21D9xIWkUMSu75XGBnKFl4zmv2LC43mspyVrbvRt/l8vmexkebTxsHCs1eP49jsKjmnhtonnuJUijjUs7uwVVA6kk8AVy+t/EPTLS9XQfDkJ1/XJRlLGzkBWJf+ek8vKwp7t8x/hVjxVF/A8eoxtr3xT1OHVzbA3P2HBTS7MKCciE/60qM/vJdx7gJ0roljFO6w9pW3d/dXq9dfJXfey1PclXu3Gmrtb9l6v8ARfOwmsfGLwtYWFzqWlwX2tWtoCZ7uxiAtIwOMm5lKQnk4wrsfauBn/aG8a3qmbR/hlBaWTLujvNU1Ro/MBHDLCkW8j3OAexruNF02PxMbbxx4sgBtdok0LSXT93aQkfJM6dGnZcHJ/1YIVcHczeG/tKPqnh6zabwxdQvcXas6Ws0m37Og6yMx4YdcAkdD1Ar5HO8TnseSvg6kVSe+i5vJ2d9+17rfq1HysXiK9Oi6znZdklr997em/psen+FvjpHr+oW+kajrOi6PfSHHl3NvKYpj/dSXzQAf94DPau60/xHrup4m0zTVvbYji5aJraJ/QoZG3OPcLg9iRX4yeKda8SaxqszSRTX0jPhri4uPlbnouDnH0wPav1o/Z18Ta14m+B2htqtzLcazaaWLW5lY5driMFSCe5GF5PJ6nmvocBKtUilUm721ff9F933HHlGaVMbN0qj1tdW3f8AXoT6T+0J4f1Pxbd+Dl8P6k13bSPEstu8Msc7J97y/nDN0OBtycHANd5a+MvDNyHWTVorSaNDJJBeq1tMigZJKSBWwPXGK+Erm2Tw7cQXt/qy2NwJA8BZ8SmQHIKKPmZsjsCa+no/i/4K+IPg1dFvdN1fUr6/0/y7iK00iecpKyFGICruT5s9QODXNHOabUlCqnJLRO2r7XVv1N8kzZ4qtyY+Sgrrp9lvW22qX3mz4h+JHhbxVpWrwaFei6n8L6nZ3dzDjBmjt7iOaUxg/fwiMePQV2jw6fe6hba8IYZ7iCFktZ9xYLHJgkoM7RuAX5gMkYGcV84fCH4TSeAtd/4SrX9Uiga5DXUUWrWF3EsVwQUwXdVAXZwcscH+FsCt7xn8U9Q+EOgfY7WG0Gl31wLTw/cGVbmGOdicWSOjYdfvGMsFZQNhXAVj5FPNMSsO8XjVZ9Ul2d07a23tq+ifVtfeZ5gMpjnVPBZJiFVp1FBc0rJKe2r7Xe9lZ2tfc9vu/EdnaXsGnXGoRRXNyQIoyQCxOcfng49cVl+KvFN9oVrbLYWkl/qOo3K2dhaiYRLJKVZiXfB2IqIzM2CQBwCSK+F9d+MGs6r8V9I1W/aWO8h8qHddElYWDDYxAzlV+Ykgd+nSvd7Xxx488UaBZeI9S0mWG70K9M8dtbgqby3aNo5PKyfnYxyFgejFQB97jzaXFFWrdTjJX+HVN2631evXZrY+i428PcbwnllLHzqJppc2qTTbt7q+1p/nax7Po/irV57q90rX44LG/sBDI/kXRkglilDFHRnVWHKOCrDIK55BFef+INTax1i6ii1CGRGcyJh1bKtyOn1/SsCTXfDdxZy+I7bU7Rre7K+bdNJjcyDaFbdyGUcFTgjnIzXj3xM+JPhR4D/Zwur26t84aCIKrL3ALEZ9RxXBxPg3xHgIwv78HzLW7ae66dLfcfj1bM/Yx95/ieu3/iqVSRNCpHqpwa8X+OojfRJvHGkpczXelxr50FuhM0ibgAVA7ruOT6fSvMrb9oeDT5hF9n1JoAcNHLtcfh82R+Fd/wCGPiDo/jm7trTwjfG61ScFo7FQRc5Ay3yHkgevSvm8tyd5VavV92MdW27JJb3fT1PLq414391BNt7Jau/S3c4SDx9f3WnjSvEdhcAXCKySvCyyxnAI3rj5vQ9/rVGGymudWS7vMx6dZESYJ5lcc9P7o9T6V3HirUWsdRuLW+misJ4CRNBNKolibGSGBOF9e9eF+HfiHYXNrq2itLNdTTwXEltLDgqku0llZmIXaRk8HORx1r7vEKeNwKUJXUuqd7ryfU8eVWcKjhNWa0d+nqalt40lv9Smv5Zfmnn3DJ6KxwB+VemeGPGVppOmPhg7yzMclsDgAde/evGfD/i3TvB1pfaLaeF9L16fxToA0+4k1iMltKuzMWM1p5Z5KqseGYqSQeijDa3hP4x+JPhvbavp+jyab5niPTJNInF5ZrJ5duxy7ruPykevOcjjOCPDxOUKEPZU3a++l7fp/kXTmoyTct/nY+kP+En03w74YbxNeXKQw6lcHylPMjlVAyqDkgnIz0yK8h8aePj4gnE+l2YikXjfNIFMi/QcAjtzXP6TrQ1Szt4Li/a9YwJEfMYDj0x269qyPGWjz+HbH+11u0lgzt2qR5p9AF/i+o/HFctbIYYCarYdatK/r1+Q54ydaPJ0RR8SfEjxNPox8LTa5MNJN2b1bDzWEAudu0uUzjft4z6V6H8PPBXiHXvgjrPxQ1LxnZxafprz2MNi5Xzs8RgEuecs42qBnHfHT5d8T+ItQ1WRoLuM28RONjDDEe7Hn8q3vB3w5+LNzper6h4e0sX+jaZpdrruoQf2lbgxWs8hjgm8oybi7HOFA34IJABGe95RjcRSh9Wqckk03opXit467X7nXhI00pyrw5/daSu1Z9JXW9uz0Nqz+I+t+H5l0a0vIhFqJ2OWVlMJzjcvJwT0JH8xU2q2t14nWLSWFvJLI6+WsYdn3542nI5rnfFXgDxJNrMEmmabcPDcW0Txl0ZSrHO4EkY4cNzmvob4QfCDVdRvIXsLZmkZFFxqU6ERx8fMsf8Ae+gyT3wK+qr4KVWEeskjyowV4+z3Z4/pH7PN/ZXd3BfawY5FILMqho3LDIAYEE4B598108v7PN7oUkOdSt/JkAxIkDZJxypOeSPevpD4+av4K+C3w4sdUu41N6kos7RZVP8ApUjAszSkAkKNpOfUhRjOR5F8Ifjda+P7mXTtT0yWW4uesTSRw29tEP4mGSQT1yTngAcmvCzHK89y/CzzGpByw70UrJK63SfdefyPehldfEQc97eZ23wR+DGiwahM+rXD6jFGgmjQ5jXJ+XkLye3evpTSPDFgkaQ2tuLeCMYVI+FHsBWN8Lvh1di7uLixzPDHBkR5/ebWYEfUcfWvSYbJoG8l4jGycFGXBH4Vz8PVKeKwP1lr4pP520/Q68LgnSiuZFS10WBQAGfHpxXdeELoRFdLu5XZG/1LMeVP936elYNvB7Vp2kTRurqcMpBBHYiu542OGqqoltuu6Paw1Pkd0d39jh/2vzqYcDFQ2V0t5bJOowSMMPQ9xU9foOH9jKCqUdpJM9MKKKK3AKKKKAM3W1nlgS2t4ncu2W2jsPX8cVmR6DfyfeCR/Vuf0rpaK8PGZDh8fiHiK8m9kktFZfiJq5gxeErUnddzvJ7J8o/PrWnaaVp1iD9ktEjJGCwHzfn1q3RXfhsvw2EVqUEvxf3sSjFa2OH8d6Amtqll5xVYSJAQMkE5z9eK5aHwho1mCVgZ5sY85z84+npXoN4PMuZW65Y1l3hjkBiVVb1OK+ZxmUZesW8wcF7TZN67bW7eu5x1aam22eZ61ptxCWWwcS+pPBH07GsK0065h867uYJFGCu5lOMd+fSvT5dEtriQIsRBY4ABOKi8R6LZ22mrp9ukrGYbDhv4R16eprWGIdGnKvU2X9I86pg3JuSPg39riGefwqsnhzw7BbWj36C7uLazCyOoU7d7KMhSx+nAzzXyNPpMl9JBbi1MxZgAoTcQcj/Cv1k8Y/DN/EnhfUtDESW32qAiIsOfMHzIf++gK+dPDXw7Sz88apYmOVt0RidcOhzhifQ5H4VP9oQqQ5pHzONo1cNVTS3PGv2a4/Bvww+J9h42+LngWbV/DdvbXC/Z4rRZXSdlAjlaFioYD5hhj/FnBxXoMvxK0/xpf69Y+GdPj0bSptRa8sdOeNCUtUkYwANgkFVbDKrYPfIxXWSeB5LGXbPAJYjwkmOo9D6GnWvwf8MXmoQ6mtrcWdxG4cvaS7Nw7gggryOOlfH5lm1Ck1FuyT36+l97eREfb1Kfs7L9fvPPPif4h8S/EXxVc+LfE72b31zHFG/2K2EMe2NQqgIPYdef5CvDPEUel6ALtZ4dQXVYbmFtPkjKLD5J3eb5mfmzjYF28fe3dq/TOy/Yp8A6zBbarb+M9cNndQrMq7Id/wAy5+9tx36YrkPjR+xv8L7LTbOHRILyTVbeNpo76/m87+IDayKAu3qeFyOvPSvtqeCqzpqtUs09b33v/mbTynHU+avVSa9dXc+JdT+EfxRinstU1Pw9f6X9nEEs1xd2E8K/Z5SSjksu3ldxAzyAcdKvfHj9qnwp8Svhb4M+DOg+A7TSn8HyCGXWoXVm1GNYzECirGCiyEiV8scsB1619R6r44+P83ws174N+LNNttWsLmIyDWbu5aWf7OhRxBFggMf3QCsQCuSTk4NfMHiX4WrrviCTxPHNp8l3Oyu/mWUcIyFABCxKEzgAk7ASck5JJPVFQpR5ab33OeVWnhLqN7SWqaS63t1201Rp/s8/Erwv4DfxNYJ8VbzwZa6nobxwSQab9pa4vo/9RBIrKRsbc+GJBUnG4Agjy/ULbWdT1mbT9StTLPfMDBMikwzZ+7tY8A8YxnscZr2/xToviv41eMtQ8XeNZNAfUJ44bG5mtLTy49sUQRdoAxuCgZ54PpjA9J8AfCnwx4m+FzHWdYU6okMDWVpLCStwz8O8e3/V4ADEjnkEYIr5LG4fDUMVKpShFSl8U9E2o7X726LzstRe2q4mEaEJOUYc3Ld99Xpeyv5b+bPnbRPhdr2mxxz3ks6zA7kjVBPEnpkHk/TIrsNM0nx+ZP3E1rJGBk+XatFJjvy4dan8Z65f+B9eHhafxDbXNuI4mg1e2JdJmdQTAzlR+9jOVYgYYgkHrRbeLJTZywyeKpGjnQxMGn8zIPUbec/gM124x0lQSpPp3OSMJ837zc7fwRoni99WgvbfwxPqF3bMJIp7rVFKxsO6x+WEHPfbXpXxA0vXpvD58Q+KLCO31m9U6egtpTcQRq4AD7iq7JS2ccEDBI54DPgHcWupW+p3sdotjI06bbJI/LWNNir5gX+HeVJ29sDPJr3WDT7W6jj+02cU7I26MSRh9reoz3r8nzfNZ4LEcttE9v60/DVH6n4eZzPhfMYZlG8o2alFNLmXbbukz4+8OWEvgmK9n8Xa5e2qaXnUIgsbuiyfw/KARksAOfr0rt/2dv2ktC1r4taN4R8SwX2rWt/9oLX+oH9zY3GwsjxwrlVThlLN037sqAc+leMfBniTx5q2reHrvw1dXlpqOy2XyICsDwr/AKvLLwpQkk55Bye9dV4L/ZN8GfBzVrrWvBHhq81vUdT0mfT1uL+9hdLOWbCu2CEIj2E8qGfbuX+IV+lZBlVPE0IZppUvaUXZ6aLTl8mtdXax+w8QeInDnGOX16uZ4WosXBSVJfYvJW5vda2a5mpJ+W7Po5VUABQAB0HpVTV9MtdY0u60q9gimgu4XheOVA6MGBHIPB61LZW5tLSC1aUyGGNYy56tgAZ/HFT1+lygqkHCS0a1PyC11Znynqv7PNte3JbR9Kmmg01/Mn0+OTy5YgD8xspjzBN12pnym6FR1rV+JfiTWH+EN94V1m+Gp299Bb3Gg60sQj+2wJKnmQToOI7iMfeAxuAJwCrCvff7XceLG0CCK3SNLD7dO5OJHZpNibR6DY+4nplB3rz9/B1l8SvAHiPTLR1Wzu9eur7SJgAU3JICXQ5+48om5HBEhIyDXxGTZBLI4uFKs6k25XvpdLpb0dr/AM1rWV0/CxWBiozhhdHJSVu+n/B+Ttbrf8+PF/w8bWnbUrC22aimPMXoJwP/AGbHQ9+ldn+zrrGreFfE8GlSGSMGTzIEkyDFOOSuD0DjII9cetenL4RzI1vcwNHNExRsjlWBwQfxq3b+CIUvba9ubXMlvIrpPHw4wQev4dDXzPEGcqcWqUuWS29T5XBYKpTqRn2PfrP4h6Jp2q6ld614ksdNtLK2tZoLaZ1WR0dN7SgH5pCWJiCJnmMjG411vwzS5j8H2zXlk1lPczXN8bVxhoFnnkmVGHYhZACOxyO1ZmieHbaxCeYILuOJvOtJJYFMsBbrtJBxng5GK6W1doXDr+I9RX2+V4jEqMK2NVpWaa3s21fVNprRWt0310X3dCnKM+aT7/i7/ofBn7Wn7Q+s6d8WL/w3faVdXFv4cmaOzszcGG3ZiqlZZAg3SZ4OMjgjpXtX7OXxO8a+PvhJarqNu1tfXlrLarbJGsEjKQ22e0Y4Xdsy4hcgHaSjgAqvsPjb4EfB74l6tF4i8aeBNN1TUI1VBcyB0d1X7ocoy7wOmGzxx0p2qeG9Fs/F2j6La2Edvp2oaRLY+RbDyVg+yNG9s0W3GwxiSUKRjGRjpW1TLXRxEsdTa5pNJtbtPRJ/h322drH3PFWbZBj8ow1DKsI6WJXJ7WfSVouFo6vSTak7paq7UnqfIep/saahrN/c6l4fhTUR52Z1tLwW0sTHqskE4VomPUj8RkGqNr+xy3h3WBL4u09oIpWMkbS3fnGQZ6YT5cjoQT26V9nazoGl6nPb6X4rnubfUnHlWOt2Mz2c8uOieZGRtkGSfLOVbkqOqri6n8JPFc9pJYw/ErU9RtmGFj1OSUuMdMyQumT77QanE4P6xpKm5W3tJL5Nbr5N97n5M8hpU7ypRbfqrL1T1/F9zymw8N+C/COjRC7jtLLTbN0lRrhhHGJFOVbtls9Mc9gK6/wZ47utK1Vtc1OwnY6wkGlaDp02Y7p4I2Z2mZTyiEuzncMoiLnBO2q7/s1eJPti6rZ+LdJsLpT/AKxNOlvLlBn/AJZ3F5LKYz7hOK6Pwx8JG8Izy3yWV1f6jcKFuNTu7n7TdTKOcFz91f8AZUKvtXBiY42i4zoUuRR2tZ/l+TStvqdGFwuKpzT5eVL+v6Tt312PXUmjkiE6OpRhuDZ4I9a8X+IXja81PVQmgWT/ANq+GLmSWayVx599p8qNGzwZwDlSCP8AbjKEgkE9as/iJIjZx6Te/ZW+8vlHJ9/b6VieJvhivjSGEX+kzrLbsZLW7jmNtc2zEfejkUhlPqOh7g1lVzvEZslQw1OUWt7p6vydtk9b/foetjFUq0+Wnueayaf4O8X2N3PYLBeQ3bYvFUfNvAC7ZUb5kcAAYYAjFeP63+yLa+KdW2eDrDzZHO8qtz5BiH945+T+WfSvoCT9mvxLc3Y1G/8AGljqEsYxE97pzLeYH8LXlrJC7fUg11WjfCHxdY2i2i/EK60uLJLjT5LiRvweeVu3dga7PqVTEKLr4d8y6ppP87fJtngvLateX72np5Wv+en3nyyv7FmqWM41DX7RNOtElUCTUdTRlc9lCQhmct2UAk9K9y8f+LfFnw0+DMum6ctxPdaTpLJa27w/6XdHa2wyqM+RFgNtjGZWWM5MYVyOz1nUvAfwignurrV7zVtbtYDNJeardyXtxDHwCeThCQwwiBdw5OBk1f0CTQPEXi/SJtMuY722h0yfV55C6u8t5PshBk2kgMsXmrt6AOAOBWsqkJt4OnNKeicU7uzdtdvmvvbuexl+QzyuMMf7KTpuSi272dmm43SS23tt3Phb4B/tNeIo/iXoxtNInivNXng0+9treUm2vCzqNwhI/dN/unGTwAOK/Rbx1YXGreDNb0m0wbm90+4t4VJwHkaMhVJ7Anj8a5fw5+zz8E/B/ib/AITLw58OtIsNWR2lS4jRiIWPVo0JKRnk42qMdsV2N5IZ3z/COAK6qGDp5XhZYaKSUr2S892fonGmZ5Bm0qUchwroQUXzXtdyk76JOWi6a9bWSSR53cfEfSdX/sK70vWbZJ7q9S0u9Jbb9piUo3mo0Z+eJoCu4kgLhTnO5a+Tf2ofEuoa/rMuk27MEuAJJ1Xr5fSOL6YGSO+RX2prWgxaiHFulvbTXOI57lYFMzxj+DcOSOnU4r5w8S+CrWbxNqN9a2xlka4cCeXkhQcDB6DgDpXwvEuNxtDEUo1WlS3v3lbort6L0V35XPyvNaFWpR5G7ts+XPCvw3eynTWNXtSZw263gYfc9GYevoO3XrX2L8BfEWv6Z8O7nwt4ae2g1Oe/nvbrUbtQbfSLFY491w443sSGCJnkhiflU1wk3hSO2y2zc/diP5V7lo3w9TwJ8GNU+1wySTalJbalqiKmXW1V4vNix3AhWTI/2mr6DLcweMoS9g/hTbfW1r79G9r7rVrVHjZXgq1HESqLRKLv/Xn/AME88t/gTaz3T+JruK/XTdXPmRNct/p+oA877qRcGNG6pbx7QFI3ZOVH0t4N8O2PhXw1p+hafZQWkVrCF8qGMIqseTwOOpqO71+Ndc0WxjNpc2OsRTPDIjbm3xqsiOuCQ0ZXd83Y7OfmrersyPh2nleOr4uFVyUkkk18OzfrfRrstNT7HCYWjh7+zWvV/iJgV8O/tefHfwh4R+KNn4PstFljktLVLu61SyjQMLsSsFQI42SBArBm6gsVz8rCvuI18++Pv2YPC3xjutIsPH3h+7s20CO8gXWNPuoY2uonmEkQAO9jyzswdQFZnwTuzXp51goZhRWGqQ5ovy63VtenV37K3U+q4axGUYbNKcs8pynQad+W94y05ZaNPT1+/Z+PfCz4WaD8cPDmveMvDHiKUvaXRjt7i8tPLfIRWHC5Awdw46dec11fi3SPGvhGyittKutF1VobdQsFxNcJNCFXoZcMr9yBtXAwO2T7x4X8EeD/AIGeA08L+B9MaC1WRmBkYyvLM/3pJXPU4A9BwAABXAajoVreSSXMssxaRi7Dd1J9+tfk/FeKy/hdwwWFi3XaTk7tqK8vN222S1ttbu4/4rrcUVp4ajOX1aMr01JJSSStrbTXe2yPj+8v/Fvj6a410+ErqG+Vgk97bamsZbjjcAm18AfxKTXKaxovxDhk2ytBEn/TxAZnx9Y1QV9Y+N9DjfSFt7LTVlht7qG5ls4kUC5jR8umOjE9cH7xUA9a8e8b+KPCnhbRRbaXdQC5d5BFBKTCbcFix3RtgqFzgKR/KlkeNWImpJb+b/M/EcbhXSbUnc+f9Z+Gmv6ysk0U9x9qbk4hFvE59D3H1zXPeE9Y8dfCvxfZ3Xg8PZeILN2/eiMPHErjD+YSCNu3PB5Pb1rs4bzUPHHim28Pab4rW3nvJhHcajdSSC009Dn95KUU4HYAKfU8Cuy0jw94f8MfDm41G+8WifWZ75ra40kRM87QeWX+0tMeJE3jaUI5OOmAK+szShQxNH2dlJNNOL2kut77+nXbucWG9vSkqtN2cdU72aa7HDfF7xF4F8SQ6N4l1D4n3vifxVqyzXPimKazZI7G5DKI4LfA2tlc5bLEALggtgZ/7NP7U3hX9ne68ZaVq3w7t/Flr4ks1sLYTyLGbQAyZHzRvmNxICyjB/dr17dd4f8ACmufDnVvDnxF8NTaLJf6ZPb6jbXFxblo/OYbg0gA+7lzzkYyORWFdfDi91bxxP4716bSf7Tn1F9SkaGxSSN52lMhzE6+WV3E/KysMcEEV6uVRp0aadJcuiVlslaxpDHRp1XXk3zv59NXre7etzH0j4U/EHXtX/tbwlpF5r9reFYNLlsrGafzcxBxwikbtuSFzkgE9K42zQahcXdhdQXn/CRrqItcyAeQtsoYOCp/eLIJAOPugBs84r7a8B+Pvjp4T+FrfD3wBpVtHDr17LqEOtQy+TeWW+QF8jhPm2ZDYwFcrjpjo/g1+yR4E1vUby/8dx3NzrmppLJJfWc5jZH3AsQSCHYknLMpz/PsnhadZpQ3ZrRwntuWFC7k1rdWS8vM+XvBE/inwX4g0vxRol9p0F1o86XUDXNmZY1ZOhZS3zDH09Rg81g+K/HnivxVqt5ea5qFtNZ6hqv9qz2cNjHEsjljvweWRWVmG0NtBIOMjNfbPxO/Y48E+HtCM9h4v1wLcyiHy3SFm28sfmCjsMdK8Xh+BPhPSZPPMN1fSKcqbqQFeP8AZUAfnmvlc7zGOW4hYWo7S3t6/wDAFPAYvC/u6unXc8v/AGnX+F3xW8SaPrPwE+HEvhrSrLSxb38LWMUHnzh8qyorMGKp8pbO5jyc4zXiHhbwxd2fjCK223Nu29mb92EJG0n+7X2Yngh7qXyLK0VFXgvt+VB/ntXsPwf+CCakbnxLFZb10uFreHcvM8j43kH1Vf8A0ICvSyvHRxtS8Vdvsv0KUMTjargkve7L9D5x+B+hXrS3EHiLTb++0m3dZYPPZsK7H5vLOB2AOBxkD1r6Vk8FaZeWcNzawahOiAbCb24ICHsPnwB7V2f/AAiEmNqoJ4xxsYYZfauo8J6NarDJptxFKqrllUsRweo5/Ou+ONpzq+wfXb1PWwmWOC5ZfkfKP7Rv7OOp/Ev4fCy8J25tb+G8hnuI0LTS3MC5yqqzYDKSrDB5AIwa5/8AZb/Zw8QeENUki167tI7qEhjZ38MieeOxVSuFYDnqfYEZr7a/4R+1tZjEyMdp4y3Udq1LWG2QxiW3iPlnMbMgJQ+xPIr6TDcUVaWS1eHMRThKhUbesU3d23utdlro10eit7mEpLDwcElqVvA/huPQrp8TMy3RCklcEADgfn3rubnTbG8jEd1bJKAMAsMkfj1rEiGx1cfwkHNdLXn5PluEwGH+q4eCUV03316+Z3UYpR5TCm8JWRO61leI+jfMP8arv4evYh+78uQezYP610tFLFcP4HFauLi/J2/Db8DRQS2MnQ47m2aW3uIXQHDqSOPQ8/lWtRRXoYHCLA0FQi20tr7lBRRRXWAUUUUAFFFFABRRRQBhSRhywPIJNV2sYf7pH4mr7qAxHuantbQMwlcfKOg9a+chT+sT5Grsz5LkOnaPbRjz5Ycu3QEngUmpaPJdzRmDyo0RcdOc5rWor1K2W4evQ+rzXu6baXsUopKxk2nhywt5BPMvnyLyNw+UH6V5p8XvhWt/O/i7QbXM55voI15f/pqAO/8Ae9evrXsNFZV8nw1XCvCQXKns1un38zGvhaeIhyTR8n2mjqw2PGCDwQRwa1bTwtZMcrBsz/dOK9r8Q/DnTNSme+00JaXLcsoX93IfUgfdPuPyrk73w1qukZFxYvsH/LRBuUj6jp+NfgnFeS5vlUn7Wk50+k0rr5/y/P8AE4aeXqnudv8ADtPJ8KWlpuLC3LxjJyQNxIH5Gqnj/SlvVtbhk3KA8L8djgj+RrQ8DQmPQI3IP72R3Gfrj+lbN7aR3ts9vKOG6H0PY1+y5JTrYrhzDx+26cLfJK33noypqdPkZ8+6h4SknuFtET96sgEZx94E14H8Zvhjc+CvEj39lbFdJ1KVngIHEMnVoj6Y5K/7P0NfbEXhxp7oyyw4e0ORxwx7D+tVfEPhTRvFelz6Prdkk9vcLtYMOR6EHsQeQeoNc2XxxEqEqlVWbel/LT8zwcdkscVTcVo+h8BaF4X1aW0fS49Xjh06aSTcEgP2lY3JZo1k3bRksfm27gD68132reFv7W8HajoVne3mmCSzMcU1i+yWIIMqEPb7oX6EivSdb/Z/8Q+F5prrQlbVtNB3KYx+/jHoyfxfVc/QVU0nT2jbZJGVZTghhyD7ivhOIcTWwbvNNdvl2PGw+XVKMuSrGzPm0+H4tU8OHRpl+0/uFWNpxvPmoPkc++R19z61oeGfCmlX1jBqE009nDcLGNwYOLaVgMRyZ52Nn5JCe+1uRk+qeIPhLrFjeTah4bs2u7SRvM+zx/62AnnG3+JfTHOO3esf4Y+CvFmr6bNBpvhe+uvs093DJG9uVWa0+0SZU7gASp3EDvll/io4ZzSjjsQ6E3dS2Xnq7W/ryKng5xkk46nc/AL4Xyy+MbiCPV2EQsJDMfs/TDpt/i9a+hPEXwY0DxR4V1LwrqOrarBHqdubd7iynEE0YJByjAHB4xzkYJFcZ4E8DeOPhHo66t4Sh07xhZ6hEjzWpnaK5gjHKrbzsD5sYBJ2uA2cYJ4A6a3+O2jI7W2saBeaddoMvBc3tnA6nPQrPNE3p/D3r7hZJkEKyq4uhaotnLma8mt4v8+9j38H7HDUfZV1Zv1tZ9nsbDeEb/StJ8N+A9D1LVYNHsbUwXd/HcD7W6QxKsatKRkM5OWdQD8nUZq18P7vVWj1vRtV1KbUf7F1WSxt7yZVEs0PlRSrvK4DMvmlC2BnZk85rkdX+NFtNE8MGu+GfDqE7Gub7V4L25TsfLtbZn3sPRnAz2bpXSfD55Dbx22h6bfW+iQiSSS+1WFo7zVLmRtzTbGwygksxZ1UsSAqhRmvboV8PUxKWHe3Tyskly9Et7tWvom72OmlVpTrJUn/AMNa1rdut38tztqKKK9s9IxfEfgzwt4tEI8R6HaX/wBnz5ZmTJUHG5cjB2tgZXocDINa1vbwWsEdrawxwwwoI4441CqigYCgDgADjAqSioVKEZOaSu931fqSoRUnJLVnmvj74bJfXr+IdGgzLL811Co5Y/31Hr6j8fWuTtNJSNhGUyxO3b7+le7VQu9C0q9uEu57NDMjBxIPlJIORnHX8a/NeKuAJZxX+s4CqoNv3ovZ92mtn5Ws32Mfq0FLmSJBptt5aqE2lVC5XjoMU3+zyv3JAfqKu0V+iSwlGas0b2Rwfi/V4tE17SrfxHqt1pmgzRSubi3Z0SW7Vk2RSyoN0a7NzAZUOQQTxtOH4n8W6zdGX4i6BojSaVoFrJFaS3oa3+0vMyedcKrDeYo0QBcqN7OcDABPq+M1Hc2tveW0tndwpNBOhjkjcZV1IwQR3BHGK4q2XVZU506VSye2mqaWmt9k9bJLXrvd4WMKWKhVrrnpqSbj3Stpe+3pbX53+df2bfiX4u+KsWq+GfGWli7062815pb0gzENJ+6XAPIxyGI7cEEV7OG8ReFWKPHc67pAxtZfnvrYejA4+0KPUfvMDkSHmtjTvD+h6PPPc6To9nZy3IUStbwLGXCjC5wOcDitCpyzLauDw0aVao3NX1126LXdeT26Hs8TY/B5zmU8bgKCoQdrRXR218nd3/4DKGm67pGrqTp1/DMynDxg4kQ+jIcMp9iAaI9c0ubVG0WC8SW8jj82SOP5vKXOBvI4XOeAcE4OM4NSXuk6XqQxqGnWt0MEfvoVfg9uRTrHTtP0yD7Nptjb2sOc+XBGqLn1wABXpL2t0nb8fy6fezwlz9bf1/Xcs1RvNb0vT7220++u0t5rsN5HmfKshGMqGPG7nO3OSMkDg1eqG6s7W+ga1vbaK4hf70cqB1b6g8GtJqVvc3Lle3ukOo6xpWkw/aNT1C3tk7GWQLn6DqT7CsOW/wDEXicm30WKfRtOJw+oXEW24lX/AKYQsPlz/flAx2RuCNqy0PRtNIOnaTZ2pAwDDAqYH4Cr1Yyp1Kuk3Zdl/n/lZ+Zm4yn8TsvL/M8d+MvwBsviJ4csdA0RobB4pn8+5kkk8145P9YxcHLuxHLNkmovAvw91P4Madpmqy2zan5cU1nrhsA8rtFuUwXKR9XKBArhRuKtkAlefZ6K895HhViXi6fuzdrdk1bW3orPur9z3K+fY+tlEMjc7UIS5krbO9/uv020R57oXiS08QeM3i8Iazd6lpc9pJPqQk8xoLWbcnkiN3HyswMmYgcALnCn73a/YGbhpAPoM1cxilrpp4COsqru2+l0vRK7/Pds8OlTcFaTv/XqyrHp9uhDMC5H97p+VeP67pUQ1G7gKbSkzrjH+0a9qqguhaUt6+omzRriRtxd/mwfUA8CvleMeFK3EVOhTws1Bwk2277Na2tu7pbteo501NWPOPBnwzFxfxa1rVuBbwsHihccysOhI/u9/f6V6rgEYNLRX0GR5LQyLCrDUnd9ZPdv9F2XT8Qp0oUlaKMLQvAvhDwzez6joHh2xsbi4BV5IYtpCk5Kr2RSQCVXAJ5xmt2iivWp0oUY8tNJLy0KhCNNWgrIK5r4h6nqml+GXfRrk2t1d3dnYLd7Ff7KJ7iOJpdrcEqHJGeM4yCOK6WuW8d/aDp8kF/ocusaDdwtb39taRl7uLJ4lRQcuB3C/OCAy5xiscY2qE+V2dnr289NfmttzPEN+ylbsJoOjavous3GkT3+o6to09msqzajKszx3Acq6BsAkMpVsHIBBxgHAm1DwJot5uaASWrN2jOV/I/0rg9G+L9ppUf2FvFmgeJLeBvLSWbUY9N1NQOMTwXGxWYd2BTJ/gFWNb/aO8GaGiJeQbLiQsFhOqae7MR1AWKd3PPHC189iaOSZnRVPGwU0trq7XkpK/4M5KeMw0YWctPvt81dfiX734Nw3hbGvsgP/TsDj/x6vmL9o34e6bpXiG2EeqXN9b21qY7i4VVjVZQ5LW8XXdKcrk5xGvLc4Fe5fCfSvjvqmnam3jvxh9n0TUNQnv7a6ZFGomzkA2QJj5IEAyd+Cwz8oXhhR+P/AIa0PXfhHqFxbxmzt7GxnGh7V+5GUImnIPLeYpxzyVJbqxryK+AyjKMHLGUKLpxit25Xey0Tb3bSu1u1be64MVSjjMO5xg4vfXfTyv8Aj6ep8b6BpEOmaFG8dnFbyXpN5MsYPLPyoJPzHC7Rzz17k1k6rbuyuQ21iDg4zg464r1i++H3ivd9ktdEluAuFRoGV1ZegI5yO3UCn6L8IdSN0l94lhWCGJgy2oYM8jDoGxwB6jqfavz3C5xBzc5zTb8zw54WduVI870jwR4v0rwLbeH9V8T293FJblXZ7MiaKJyT5SNuwQFOAWBI9wBXX/Df4b3vjvxMmnrG6adalZL2YfwR54QH+82MD8T2r2jSfgd4o8XsktzAdL09mBa4uFwzL/sJ1PsTge9e4+EPAegeB9Jj0nRLUKqEs8jcvI56ux7k/wD1hgV+i5N7aceepGyffT7l2HhsiniKqnUVoL8TzeLwd9hv5reO3CFn2RRgYEcf8I/LH5V6b8P9FWyvXmRPkgg8sHHdiP8AA1oXXh8rMmorCWkm+Tbjp6H8a6HTLBNPthEMb2O5yO5r0MuoYl5hKM1aEdb977f15H1mHwUaUuY4z4tWZvrCygIOwvJuIPfA/wDr15BP4TsxndCX9mNe7+PbNrjR1uEBJtpQx/3Twf1xXH6R4V1DW2DLD5UHeaRePw9a/LON8Jj63E8qOGpubnGLikulkvkrp3b0RVfDRrSu9zzrSvBd1rd/FpOm26hnPXGERe7HHQCvojw3oNn4Z0S10WxH7u3TBbGC7nlmPuSSaboPh3T/AA/bmKzjzJJgyysPmc/0HtWrX6pwpw/UyfD+0xTvWlvbaK7Lv5v7u7rDYSGHbkt2Zl/4fsL6Q3Gzypj1dB976jvUVhoktpdCR2ikj2lTxz+VbFFe3VynC1a8cQ42mne60+9bHVyrczr/AEe1uEDpCBInTBxkelZYsYR/AfzNdLVO7tQSZkH+8P61ONwcJL2kYrz0JcE9TMSFUXaowBW7GcxqfYVlbRWsowoHoKWWu7kl5DirC0UUV6pQUUUUAFFFFABRRRQAUUUUAFFFFAFP7OXuXyPlByatgADAGAKWisaVCNG7j1AKKKK2AKKKKACkpaKAGqiooVFCgdgMCnUUUkklZAFVbizWRjJGMN3HrVqioqUo1Y8sgKVmCkrIwwcdKz/Fvh9dZ0LUorGztDqktpMlnNLEpMcxQhG3EHGGI5rc2gkMQMjoaWuZYKnKg8PVXNF33XcmUVKLizyTR7GKDSV0Xwd8Jr3StWZVSW41SJVt7eXaAZpZt5NyR1+TcXIAJUEkei+F/DWneFNCstC06MeXZwrF5hGGkbqzt7sxLH3NauB6Utc+CyfC4GftacI8211GMfyS+f6GVKgqWrd+nRW+78TlbjzfBd894g3eHrp2kulz/wAg+UnJkA/54sSS/wDcY7vultvJt4/vPE/ijWPCl74TiSx04kx3NxEJllGQBwylMMp3AgnivVSAwIYZBrhL/wACalpM7TeEpoXsG5/sm4cpHCcf8u7gHy1P/PMgoD93bXTOnOnpHWHbt/wPxXS62xrU6it7N+71X9dP69LvhC00K2uWhtdA0u0m27lltrOOJmxxg7QPX+dddXkX/CyNO8LeJm8K32mSp4lOmy6othLPGFFlHkvKJELbj8jAKBkkdhyPIPgz+3BrvxG+LNl4K1vwbY2mla3M1vYvaySNcW74LIZSx2uDjBwq4znnGKmniaFO1Naa9mv0Ob+08LhpQozlZydlp18/vR9e0Ug55pa7j1gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAM/UfD+hawQdW0axvcdPtNskuP8AvoH1NeUfEz4M6jq2s22p+DLPTreD7OttJbqFtxHtYkEbRgg7unr9a9Ml1nXLW7nt5fCl1cRq/wC4mtLiFkkTtuEjIUb1GCPQmoLvSdX8SxiDWZf7P05wPNs7aXMs47pJKMbUPQqnJ6bsZB4qipzvywvL0t+LW33+Vzjr0qeIi4uOvpb8bHPeEtGur3w/p/hFLtbjRNMiMN/doTtv5Q2TBEe8KkkO3fAQfx47XWNE0vXtKudF1WzjuLO6heCWNlGCjLtIHpwe1Wba2t7O3itLSCOGCBFjijjUKqIBgKAOAAOMCpa1hh48jjV96+/b09DanRUI8r16f8D0PHbbwppnhfTm8O+L/hxe+Io4QsFtf2Nqtyt3Ev8Aqy8e4GGYAAMSNmRuDDOB2vw88Mf2N4Y09NW0iC31FFYsHKyyxIXYxxvL/GyIUUtk5Kk5PWuswD1FLXBhckweEqqrThHRWXuxT1t1Su3po9+93qRTwypy5r3srLb+mVL3kogGTycUlvZAESSjkdFq3tXduwM9M0tdn1WMqrqz1OiwUUUV1jGyRRzIYpY1dGGCrDII+lKAAMAUtFLlV+a2oBRRRTAKKKKACiiigCnNbbZVKD5WP5VcoorGlQjRcnHqAUUUVsAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAFCfQNCuNUXXLjRbCXUkgNqt49sjTrCTkxiQjcEOTlc45r4O/ZI0rS0/ay8TQJptqsenx6qbNBCoW3IuFQGMY+TCsyjGOCR0NFFeXif41P8Axf5Hyea/79hv+vj/APbT9AKKKK9Q+sCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/2Q==');
		z-index: calc(var(--welcome-z) + 1);
		background-size: 100% 100%;
		transition: all 1s;
		padding: 40rpx;
		box-sizing: border-box;
	}
	

	
		
	.show-setting .setting-panel {
		top: 0rpx;
		height: 460rpx;
	}
	
	 .mask {
		 position: absolute;
		 height: 100vh;
		 width: 100vw;
	 }

	.welcome {
		top: calc(0rpx - 100vh);
		
		z-index: var(--welcome-z);
		background: url(../../static/miao-bg.webp) no-repeat;
		background-size: 100% 100%;

		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		transition: all 1s;
	}

	.welcome .game-name {
		color: white;
		text-shadow: calc(var(--card-height) * .07) calc(var(--card-height) * .07) gray;
		transform-origin: left;
		font-weight: bolder;
		position: absolute;
	}

	.show-welcome .welcome {
		top: 0rpx;
	}

	.water-mark {
		user-select: all;
		position: absolute;
		right: calc(var(--width) * .1);
		bottom: 1.5%;
		z-index: var(--water-mark-z);
		color: gray;
	}
	
	.game-over-mask {
	  --light-transparent: rgba(200, 200, 200, .6);
	  --dark-transparent: rgba(100, 100, 100, .8);
	  
	  top: calc(0rpx - 100vh);
	  
	  z-index: var(--game-over-z);
	  background: linear-gradient(var(--light-transparent) 5%, var(--dark-transparent) 50%, var(--light-transparent) 100%);
	  
	  display: flex;
	  flex-flow: column;
	  justify-content: center;
	  align-items: center;
	  transition: all 1s;
	}

	.show-game-over .game-over-mask {
		top: 0rpx;
	}

	.game-over-mask>.text {
		top: -100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--card-width);
		color: white;
	}
	
	.speaker-btn {
		position: absolute;
		z-index: var(--speaker-z);
		right: 20%;
		top: 5%;
		width: 40rpx;
		height: 40rpx;
	}
	.speaker-btn>image{
		width: 100%;
		height: 100%;
	}
	.button {
		margin-top: 30rpx;
		min-width: 200rpx;
		height: 70rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 15rpx;
		color: white;
		background: linear-gradient(hsl(240, 100%, 64%), hsl(210, 100%, 64%), hsl(240, 100%, 64%));
	}
	
	.switch {
		display: flex;
		align-items: centers;
		color: orange;
		margin-left: 140rpx;
		margin-top: 40rpx;
	}
	.switch .label {
		font-size: 40rpx;
		margin-right: 40rpx;
	}
	.switch .input {
		display: flex;
		align-items: center;
	}
</style>
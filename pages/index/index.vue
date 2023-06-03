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

		<view class="welcome">
			<view class="game-name" v-for="(item, idx) of gameNameDisplay" :key="idx" :style="[item.style]">
				{{item.char}}
			</view>
			<view class="start-button button" @click="startGame">开始游戏</view>
			<view class="setting-button button" @click="startGame">设置</view>
		</view>



		<div class="game-over-mask">
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
			StateBar
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

				xipaiFlag: false,
				xipaiLeft: 3,

				pauseLeft: 3,

				show: {
					welcome: true,
					gameover: false
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
					gameover
				} = this.show
				const classes = []
				if (welcome) {
					classes.push('show-welcome')
				}
				if (gameover) {
					classes.push('show-game-over')
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
				if (value) {
					this.audio.bgm.play()
				} else {
					this.audio.bgm.pause()
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
				that.audioOn && that.audio.bgm.play();
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

	.welcome {
		top: -120%;
		position: relative;
		height: 100%;
		width: 100%;

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
		top: 0;
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
	  
	  top: -0rpx;
	  position: relative;
	  height: 100%;
	  width: 100%;
	  
	  z-index: var(--game-over-z);
	  background: linear-gradient(var(--light-transparent) 5%, var(--dark-transparent) 50%, var(--light-transparent) 100%);
	  
	  display: flex;
	  flex-flow: column;
	  justify-content: center;
	  align-items: center;
	  transition: all 1s;
	}

	.show-game-over .game-over-mask {
		top: -100%;
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
</style>
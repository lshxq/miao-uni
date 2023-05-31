<template>
	<view class="main-panel" ref="abc">
		<template v-if='cards' v-for="(layer,layerIdx) in cards">
			<template v-for="(row,rowIdx) in layer">
				<template v-for="(card, cardIdx) in row">
					<view class="card-item" :style="[cardStyle(card)]" ref="mainPanelRef">
						<image v-if='card.type === 0' src="../../static/0.png"/>
						<image v-if='card.type === 1' src="../../static/1.png"/>
						<image v-if='card.type === 2' src="../../static/2.png"/>
						<image v-if='card.type === 3' src="../../static/3.png"/>
						<image v-if='card.type === 4' src="../../static/4.png"/>
						<image v-if='card.type === 5' src="../../static/5.png"/>
						<image v-if='card.type === 6' src="../../static/6.png"/>
						<image v-if='card.type === 7' src="../../static/7.png"/>
						<image v-if='card.type === 8' src="../../static/8.png"/>
						<image v-if='card.type === 9' src="../../static/9.png"/>
					</view>
				</template>
			</template>
		</template>

		<view class="xipai-btn control-btn" @click='xipaiClicked'>
			<view class='corner'>{{xipaiLeft}}</view>
			<text>洗牌</text>
		</view>
		
		<state-bar :time-remain="gameTime" :score="score"/>
		
		<div class="bar"></div>
	</view>
</template>



<script>
	import StateBar from './state-bar.vue'
	
	const BAR_LENGTH = 8;
	const CARD_TYPE = 9

	const createCardsData = (layerCnt, rowCnt, columnCnt, typeCnt) => {
		let id = 1;

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
		created() {
		},
		components: {
			StateBar
		},
		data() {
			return {
				cards: false,
				xipaiFlag: false,
				xipaiLeft: 3,
				bar: [],
				score: 0,
				gameTime: 50
			}
		},
		computed: {
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
				const {
					height
				} = this
				return Math.floor(height / 10);
			},
			cardWidth() {
				const {
					cardHeight
				} = this
				return Math.floor(cardHeight * 0.8 - 10)
			},
			columnCount() {
				const {
					width,
					cardWidth
				} = this
				return Math.floor(width / cardWidth) - 1
			}

		},
		mounted() {
			const {
				width,
				height,
				cardHeight,
				cardWidth,
				columnCount
			} = this

			this.cards = createCardsData(2, 7, columnCount, 6)
		},
		methods: {
			cardStyle(card) {
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
			}
		}
	}
</script>

<style>
	.main-panel {
		--width: 750rpx;
		--height: 1280rpx;
		--card-height: calc(var(--height) / 10 - 10rpx);
		--card-width: calc(var(--card-height) * 0.7);
		--bar-length: 8;
		--bar-left: calc((var(--width) - var(--card-width) * var(--bar-length)) / 2);
		overflow: hidden;
		height: var(--height);
		width: var(--width);
		position: relative;
		background: linear-gradient(190deg, hsl(250, 100%, 65%), hsl(200, 100%, 65%), hsl(100, 100%, 64%))
	}

	.card-item {
		display: inline-block;
		position: absolute;
		width: var(--card-width);
		height: var(--card-height);
		border: 1rpx solid red;
		transition: all 1s;

	}
	
	.card-item> image{
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
	  border: 1px solid gray;
	  --box-shadow-size: calc(var(--card-width) * .05);
	  box-shadow: var(--box-shadow-size) var(--box-shadow-size) var(--box-shadow-size) gray;
	}

	.xipai-btn {
		position: absolute;
		right: var(--card-width);
		top: calc(var(--card-height) * 8.5);
		background: gray;
		padding: calc(var(--card-height) * .1);
	}
	
	.control-btn>.corner {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  --coner-width: calc(var(--card-width) * .4);
	  position: absolute;
	  right: 0;
	  top: calc(0px - var(--coner-width) * .5);
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
  bottom: 1%;
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
</style>
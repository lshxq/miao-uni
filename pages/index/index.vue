<template>
	<view class="main-panel" ref="abc"> {{columnCount}} {{xipaiFlag}}
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
					</view>
				</template>
			</template>
		</template>

		<view class="xipai-btn" @click='xipaiClicked'>洗牌</view>
	</view>
</template>



<script>

	const BAR_LENGTH = 8;

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
			this.cardTypes = [
				img0,img1,img2,img3,img4,img5,img6,img7,img8
			]
		},
		data() {
			return {
				cards: false,
				xipaiFlag: false,
				xipaiLeft: 3,
				bar: []
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
									card.type = Math.floor(Math.random() * that.images.length)
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
		--height: 1334rpx;
		--card-height: calc(var(--height) / 10);
		--card-width: calc(var(--card-height) * 0.8 - 20rpx);
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

	.xipai-btn {
		position: absolute;
		right: var(--card-width);
		top: calc(var(--card-height) * 8.5);
		background: gray;
		padding: calc(var(--card-height) * .1);
	}
</style>
"use strict";
const common_vendor = require("../../common/vendor.js");
const StateBar = () => "./state-bar.js";
const BAR_LENGTH = 8;
const CARD_TYPE = 11;
let id = 1;
const createCardsData = (layerCnt, rowCnt, columnCnt, typeCnt) => {
  const data = [];
  for (let layerIdx = 0; layerIdx < layerCnt; layerIdx++) {
    const layer = [];
    for (let rowIdx = 0; rowIdx < rowCnt - layerIdx % 2; rowIdx++) {
      const row = [];
      for (let colIdx = 0; colIdx < columnCnt - layerIdx % 2; colIdx++) {
        row.push({
          id,
          type: Math.floor(Math.random() * typeCnt),
          layerIdx,
          rowIdx,
          colIdx,
          dark: layerIdx !== layerCnt - 1
        });
        id++;
      }
      layer.push(row);
    }
    data.push(layer);
  }
  return data;
};
const _sfc_main = {
  created() {
  },
  components: {
    StateBar
  },
  data() {
    return {
      gameName: "喵了个咪",
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
        gameover: false,
        setting: false
      }
    };
  },
  computed: {
    timeRemain() {
      const {
        gameStartTime,
        currentTime,
        pauseTime,
        pauseTimeStart,
        gameTime
      } = this;
      let rv = 0;
      if (pauseTimeStart === 0) {
        rv = gameTime - (currentTime - gameStartTime) / 1e3 + pauseTime;
      } else {
        rv = gameTime - (pauseTimeStart - gameStartTime) / 1e3 + pauseTime;
      }
      if (rv < 0) {
        rv = 0;
      }
      return Math.floor(rv);
    },
    gameNameDisplay() {
      const {
        gameName,
        height,
        width
      } = this;
      const arr = [];
      const fs = Math.min(width, height) / gameName.length;
      const offsetX = width / (gameName.length + 1);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2;
      const deg = 60;
      for (let idx = 0; idx < gameName.length; idx++) {
        const char = gameName.charAt(idx);
        const left = offsetX * (idx + 1);
        const a = centerX - left;
        const topOffset = Math.sqrt(radius * radius - a * a);
        let top = centerY - topOffset;
        const rot = deg / (gameName.length - 1) * idx - deg / 2;
        arr.push({
          char,
          style: {
            left: `${left}rpx`,
            top: `${top}rpx`,
            transform: `rotate(${rot}deg) translateX(-50%)`,
            "font-size": `${fs}rpx`
          }
        });
      }
      return arr;
    },
    mainPanelClass() {
      const {
        welcome,
        gameover,
        setting
      } = this.show;
      const classes = [];
      if (welcome) {
        classes.push("show-welcome");
      }
      if (gameover) {
        classes.push("show-game-over");
      }
      if (setting) {
        classes.push("show-setting");
      }
      return classes;
    },
    cardMarginLeft() {
      const {
        cardWidth,
        columnCount,
        width
      } = this;
      return (width - cardWidth * columnCount) / 2;
    },
    width() {
      return 750;
    },
    height() {
      return 1334;
    },
    cardHeight() {
      return 130;
    },
    cardWidth() {
      const {
        cardHeight
      } = this;
      return cardHeight * 0.6;
    },
    columnCount() {
      const {
        width,
        cardWidth
      } = this;
      return Math.floor(width * 0.95 / cardWidth);
    },
    barMarginLeft() {
      const {
        width,
        cardWidth
      } = this;
      return (width - cardWidth * BAR_LENGTH) / 2;
    }
  },
  watch: {
    audioOn(value) {
      if (value) {
        this.audio.bgm.play();
      } else {
        this.audio.bgm.pause();
      }
    },
    timeRemain(remain) {
      if (this.show.welcome || this.show.gameover) {
        return false;
      }
      if (remain === 6) {
        this.audio.bgm.pause();
      }
      if (remain === 5 || remain === 4 || remain === 3 || remain === 2 || remain === 1) {
        this.audioOn && this.audio.du.play();
      }
      if (remain <= 0) {
        this.gameover();
      }
    }
  },
  onLoad() {
    setTimeout(() => {
      console.log(getApp().globalData);
    }, 5e3);
    const that = this;
    that.timerId = setInterval(() => {
      if (that.show.gameover || that.show.welcome) {
        return false;
      }
      that.currentTime = Date.now();
    }, 100);
    const createAudio = (src, loop = false) => {
      const obj = common_vendor.index.createInnerAudioContext();
      obj.sessionCategory = "ambient";
      obj.src = src;
      obj.loop = loop;
      return obj;
    };
    that.audio = {
      bgm: createAudio("https://img.tukuppt.com/newpreview_music/09/02/07/5c8a31e2c9f0298727.mp3", true),
      failed: createAudio("https://img.tukuppt.com/newpreview_music/09/00/25/5c89106c1b91b30143.mp3"),
      sua: createAudio("https://img.tukuppt.com/newpreview_music/09/00/62/5c893bcaf3c9980553.mp3"),
      du: createAudio("https://img.tukuppt.com/newpreview_music/09/04/04/5c8afef35a2001596.mp3")
    };
  },
  onUnload() {
    clearTimeout(this.timerId);
    this.show.welcome = true;
  },
  methods: {
    cardInMatrix(layerIdx, rowIdx, colIdx, newValue) {
      const cards = JSON.parse(JSON.stringify(this.cards));
      const layer = cards[layerIdx];
      if (layer) {
        const row = layer[rowIdx];
        if (row) {
          const card = row[colIdx];
          if (newValue !== void 0) {
            row[colIdx] = newValue;
            this.cards = cards;
          }
          if (card) {
            return card;
          }
        }
      }
      return false;
    },
    uncover(card) {
      const that = this;
      const removed = (layerIdx, rowIdx, colIdx) => {
        const card2 = this.cardInMatrix(layerIdx, rowIdx, colIdx);
        if (card2 === false) {
          return true;
        }
        if (card2.destory) {
          return card2;
        }
        const cardInBar = that.bar.find((cardInBar2) => {
          return cardInBar2.id === card2.id;
        });
        return cardInBar;
      };
      if (card.layerIdx % 2 === 0) {
        const needCheckCards = [{
          // 上一层相邻的4张牌
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
        }].map((pos) => {
          const currCard = that.cardInMatrix(pos.layerIdx, pos.rowIdx, pos.colIdx);
          return currCard;
        });
        const check = (currCard) => {
          const c1Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx);
          const c2Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx + 1);
          const c3Removed = removed(currCard.layerIdx + 1, currCard.rowIdx + 1, currCard.colIdx);
          const c4Removed = removed(currCard.layerIdx + 1, currCard.rowIdx + 1, currCard.colIdx + 1);
          if (c1Removed && c2Removed && c3Removed && c4Removed) {
            currCard.dark = false;
            that.cardInMatrix(currCard.layerIdx, currCard.rowIdx, currCard.colIdx, currCard);
          }
        };
        needCheckCards.forEach((cardNeedCheck) => {
          cardNeedCheck && check(cardNeedCheck);
        });
      } else {
        const needCheckCards = [{
          // 上一层相邻的4张牌
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
        }].map((pos) => {
          const currCard = that.cardInMatrix(pos.layerIdx, pos.rowIdx, pos.colIdx);
          return currCard;
        });
        const check = (currCard) => {
          const c1Removed = removed(currCard.layerIdx + 1, currCard.rowIdx - 1, currCard.colIdx - 1);
          const c2Removed = removed(currCard.layerIdx + 1, currCard.rowIdx - 1, currCard.colIdx);
          const c3Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx - 1);
          const c4Removed = removed(currCard.layerIdx + 1, currCard.rowIdx, currCard.colIdx);
          if (c1Removed && c2Removed && c3Removed && c4Removed) {
            currCard.dark = false;
            that.cardInMatrix(currCard.layerIdx, currCard.rowIdx, currCard.colIdx, currCard);
          }
        };
        needCheckCards.forEach((cardNeedCheck) => {
          cardNeedCheck && check(cardNeedCheck);
        });
      }
    },
    cardClicked(card) {
      if (card.dark) {
        return false;
      }
      if (this.xipaiFlag) {
        return false;
      }
      if (this.pauseTimeStart !== 0) {
        return false;
      }
      if (this.show.gameover) {
        return false;
      }
      const that = this;
      const cardInBarBeforePush = that.bar.find((cib) => {
        return cib.id === card.id;
      });
      if (cardInBarBeforePush) {
        return false;
      }
      if (that.bar.length === BAR_LENGTH) {
        return false;
      }
      that.audioOn && that.audio.sua.play();
      that.bar.push(card);
      that.bar.sort((a, b) => {
        return a.type - b.type;
      });
      that.uncover(card);
      const destoryQueue = [];
      const grouped = [];
      for (const cardInBar of that.bar) {
        if (!grouped[cardInBar.type]) {
          grouped[cardInBar.type] = [];
        }
        grouped[cardInBar.type].push(cardInBar);
      }
      for (const key in grouped) {
        const cardGroup = grouped[key];
        if (cardGroup.length >= 3) {
          for (let destoryIdx = 0; destoryIdx < 3; destoryIdx++) {
            destoryQueue.push(cardGroup[destoryIdx]);
          }
          that.gameTime += 5;
          setTimeout(() => {
            that.score += 1;
            destoryQueue.forEach((cardInGroup) => {
              cardInGroup.destory = true;
              that.cardInMatrix(cardInGroup.layerIdx, cardInGroup.rowIdx, cardInGroup.colIdx, cardInGroup);
              that.deleteCardInBar(cardInGroup.id);
            });
          }, 1e3);
        }
      }
      let barItemCnt = 0;
      that.bar.forEach((cardInBar) => {
        const needDestory = destoryQueue.find((cardInDestory) => {
          return cardInBar.id === cardInDestory.id;
        });
        if (!needDestory) {
          barItemCnt++;
        }
      });
      if (barItemCnt > BAR_LENGTH - 1) {
        that.gameover();
      }
    },
    pauseClicked() {
      if (this.pauseTimeStart === 0) {
        if (this.pauseLeft <= 0) {
          return false;
        }
        this.pauseLeft -= 1;
        this.pauseTimeStart = Date.now();
      } else {
        this.pauseTime += (Date.now() - this.pauseTimeStart) / 1e3;
        this.pauseTimeStart = 0;
      }
    },
    deleteCardInBar(cardId) {
      const newBar = [];
      for (let idx = 0; idx < this.bar.length; idx++) {
        const cardInBar = this.bar[idx];
        if (cardInBar && cardInBar.id !== cardId) {
          newBar.push(cardInBar);
        }
      }
      this.bar = newBar;
    },
    getCardPositionInBar(cardId) {
      const {
        bar,
        height,
        cardWidth,
        barMarginLeft
      } = this;
      let left = 0;
      for (let idx = 0; idx < bar.length; idx++) {
        if (bar[idx].id === cardId) {
          left = Math.floor(idx * cardWidth + barMarginLeft);
          break;
        }
      }
      return {
        top: Math.floor(height * 0.9),
        left
      };
    },
    cardStyle(card) {
      const cardInBar = this.bar.find((cardInBar2) => {
        return cardInBar2 && cardInBar2.id === card.id;
      });
      if (cardInBar) {
        const pos = this.getCardPositionInBar(card.id);
        const style = {
          top: `${pos.top}rpx`,
          left: `${pos.left}rpx`,
          "z-index": 1e5 + card.layerIdx
        };
        return style;
      }
      const {
        width,
        height,
        cardWidth,
        cardHeight
      } = this;
      let offsetX = 0;
      let offsetY = 0;
      if (card.layerIdx % 2 === 1) {
        offsetX = cardWidth / 2;
        offsetY = cardHeight / 2;
      }
      const leftValue = card.colIdx * this.cardWidth + this.cardMarginLeft + offsetX;
      const topValue = card.rowIdx * this.cardHeight + this.cardHeight + offsetY;
      let top = topValue;
      let left = leftValue;
      if (this.xipaiFlag) {
        const centerX = width / 2;
        const centerY = height / 2;
        let cx = left + cardWidth / 2;
        let cy = top + cardHeight / 2;
        if (cy === centerY) {
          cy = 1;
        }
        if (cx === centerX) {
          cx += 1;
        }
        const b = centerY - cy;
        const a = centerX - cx;
        let tan = b / a;
        if (tan > 20) {
          tan = 20;
        } else if (tan < -20) {
          tan = -20;
        }
        if (cx <= centerX) {
          left = centerX - width;
          if (cy <= centerY) {
            top = left * tan;
          } else {
            top = left * tan + centerY;
          }
        } else {
          left = centerX + width;
          if (cy <= centerY) {
            top = left * tan;
          } else {
            top = left * tan;
          }
        }
        return {
          top: `${top}rpx`,
          left: `${left}rpx`
        };
      }
      return {
        top: `${topValue}rpx`,
        left: `${leftValue}rpx`
      };
    },
    xipaiClicked() {
      const that = this;
      if (that.xipaiLeft <= 0) {
        return false;
      }
      if (that.xipaiFlag) {
        return false;
      }
      that.xipaiFlag = true;
      that.xipaiLeft -= 1;
      setTimeout(() => {
        that.xipaiFlag = false;
        const {
          cards
        } = that;
        for (const layer of cards) {
          for (const row of layer) {
            for (const card of row) {
              const cardInBar = that.bar.find((cardInBar2) => {
                return cardInBar2 && cardInBar2.id === card.id;
              });
              if (!cardInBar && !card.destory) {
                card.type = Math.floor(Math.random() * CARD_TYPE);
              }
            }
          }
        }
      }, 1e3);
    },
    gameover() {
      const that = this;
      that.audio.bgm.pause();
      that.audioOn && that.audio.failed.play();
      that.show.gameover = true;
    },
    startGame() {
      this.show.welcome = false;
      this.newGame();
    },
    restartGame() {
      this.newGame();
    },
    newGame() {
      const that = this;
      const {
        columnCount
      } = that;
      that.show.setting = false;
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
};
if (!Array) {
  const _component_state_bar = common_vendor.resolveComponent("state-bar");
  _component_state_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.cards
  }, $data.cards ? {
    b: common_vendor.f($data.cards, (layer, layerIdx, i0) => {
      return {
        a: common_vendor.f(layer, (row, rowIdx, i1) => {
          return {
            a: common_vendor.f(row, (card, cardIdx, i2) => {
              return common_vendor.e({
                a: card && !card.destory
              }, card && !card.destory ? common_vendor.e({
                b: card.type === 0
              }, card.type === 0 ? {} : {}, {
                c: card.type === 1
              }, card.type === 1 ? {} : {}, {
                d: card.type === 2
              }, card.type === 2 ? {} : {}, {
                e: card.type === 3
              }, card.type === 3 ? {} : {}, {
                f: card.type === 4
              }, card.type === 4 ? {} : {}, {
                g: card.type === 5
              }, card.type === 5 ? {} : {}, {
                h: card.type === 6
              }, card.type === 6 ? {} : {}, {
                i: card.type === 7
              }, card.type === 7 ? {} : {}, {
                j: card.type === 8
              }, card.type === 8 ? {} : {}, {
                k: card.type === 9
              }, card.type === 9 ? {} : {}, {
                l: card.type === 10
              }, card.type === 10 ? {} : {}, {
                m: card.dark || $data.pauseTimeStart !== 0 ? 1 : "",
                n: common_vendor.s($options.cardStyle(card)),
                o: common_vendor.o(($event) => $options.cardClicked(card), card.id),
                p: card.id
              }) : {});
            })
          };
        })
      };
    })
  } : {}, {
    c: common_vendor.t($data.xipaiLeft),
    d: common_vendor.o((...args) => $options.xipaiClicked && $options.xipaiClicked(...args)),
    e: common_vendor.t($data.pauseTimeStart === 0 ? "暂停" : "继续"),
    f: common_vendor.t($data.pauseLeft),
    g: common_vendor.o((...args) => $options.pauseClicked && $options.pauseClicked(...args)),
    h: $data.audioOn
  }, $data.audioOn ? {} : {}, {
    i: common_vendor.o(($event) => $data.audioOn = !$data.audioOn),
    j: common_vendor.p({
      ["time-remain"]: $options.timeRemain,
      score: $data.score,
      hidden: $data.show.welcome
    }),
    k: common_vendor.f($options.gameNameDisplay, (item, idx, i0) => {
      return {
        a: common_vendor.t(item.char),
        b: idx,
        c: common_vendor.s(item.style)
      };
    }),
    l: common_vendor.o((...args) => $options.startGame && $options.startGame(...args)),
    m: common_vendor.o(($event) => $data.show.setting = !$data.show.setting),
    n: common_vendor.o((...args) => $options.restartGame && $options.restartGame(...args)),
    o: common_vendor.n($options.mainPanelClass)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "D:/tian/workspace/HBuilderProjects/miao/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);

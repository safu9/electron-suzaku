<template>
  <div class="slider-wrapper">
    <div
      class="slider-container"
      :class="{ 'animating': !activated, 'disabled': disabled }"
      :style="{ '--slider-color': this.color }">

      <div
        ref="slider"
        class="slider"
        :disabled="disabled"
        @touchstart="onClickSlider($event)"
        @mousedown="onClickSlider($event)">
        <div
          class="slider-line"
          :style="{ width: `${this.percent}%` }">
        </div>
      </div>
      <div
        ref="circle"
        class="slider-circle"
        :disabled="disabled"
        :style="{ left: `${this.percent}%` }"
        @touchstart="activateListners()"
        @mousedown="activateListners()">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Seekbar',
  props: {
    value: {
      default: 0,
      type: Number
    },
    disabled: {
      default: false,
      type: Boolean
    },
    color: {
      default: '#777',
      type: String
    },
    max: {
      default: 100,
      type: Number
    },
    min: {
      default: 0,
      type: Number
    },
    step: {
      default: 1,
      type: Number
    }
  },
  data: () => ({
    percent: 0,
    activated: false
  }),
  computed: {
    percentPerStep () {
      return 100 / ((this.max - this.min) / this.step)
    }
  },
  watch: {
    value () {
      if (!this.activated) {
        this.updatePercent()
      }
    }
  },
  mounted () {
    this.updatePercent()
  },
  methods: {
    activateListners () {
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('touchmove', this.onMouseMove)
      window.addEventListener('mouseup', this.deactivateListeners)
      window.addEventListener('touchend', this.deactivateListeners)

      this.activated = true
    },
    deactivateListeners () {
      this.activated = false

      window.removeEventListener('mousemove', this.onMouseMove)
      window.removeEventListener('touchmove', this.onMouseMove)
      window.removeEventListener('mouseup', this.deactivateListeners)
      window.removeEventListener('touchend', this.deactivateListeners)
    },
    onClickSlider (event) {
      const slider = this.$refs.slider
      const position = event.clientX - slider.getBoundingClientRect().left

      this.activateListners()
      this.changePercent(position)
    },
    onMouseMove (event) {
      const slider = this.$refs.slider
      let position

      if (event.type === 'touchmove') {
        position = event.targetTouches[0].clientX - slider.getBoundingClientRect().left
      } else {
        position = event.clientX - slider.getBoundingClientRect().left
      }
      if (position < 0) {
        position = 0
      } else if (slider.clientWidth < position) {
        position = slider.clientWidth
      }
      this.changePercent(position)
    },
    changePercent (position) {
      const slider = this.$refs.slider
      const posPercent = Math.round((position / slider.clientWidth) * 100)
      const steps = Math.round(posPercent / this.percentPerStep)
      let value = Math.round((this.max - this.min) * steps * this.percentPerStep / 100 + this.min)

      if (this.max < value) {
        value = this.max
        this.percent = 100
      } else {
        this.percent = Math.round(steps * this.percentPerStep)
      }

      this.$emit('change', value)
    },
    updatePercent () {
      // Set new percent from value(props)
      this.percent = (this.value - this.min) / (this.max - this.min) * 100
    }
  }
}
</script>

<style lang="scss">
.slider-wrapper {
  --slider-color: #777;

  width: 100%;
  padding: 0 6px;
  margin: 12px 0px;

  .slider-container {
    width: 100%;
    position: relative;
    left: 0px;

    &.animating div {
      transition: all .1s ease !important;
    }
    &.disabled {
      opacity: .4;
      cursor: default;
      div {
        cursor: default !important;
        pointer-events: none;
      }
    }

    .slider {
      display: block;
      position: relative;
      width: 100%;
      height: 4px;
      border: 0px;
      border-radius: 2px;
      padding: 0px;
      margin: 0px;
      outline: none;
      overflow: hidden;
      background: #ddd;
      cursor: pointer;
      z-index: 0;

      .slider-line {
        width: 0%;
        height: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
        z-index: 1;
        background: var(--slider-color);
      }
    }

    .slider-circle {
      display: block;
      width: 12px;
      height: 12px;
      position: absolute;
      top: -4px;
      z-index: 200;
      border: 1px solid var(--slider-color);
      border-radius: 50%;
      padding: 0px;
      margin: 0px;
      outline: none;
      cursor: pointer;
      background: #fff;
      transform: translate(-50%);
      transition: transform .1s ease;
      &:hover {
        transform: translate(-50%) scale(1.2);
      }
    }
  }
}
</style>

<template>
  <svg
    class="circle-progress"
    :viewBox="`-${radius} -${radius} ${radius*2} ${radius*2}`">
    <title>{{ title }}</title>
    <path
      :d="`M 0,0 L 0,-${radius} A ${radius},${radius} 0 ${flag} ${x},${y} z`"
      fill="#ddd" />
  </svg>
</template>

<script>
export default {
  props: ['percent', 'title'],
  data () {
    return {
      radius: 100
    }
  },
  computed: {
    x () {
      return this.radius * Math.sin(Math.PI * 2 * this.percent / 100)
    },
    y () {
      return this.radius * -Math.cos(Math.PI * 2 * this.percent / 100)
    },
    flag () {
      return (this.percent <= 50) ? '0,1' : '1,1'
    }
  }
}
</script>

<style>
.circle-progress {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}
</style>

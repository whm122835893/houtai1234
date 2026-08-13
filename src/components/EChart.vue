<template>
  <div ref="chartRef" class="echart" :style="{ height: height }" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  height?: string
}>()

const chartRef = ref<HTMLDivElement>()
const chart = shallowRef<echarts.ECharts>()

let observer: ResizeObserver | null = null

function init(): void {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  chart.value.setOption(props.option as EChartsOption)
  observer = new ResizeObserver(() => {
    chart.value?.resize()
  })
  observer.observe(chartRef.value)
}

function render(): void {
  if (chart.value) {
    chart.value.setOption(props.option as EChartsOption, { notMerge: true })
  }
}

onMounted(init)

onBeforeUnmount(() => {
  observer?.disconnect()
  chart.value?.dispose()
  chart.value = undefined
})

watch(() => props.option, render, { deep: true })
</script>

<style scoped>
.echart {
  width: 100%;
  min-height: 260px;
}
</style>

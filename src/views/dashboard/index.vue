<template>
  <div class="app-page dashboard-page">
    <!-- 核心指标卡片 -->
    <el-row :gutter="16" class="mb-16">
      <el-col :xs="12" :sm="12" :md="8" :lg="4" v-for="card in statCards" :key="card.label" class="mb-16">
        <StatCard
          :label="card.label"
          :value="card.value"
          :icon="card.icon"
          :start="card.start"
          :end="card.end"
          :extra="card.extra"
        />
      </el-col>
    </el-row>

    <!-- 趋势图 -->
    <div class="app-card mb-16">
      <div class="card-header">
        <div class="card-title">近7日销售趋势</div>
        <el-radio-group v-model="trendType" size="small">
          <el-radio-button value="sales">销售额</el-radio-button>
          <el-radio-button value="orders">订单量</el-radio-button>
        </el-radio-group>
      </div>
      <EChart :option="trendOption" height="300px" />
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12" class="mb-16">
        <div class="app-card">
          <div class="card-header">
            <div class="card-title">资金监控</div>
          </div>
          <div class="fund-grid">
            <div class="fund-item">
              <div class="fund-label">平台总充值额</div>
              <div class="fund-value">¥{{ data?.total_recharge || '0' }}</div>
            </div>
            <div class="fund-item">
              <div class="fund-label">总手续费收入</div>
              <div class="fund-value">¥{{ data?.total_fee_income || '0' }}</div>
            </div>
            <div class="fund-item">
              <div class="fund-label">待结算资金</div>
              <div class="fund-value">¥{{ data?.pending_settlement || '0' }}</div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="12" class="mb-16">
        <div class="app-card">
          <div class="card-header">
            <div class="card-title">钱包余额分布</div>
          </div>
          <EChart :option="pieOption" height="220px" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8" class="mb-16">
        <div class="app-card">
          <div class="card-header">
            <div class="card-title">库存预警</div>
          </div>
          <template v-if="data?.stock_warnings.length">
            <div v-for="(w, i) in data.stock_warnings" :key="i" class="warning-item">
              <el-tag :type="w.level === 'danger' ? 'danger' : 'warning'" size="small" effect="light">
                {{ w.level === 'danger' ? '危险' : '预警' }}
              </el-tag>
              <span class="warning-text">{{ w.text }}</span>
            </div>
          </template>
          <EmptyState v-else text="暂无库存预警" />
        </div>
      </el-col>
      <el-col :xs="24" :md="8" class="mb-16">
        <div class="app-card">
          <div class="card-header">
            <div class="card-title">实时动态</div>
          </div>
          <div class="event-list">
            <div v-for="(ev, i) in data?.realtime_events" :key="i" class="event-item">
              <span class="event-dot" :class="ev.type"></span>
              <span class="event-text">{{ ev.text }}</span>
              <span class="event-time">{{ ev.time }}</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :md="8" class="mb-16">
        <div class="app-card">
          <div class="card-header">
            <div class="card-title">优先购统计</div>
          </div>
          <div class="priority-stats">
            <div class="p-stat">
              <div class="p-num">{{ data?.priority_stats.total_issued || 0 }}</div>
              <div class="p-label">发放总量</div>
            </div>
            <div class="p-stat">
              <div class="p-num">{{ data?.priority_stats.used || 0 }}</div>
              <div class="p-label">已使用</div>
            </div>
            <div class="p-stat">
              <div class="p-num">{{ data?.priority_stats.remaining || 0 }}</div>
              <div class="p-label">剩余资格</div>
            </div>
          </div>
          <el-progress
            :percentage="usedPercent"
            :stroke-width="12"
            color="#409EFF"
            class="mt-16"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import StatCard from '@/components/StatCard.vue'
import EChart from '@/components/EChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import { getDashboardData } from '@/api/dashboard'
import type { DashboardData } from '@/api/dashboard'

const data = ref<DashboardData | null>(null)
const trendType = ref<'sales' | 'orders'>('sales')

onMounted(async () => {
  data.value = await getDashboardData()
})

const statCards = computed(() => [
  {
    label: '今日新增用户',
    value: data.value ? String(data.value.today_new_users) : '-',
    icon: 'UserFilled',
    start: '#409EFF',
    end: '#7c3aed',
    extra: '较昨日 +12.6%'
  },
  {
    label: '今日销售额',
    value: data.value ? `¥${Number(data.value.today_sales_amount).toFixed(0)}` : '-',
    icon: 'Money',
    start: '#ec4899',
    end: '#f97316',
    extra: '今日实时'
  },
  {
    label: '今日订单量',
    value: data.value ? String(data.value.today_orders) : '-',
    icon: 'List',
    start: '#06b6d4',
    end: '#3b82f6',
    extra: '较昨日 +8.2%'
  },
  {
    label: '活跃藏品数',
    value: data.value ? String(data.value.active_collectibles) : '-',
    icon: 'Collection',
    start: '#f59e0b',
    end: '#ef4444',
    extra: '发售中'
  },
  {
    label: '寄售中数量',
    value: data.value ? String(data.value.on_sale_count) : '-',
    icon: 'ShoppingCart',
    start: '#10b981',
    end: '#84cc16',
    extra: '二级市场在售'
  }
])

const trendOption = computed<EChartsOption>(() => {
  const list = data.value?.trend || []
  const isSales = trendType.value === 'sales'
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 12, right: 20, top: 30, bottom: 8, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: list.map((i) => i.date), axisLine: { lineStyle: { color: '#dcdfe6' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ebeef5' } } },
    series: [
      {
        name: isSales ? '销售额(元)' : '订单量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: isSales ? list.map((i) => Number(i.sales_amount)) : list.map((i) => i.orders),
        lineStyle: { color: '#409EFF', width: 2.5 },
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.35)' },
              { offset: 1, color: 'rgba(64,158,255,0.02)' }
            ]
          }
        }
      }
    ]
  }
})

const pieOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { bottom: 0, textStyle: { fontSize: 12 } },
  color: ['#409EFF', '#7c3aed', '#f59e0b'],
  series: [
    {
      name: '钱包余额',
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: data.value?.wallet_balance || []
    }
  ]
}))

const usedPercent = computed(() => {
  const s = data.value?.priority_stats
  if (!s) return 0
  return s.total_issued > 0 ? Math.round((s.used / s.total_issued) * 100) : 0
})
</script>

<style lang="scss" scoped>
.fund-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .fund-item {
    background: $bg-page;
    border-radius: 8px;
    padding: 16px;

    .fund-label {
      font-size: 12px;
      color: $text-secondary;
    }

    .fund-value {
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;
      margin-top: 8px;
    }
  }
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px dashed $border-color;

  &:last-child {
    border-bottom: none;
  }

  .warning-text {
    font-size: 13px;
    color: $text-regular;
    flex: 1;
  }
}

.event-list {
  .event-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 0;
    border-bottom: 1px dashed $border-color;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }

    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &.order { background: #409eff; }
      &.onsale { background: #f59e0b; }
      &.transfer { background: #10b981; }
      &.alarm { background: #ef4444; }
    }

    .event-text {
      flex: 1;
      color: $text-regular;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-time {
      color: $text-secondary;
      font-size: 12px;
    }
  }
}

.priority-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  .p-stat {
    text-align: center;
    background: $bg-page;
    border-radius: 8px;
    padding: 16px 8px;

    .p-num {
      font-size: 24px;
      font-weight: 700;
      color: $color-primary;
    }

    .p-label {
      font-size: 12px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }
}
</style>

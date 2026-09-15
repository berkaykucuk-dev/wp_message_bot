<template>
  <div class="bg-white dark:bg-wa-panelDark border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm p-4 w-full h-72 flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-gray-800 dark:text-white">Son 7 Gün Gönderim Hacmi</h3>
      <span class="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-sm">↑ %12 trend</span>
    </div>
    <div class="flex-1 relative">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

const chartData = {
  labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  datasets: [
    {
      label: 'Gönderilen',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      borderColor: '#14b8a6', // wa-teal
      pointBackgroundColor: '#14b8a6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#14b8a6',
      fill: true,
      tension: 0.4,
      data: [120, 350, 200, 480, 500, 300, 650]
    },
    {
      label: 'Hatalı',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderColor: '#ef4444',
      borderDash: [5, 5],
      pointBackgroundColor: '#ef4444',
      pointBorderColor: '#fff',
      fill: true,
      tension: 0.4,
      data: [10, 15, 5, 20, 25, 5, 30]
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        color: '#6b7280'
      }
    }
  },
  scales: {
    y: {
      display: false,
      beginAtZero: true
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  }
}
</script>

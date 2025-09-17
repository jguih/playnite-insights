<script lang="ts">
	import type { BarSeriesOption, ComposeOption } from 'echarts';
	import { BarChart } from 'echarts/charts';
	import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { CanvasRenderer } from 'echarts/renderers';
	import { onMount } from 'svelte';

	echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, CanvasRenderer]);

	type Props = {
		xAxis: { data: string[] };
		series: { bar: { data: number[]; label: string } };
	};

	let { xAxis, series }: Props = $props();

	const id = 'chart-games-owned-over-time';
	const option: ComposeOption<BarSeriesOption> = $derived({
		title: {
			show: false,
		},
		tooltip: {},
		grid: {
			top: '8%',
			left: '15%',
			bottom: '12%',
		},
		xAxis: {
			data: xAxis.data,
			axisLabel: {
				color: 'white',
			},
		},
		yAxis: {
			axisLabel: {
				color: 'white',
			},
		},
		series: [
			{
				name: series.bar.label,
				type: 'bar',
				data: series.bar.data,
				color: ['hsl(198, 100%, 67%)'],
			},
		],
	});

	onMount(async () => {
		if (document) {
			const myChart = echarts.init(document.getElementById(id));
			myChart.setOption(option);
		}
	});
</script>

<div
	{id}
	class="h-[350px] w-full"
></div>

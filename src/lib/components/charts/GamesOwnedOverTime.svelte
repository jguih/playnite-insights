<script lang="ts">
	import { init, type BarSeriesOption, type ComposeOption } from 'echarts';
	import { onMount } from 'svelte';

	let { xAxis, series }: { xAxis: { data: string[] }; series: { bar: { data: number[] } } } =
		$props();

	const id = 'chart-games-owned-over-time';
	var option: ComposeOption<BarSeriesOption> = $derived({
		title: {
			show: false
		},
		tooltip: {},
		grid: {
			top: '8%',
			left: '15%',
			bottom: '12%'
		},
		xAxis: {
			data: xAxis.data,
			axisLabel: {
				color: 'white'
			}
		},
		yAxis: {
			axisLabel: {
				color: 'white'
			}
		},
		series: [
			{
				name: 'games owned',
				type: 'bar',
				data: series.bar.data,
				color: ['hsl(198, 100%, 67%)']
			}
		]
	});

	onMount(() => {
		if (document) {
			var myChart = init(document.getElementById(id));
			myChart.setOption(option);
		}
	});
</script>

<div {id} class="h-[350px] w-full"></div>

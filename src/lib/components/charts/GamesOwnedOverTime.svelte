<script lang="ts">
	import { init, type BarSeriesOption, type ComposeOption } from 'echarts';
	import { onMount } from 'svelte';

	let { xAxis, series }: { xAxis: { data: string[] }; series: { data: number[] } } = $props();

	const id = 'chart-games-owned-over-time';
	var option: ComposeOption<BarSeriesOption> = {
		title: {
			text: ''
		},
		tooltip: {},
		// legend: {
		// 	data: ['sales'],
		// 	textStyle: {
		// 		color: 'white'
		// 	}
		// },
		grid: {
			left: 52
		},
		xAxis: {
			data: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.'],
			axisLabel: {
				color: 'white'
			}
		},
		yAxis: {
			scale: true
		},
		series: [
			{
				name: 'sales',
				type: 'bar',
				data: [1141, 1142, 1156, 1157, 1158, 1158],
				color: ['hsl(198, 100%, 67%)']
			}
		]
	};

	onMount(() => {
		if (document) {
			var myChart = init(document.getElementById(id));
			myChart.setOption(option);
		}
	});
</script>

<div class="bg-background-1 rounded-md shadow-md">
	<h1 class="pt-4 pl-3 text-xl">Games owned over time</h1>
	<div {id} class="h-[350px] w-full"></div>
</div>

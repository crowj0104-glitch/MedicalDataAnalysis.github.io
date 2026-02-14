// 使用DOMContentLoaded确保DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// ==================== 全局变量声明 ====================

	/** 热力图图表实例 */
	let chartHeatmap;

	/** 饼图图表实例 */
	let chartPie;

	/** 3D图表图表实例 */
	let chart3D;

	/** 热力图配置选项 */
	let optionHeatmap;

	/** 饼图配置选项 */
	let optionPie;

	/** 3D图表配置选项 */
	let option3D;

	// ==================== 热力图初始化 ====================

	(function initHeatmapChart() {
		var heatmapElement = document.getElementById('chart-heatmap');
		showLoading(heatmapElement); // 显示加载动画

		// 模拟异步加载（800ms延迟）
		setTimeout(() => {
			// 初始化图表实例
			chartHeatmap = echarts.init(heatmapElement);

			// ========== 数据映射配置 ==========
			/** 时间段中文到索引的映射 */
			const timeMap = {
				'上午（6-11点）': 0,
				'下午（12-17点）': 1,
				'晚上（18-23点）': 2,
				'凌晨（0-5点）': 3
			};

			/** 年龄段中文到索引的映射 */
			const ageMap = {
				'0-14岁（儿童）': 0,
				'15-35岁（青年）': 1,
				'36-59岁（中年）': 2,
				'60-80岁（老年）': 3,
				'80岁以上（高龄）': 4,
				'未知年龄': 5
			};

			// 保存到全局，供input.js使用
			window.timeMap = timeMap;
			window.ageMap = ageMap;

			// ========== 坐标轴数据 ==========
			/** X轴数据：时间段 */
			const xxx = [
				'上午（6-11点）',
				'下午（12-17点）',
				'晚上（18-23点）',
				'凌晨（0-5点）'
			];

			/** Y轴数据：年龄段 */
			const yyy = [
				'0-14岁（儿童）',
				'15-35岁（青年）',
				'36-59岁（中年）',
				'60-80岁（老年）',
				'80岁以上（高龄）',
				'未知年龄'
			];

			// ========== 热力图数据 ==========
			/** 热力图原始数据：[时间段索引, 年龄段索引, 数值] */
			const data = [
				[0, 0, 69],
				[0, 1, 101],
				[0, 2, 30],
				[0, 3, 72],
				[1, 0, 322],
				[1, 1, 291],
				[1, 2, 263],
				[1, 3, 349],
				[2, 0, 744],
				[2, 1, 743],
				[2, 2, 308],
				[2, 3, 758],
				[3, 0, 790],
				[3, 1, 828],
				[3, 2, 188],
				[3, 3, 522],
				[4, 0, 376],
				[4, 1, 390],
				[4, 2, 85],
				[4, 3, 191],
				[5, 0, 45],
				[5, 1, 39],
				[5, 2, 42],
				[5, 3, 42]
			].map(function(item) {
				// 转换格式为：[年龄段索引, 时间段索引, 数值]
				return [item[1], item[0], item[2] || '-'];
			});

			// 计算最大值用于视觉映射
			var maxValue = Math.max(...data.map((item) => item[2]));

			// ========== 热力图配置选项 ==========
			optionHeatmap = {
				backgroundColor: '#f0f4f8',
				tooltip: {
					textStyle: {
						fontSize: 18,
						fontWeight: 'bold',
						color: '#000000'
					},
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					borderRadius: 4
				},
				grid: {
					height: '48%',
					top: '12%',
					left: '12%',
					right: '12%'
				},
				xAxis: {
					type: 'category',
					data: xxx,
					axisLabel: {
						color: '#000000',
						interval: 0,
						rotate: 15,
						fontSize: 12,
						fontWeight: 'bold'
					},
					splitArea: {
						show: true,
						areaStyle: {
							color: ['#ffffff', '#f8f8f8']
						}
					},
					name: '时间段',
					nameTextStyle: {
						color: '#c60718',
						fontSize: 18,
						fontWeight: 'bold',
						padding: [0, 0, 5, 0]
					}
				},
				yAxis: {
					type: 'category',
					data: yyy,
					axisLabel: {
						color: '#000000',
						interval: 0,
						rotate: 15,
						fontSize: 12,
						fontWeight: 'bold'
					},
					splitArea: {
						show: true,
						areaStyle: {
							color: ['#ffffff', '#f8f8f8']
						}
					},
					name: '年龄段',
					nameTextStyle: {
						color: '#c60718',
						fontSize: 18,
						fontWeight: 'bold',
						padding: [0, 5, 0, 0]
					}
				},
				visualMap: {
					// 基础样式 - 玻璃效果
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					borderColor: '#19647d',
					borderWidth: 2,
					padding: 8,

					// 数值范围
					min: 0,
					max: maxValue,

					// 交互性
					calculable: true,
					calculableThickness: 2,
					calculableColor: 'rgba(25, 100, 125, 0.4)',

					// 布局
					orient: 'horizontal',
					left: 'center',
					bottom: '2%',
					itemWidth: 18,
					itemHeight: 180,

					// 颜色渐变
					inRange: {
						color: [
							'#e1f0fa', '#a3d4ea', '#65b8da',
							'#3d8cb0', '#ffb74d', '#ff8a65', '#e53935'
						]
					},

					// 文本样式
					textStyle: {
						color: '#1a5f7a',
						fontSize: 12,
						fontWeight: '500'
					},

					// 手柄样式（计算滑块）
					handleStyle: {
						color: '#ffffff',
						borderColor: '#c80019',
						borderWidth: 2,
						shadowBlur: 8,
						shadowColor: 'rgba(200, 0, 25, 0.4)'
					},

					// 指示线样式
					indicatorStyle: {
						color: '#c80019',
						borderColor: '#ffffff',
						borderWidth: 1,
						shadowBlur: 4,
						shadowColor: 'rgba(200, 0, 25, 0.2)'
					},

					// 悬停效果
					emphasis: {
						handleStyle: {
							borderColor: '#e17d7d',
							borderWidth: 2,
							shadowBlur: 8,
							shadowColor: 'rgba(225, 125, 125, 0.5)'
						}
					}
				},
				series: [{
					name: '就诊人次',
					type: 'heatmap',
					data: data,
					label: {
						show: true,
						color: '#000000',
						fontSize: 10,
						fontWeight: 'bold',
						textBorderColor: '#ffffff',
						textBorderWidth: 2,
						textShadow: '0 1px 1px rgba(196, 8, 24, 0.8)'
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: 'rgba(196, 8, 24, 0.6)'
						}
					}
				}]
			};

			// 保存配置到全局，供input.js使用
			chartHeatmap.setOption(optionHeatmap);
			window.optionHeatmap = optionHeatmap;

			// 添加标志
			window.chartHeatmapLoaded = true;
			checkAllChartsLoaded();

			// ==================== 热力图点击事件 ====================
			chartHeatmap.on('click', function(params) {
				if (params.data) {
					// 高亮选中的单元格
					chartHeatmap.dispatchAction({
						type: 'highlight',
						dataIndex: params.dataIndex
					});

					// 1秒后取消高亮
					setTimeout(() => {
						chartHeatmap.dispatchAction({
							type: 'downplay',
							dataIndex: params.dataIndex
						});
					}, 1000);
				}
			});

			// ==================== 渲染与窗口自适应 ====================
			try {
				chartHeatmap.setOption(optionHeatmap);
				window.addEventListener('resize', function() {
					chartHeatmap.resize();
				});
			} catch (error) {
				console.error('热力图初始化失败:', error);
			}
		}, 800); // 模拟异步加载结束
	})(); // 热力图初始化结束

	// ==================== 饼图初始化 ====================

	(function initPieChart() {
		var pieElement = document.getElementById('chart-pie');
		showLoading(pieElement); // 显示加载动画

		// 模拟异步加载（800ms延迟）
		setTimeout(() => {
			// 初始化图表实例
			chartPie = echarts.init(pieElement);

			// ========== 饼图原始数据 ==========
			const pieRawData = [{
					value: 2053,
					name: '车祸'
				},
				{
					value: 557,
					name: '外伤'
				},
				{
					value: 495,
					name: '头晕'
				},
				{
					value: 489,
					name: '昏迷'
				},
				{
					value: 375,
					name: '醉酒类'
				},
				{
					value: 373,
					name: '肚子疼'
				},
				{
					value: 155,
					name: '抽搐'
				}
			];

			/**
			 * 动态计算最大三类数据
			 * @param {Array} dataArray - 饼图数据数组
			 * @returns {Array} 数值最大的前三个数据项
			 */
			function getTopThreeData(dataArray) {
				// 深拷贝数据避免修改原数组
				const sortedData = [...dataArray].sort((a, b) => b.value - a.value);
				return sortedData.slice(0, 3);
			}

			const topThreeData = getTopThreeData(pieRawData);

			// ========== 饼图配置选项（双层饼图） ==========
			optionPie = {
				backgroundColor: '#f0f4f8',
				tooltip: {
					trigger: 'item',
					formatter: '{a} <br/> {b}: {c} ({d}%)',
					textStyle: {
						fontSize: 18,
						fontWeight: 'bold',
						color: '#000000'
					},
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					borderRadius: 6
				},
				legend: {
					data: pieRawData.map((item) => item.name),
					orient: 'vertical',
					right: '5%',
					top: 'center',
					align: 'left',
					itemWidth: 12,
					itemHeight: 12,
					itemGap: 10,
					textStyle: {
						color: '#333',
						fontSize: 18,
						fontWeight: 'bold'
					},
					formatter: function(name) {
						// 显示名称和对应的数值
						const item = pieRawData.find((d) => d.name === name);
						return item ? `${name}: ${item.value}` : name;
					}
				},
				series: [{
						name: '病症-呼救量',
						type: 'pie',
						selectedMode: 'single',
						center: ['40%', '50%'], // 明确指定中心位置
						radius: [0, '28%'],
						label: {
							position: 'inner',
							show: true,
							color: '#ffffff',
							fontSize: 12,
							fontWeight: 'bold',
							textShadow: '0 1px 1px rgba(199, 6, 24, 0.8)'
						},
						labelLine: {
							show: false
						},
						data: topThreeData
					},
					{
						name: '病症-呼救量',
						type: 'pie',
						center: ['40%', '50%'], // 与内环相同的中心位置
						radius: ['42%', '58%'],
						labelLine: {
							length: 30,
							lineStyle: {
								color: '#c60718'
							}
						},
						label: {
							formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
							backgroundColor: '#e1e1e1',
							borderColor: '#c60713',
							borderWidth: 1,
							borderRadius: 4,
							rich: {
								a: {
									color: '#646464',
									lineHeight: 22,
									align: 'center'
								},
								hr: {
									borderColor: '#969696',
									width: '100%',
									borderWidth: 1,
									height: 0
								},
								b: {
									color: '#323232',
									fontSize: 14,
									fontWeight: 'bold',
									lineHeight: 33
								},
								per: {
									color: '#ffffff',
									backgroundColor: '#d67a71',
									padding: [3, 4],
									borderRadius: 4
								}
							}
						},
						data: pieRawData
					}
				]
			};

			// 保存配置到全局，供input.js使用
			chartPie.setOption(optionPie);
			window.optionPie = optionPie;

			window.chartPieLoaded = true;
			checkAllChartsLoaded();

			// 将计算最大三类的函数也保存到全局
			window.getTopThreeData = getTopThreeData;

			// ==================== 饼图点击事件 ====================
			chartPie.on('click', function(params) {
				if (params.data) {
					// 高亮选中的扇区
					chartPie.dispatchAction({
						type: 'highlight',
						dataIndex: params.dataIndex
					});

					// 1秒后取消高亮
					setTimeout(() => {
						chartPie.dispatchAction({
							type: 'downplay',
							dataIndex: params.dataIndex
						});
					}, 1000);
				}
			});

			// ==================== 渲染与窗口自适应 ====================
			try {
				chartPie.setOption(optionPie);
				window.addEventListener('resize', function() {
					chartPie.resize();
				});
			} catch (error) {
				console.error('饼图初始化失败:', error);
			}
		}, 800); // 模拟异步加载结束
	})(); // 饼图初始化结束

	// ==================== 3D图表初始化 ====================

	(function init3DChart() {
		var chart3dElement = document.getElementById('chart-3d');
		showLoading(chart3dElement); // 显示加载动画

		// 为3D图表容器添加特殊类名，便于识别
		chart3dElement.classList.add('chart-3d-container');

		// 模拟异步加载（800ms延迟）
		setTimeout(() => {
			// 初始化图表实例
			chart3D = echarts.init(chart3dElement);

			// ========== 坐标轴数据 ==========
			/** X轴数据：位置列表 */
			var xx = [
				'上望', '中医院', '仙降', '南滨', '场桥', '塘下',
				'平阳坑', '曹村', '林川', '桐浦', '汀田', '湖岭',
				'瑞医', '瑞祥', '罗凤', '陶山', '飞云', '马屿', '高楼'
			];

			/** Y轴数据：症状列表 */
			var yy = ['外伤', '头晕', '抽搐', '昏迷', '肚子疼', '车祸', '醉酒类'];

			// ========== 3D图表数据 ==========
			/** 3D图表数据：[症状, 位置, 数值] */
			var LocSymp = [
				// 外伤数据
				['外伤', '上望', 23],
				['外伤', '中医院', 4],
				['外伤', '仙降', 32],
				['外伤', '南滨', 4],
				['外伤', '场桥', 8],
				['外伤', '塘下', 65],
				['外伤', '平阳坑', 4],
				['外伤', '曹村', 8],
				['外伤', '林川', 3],
				['外伤', '桐浦', 6],
				['外伤', '汀田', 15],
				['外伤', '湖岭', 32],
				['外伤', '瑞医', 1],
				['外伤', '瑞祥', 20],
				['外伤', '罗凤', 6],
				['外伤', '陶山', 49],
				['外伤', '飞云', 31],
				['外伤', '马屿', 25],
				['外伤', '高楼', 24],

				// 头晕数据
				['头晕', '上望', 12],
				['头晕', '中医院', 4],
				['头晕', '仙降', 22],
				['头晕', '南滨', 6],
				['头晕', '场桥', 3],
				['头晕', '塘下', 60],
				['头晕', '平阳坑', 3],
				['头晕', '曹村', 5],
				['头晕', '林川', 0],
				['头晕', '桐浦', 10],
				['头晕', '汀田', 16],
				['头晕', '湖岭', 32],
				['头晕', '瑞医', 7],
				['头晕', '瑞祥', 18],
				['头晕', '罗凤', 6],
				['头晕', '陶山', 30],
				['头晕', '飞云', 18],
				['头晕', '马屿', 30],
				['头晕', '高楼', 11],

				// 抽搐数据
				['抽搐', '上望', 7],
				['抽搐', '中医院', 0],
				['抽搐', '仙降', 10],
				['抽搐', '南滨', 3],
				['抽搐', '场桥', 1],
				['抽搐', '塘下', 29],
				['抽搐', '平阳坑', 0],
				['抽搐', '曹村', 1],
				['抽搐', '林川', 0],
				['抽搐', '桐浦', 1],
				['抽搐', '汀田', 7],
				['抽搐', '湖岭', 2],
				['抽搐', '瑞医', 0],
				['抽搐', '瑞祥', 4],
				['抽搐', '罗凤', 3],
				['抽搐', '陶山', 11],
				['抽搐', '飞云', 7],
				['抽搐', '马屿', 10],
				['抽搐', '高楼', 1],

				// 昏迷数据
				['昏迷', '上望', 21],
				['昏迷', '中医院', 9],
				['昏迷', '仙降', 29],
				['昏迷', '南滨', 17],
				['昏迷', '场桥', 4],
				['昏迷', '塘下', 34],
				['昏迷', '平阳坑', 3],
				['昏迷', '曹村', 12],
				['昏迷', '林川', 3],
				['昏迷', '桐浦', 8],
				['昏迷', '汀田', 20],
				['昏迷', '湖岭', 13],
				['昏迷', '瑞医', 13],
				['昏迷', '瑞祥', 34],
				['昏迷', '罗凤', 6],
				['昏迷', '陶山', 25],
				['昏迷', '飞云', 25],
				['昏迷', '马屿', 25],
				['昏迷', '高楼', 17],

				// 肚子疼数据
				['肚子疼', '上望', 12],
				['肚子疼', '中医院', 10],
				['肚子疼', '仙降', 28],
				['肚子疼', '南滨', 6],
				['肚子疼', '场桥', 10],
				['肚子疼', '塘下', 49],
				['肚子疼', '平阳坑', 1],
				['肚子疼', '曹村', 1],
				['肚子疼', '林川', 3],
				['肚子疼', '桐浦', 1],
				['肚子疼', '汀田', 16],
				['肚子疼', '湖岭', 21],
				['肚子疼', '瑞医', 3],
				['肚子疼', '瑞祥', 14],
				['肚子疼', '罗凤', 5],
				['肚子疼', '陶山', 25],
				['肚子疼', '飞云', 16],
				['肚子疼', '马屿', 23],
				['肚子疼', '高楼', 11],

				// 车祸数据
				['车祸', '上望', 92],
				['车祸', '中医院', 9],
				['车祸', '仙降', 187],
				['车祸', '南滨', 75],
				['车祸', '场桥', 20],
				['车祸', '塘下', 297],
				['车祸', '平阳坑', 12],
				['车祸', '曹村', 24],
				['车祸', '林川', 4],
				['车祸', '桐浦', 39],
				['车祸', '汀田', 93],
				['车祸', '湖岭', 36],
				['车祸', '瑞医', 1],
				['车祸', '瑞祥', 66],
				['车祸', '罗凤', 37],
				['车祸', '陶山', 86],
				['车祸', '飞云', 170],
				['车祸', '马屿', 119],
				['车祸', '高楼', 28],

				// 醉酒类数据
				['醉酒类', '上望', 21],
				['醉酒类', '中医院', 1],
				['醉酒类', '仙降', 24],
				['醉酒类', '南滨', 5],
				['醉酒类', '场桥', 6],
				['醉酒类', '塘下', 64],
				['醉酒类', '平阳坑', 3],
				['醉酒类', '曹村', 0],
				['醉酒类', '林川', 1],
				['醉酒类', '桐浦', 4],
				['醉酒类', '汀田', 10],
				['醉酒类', '湖岭', 9],
				['醉酒类', '瑞医', 0],
				['醉酒类', '瑞祥', 15],
				['醉酒类', '罗凤', 3],
				['醉酒类', '陶山', 8],
				['醉酒类', '飞云', 22],
				['醉酒类', '马屿', 11],
				['醉酒类', '高楼', 2]
			];

			// 计算最大值用于视觉映射
			var maxValue = Math.max(...LocSymp.map((item) => item[2]));

			// ========== 3D图表配置选项 ==========
			option3D = {
				tooltip: {
					trigger: 'item',
					formatter: '{b} <br/> 呼救量: {c}',
					backgroundColor: 'rgba(255, 255, 255, 0.95)',
					borderColor: '#1a5f7a',
					borderWidth: 1,
					textStyle: {
						color: '#000000',
						fontSize: 14,
						fontWeight: '600'
					}
				},
				visualMap: {
					max: maxValue,
					min: 0,
					calculable: true,
					orient: 'vertical', // 竖直方向
					left: '1%', // 左侧位置
					top: 'center', // 垂直居中
					itemWidth: 12,
					itemHeight: 180,

					borderColor: '#19647d',
					borderWidth: 1,
					backgroundColor: 'rgba(250, 250, 250, 0.8)',

					inRange: {
						color: [
							'#c1e4f0', '#9ad0e6', '#73bcdc', '#4ca8d2',
							'#3a8ab3', '#2d6f94', '#205475',
							'#ff9f4b', '#ff7043', '#e53935', '#b71c1c'
						]
					},

					textStyle: {
						color: '#19647d',
						fontSize: 10,
						fontWeight: '500'
					},

					// 手柄样式
					handleStyle: {
						color: '#ffffff',
						borderColor: '#000000',
						borderWidth: 2,
						shadowBlur: 6,
						shadowColor: 'rgba(200, 0, 25, 0.4)'
					},

					// 悬停效果
					emphasis: {
						handleStyle: {
							borderColor: '#e17d7d',
							borderWidth: 2,
							shadowBlur: 6
						}
					},

					// 指示器样式
					indicatorStyle: {
						color: '#c80019',
						borderColor: '#ffffff',
						borderWidth: 2,
						shadowBlur: 4
					}
				},
				xAxis3D: {
					type: 'category',
					data: xx,
					axisLabel: {
						interval: 0,
						fontSize: 12,
						fontWeight: '600',
						color: '#222',
						rotate: 15,
						margin: 8 // 增加轴标签与轴线的距离
					},
					name: '位置',
					nameTextStyle: {
						fontSize: 14,
						fontWeight: '700',
						color: '#1a5f7a'
					},
					nameLocation: 'end', // 名称位置：start/middle/end
					nameGap: 50
				},
				yAxis3D: {
					type: 'category',
					data: yy,
					axisLabel: {
						interval: 0,
						fontSize: 12,
						fontWeight: '600',
						color: '#222',
						margin: 8
					},
					name: '症状',
					nameTextStyle: {
						fontSize: 14,
						fontWeight: '700',
						color: '#1a5f7a'
					},
					nameLocation: 'end',
					nameGap: 50
				},
				zAxis3D: {
					type: 'value',
					axisLabel: {
						color: '#222',
						fontSize: 11,
						fontWeight: '500',
						margin: 8
					},
					name: '呼救量',
					nameTextStyle: {
						fontSize: 14,
						fontWeight: '700',
						color: '#1a5f7a'
					},
					nameLocation: 'end',
					nameGap: 50
				},
				grid3D: {
					environment: '#f5f5f5',
					boxWidth: 400,
					boxDepth: 200,
					boxHeight: 200,
					viewControl: {
						autoRotate: true,
						autoRotateSpeed: 5,
						autoRotateAfterStill: 10,
						distance: 400,
						minDistance: 200,
						maxDistance: 700,
						alpha: 40,
						beta: 40,
						zoomSensitivity: 0.5,
						rotateSensitivity: 1,
						panSensitivity: 1,
						panMouseButton: 'right'
					},
					axisPointer: {
						show: true,
						lineStyle: {
							color: '#c60718',
							width: 1.5
						}
					},
					light: {
						main: {
							intensity: 1.5,
							shadow: false
						},
						ambient: {
							intensity: 0.3
						},
						auxiliary: {
							intensity: 0.6
						}
					}
				},
				series: [{
					type: 'bar3D',
					data: LocSymp.map(function(item) {
						return {
							value: [item[1], item[0], item[2]]
						};
					}),
					shading: 'lambert',
					label: {
						show: false
					},
					emphasis: {
						label: {
							show: true,
							fontSize: 14,
							fontWeight: '800',
							color: '#d67a71',
							backgroundColor: 'rgba(214, 122, 113, 0.1)',
							padding: [4, 8],
							borderRadius: 4
						},
						itemStyle: {
							color: '#d67a71',
							shadowBlur: 12,
							shadowColor: 'rgba(214, 122, 113, 0.6)'
						}
					}
				}]
			};

			// 保存原始数据映射
			const originalLocations = [...new Set(LocSymp.map((item) => item[1]))].sort();
			const originalSymptoms = [...new Set(LocSymp.map((item) => item[0]))].sort();

			// 保存到全局
			window.originalLocations = originalLocations;
			window.originalSymptoms = originalSymptoms;

			// 保存配置和实例到全局，供input.js使用
			chart3D.setOption(option3D);
			window.option3D = option3D;

			window.chart3DLoaded = true;
			checkAllChartsLoaded();

			window.chartHeatmap = chartHeatmap;
			window.chartPie = chartPie;
			window.chart3D = chart3D;

			// ==================== 添加3D图表交互提示 ====================
			if (!document.querySelector('.chart-3d-tip')) {
				const tip = document.createElement('div');
				tip.className = 'chart-3d-tip';
				tip.innerHTML = `
          <span>左键拖拽 → 旋转视角</span>
          <span>右键拖拽 → 平移视角</span>
          <span>鼠标滚轮 → 缩放视角</span>
        `;
				chart3dElement.appendChild(tip);
			}

			// ==================== 渲染与窗口自适应 ====================
			try {
				chart3D.setOption(option3D);
				window.addEventListener('resize', function() {
					chart3D.resize();
				});
			} catch (error) {
				console.error('3D图表初始化失败:', error);
			}
		}, 800); // 模拟异步加载结束
	})(); // 3D图表初始化结束

	// ==================== 辅助函数 ====================

	/**
	 * 检查所有图表是否加载完成
	 * @returns {void}
	 */
	function checkAllChartsLoaded() {
		if (window.chartHeatmapLoaded && window.chartPieLoaded && window.chart3DLoaded) {
			// 所有图表加载完成后，启用视差效果
			setTimeout(() => {
				if (window.parallax && window.parallax.toggle) {
					window.parallax.toggle(true);
					console.log('所有图表加载完成，视差效果已启用');
				}
			}, 500);
		}
	}

	/**
	 * 显示加载动画
	 * @param {HTMLElement} container - 要显示加载动画的容器
	 * @returns {void}
	 */
	function showLoading(container) {
		const loadingHtml = `
      <div class="chart-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">数据加载中...</div>
      </div>
    `;
		container.innerHTML = loadingHtml;
	}

	/**
	 * 全局显示加载函数（供input.js调用）
	 * @param {HTMLElement} container - 要显示加载动画的容器
	 * @returns {void}
	 */
	window.showLoading = function(container) {
		const loadingHtml = `
      <div class="chart-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">数据更新中...</div>
      </div>
    `;
		container.innerHTML = loadingHtml;
	};
}); // DOMContentLoaded结束
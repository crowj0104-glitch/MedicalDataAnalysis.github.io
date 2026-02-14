// ==================== 数据更新函数 ====================

/**
 * 1. 更新热力图数据
 * 功能：解析用户输入的文本数据，更新热力图图表
 * @returns {void}
 */
function updateHeatmap() {
	const inputEl = document.getElementById('heatmap-input');
	const inputValue = inputEl.value.trim();

	// 验证输入是否为空
	if (!inputValue) {
		alert('请输入热力图数据！');
		return;
	}

	// 使用全局定义的映射（从index.js中获取）
	const timeMap = window.timeMap || {
		'上午（6-11点）': 0,
		'下午（12-17点）': 1,
		'晚上（18-23点）': 2,
		'凌晨（0-5点）': 3
	};

	const ageMap = window.ageMap || {
		'0-14岁（儿童）': 0,
		'15-35岁（青年）': 1,
		'36-59岁（中年）': 2,
		'60-80岁（老年）': 3,
		'80岁以上（高龄）': 4,
		'未知年龄': 5
	};

	/** 解析后的新数据 */
	let newData = [];

	/** 使用的时间段集合 */
	let usedTimeSlots = new Set();

	/** 使用的年龄段集合 */
	let usedAgeGroups = new Set();

	/** 数据最大值 */
	let maxValue = 0;

	// ========== 数据解析 ==========
	try {
		const lines = inputValue.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			const parts = line.split(',').map(item => item.trim());
			if (parts.length < 3) {
				throw new Error(`第${i + 1}行：字段缺失（需按【时间段,年龄段,数值】输入）`);
			}

			const [timeCn, ageCn, valueStr] = parts;

			// 验证时间段
			if (!timeMap.hasOwnProperty(timeCn)) {
				const validTime = Object.keys(timeMap).join('、');
				throw new Error(`第${i + 1}行：时间段错误，可选值：${validTime}`);
			}

			// 验证年龄段
			if (!ageMap.hasOwnProperty(ageCn)) {
				const validAge = Object.keys(ageMap).join('、');
				throw new Error(`第${i + 1}行：年龄段错误，可选值：${validAge}`);
			}

			const value = Number(valueStr);
			if (isNaN(value) || value < 0) {
				throw new Error(`第${i + 1}行：数值必须为非负数字（当前：${valueStr}）`);
			}

			usedTimeSlots.add(timeCn);
			usedAgeGroups.add(ageCn);
			if (value > maxValue) maxValue = value;

			const timeIdx = timeMap[timeCn];
			const ageIdx = ageMap[ageCn];
			newData.push([timeIdx, ageIdx, value]);
		}

		if (newData.length === 0) {
			throw new Error('未解析到有效数据，请检查输入！');
		}
	} catch (e) {
		alert(`数据解析失败：${e.message}`);
		return;
	}

	// 显示加载动画
	const heatmapElement = document.getElementById('chart-heatmap');
	showLoading(heatmapElement);

	setTimeout(() => {
		// 准备图表数据：转换为 [年龄段索引, 时间段索引, 数值] 格式
		const formattedData = newData.map(item => [item[1], item[0], item[2] || '-']);

		// 动态生成坐标轴数据
		const dynamicXAxis = Object.keys(timeMap).filter(time => usedTimeSlots.has(time));
		const dynamicYAxis = Object.keys(ageMap).filter(age => usedAgeGroups.has(age));

		// 销毁并重新初始化图表
		if (window.chartHeatmap) {
			window.chartHeatmap.dispose();
		}

		if (window.hideEditPanel) {
			window.hideEditPanel();
		}

		window.chartHeatmap = echarts.init(heatmapElement);

		// 计算合适的最大值（向上取整到最近的百位）
		const adjustedMax = Math.ceil(maxValue / 100) * 100;

		// 更新配置选项
		const updatedOption = {
			...window.optionHeatmap,
			xAxis: {
				...window.optionHeatmap.xAxis,
				data: dynamicXAxis,
				axisLabel: {
					...window.optionHeatmap.xAxis.axisLabel,
					rotate: dynamicXAxis.length > 3 ? 15 : 0
				}
			},
			yAxis: {
				...window.optionHeatmap.yAxis,
				data: dynamicYAxis
			},
			visualMap: {
				...window.optionHeatmap.visualMap,
				max: adjustedMax,
				min: 0
			},
			series: [{
				...window.optionHeatmap.series[0],
				data: formattedData
			}]
		};

		// 应用新配置
		window.chartHeatmap.setOption(updatedOption);

		// 重新绑定点击事件
		window.chartHeatmap.on('click', function(params) {
			if (params.data) {
				window.chartHeatmap.dispatchAction({
					type: 'highlight',
					dataIndex: params.dataIndex
				});
				setTimeout(() => {
					window.chartHeatmap.dispatchAction({
						type: 'downplay',
						dataIndex: params.dataIndex
					});
				}, 1000);
			}
		});

		// 窗口自适应
		window.addEventListener('resize', () => window.chartHeatmap.resize());

		// 成功提示
		alert(
			`热力图数据更新成功！\n` +
			`共解析${newData.length}条有效数据\n` +
			`覆盖${dynamicXAxis.length}个时间段 × ${dynamicYAxis.length}个年龄段\n` +
			`最大呼救量：${maxValue}`
		);
	}, 500);
}

/**
 * 2. 更新饼图数据
 * 功能：解析用户输入的文本数据，更新双层饼图图表
 * @returns {void}
 */
function updatePie() {
	const inputEl = document.getElementById('pie-input');
	const inputValue = inputEl.value.trim();

	if (!inputValue) {
		alert('请输入饼图数据！');
		return;
	}

	// 解析输入数据
	let newData = [];
	try {
		const lines = inputValue.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			const parts = line.split(',').map(item => item.trim());
			if (parts.length < 2) {
				throw new Error(`第${i + 1}行：格式错误，应为【病症名称,数值】`);
			}

			const [name, valueStr] = parts;
			const value = Number(valueStr);

			if (!name || isNaN(value)) {
				throw new Error(`第${i + 1}行：数值必须是有效数字`);
			}

			newData.push({
				name,
				value
			});
		}

		if (newData.length === 0) {
			throw new Error('未解析到有效数据！');
		}
	} catch (e) {
		alert(`数据解析失败：${e.message}`);
		return;
	}

	// 显示加载动画
	const pieElement = document.getElementById('chart-pie');
	showLoading(pieElement);

	setTimeout(() => {
		/**
		 * 动态计算最大三类数据
		 * @param {Array} dataArray - 饼图数据数组
		 * @returns {Array} 数值最大的前三个数据项
		 */
		function getTopThreeData(dataArray) {
			const sortedData = [...dataArray].sort((a, b) => b.value - a.value);
			return sortedData.slice(0, 3);
		}

		const topThreeData = getTopThreeData(newData);

		// 销毁旧图表实例
		if (window.chartPie) {
			window.chartPie.dispose();
		}

		if (window.hideEditPanel) {
			window.hideEditPanel();
		}

		// 重新初始化图表
		window.chartPie = echarts.init(pieElement);

		// 更新配置（保留原有样式，包括图例配置）
		const updatedOption = {
			...window.optionPie,
			legend: {
				...window.optionPie.legend,
				data: newData.map(item => item.name),
				formatter: function(name) {
					// 显示名称和对应的数值
					const item = newData.find(d => d.name === name);
					return item ? `${name}: ${item.value}` : name;
				}
			},
			series: [{
					...window.optionPie.series[0],
					data: topThreeData
				},
				{
					...window.optionPie.series[1],
					data: newData,
					center: ['40%', '50%']
				}
			]
		};

		window.chartPie.setOption(updatedOption);

		// 重新绑定点击事件
		window.chartPie.on('click', function(params) {
			if (params.data) {
				window.chartPie.dispatchAction({
					type: 'highlight',
					dataIndex: params.dataIndex
				});
				setTimeout(() => {
					window.chartPie.dispatchAction({
						type: 'downplay',
						dataIndex: params.dataIndex
					});
				}, 1000);
			}
		});

		// 窗口自适应
		window.addEventListener('resize', () => window.chartPie.resize());

		alert(
			`饼图数据更新成功！\n` +
			`共更新${newData.length}种病症数据\n` +
			`内环显示数值最大的三类：${topThreeData.map(d => d.name).join('、')}`
		);
	}, 500);
}

/**
 * 3. 更新3D柱状图数据
 * 功能：解析用户输入的文本数据，更新3D柱状图图表
 * @returns {void}
 */
function update3D() {
	const inputEl = document.getElementById('3d-input');
	const inputValue = inputEl.value.trim();

	// 验证输入是否为空
	if (!inputValue) {
		alert('请输入3D图表数据！');
		return;
	}

	// 解析输入数据
	let newData = [];
	let symptomSet = new Set();
	let locationSet = new Set();
	let maxValue = 0;
	let minValue = Infinity;

	try {
		const lines = inputValue.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) continue;

			const parts = line.split(',').map(item => item.trim());
			if (parts.length < 3) {
				throw new Error(`第${i + 1}行：格式错误，应为【症状名称,位置名称,数值】`);
			}

			const [symptom, location, valueStr] = parts;
			const value = Number(valueStr);

			// 验证数据有效性
			if (!symptom || !location) {
				throw new Error(`第${i + 1}行：症状名称和位置名称不能为空`);
			}

			if (isNaN(value)) {
				throw new Error(`第${i + 1}行：数值必须是有效数字（当前：${valueStr}）`);
			}

			if (value < 0) {
				throw new Error(`第${i + 1}行：数值不能为负数（当前：${value}）`);
			}

			// 记录唯一的症状和位置
			symptomSet.add(symptom);
			locationSet.add(location);

			// 更新最大值和最小值
			if (value > maxValue) maxValue = value;
			if (value < minValue) minValue = value;

			newData.push([symptom, location, value]);
		}

		// 检查是否有有效数据
		if (newData.length === 0) {
			throw new Error('未解析到有效数据！');
		}

		// 检查数据量是否合理（避免图表过于拥挤）
		if (symptomSet.size > 20) {
			const confirmContinue = confirm(
				`警告：症状种类过多（${symptomSet.size}种），可能会导致图表显示拥挤\n` +
				`是否继续？`
			);
			if (!confirmContinue) return;
		}

		if (locationSet.size > 30) {
			const confirmContinue = confirm(
				`警告：位置种类过多（${locationSet.size}个），可能会导致图表显示拥挤\n` +
				`是否继续？`
			);
			if (!confirmContinue) return;
		}
	} catch (e) {
		alert(`数据解析失败：${e.message}`);
		return;
	}

	// 显示加载动画
	const chart3dElement = document.getElementById('chart-3d');
	showLoading(chart3dElement);

	// 模拟加载延迟（500ms）
	setTimeout(() => {
		// 提取唯一的位置和症状列表（排序以保持一致性）
		const locations = Array.from(locationSet).sort();
		const symptoms = Array.from(symptomSet).sort();

		// 计算合适的最大值（向上取整到最近的10、50或100）
		let adjustedMax;
		if (maxValue <= 10) {
			adjustedMax = Math.ceil(maxValue);
		} else if (maxValue <= 50) {
			adjustedMax = Math.ceil(maxValue / 5) * 5;
		} else {
			adjustedMax = Math.ceil(maxValue / 10) * 10;
		}

		// 创建数据映射，确保所有组合都有数据（缺失的设为0）
		const dataMap = new Map();
		newData.forEach(([symptom, location, value]) => {
			const key = `${symptom}|${location}`;
			dataMap.set(key, value);
		});

		// 构建完整的数据矩阵
		const formattedData = [];
		symptoms.forEach(symptom => {
			locations.forEach(location => {
				const key = `${symptom}|${location}`;
				const value = dataMap.has(key) ? dataMap.get(key) : 0;
				formattedData.push({
					value: [location, symptom, value],
					itemStyle: {
						color: value === 0 ? '#f0f0f0' : undefined
					}
				});
			});
		});

		// 销毁旧图表实例
		if (window.chart3D) {
			window.chart3D.dispose();
		}

		if (window.hideEditPanel) {
			window.hideEditPanel();
		}

		// 重新初始化图表
		window.chart3D = echarts.init(chart3dElement);

		// 保存当前视图状态（如果有）
		const currentView = window.chart3D && window.chart3D.getOption() ?
			window.chart3D.getOption().grid3D.viewControl :
			null;

		// 动态调整3D盒子大小基于数据量
		const boxWidth = Math.min(400 + (locations.length * 10), 800);
		const boxDepth = Math.min(200 + (symptoms.length * 10), 400);

		// 调整标签字体大小基于数量
		const xAxisFontSize = Math.max(8, Math.min(15, 15 - Math.floor(locations.length / 10)));
		const yAxisFontSize = Math.max(8, Math.min(15, 15 - Math.floor(symptoms.length / 5)));

		// 更新配置（保留原有样式，动态更新坐标轴和视觉映射）
		const updatedOption = {
			...window.option3D,
			xAxis3D: {
				...window.option3D.xAxis3D,
				data: locations,
				axisLabel: {
					...window.option3D.xAxis3D.axisLabel,
					fontSize: xAxisFontSize,
					interval: 0,
					rotate: locations.length > 10 ? 45 : 0
				},
				nameTextStyle: {
					...window.option3D.xAxis3D.nameTextStyle
				}
			},
			yAxis3D: {
				...window.option3D.yAxis3D,
				data: symptoms,
				axisLabel: {
					...window.option3D.yAxis3D.axisLabel,
					fontSize: yAxisFontSize
				},
				nameTextStyle: {
					...window.option3D.yAxis3D.nameTextStyle
				}
			},
			zAxis3D: {
				...window.option3D.zAxis3D,
				max: adjustedMax,
				min: 0,
				axisLabel: {
					...window.option3D.zAxis3D.axisLabel
				},
				nameTextStyle: {
					...window.option3D.zAxis3D.nameTextStyle
				}
			},
			visualMap: {
				...window.option3D.visualMap,
				max: adjustedMax,
				min: minValue === Infinity ? 0 : minValue
			},
			grid3D: {
				...window.option3D.grid3D,
				boxWidth: boxWidth,
				boxDepth: boxDepth,
				viewControl: currentView || window.option3D.grid3D.viewControl
			},
			series: [{
				...window.option3D.series[0],
				data: formattedData,
				label: {
					...window.option3D.series[0].label,
					formatter: function(params) {
						return params.value[2] > 0 ? params.value[2] : '';
					},
					fontSize: Math.max(8, 12 - Math.floor((symptoms.length * locations.length) /
						50))
				}
			}]
		};

		window.chart3D.setOption(updatedOption);

		// 重新添加交互提示
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

		// 窗口自适应
		window.addEventListener('resize', () => {
			if (window.chart3D) {
				window.chart3D.resize();
			}
		});

		// 计算统计数据
		const totalValue = newData.reduce((sum, item) => sum + item[2], 0);
		const avgValue = totalValue / newData.length;

		setTimeout(() => {
			// 确保视角控制按钮存在
			if (window.chart3DControls && window.chart3DControls.ensureControls) {
				window.chart3DControls.ensureControls();
			}

			// 恢复之前保存的视角状态（默认等轴侧）
			if (window.chart3DControls && window.chart3DControls.setView) {
				// 可以保存用户上次使用的视角，这里简单使用默认值
				window.chart3DControls.setView('isometric');
			}
		}, 100); // 在图表渲染完成后立即执行

		// 成功提示
		alert(
			`3D图表数据更新成功！\n` +
			`共解析${newData.length}条有效数据\n` +
			`覆盖${symptoms.length}种症状 × ${locations.length}个位置\n` +
			`最大呼救量：${maxValue}\n` +
			`平均呼救量：${avgValue.toFixed(1)}`
		);
	}, 500);
}

// ==================== 全局函数注册 ====================

// 确保函数在全局可用，供HTML中的onclick事件调用
window.updateHeatmap = updateHeatmap;
window.updatePie = updatePie;
window.update3D = update3D;
// ==================== 3D图表视角控制模块 ====================
// 修改点1: 将视角控制与图表实例解耦，通过ID定位容器
// 修改点2: 增加ensureViewControls函数，确保按钮始终存在
// 修改点3: 重写update3D函数，保留视角控制
// 修改点4: 增加状态管理，记住当前视角

(function() {
	'use strict';

	// ==================== 视角配置 ====================

	/**
	 * 视角预设配置
	 * @constant {Object}
	 */
	const VIEW_PRESETS = {
		top: {
			id: 'top',
			icon: '⬆️',
			label: '俯视',
			alpha: 90,
			beta: 0,
			distance: 500,
			autoRotate: false,
			tip: '俯视图 (X-Z平面)'
		},
		side: {
			id: 'side',
			icon: '⬅️',
			label: '侧视',
			alpha: 0,
			beta: 90,
			distance: 500,
			autoRotate: false,
			tip: '侧视图 (Y轴方向)'
		},
		front: {
			id: 'front',
			icon: '⬇️',
			label: '正视',
			alpha: 0,
			beta: 0,
			distance: 500,
			autoRotate: false,
			tip: '正视图 (X轴方向)'
		},
		isometric: {
			id: 'isometric',
			icon: '🔲',
			label: '等轴',
			alpha: 45,
			beta: 45,
			distance: 450,
			autoRotate: false,
			tip: '等轴侧视图 (立体感)'
		},
		reset: {
			id: 'reset',
			icon: '🔄',
			label: '重置',
			alpha: 40,
			beta: 40,
			distance: 400,
			autoRotate: true,
			tip: '重置视角并恢复自动旋转'
		}
	};

	// ==================== 状态管理 ====================

	/** 当前视角ID */
	let currentViewId = 'isometric';

	/** 视角控制是否已初始化 */
	let isViewControlsInitialized = false;

	// ==================== 核心API ====================

	/**
	 * 确保3D图表视角控制按钮存在
	 * 此函数可以被多次调用，不会重复创建
	 * @returns {boolean} 是否成功创建/获取
	 */
	function ensureViewControls() {
		const chartContainer = get3DChartContainer();
		if (!chartContainer) {
			console.warn('3D图表容器未找到，稍后重试...');
			return false;
		}

		// 检查是否已存在视角控制
		let viewControls = chartContainer.querySelector('.chart-3d-view-controls');

		if (!viewControls) {
			// 创建新的视角控制按钮
			viewControls = createViewControls();
			chartContainer.appendChild(viewControls);
			console.log('3D视角控制按钮已创建');
		}

		// 确保激活状态正确
		updateActiveState(currentViewId);

		return true;
	}

	/**
	 * 获取3D图表的父容器（用于放置视角控制按钮）
	 * @returns {HTMLElement|null} 图表容器元素
	 */
	function get3DChartContainer() {
		// 获取3D图表元素
		const chart3d = document.getElementById('chart-3d');
		if (!chart3d) return null;

		// 返回父容器 .chart-container
		return chart3d.closest('.chart-container');
	}

	/**
	 * 创建视角控制按钮DOM
	 * @returns {HTMLElement} 视角控制容器元素
	 */
	function createViewControls() {
		const controls = document.createElement('div');
		controls.className = 'chart-3d-view-controls';

		// 按顺序添加预设视角
		const presetOrder = ['top', 'side', 'front', 'isometric', 'reset'];

		presetOrder.forEach(presetId => {
			const preset = VIEW_PRESETS[presetId];
			if (!preset) return;

			const btn = document.createElement('button');
			btn.className = `view-btn ${presetId === 'reset' ? 'reset-btn' : ''}`;
			btn.setAttribute('data-view', presetId);

			// 图标
			const iconSpan = document.createElement('span');
			iconSpan.className = 'view-icon';
			iconSpan.textContent = preset.icon;

			// 标签
			const labelSpan = document.createElement('span');
			labelSpan.className = 'view-text';
			labelSpan.textContent = preset.label;

			// 工具提示
			const tooltipSpan = document.createElement('span');
			tooltipSpan.className = 'view-tooltip';
			tooltipSpan.textContent = preset.tip;

			btn.appendChild(iconSpan);
			btn.appendChild(labelSpan);
			btn.appendChild(tooltipSpan);

			// 绑定点击事件
			btn.addEventListener('click', function(e) {
				e.stopPropagation();
				setViewPreset(presetId);
			});

			controls.appendChild(btn);
		});

		return controls;
	}

	/**
	 * 设置视角预设
	 * @param {string} viewId - 视角ID (top/side/front/isometric/reset)
	 * @returns {void}
	 */
	function setViewPreset(viewId) {
		if (!window.chart3D) {
			console.warn('3D图表实例不存在');
			return;
		}

		const preset = VIEW_PRESETS[viewId];
		if (!preset) return;

		try {
			// 获取当前配置
			const option = window.chart3D.getOption();

			// 确保grid3D存在
			if (!option.grid3D || !option.grid3D[0]) {
				console.warn('grid3D配置不存在');
				return;
			}

			// 更新视角参数
			const viewControl = option.grid3D[0].viewControl || {};
			viewControl.alpha = preset.alpha;
			viewControl.beta = preset.beta;
			viewControl.distance = preset.distance;
			viewControl.autoRotate = preset.autoRotate || false;

			if (preset.autoRotate) {
				viewControl.autoRotateSpeed = 5;
			}

			// 应用设置
			window.chart3D.setOption({
				grid3D: {
					viewControl: viewControl
				}
			});

			// 更新当前视角ID
			currentViewId = viewId;

			// 更新按钮激活状态
			updateActiveState(viewId);

			// 显示提示
			showViewTip(preset.tip);

			// 重置按钮特殊处理：短暂激活后移除
			if (viewId === 'reset') {
				setTimeout(() => {
					updateActiveState(currentViewId);
				}, 800);
			}

		} catch (error) {
			console.error('视角切换失败:', error);
		}
	}

	/**
	 * 更新按钮激活状态
	 * @param {string} activeViewId - 当前激活的视角ID
	 * @returns {void}
	 */
	function updateActiveState(activeViewId) {
		const chartContainer = get3DChartContainer();
		if (!chartContainer) return;

		const viewControls = chartContainer.querySelector('.chart-3d-view-controls');
		if (!viewControls) return;

		viewControls.querySelectorAll('.view-btn').forEach(btn => {
			const viewId = btn.getAttribute('data-view');
			btn.classList.toggle('active', viewId === activeViewId);
		});
	}

	/**
	 * 显示视角切换提示
	 * @param {string} message - 提示信息
	 * @returns {void}
	 */
	function showViewTip(message) {
		const chartContainer = get3DChartContainer();
		if (!chartContainer) return;

		let tip = chartContainer.querySelector('.chart-3d-temp-tip');
		if (!tip) {
			tip = document.createElement('div');
			tip.className = 'chart-3d-temp-tip';
			chartContainer.appendChild(tip);
		}

		tip.textContent = `📐 视角：${message}`;
		tip.style.display = 'block';
		tip.style.opacity = '1';

		clearTimeout(tip.hideTimeout);
		tip.hideTimeout = setTimeout(() => {
			tip.style.opacity = '0';
			setTimeout(() => {
				tip.style.display = 'none';
			}, 300);
		}, 2000);
	}

	// ==================== 初始化与监听 ====================

	/**
	 * 初始化视角控制
	 * @returns {void}
	 */
	function initViewControls() {
		// 等待3D图表实例存在
		const checkInterval = setInterval(() => {
			if (window.chart3D) {
				clearInterval(checkInterval);

				// 确保按钮存在
				ensureViewControls();

				// 设置默认视角（等轴侧）
				setTimeout(() => {
					setViewPreset('isometric');
					isViewControlsInitialized = true;
					console.log('3D视角控制初始化完成');
				}, 500);
			}
		}, 300);
	}

	// ==================== 重写update3D函数 ====================
	// 修改点：完全重写update3D函数，确保更新后视角控制按钮不丢失

	/**
	 * 重写全局update3D函数
	 * @returns {void}
	 */
	function overrideUpdate3D() {
		const originalUpdate3D = window.update3D;

		window.update3D = function() {
			// 调用原始的update3D函数
			if (originalUpdate3D) {
				originalUpdate3D();
			}

			// 等待图表更新完成
			setTimeout(() => {
				// 确保视角控制按钮存在
				ensureViewControls();

				// 恢复之前的视角状态
				if (window.chart3D && currentViewId) {
					setViewPreset(currentViewId);
				}

				// 强制重绘
				if (window.chart3D) {
					window.chart3D.resize();
				}
			}, 600); // 必须大于update3D内部的500ms延迟
		};

		console.log('3D数据更新函数已增强：视角控制保留');
	}

	// ==================== 事件监听 ====================

	/**
	 * 监听编辑面板事件
	 * @returns {void}
	 */
	function bindEditPanelEvents() {
		// 编辑面板打开
		document.addEventListener('editPanelOpened', function() {
			const chartContainer = get3DChartContainer();
			if (chartContainer) {
				const viewControls = chartContainer.querySelector('.chart-3d-view-controls');
				if (viewControls) {
					viewControls.style.opacity = '0.4';
					viewControls.style.pointerEvents = 'none';
				}
			}
		});

		// 编辑面板关闭
		document.addEventListener('editPanelClosed', function() {
			const chartContainer = get3DChartContainer();
			if (chartContainer) {
				const viewControls = chartContainer.querySelector('.chart-3d-view-controls');
				if (viewControls) {
					viewControls.style.opacity = '1';
					viewControls.style.pointerEvents = 'auto';
				}
			}
		});
	}

	/**
	 * 监听滑块切换，确保视角控制按钮依然存在
	 * @returns {void}
	 */
	function bindSliderEvents() {
		document.addEventListener('sliderChange', function(e) {
			// 只有当切换到3D图表时才需要检查
			const index = e.detail.currentIndex;
			if (index === 2) { // 3D图表是第3个滑块
				setTimeout(() => {
					ensureViewControls();
					// 恢复视角状态
					if (window.chart3D && currentViewId) {
						setViewPreset(currentViewId);
					}
				}, 100);
			}
		});
	}

	// ==================== 启动 ====================

	/**
	 * 启动所有功能
	 * @returns {void}
	 */
	function startup() {
		// 等待DOM加载
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', function() {
				initViewControls();
				overrideUpdate3D();
				bindEditPanelEvents();
				bindSliderEvents();
			});
		} else {
			initViewControls();
			overrideUpdate3D();
			bindEditPanelEvents();
			bindSliderEvents();
		}

		// 添加全局访问接口
		window.chart3DControls = {
			setView: setViewPreset,
			getCurrentView: () => currentViewId,
			ensureControls: ensureViewControls
		};
	}

	// 启动
	startup();

})();
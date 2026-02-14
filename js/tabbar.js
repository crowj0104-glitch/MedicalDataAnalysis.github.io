// ==================== 底部图表标签栏交互 ====================

document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// ==================== 配置 ====================

	/** 标签栏配置 */
	const TABBAR_CONFIG = {
		autoHideDelay: 0, // 自动收起延迟（毫秒），0 表示不自动收起
		initialExpanded: true // 初始是否展开
	};

	// ==================== 状态变量 ====================

	/** 标签栏是否展开 */
	let isTabbarExpanded = TABBAR_CONFIG.initialExpanded;

	/** 自动收起定时器ID */
	let autoHideTimer = null;

	// ==================== DOM 元素 ====================

	/** 标签栏元素 */
	let tabbar = document.querySelector('.chart-tabbar');

	/** 滑块轨道 */
	const sliderTrack = document.querySelector('.slider-track');

	/** 所有导航点 */
	const dots = document.querySelectorAll('.dot');

	// ==================== 创建标签栏 ====================

	/**
	 * 创建标签栏DOM结构
	 * @returns {void}
	 */
	function createTabbar() {
		// 如果已存在，直接返回
		if (document.querySelector('.chart-tabbar')) {
			tabbar = document.querySelector('.chart-tabbar');
			return;
		}

		// 创建标签栏容器
		tabbar = document.createElement('div');
		tabbar.className = 'chart-tabbar';
		if (isTabbarExpanded) tabbar.classList.add('expanded');

		// 创建收起/展开手柄
		const handle = document.createElement('div');
		handle.className = 'tabbar-handle';
		handle.setAttribute('aria-label', '切换图表标签栏');
		tabbar.appendChild(handle);

		// 定义标签数据
		const tabs = [{
				id: 'heatmap',
				icon: '📊',
				label: '时段分布'
			},
			{
				id: 'pie',
				icon: '🥧',
				label: '病症统计'
			},
			{
				id: '3d',
				icon: '📈',
				label: '位置统计'
			}
		];

		// 创建标签项
		tabs.forEach((tab, index) => {
			const item = document.createElement('button');
			item.className = 'tabbar-item';
			item.setAttribute('data-tab', tab.id);
			item.setAttribute('data-index', index);

			// 图标
			const iconSpan = document.createElement('span');
			iconSpan.className = 'tabbar-icon';
			iconSpan.textContent = tab.icon;

			// 标签文字
			const labelSpan = document.createElement('span');
			labelSpan.className = 'tabbar-label';
			labelSpan.textContent = tab.label;

			item.appendChild(iconSpan);
			item.appendChild(labelSpan);
			tabbar.appendChild(item);
		});

		document.body.appendChild(tabbar);
	}

	// ==================== 标签栏状态控制 ====================

	/**
	 * 展开标签栏
	 * @returns {void}
	 */
	function expandTabbar() {
		if (!tabbar) return;
		tabbar.classList.add('expanded');
		isTabbarExpanded = true;
		clearAutoHideTimer();
	}

	/**
	 * 收起标签栏
	 * @returns {void}
	 */
	function collapseTabbar() {
		if (!tabbar) return;
		tabbar.classList.remove('expanded');
		isTabbarExpanded = false;
	}

	/**
	 * 切换标签栏展开/收起
	 * @returns {void}
	 */
	function toggleTabbar() {
		if (isTabbarExpanded) {
			collapseTabbar();
		} else {
			expandTabbar();
		}
	}

	/**
	 * 清除自动收起定时器
	 * @returns {void}
	 */
	function clearAutoHideTimer() {
		if (autoHideTimer) {
			clearTimeout(autoHideTimer);
			autoHideTimer = null;
		}
	}

	/**
	 * 重置自动收起定时器（当用户交互时）
	 * @returns {void}
	 */
	function resetAutoHideTimer() {
		if (TABBAR_CONFIG.autoHideDelay <= 0) return;

		clearAutoHideTimer();
		if (isTabbarExpanded) {
			autoHideTimer = setTimeout(() => {
				collapseTabbar();
			}, TABBAR_CONFIG.autoHideDelay);
		}
	}

	// ==================== 切换图表（与滑块联动）====================

	/**
	 * 切换到指定索引的图表
	 * @param {number} index - 0:热力图, 1:饼图, 2:3D图
	 * @returns {void}
	 */
	function switchToChart(index) {
		// 1. 更新滑块
		if (window.goToIndex) {
			window.goToIndex(index);
		} else {
			// 降级方案：直接操作滑块
			if (sliderTrack) {
				sliderTrack.style.transform = `translateX(-${index * 100}%)`;
			}
			// 更新指示点
			dots.forEach((dot, i) => {
				dot.classList.toggle('active', i === index);
			});
		}

		// 2. 更新标签栏激活状态
		const tabItems = tabbar.querySelectorAll('.tabbar-item');
		tabItems.forEach((item, i) => {
			item.classList.toggle('active', i === index);
		});

		// 3. 触发图表自适应
		setTimeout(() => {
			if (index === 0 && window.chartHeatmap) window.chartHeatmap.resize();
			if (index === 1 && window.chartPie) window.chartPie.resize();
			if (index === 2 && window.chart3D) window.chart3D.resize();
		}, 100);
	}

	// ==================== 事件绑定 ====================

	/**
	 * 初始化事件监听
	 * @returns {void}
	 */
	function bindEvents() {
		if (!tabbar) return;

		// 1. 手柄点击：切换展开/收起
		const handle = tabbar.querySelector('.tabbar-handle');
		if (handle) {
			handle.addEventListener('click', (e) => {
				e.stopPropagation();
				toggleTabbar();
				resetAutoHideTimer();
			});
		}

		// 2. 标签项点击：切换图表 + 展开标签栏（如果已收起）
		const tabItems = tabbar.querySelectorAll('.tabbar-item');
		tabItems.forEach((item, index) => {
			item.addEventListener('click', (e) => {
				e.stopPropagation();
				switchToChart(index);
				expandTabbar(); // 点击标签时自动展开（便于继续切换）
				resetAutoHideTimer();
			});
		});

		// 3. 鼠标移入标签栏：暂停自动收起
		tabbar.addEventListener('mouseenter', () => {
			clearAutoHideTimer();
		});

		tabbar.addEventListener('mouseleave', () => {
			resetAutoHideTimer();
		});

		// 4. 监听滑块切换（来自 slider.js 的事件）
		document.addEventListener('sliderChange', function(e) {
			const index = e.detail.currentIndex;
			switchToChart(index);
		});

		// 5. 监听页面点击，自动收起（可选）
		document.addEventListener('click', function(e) {
			// 如果点击的不是标签栏内部，且标签栏是展开状态，且启用了自动隐藏
			if (tabbar && !tabbar.contains(e.target) && isTabbarExpanded) {
				resetAutoHideTimer();
			}
		});

		// 6. 编辑面板打开时，降低标签栏层级
		document.addEventListener('editPanelOpened', function() {
			document.body.classList.add('edit-panel-open');
		});

		document.addEventListener('editPanelClosed', function() {
			document.body.classList.remove('edit-panel-open');
		});

		// 兼容现有的 hideAllPanels / showEditPanel
		const originalShowEditPanel = window.showEditPanel;
		if (originalShowEditPanel) {
			window.showEditPanel = function(chartType) {
				document.body.classList.add('edit-panel-open');
				originalShowEditPanel(chartType);
			};
		}

		const originalHideEditPanel = window.hideEditPanel;
		if (originalHideEditPanel) {
			window.hideEditPanel = function() {
				document.body.classList.remove('edit-panel-open');
				originalHideEditPanel();
			};
		}
	}

	// ==================== 初始化 ====================

	/**
	 * 初始化标签栏
	 * @returns {void}
	 */
	function initTabbar() {
		createTabbar();

		// 获取当前激活的滑块索引
		let initialIndex = 0;
		const activeDot = document.querySelector('.dot.active');
		if (activeDot) {
			initialIndex = parseInt(activeDot.getAttribute('data-index')) || 0;
		}

		// 设置初始激活状态
		setTimeout(() => {
			switchToChart(initialIndex);
			if (isTabbarExpanded) {
				expandTabbar();
			}
			bindEvents();
			resetAutoHideTimer();
			console.log('底部图表标签栏已初始化');
		}, 2000); // 延迟一点确保其他组件已加载
	}

	// 等待 DOM 完全加载
	setTimeout(initTabbar, 1500);

	// ==================== 全局导出 ====================

	window.tabbar = {
		expand: expandTabbar,
		collapse: collapseTabbar,
		toggle: toggleTabbar,
		switchTo: switchToChart,
		isExpanded: () => isTabbarExpanded
	};
});
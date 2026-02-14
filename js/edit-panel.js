// ==================== 编辑面板交互逻辑 ====================

document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// ==================== 变量声明 ====================

	/** 所有编辑按钮 */
	const editButtons = document.querySelectorAll('.edit-btn');

	/** 所有编辑面板 */
	const editPanels = document.querySelectorAll('.edit-panel');

	/** 遮罩层元素 - 不存在则创建 */
	let overlay = document.querySelector('.overlay');
	if (!overlay) {
		overlay = document.createElement('div');
		overlay.className = 'overlay';
		document.body.appendChild(overlay);
	}

	/** 当前活动的编辑面板 */
	let activePanel = null;

	// ==================== 拖动相关变量 ====================

	/** 是否正在拖动 */
	let isDragging = false;

	/** 拖动起始X坐标 */
	let dragStartX = 0;

	/** 拖动起始Y坐标 */
	let dragStartY = 0;

	/** 面板起始X坐标 */
	let panelStartX = 0;

	/** 面板起始Y坐标 */
	let panelStartY = 0;

	/** 当前被拖动的面板 */
	let currentDraggingPanel = null;

	// ==================== 核心功能函数 ====================

	/**
	 * 显示编辑面板
	 * @param {string} chartType - 图表类型: heatmap, pie, 3d
	 * @returns {void}
	 */
	function showEditPanel(chartType) {
		// 隐藏所有面板
		hideAllPanels();

		// 显示对应面板
		const panelId = `edit-panel-${chartType}`;
		const panel = document.getElementById(panelId);

		if (panel) {
			// 统一从右侧飞入
			const animationClass = 'slide-in-right';

			// 移除可能的动画类
			panel.classList.remove('slide-in-right', 'slide-in-left');

			// 设置初始状态（统一从右侧飞出）
			panel.style.left = 'auto';
			panel.style.right = '-100%';
			panel.style.top = '50%';
			panel.style.transform = 'translateY(-50%) scale(0.9)';
			panel.style.opacity = '0';

			// 显示面板和遮罩层
			panel.style.display = 'block';
			overlay.style.display = 'block';

			// 强制重排，确保初始状态生效
			panel.offsetHeight;

			// 添加动画类
			panel.classList.add(animationClass);

			// 遮罩层淡入
			setTimeout(() => {
				overlay.classList.add('show');
			}, 10);

			// 添加到活动面板
			activePanel = panel;

			// 禁用滑块导航
			disableSliderNavigation(true);

			// 将焦点设置到文本区域
			const textarea = panel.querySelector('textarea');
			if (textarea) {
				// 动画结束后设置焦点
				setTimeout(() => {
					textarea.focus();
					// 移动光标到文本末尾
					textarea.setSelectionRange(textarea.value.length, textarea.value.length);
				}, 400);
			}

			// 阻止页面滚动
			document.body.style.overflow = 'hidden';
		}
	}

	/**
	 * 隐藏所有编辑面板
	 * @returns {void}
	 */
	function hideAllPanels() {
		editPanels.forEach(panel => {
			// 移除动画类
			panel.classList.remove('slide-in-right', 'slide-in-left');

			// 恢复默认样式
			panel.style.opacity = '';
			panel.style.transform = '';
			panel.style.display = 'none';
			panel.classList.remove('dragging');
		});

		// 遮罩层淡出
		overlay.classList.remove('show');

		// 等待过渡完成后隐藏遮罩层
		setTimeout(() => {
			overlay.style.display = 'none';
		}, 300);

		// 重置活动面板
		activePanel = null;

		// 重置拖动状态
		isDragging = false;
		currentDraggingPanel = null;

		// 启用滑块导航
		disableSliderNavigation(false);

		// 恢复页面滚动
		document.body.style.overflow = '';
	}

	// ==================== 拖动功能函数 ====================

	/**
	 * 开始拖动面板
	 * @param {Event} e - 鼠标事件
	 * @param {HTMLElement} panel - 被拖动的面板元素
	 * @returns {void}
	 */
	function startDrag(e, panel) {
		e.preventDefault();
		e.stopPropagation();

		isDragging = true;
		currentDraggingPanel = panel;

		// 获取鼠标起始位置
		dragStartX = e.clientX || e.touches[0].clientX;
		dragStartY = e.clientY || e.touches[0].clientY;

		// 获取面板当前计算样式
		const computedStyle = window.getComputedStyle(panel);
		panelStartX = parseInt(computedStyle.left) || 0;
		panelStartY = parseInt(computedStyle.top) || 0;

		// 添加拖动类名
		panel.classList.add('dragging');

		// 临时移除居中定位
		panel.style.transform = 'none';
		panel.style.left = panelStartX + 'px';
		panel.style.top = panelStartY + 'px';

		// 添加事件监听器
		document.addEventListener('mousemove', onDragMove);
		document.addEventListener('mouseup', stopDrag);
		document.addEventListener('touchmove', onDragMove, {
			passive: false
		});
		document.addEventListener('touchend', stopDrag);
	}

	/**
	 * 处理拖动移动
	 * @param {Event} e - 鼠标事件
	 * @returns {void}
	 */
	function onDragMove(e) {
		if (!isDragging || !currentDraggingPanel) return;

		e.preventDefault();

		const clientX = e.clientX || (e.touches && e.touches[0].clientX);
		const clientY = e.clientY || (e.touches && e.touches[0].clientY);

		if (!clientX || !clientY) return;

		// 计算新的位置
		const deltaX = clientX - dragStartX;
		const deltaY = clientY - dragStartY;

		const newLeft = panelStartX + deltaX;
		const newTop = panelStartY + deltaY;

		// 边界检查：允许面板部分移出屏幕，但保持大部分可见
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const panelWidth = currentDraggingPanel.offsetWidth;
		const panelHeight = currentDraggingPanel.offsetHeight;

		// 限制在可视区域内,允许面板部分移出屏幕（50px边界）
		const minLeft = -panelWidth * 0.3; // 允许向左移出30%
		const maxLeft = viewportWidth - panelWidth * 0.7; // 允许向右移出30%
		const minTop = -panelHeight * 0.3; // 允许向上移出30%
		const maxTop = viewportHeight - panelHeight * 0.7; // 允许向下移出30%

		const boundedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
		const boundedTop = Math.max(minTop, Math.min(newTop, maxTop));

		// 更新面板位置
		currentDraggingPanel.style.left = boundedLeft + 'px';
		currentDraggingPanel.style.top = boundedTop + 'px';
	}

	/**
	 * 停止拖动
	 * @returns {void}
	 */
	function stopDrag() {
		if (!isDragging) return;

		isDragging = false;

		if (currentDraggingPanel) {
			currentDraggingPanel.classList.remove('dragging');
			currentDraggingPanel = null;
		}

		// 移除事件监听器
		document.removeEventListener('mousemove', onDragMove);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchmove', onDragMove);
		document.removeEventListener('touchend', stopDrag);
	}

	// ==================== 辅助功能函数 ====================

	/**
	 * 启用/禁用滑块导航
	 * @param {boolean} disabled - 是否禁用
	 * @returns {void}
	 */
	function disableSliderNavigation(disabled) {
		const prevBtn = document.querySelector('.slider-nav.prev');
		const nextBtn = document.querySelector('.slider-nav.next');
		const dots = document.querySelectorAll('.dot');

		if (prevBtn && nextBtn) {
			prevBtn.style.pointerEvents = disabled ? 'none' : 'auto';
			nextBtn.style.pointerEvents = disabled ? 'none' : 'auto';
			prevBtn.style.opacity = disabled ? '0.5' : '1';
			nextBtn.style.opacity = disabled ? '0.5' : '1';

			// 添加/移除禁用类
			if (disabled) {
				prevBtn.classList.add('navigation-disabled');
				nextBtn.classList.add('navigation-disabled');
			} else {
				prevBtn.classList.remove('navigation-disabled');
				nextBtn.classList.remove('navigation-disabled');
			}
		}

		dots.forEach(dot => {
			dot.style.pointerEvents = disabled ? 'none' : 'auto';
			dot.style.opacity = disabled ? '0.5' : '1';

			if (disabled) {
				dot.classList.add('navigation-disabled');
			} else {
				dot.classList.remove('navigation-disabled');
			}
		});
	}

	/**
	 * 初始化示例数据
	 * @returns {void}
	 */
	function initSampleData() {
		// 热力图示例数据
		const heatmapData = `上午（6-11点）,0-14岁（儿童）,69
下午（12-17点）,15-35岁（青年）,101
晚上（18-23点）,36-59岁（中年）,30
凌晨（0-5点）,60-80岁（老年）,72
上午（6-11点）,15-35岁（青年）,45
下午（12-17点）,36-59岁（中年）,88
晚上（18-23点）,60-80岁（老年）,120
凌晨（0-5点）,0-14岁（儿童）,25`;

		// 饼图示例数据
		const pieData = `车祸,2053
外伤,557
头晕,495
昏迷,489
醉酒类,375
肚子疼,373
抽搐,155`;

		// 3D图表示例数据
		const threeDData = `外伤,上望,23
外伤,中医院,4
外伤,仙降,32
外伤,南滨,4
外伤,场桥,8
外伤,塘下,65
头晕,上望,12
头晕,中医院,4
头晕,仙降,22
头晕,南滨,6
头晕,场桥,3
头晕,塘下,60`;

		// 设置到对应的textarea中
		const heatmapTextarea = document.getElementById('heatmap-input');
		const pieTextarea = document.getElementById('pie-input');
		const threeDTextarea = document.getElementById('3d-input');

		if (heatmapTextarea && !heatmapTextarea.value.trim()) {
			heatmapTextarea.value = heatmapData;
		}

		if (pieTextarea && !pieTextarea.value.trim()) {
			pieTextarea.value = pieData;
		}

		if (threeDTextarea && !threeDTextarea.value.trim()) {
			threeDTextarea.value = threeDData;
		}
	}

	/**
	 * 处理数据更新成功后的操作
	 * @param {string} chartType - 图表类型
	 * @returns {void}
	 */
	function handleUpdateSuccess(chartType) {
		// 隐藏编辑面板
		hideAllPanels();

		// 触发图表重绘
		setTimeout(() => {
			if (chartType === 'heatmap' && window.chartHeatmap) {
				window.chartHeatmap.resize();
			} else if (chartType === 'pie' && window.chartPie) {
				window.chartPie.resize();
			} else if (chartType === '3d' && window.chart3D) {
				window.chart3D.resize();
			}
		}, 300);
	}

	// ==================== 事件绑定 ====================

	/**
	 * 绑定编辑按钮点击事件
	 */
	editButtons.forEach(button => {
		button.addEventListener('click', function(e) {
			e.stopPropagation(); // 阻止事件冒泡
			const chartType = this.getAttribute('data-chart');
			showEditPanel(chartType);
		});
	});

	/**
	 * 绑定关闭按钮事件
	 */
	editPanels.forEach(panel => {
		const closeBtn = panel.querySelector('.close-btn');
		const cancelBtn = panel.querySelector('.cancel-btn');

		if (closeBtn) {
			closeBtn.addEventListener('click', hideAllPanels);
		}

		if (cancelBtn) {
			cancelBtn.addEventListener('click', hideAllPanels);
		}
	});

	/**
	 * 点击遮罩层关闭面板
	 */
	overlay.addEventListener('click', hideAllPanels);

	/**
	 * 阻止点击编辑面板内部时关闭
	 */
	editPanels.forEach(panel => {
		panel.addEventListener('click', function(e) {
			e.stopPropagation();
		});

		// 阻止表单元素冒泡
		const formElements = panel.querySelectorAll('textarea, button, input');
		formElements.forEach(element => {
			element.addEventListener('click', function(e) {
				e.stopPropagation();
			});
		});
	});

	/**
	 * 为每个编辑面板添加拖动功能
	 */
	editPanels.forEach(panel => {
		const header = panel.querySelector('.edit-panel-header');

		if (header) {
			// 鼠标事件
			header.addEventListener('mousedown', (e) => {
				// 如果点击的是关闭按钮，则不触发拖动
				if (e.target.classList.contains('close-btn') ||
					e.target.closest('.close-btn')) {
					return;
				}
				startDrag(e, panel);
			});

			// 触摸事件
			header.addEventListener('touchstart', (e) => {
				if (e.target.classList.contains('close-btn') ||
					e.target.closest('.close-btn')) {
					return;
				}
				startDrag(e, panel);
			});
		}

		// 阻止文本选择时的拖动
		panel.querySelector('.edit-panel-header').addEventListener('selectstart', (e) => {
			if (isDragging) {
				e.preventDefault();
			}
		});
	});

	/**
	 * 绑定ESC键关闭面板
	 */
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && activePanel) {
			hideAllPanels();
		}
	});

	// ==================== 全局函数重写 ====================

	/** 保存原始更新函数 */
	const originalUpdateHeatmap = window.updateHeatmap;
	const originalUpdatePie = window.updatePie;
	const originalUpdate3D = window.update3D;

	/**
	 * 重写热力图更新函数
	 */
	window.updateHeatmap = function() {
		if (originalUpdateHeatmap) {
			originalUpdateHeatmap();
			handleUpdateSuccess('heatmap');
		}
	};

	/**
	 * 重写饼图更新函数
	 */
	window.updatePie = function() {
		if (originalUpdatePie) {
			originalUpdatePie();
			handleUpdateSuccess('pie');
		}
	};

	/**
	 * 重写3D图表更新函数
	 */
	window.update3D = function() {
		if (originalUpdate3D) {
			originalUpdate3D();
			handleUpdateSuccess('3d');
		}
	};

	// ==================== 初始化和清理 ====================

	/**
	 * 初始化示例数据
	 */
	initSampleData();

	/**
	 * 在文档卸载时清理事件监听器
	 */
	window.addEventListener('beforeunload', stopDrag);

	// ==================== 导出全局接口 ====================

	/**
	 * 导出函数供外部使用
	 */
	window.showEditPanel = showEditPanel;
	window.hideEditPanel = hideAllPanels;

	console.log('编辑面板交互逻辑已加载');

});
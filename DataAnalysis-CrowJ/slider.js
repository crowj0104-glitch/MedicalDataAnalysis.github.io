// 使用DOMContentLoaded确保DOM加载完成后再执行
document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// ==================== 滑块功能实现 ====================

	(function initSlider() {
		// ==================== DOM元素获取 ====================

		/** 滑块容器 */
		const sliderContainer = document.querySelector('.slider-container');

		/** 滑块轨道 */
		const sliderTrack = document.querySelector('.slider-track');

		/** 所有滑块项 */
		const sliderItems = document.querySelectorAll('.slider-item');

		/** 所有导航点 */
		const dots = document.querySelectorAll('.dot');

		/** 进度条 */
		const progressBar = document.querySelector('.progress-bar');

		/** 上一页按钮 */
		const prevBtn = document.querySelector('.slider-nav.prev');

		/** 下一页按钮 */
		const nextBtn = document.querySelector('.slider-nav.next');

		// ==================== 变量声明 ====================

		/** 当前激活的滑块索引 */
		let currentIndex = 0;

		/** 滑块项总数 */
		const itemCount = sliderItems.length;

		/** 触摸起始X坐标 */
		let startX = 0;

		/** 是否正在拖拽 */
		let isDragging = false;

		// ==================== 核心功能函数 ====================

		/**
		 * 更新指示器状态
		 * @returns {void}
		 */
		function updateIndicator() {
			// 更新导航点激活状态
			dots.forEach((dot, index) => {
				dot.classList.toggle('active', index === currentIndex);
			});

			// 更新进度条
			const progressWidth = ((currentIndex + 1) / itemCount) * 100;
			progressBar.style.width = `${progressWidth}%`;

			// 更新滑动位置 - 每次显示一个项目
			sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

			// 触发图表resize
			setTimeout(() => {
				if (window.chartHeatmap) window.chartHeatmap.resize();
				if (window.chartPie) window.chartPie.resize();
				if (window.chart3D) window.chart3D.resize();
			}, 300);
		}

		/**
		 * 导航到特定索引
		 * @param {number} index - 目标索引
		 * @returns {void}
		 */
		function goToIndex(index) {
			if (index < 0) index = itemCount - 1;
			if (index >= itemCount) index = 0;

			currentIndex = index;
			updateIndicator();

			// 触发自定义滑块切换事件（用于视差效果）
			const sliderChangeEvent = new CustomEvent('sliderChange', {
				detail: {
					currentIndex: index
				}
			});
			document.dispatchEvent(sliderChangeEvent);

			// 如果存在视差模块，调用滑块切换处理函数
			if (window.parallax && window.parallax.handleSliderChange) {
				window.parallax.handleSliderChange(index);
			}
		}

		/**
		 * 切换到下一个项目
		 * @returns {void}
		 */
		function nextSlide() {
			goToIndex(currentIndex + 1);
		}

		/**
		 * 切换到上一个项目
		 * @returns {void}
		 */
		function prevSlide() {
			goToIndex(currentIndex - 1);
		}

		// ==================== 事件绑定 ====================

		// 触摸滑动支持
		sliderContainer.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			isDragging = true;
		});

		sliderContainer.addEventListener('touchmove', (e) => {
			if (!isDragging) return;

			const currentX = e.touches[0].clientX;
			const diff = startX - currentX;

			if (Math.abs(diff) > 50) {
				if (diff > 0) {
					nextSlide();
				} else {
					prevSlide();
				}
				isDragging = false;
			}
		});

		sliderContainer.addEventListener('touchend', () => {
			isDragging = false;
		});

		// 点击指示点导航
		dots.forEach((dot, index) => {
			dot.addEventListener('click', () => {
				goToIndex(index);
			});
		});

		// 按钮事件
		prevBtn.addEventListener('click', prevSlide);
		nextBtn.addEventListener('click', nextSlide);

		// ==================== 响应式处理 ====================

		/**
		 * 处理窗口大小变化
		 * @returns {void}
		 */
		function handleResize() {
			updateIndicator();
		}

		window.addEventListener('resize', handleResize);

		// ==================== 初始化 ====================

		// 初始化指示器
		updateIndicator();

		// 添加触摸提示
		if ('ontouchstart' in window) {
			const hint = document.createElement('div');
			hint.className = 'slider-hint';
			hint.textContent = '左右滑动切换图表';
			sliderContainer.appendChild(hint);

			setTimeout(() => {
				hint.style.opacity = '0';
				setTimeout(() => hint.remove(), 500);
			}, 3000);
		}

		// 导出goToIndex供其他模块使用
		window.goToIndex = goToIndex;
	})(); // 滑块功能初始化结束
}); // DOMContentLoaded结束
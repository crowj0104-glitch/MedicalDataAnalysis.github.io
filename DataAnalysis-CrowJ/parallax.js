// ==================== 视差滚动效果逻辑 ====================

document.addEventListener('DOMContentLoaded', function() {
	'use strict';

	// 检查是否支持CSS 3D变换
	const supports3D = 'transform' in document.documentElement.style &&
		'perspective' in document.documentElement.style;

	if (!supports3D) {
		console.log('浏览器不支持3D变换，视差效果已禁用');
		return;
	}

	// ==================== 配置变量 ====================

	/** 视差效果配置 */
	const parallaxConfig = {
		// 视差强度系数 (0-1，值越大效果越明显)
		intensity: 0.5,

		// 启用/禁用视差效果
		enabled: true,

		// 医疗装饰图标
		medicalIcons: ['🏥', '🚑', '🩺', '💊', '❤️', '⚕️', '🩸'],

		// 装饰元素数量
		elementCount: 12,

		// 滚动速度比例 (背景元素移动速度与页面滚动的比例)
		speedRatio: {
			deep: 0.2, // 深层元素移动最慢
			mid: 0.4, // 中层元素
			front: 0.6 // 前景元素移动较快
		},

		// 是否启用鼠标移动视差
		mouseParallax: true,

		// 鼠标视差强度
		mouseIntensity: 0.01
	};

	// ==================== 变量声明 ====================

	/** 视差装饰元素数组 */
	let parallaxElements = [];

	/** 上一次滚动位置 */
	let lastScrollY = window.scrollY;

	/** 上一次鼠标X坐标 */
	let lastMouseX = 0;

	/** 上一次鼠标Y坐标 */
	let lastMouseY = 0;

	/** 鼠标视差是否启用 */
	let mouseParallaxEnabled = parallaxConfig.mouseParallax;

	/** 视差效果是否激活 */
	let isParallaxActive = parallaxConfig.enabled;

	/** 当前滑块索引 */
	let currentIndex = 0;

	// ==================== DOM元素获取 ====================

	/** 视差背景容器 */
	const parallaxBg = document.getElementById('parallax-bg');

	/** 视差提示元素 */
	const parallaxHint = document.getElementById('parallax-hint');

	/** 所有滑块项 */
	const sliderItems = document.querySelectorAll('.slider-item');

	/** 所有图表容器 */
	const chartContainers = document.querySelectorAll('.chart-container');

	/** 所有图表标题 */
	const chartTitles = document.querySelectorAll('.chart-title');

	/** 所有编辑按钮 */
	const editButtons = document.querySelectorAll('.edit-btn');

	/** 所有导航点 */
	const dots = document.querySelectorAll('.dot');

	// ==================== 初始化函数 ====================

	/**
	 * 初始化视差背景装饰元素
	 * @returns {void}
	 */
	function initParallaxElements() {
		if (!parallaxBg) return;

		// 清空现有元素
		parallaxBg.innerHTML = '';
		parallaxElements = [];

		// 创建医疗装饰元素
		for (let i = 0; i < parallaxConfig.elementCount; i++) {
			const element = document.createElement('div');
			element.className = 'parallax-element parallax-icon';

			// 随机分配深度层级
			const depths = ['deep', 'mid', 'front'];
			const depth = depths[Math.floor(Math.random() * depths.length)];
			element.classList.add(depth);

			// 随机选择医疗图标
			const randomIcon = parallaxConfig.medicalIcons[
				Math.floor(Math.random() * parallaxConfig.medicalIcons.length)
			];
			element.textContent = randomIcon;

			// 随机位置
			const left = Math.random() * 100;
			const top = Math.random() * 100;
			element.style.left = `${left}%`;
			element.style.top = `${top}%`;

			// 随机大小
			const randomSize = 30 + Math.random() * 40;
			element.style.fontSize = `${randomSize}px`;

			// 随机旋转角度
			const randomRotate = Math.random() * 360;
			element.style.transform = `rotate(${randomRotate}deg)`;

			// 随机动画延迟
			element.style.animationDelay = `${Math.random() * 5}s`;

			// 随机动画时长
			element.style.animationDuration = `${15 + Math.random() * 10}s`;

			parallaxBg.appendChild(element);
			parallaxElements.push({
				element: element,
				depth: depth,
				baseX: left,
				baseY: top,
				speed: parallaxConfig.speedRatio[depth]
			});
		}
	}

	/**
	 * 为图表元素添加视差类名
	 * @returns {void}
	 */
	function initParallaxClasses() {
		// 为滑块项添加视差类名
		sliderItems.forEach((item, index) => {
			item.classList.add('parallax-item');
			item.classList.add(`parallax-layer-${(index % 5) + 1}`);
		});

		// 为图表容器添加视差类名
		chartContainers.forEach(container => {
			container.classList.add('parallax-enabled');
		});

		// 为图表标题添加视差类名
		chartTitles.forEach(title => {
			title.classList.add('parallax-title');
		});

		// 为编辑按钮添加视差类名
		editButtons.forEach(btn => {
			btn.classList.add('parallax-btn');
		});

		// 为指示点添加视差类名
		dots.forEach(dot => {
			dot.classList.add('parallax-dot');
		});
	}

	// ==================== 视差效果处理函数 ====================

	/**
	 * 处理滚动视差效果
	 * @returns {void}
	 */
	function handleScrollParallax() {
		if (!isParallaxActive) return;

		const scrollY = window.scrollY;
		const scrollDelta = scrollY - lastScrollY;

		// 1. 更新背景装饰元素位置
		parallaxElements.forEach(item => {
			const moveY = scrollDelta * item.speed * parallaxConfig.intensity;
			const currentTop = parseFloat(item.element.style.top) || item.baseY;
			item.element.style.top = `${currentTop + moveY}%`;

			// 如果元素移出视口，重置位置
			if (parseFloat(item.element.style.top) > 120) {
				item.element.style.top = '-20%';
				item.baseY = -20;
			} else if (parseFloat(item.element.style.top) < -20) {
				item.element.style.top = '120%';
				item.baseY = 120;
			}
		});

		// 2. 应用基于滚动的3D变换到滑块容器
		const sliderContainer = document.querySelector('.slider-container');
		if (sliderContainer) {
			// 计算旋转角度（基于滚动距离）
			const rotateX = Math.min(Math.max(scrollY * 0.01, -10), 10);
			sliderContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg)`;
		}

		// 3. 为当前活动的滑块项添加视差效果
		const activeItem = document.querySelector('.slider-item[style*="transform"]');
		if (activeItem) {
			const scrollFactor = Math.sin(scrollY * 0.005) * 5;
			activeItem.style.transform = `translateX(-${currentIndex * 100}%) translateY(${scrollFactor}px)`;
		}

		lastScrollY = scrollY;

		// 4. 更新图表容器的视差效果
		updateChartParallax(scrollY);
	}

	/**
	 * 更新图表容器的视差效果
	 * @param {number} scrollY - 当前滚动位置
	 * @returns {void}
	 */
	function updateChartParallax(scrollY) {
		const viewportHeight = window.innerHeight;

		chartContainers.forEach((container) => {
			const rect = container.getBoundingClientRect();
			const elementCenter = rect.top + rect.height / 2;
			const viewportCenter = viewportHeight / 2;
			const distanceFromCenter = elementCenter - viewportCenter;

			// 计算视差偏移量
			const parallaxOffset = (distanceFromCenter / viewportHeight) * 50;

			// 应用变换
			container.style.transform = `translateY(${parallaxOffset * parallaxConfig.intensity}px)`;

			// 为处于视口中心的图表添加增强效果
			if (Math.abs(distanceFromCenter) < viewportHeight * 0.3) {
				const scale = 1 + (1 - Math.abs(distanceFromCenter) / (viewportHeight * 0.3)) * 0.02;
				container.style.transform += ` scale(${scale})`;
				container.style.boxShadow =
					`0 15px 35px rgba(26, 95, 122, ${0.1 + (1 - Math.abs(distanceFromCenter) / (viewportHeight * 0.3)) * 0.1})`;
			} else {
				container.style.boxShadow = '0 4px 20px rgba(42, 140, 158, 0.1)';
			}
		});
	}

	/**
	 * 处理鼠标移动视差效果
	 * @param {MouseEvent} e - 鼠标事件
	 * @returns {void}
	 */
	function handleMouseParallax(e) {
		if (!mouseParallaxEnabled || !isParallaxActive) return;

		const mouseX = e.clientX;
		const mouseY = e.clientY;
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		const deltaX = (mouseX - centerX) * parallaxConfig.mouseIntensity;
		const deltaY = (mouseY - centerY) * parallaxConfig.mouseIntensity;

		// 更新背景装饰元素
		parallaxElements.forEach(item => {
			const moveX = deltaX * item.speed * 50;
			const moveY = deltaY * item.speed * 50;
			item.element.style.transform =
				`translate(${moveX}px, ${moveY}px) rotate(${Math.atan2(deltaY, deltaX) * 180 / Math.PI}deg)`;
		});

		// 更新滑块容器的轻微倾斜
		const sliderContainer = document.querySelector('.slider-container');
		if (sliderContainer) {
			const tiltX = deltaY * 0.5;
			const tiltY = -deltaX * 0.5;
			sliderContainer.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
		}

		lastMouseX = mouseX;
		lastMouseY = mouseY;
	}

	/**
	 * 处理滑块切换时的视差效果
	 * @param {number} currentIndex - 当前滑块索引
	 * @returns {void}
	 */
	function handleSliderParallax(index) {
		if (!isParallaxActive) return;

		currentIndex = index;

		// 为当前激活的滑块项添加视差效果
		sliderItems.forEach((item, i) => {
			if (i === currentIndex) {
				item.style.transform = 'translateZ(50px)';
				item.style.zIndex = '10';

				// 为当前激活的图表标题添加动画
				const title = item.querySelector('.chart-title');
				if (title) {
					title.style.transform = 'translateZ(100px) scale(1.05)';
					setTimeout(() => {
						title.style.transform = 'translateZ(20px)';
					}, 300);
				}
			} else {
				item.style.transform = 'translateZ(0)';
				item.style.zIndex = '1';
			}
		});

		// 更新指示点视差效果
		dots.forEach((dot, i) => {
			if (i === currentIndex) {
				dot.classList.add('active');
				dot.style.transform = 'translateY(-8px) scale(1.3)';
			} else {
				dot.classList.remove('active');
				dot.style.transform = 'translateY(0) scale(1)';
			}
		});
	}

	/**
	 * 启用/禁用视差效果
	 * @param {boolean} enable - 是否启用
	 * @returns {void}
	 */
	function toggleParallax(enable) {
		isParallaxActive = enable;

		if (!enable) {
			// 禁用时重置所有变换
			parallaxElements.forEach(item => {
				item.element.style.transform = '';
			});

			const sliderContainer = document.querySelector('.slider-container');
			if (sliderContainer) {
				sliderContainer.style.transform = '';
			}

			chartContainers.forEach(container => {
				container.style.transform = '';
				container.style.boxShadow = '';
			});
		}

		console.log(`视差效果已${enable ? '启用' : '禁用'}`);
	}

	// ==================== 辅助函数 ====================

	/**
	 * 性能优化：限制函数执行频率
	 * @param {Function} func - 要节流的函数
	 * @param {number} limit - 时间限制（毫秒）
	 * @returns {Function} 节流后的函数
	 */
	function throttle(func, limit) {
		let inThrottle;
		return function() {
			const args = arguments;
			const context = this;
			if (!inThrottle) {
				func.apply(context, args);
				inThrottle = true;
				setTimeout(() => (inThrottle = false), limit);
			}
		};
	}

	// ==================== 事件监听器 ====================

	// 滚动事件（使用节流优化性能）
	window.addEventListener('scroll', throttle(handleScrollParallax, 16)); // ~60fps

	// 鼠标移动事件（使用节流优化性能）
	if (mouseParallaxEnabled) {
		window.addEventListener('mousemove', throttle(handleMouseParallax, 16));
	}

	// 监听滑块切换事件
	document.addEventListener('sliderChange', function(e) {
		handleSliderParallax(e.detail.currentIndex);
	});

	// 窗口大小变化时重新初始化
	window.addEventListener('resize', function() {
		initParallaxElements();
	});

	// 性能优化：当页面不可见时暂停视差效果
	document.addEventListener('visibilitychange', function() {
		if (document.hidden) {
			toggleParallax(false);
		} else {
			toggleParallax(true);
		}
	});

	// 触摸设备检测，禁用鼠标视差
	if ('ontouchstart' in window) {
		mouseParallaxEnabled = false;
		console.log('触摸设备检测到，鼠标视差效果已禁用');
	}

	// ==================== 初始化 ====================

	/**
	 * 初始化视差效果
	 * @returns {void}
	 */
	function initParallax() {
		if (!supports3D) return;

		// 等待DOM完全加载
		setTimeout(() => {
			initParallaxElements();
			initParallaxClasses();

			// 隐藏视差提示（5秒后）
			if (parallaxHint) {
				setTimeout(() => {
					parallaxHint.style.display = 'none';
				}, 5000);
			}

			console.log('视差滚动效果已初始化');
		}, 1000);
	}

	// 延迟初始化以确保其他组件已加载
	setTimeout(initParallax, 1500);

	// ==================== 全局导出 ====================

	window.parallax = {
		toggle: toggleParallax,
		isActive: () => isParallaxActive,
		config: parallaxConfig,
		handleSliderChange: handleSliderParallax
	};
});
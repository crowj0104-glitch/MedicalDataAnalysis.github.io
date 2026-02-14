/**
 * 移动端适配核心逻辑 - flexible.js
 * 功能说明：
 * 1. 动态设置body字体大小，适配不同设备像素比(dpr)
 * 2. 自定义rem单位，将屏幕宽度等分为24份，1rem = 屏幕宽度/24
 * 3. 监听窗口尺寸变化、页面缓存加载，实时更新rem单位
 * 4. 检测设备是否支持0.5px边框，添加对应的CSS类名
 * 调用方式：自执行函数，直接引入即可生效
 */
(function flexible(window, document) {
	// ==================== 变量声明 ====================
	var docEl = document.documentElement;
	var dpr = window.devicePixelRatio || 1;

	// ==================== 核心功能函数 ====================

	/**
	 * 设置body的基础字体大小
	 * 逻辑：
	 * 1. 如果body已加载，直接设置字体大小（12px * 设备像素比）
	 * 2. 如果body未加载，监听DOMContentLoaded事件后再设置
	 */
	function setBodyFontSize() {
		if (document.body) {
			document.body.style.fontSize = 12 * dpr + "px";
		} else {
			document.addEventListener("DOMContentLoaded", setBodyFontSize);
		}
	}

	/**
	 * 设置rem单位基准值
	 * 核心逻辑：将HTML根元素的fontSize设置为 屏幕宽度/24
	 * 即 1rem = 屏幕宽度/24，实现rem的自适应
	 */
	function setRemUnit() {
		// 计算rem基准值：视口宽度除以24
		var rem = docEl.clientWidth / 24;
		// 设置HTML根元素的fontSize，作为rem的基准
		docEl.style.fontSize = rem + "px";
	}

	/**
	 * 检测设备是否支持0.5px边框
	 * 逻辑：
	 * 1. 仅在dpr>=2的高清屏设备中检测（低清屏无需0.5px）
	 * 2. 创建测试元素，设置0.5px边框，检测其实际渲染高度
	 * 3. 如果渲染高度为1px（说明不支持0.5px），给HTML根元素添加"hairlines"类名
	 * 4. 业务中可通过.hairlines类名适配高清边框样式
	 */
	function detectHalfPixelSupport() {
		if (dpr >= 2) {
			// 创建临时body元素（避免污染真实DOM）
			var fakeBody = document.createElement("body");
			// 创建测试元素
			var testElement = document.createElement("div");
			// 设置测试元素的0.5px透明边框
			testElement.style.border = ".5px solid transparent";
			// 将测试元素添加到临时body中
			fakeBody.appendChild(testElement);
			// 将临时body添加到HTML根元素中（触发渲染）
			docEl.appendChild(fakeBody);
			// 检测测试元素的实际渲染高度
			if (testElement.offsetHeight === 1) {
				// 若高度为1px，说明不支持0.5px，添加hairlines类名
				docEl.classList.add("hairlines");
			}
			// 移除临时元素，清理DOM
			docEl.removeChild(fakeBody);
		}
	}

	// ==================== 初始化执行 ====================

	// 初始化body字体大小设置
	setBodyFontSize();

	// 初始化rem单位设置
	setRemUnit();

	// ==================== 事件监听器 ====================

	/**
	 * 监听窗口尺寸变化事件
	 * 作用：当屏幕宽度改变时（如旋转屏幕、窗口缩放），重新计算rem基准值
	 */
	window.addEventListener("resize", setRemUnit);

	/**
	 * 监听页面显示事件（pageshow）
	 * 作用：处理页面从缓存中加载的情况（如浏览器后退），重新计算rem基准值
	 * e.persisted：判断页面是否从缓存中恢复
	 */
	window.addEventListener("pageshow", function(e) {
		if (e.persisted) {
			setRemUnit();
		}
	});

	// ==================== 检测执行 ====================

	// 检测设备是否支持0.5px边框
	detectHalfPixelSupport();

})(window, document);
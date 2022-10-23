<template>
	<div>
		<div id="cesiumContainer" class="fullSize">
			<div id="slider"></div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
				slider: null,
				// 地图是否可动
				moveActive: false,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer("cesiumContainer", {
				// 图像图层
				imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
				}),
				// 是否显示图层选择器，右上角图层选择按钮
				baseLayerPicker: false,
				// 是否显示信息框
				infoBox: false,
			});

			// 获取将在地球上渲染的图像图层的集合。
			const layers = this.viewer.imageryLayers
			// 使用给定的ImageryProvider创建一个新层，并将其添加到集合中。
			const earthAtNight = layers.addImageryProvider(
				// 使用Cesium ion REST API提供平铺的图像。
				new Cesium.IonImageryProvider({
					// 离子图像资产ID；
					assetId: 3812
				})
			);

			// 仅显示在滑块的左侧。
			// 在 Scene＃imagerySplitPosition 的左侧显示ImageryLayer。
			earthAtNight.splitDirection = Cesium.SplitDirection.LEFT;

			// 将滑块的位置与拆分位置同步
			this.slider = document.getElementById("slider");
			// 分割位置
			// 获取或设置图像拆分器在视口中的位置。有效值在0.0到1.0之间。
			this.viewer.scene.splitPosition =
				this.slider.offsetLeft / this.slider.parentElement.offsetWidth;

			// 创建鼠标事件
			const handler = new Cesium.ScreenSpaceEventHandler(this.slider);

			handler.setInputAction(function() {
				this.moveActive = true;
			}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
			handler.setInputAction(function() {
				this.moveActive = true;
			}, Cesium.ScreenSpaceEventType.PINCH_START);

			handler.setInputAction(this.move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			handler.setInputAction(this.move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

			handler.setInputAction(function() {
				this.moveActive = false;
			}, Cesium.ScreenSpaceEventType.LEFT_UP);
			handler.setInputAction(function() {
				this.moveActive = false;
			}, Cesium.ScreenSpaceEventType.PINCH_END);

		},
		methods: {
			move(movement) {
				if (!this.moveActive) {
					return;
				}
				const relativeOffset = movement.endPosition.x;
				const splitPosition =
					(this.slider.offsetLeft + relativeOffset) /
					this.slider.parentElement.offsetWidth;
				this.slider.style.left = `${100.0 * splitPosition}%`;
				this.viewer.scene.splitPosition = splitPosition;
			}
		}
	}
</script>

<style>
	#slider {
		position: absolute;
		left: 50%;
		top: 0px;
		background-color: #d3d3d3;
		width: 5px;
		height: 100%;
		z-index: 9999;
	}

	#slider:hover {
		cursor: ew-resize;
	}
</style>
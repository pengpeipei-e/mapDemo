<template>
	<div id="total">
		<div id="cesiumContainer" class="mapview"></div>
		<div id="cesiumContainer2" class="mapview"></div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer0: null,
				viewer1: null,
				handler: null,
				handler1: null,
			}
		},
		mounted() {
			this.viewer0 = new Cesium.Viewer('cesiumContainer', {
				baseLayerPicker: false,
				timeline: false,
				animation: false,
				imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
					url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
				}),
			})

			let subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
			let imageryProviderTDT = new Cesium.WebMapTileServiceImageryProvider({
				url: "https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=797585713b02a32e9ede3d155dffa9ef",
				subdomains: subdomains,
				layer: "tdtImage",
				style: "default",
				format: "image/jpeg",
				tileMatrixSetID: "GoogleMapsCompatible",
				show: true,
				maximumLevel: 18,
			});

			this.viewer1 = new Cesium.Viewer('cesiumContainer2', {
				baseLayerPicker: false,
				// 时间线
				timeline: false,
				// 动画控制
				animation: false,
				imageryProvider: imageryProviderTDT,
			});

			// 去掉版权信息
			this.viewer0._cesiumWidget._creditContainer.style.display = "none";
			this.viewer1._cesiumWidget._creditContainer.style.display = "none";
			this.initHandler(this.viewer0, this.viewer1);
		},
		methods: {
			initHandler(viewer0, viewer1) {
				if (this.handler && this.handler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)) {
					return;
				}
				// 创建屏幕空间事件处理程序
				this.handler = new Cesium.ScreenSpaceEventHandler(viewer0.scene.canvas);
				this.handler1 = new Cesium.ScreenSpaceEventHandler(viewer1.scene.canvas);
				// 右侧->左侧
				// 设置要在输入时间上执行的功能
				this.handler.setInputAction(event => {
					let camera = viewer0.camera;
					viewer1.camera.setView({
						// 目的地
						destination: camera.position,
						// 方向
						orientation: {
							// 相机的观看方向
							direction: camera.direction,
							// 相机的向上方向
							up: camera.up,
							// 获取相机的heading方向（航向弧度）
							heading: camera.heading,
							// 获取相机的pitch方向（俯仰弧度）
							pitch: camera.pitch,
							// 获取相机的roll方向（翻滚弧度）
							roll: camera.roll,
						}
					})
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

				//鼠标滚轮事件
				this.handler.setInputAction(event => {
					let camera = viewer0.camera;
					viewer1.camera.setView({
						destination: camera.position,
						orientation: {
							direction: camera.direction,
							up: camera.up,
							heading: camera.heading,
							pitch: camera.pitch,
							roll: camera.roll,
						}
					})
				}, Cesium.ScreenSpaceEventType.WHEEL)

				// 左侧->右侧
				this.handler1.setInputAction(event => {
					let camera = viewer1.camera;
					viewer0.camera.setView({
						destination: camera.position,
						orientation: {
							direction: camera.direction,
							up: camera.up,
							heading: camera.heading,
							pitch: camera.pitch,
							roll: camera.roll,
						}
					})
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

				this.handler1.setInputAction(event => {
					let camera = viewer1.camera;
					viewer0.camera.setView({
						destination: camera.position,
						orientation: {
							direction: camera.direction,
							up: camera.up,
							heading: camera.heading,
							pitch: camera.pitch,
							roll: camera.roll,
						}
					})
				}, Cesium.ScreenSpaceEventType.WHEEL)
			}
		},
	}
</script>

<style>
	#total {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.mapview {
		width: 50%;
		height: 100%;
		margin: 0;
	}
</style>
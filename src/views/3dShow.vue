<template>
	<div id="cesiumContainer" class="fullSize"></div>
</template>

<script>
	export default {
		mounted() {
			var viewer = new Cesium.Viewer("cesiumContainer", {
				geocoder: false, //查找位置工具，查找到之后会将镜头对准找到的地址，默认使用bing地图
				homeButton: false, //视角复位按钮
				sceneModePicker: false, //二三维切换按钮
				baseLayerPicker: false, //底图图层空间显隐
				navigationHelpButton: false, //帮组按钮
				animation: false, //左下角动画部件按钮
				timeline: false, //下侧时间轴
				fullscreenButton: false, //全屏按钮
				vrButton: false, //vr模式按钮
			});
			console.log(123, viewer);
			// // 隐藏版权信息
			viewer._cesiumWidget._creditContainer.style.display = "none";

			viewer.scene.globe.baseColor = Cesium.Color.BLACK;

			//viewer.scene.preUpdate  在更新或者呈现场景之前立即触发
			viewer.scene.preUpdate.addEventListener(() => {
				// console.log(123);
			})

			//viewer.scene.postUpdate 在场景更新后以及渲染场景之前立即触发
			viewer.scene.postUpdate.addEventListener(() => {
				// console.log(456);
			})

			//viewer.scene.preRender 在场景更新后以及渲染场景之前触发
			viewer.scene.preRender.addEventListener(() => {
				// console.log(789);
			})

			//viewer.scene.postRender 在渲染场景后立即触发
			viewer.scene.postRender.addEventListener(() => {
				// console.log(741);
			})

			// 将三维球定位到中国
			viewer.camera.setView({
				// fromDegrees()方法，将经纬度和高程转换为世界坐标
				destination: Cesium.Cartesian3.fromDegrees(106.26667, 38.46667, 17000000.0),
				orientation: {
					heading: 6.283185307179586,
					// 视角
					pitch: -1.5686521559334161,
					roll: 0,
				}
			});


			var options = {};
			// 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
			//  west,south,east,north,
			options.defaultResetView = Cesium.Rectangle.fromDegrees(80, 22, 130, 50);
			// 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
			options.enableCompass = true;
			// 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
			options.enableZoomControls = true;
			// 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
			options.enableDistanceLegend = true;
			// 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
			options.enableCompassOuterRing = true;
			// console.log('CesiumNavigation:', this.CesiumNavigation);
			// this.CesiumNavigation(viewer, options);

			// viewer.camera.flyTo({
			// 	destination: Cesium.Cartesian3.fromDegrees(
			// 		125.29205010375024,
			// 		43.846426460858815,
			// 		931.3050623720223
			// 	),
			// 	orientation: {
			// 		heading: 0.05956398801633167,
			// 		pitch: -0.43653091585028125,
			// 		roll: 0.000011909843509627649,
			// 	},
			// 	duration: 3,
			// });

			let a = {
				name: '带边框的平面',
				position: Cesium.Cartesian3.fromDegrees(-107.0, 40.0, 300000.0), //经纬度转世界坐标
				plane: {
					show: true, //是否显示
					plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0), //朝向屏幕
					dimensions: new Cesium.Cartesian2(400000.0, 300000.0), //二维平面
					material: Cesium.Color.BLUE, //材质
					fill: true, //填充
					outline: true, //显示边框
					outlineColor: Cesium.Color.YELLOW, //边框颜色
				}
			};
		}
	}
</script>

<style lang="scss">
	#cesiumContainer {
		width: 100%;
		height: 100%;
	}
</style>
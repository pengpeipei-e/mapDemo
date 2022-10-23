<template>
	<div id="cesiumContainer" class="fullSize"></div>
</template>

<script>
	export default {
		mounted() {
			const viewer = new Cesium.Viewer("cesiumContainer", {
				/* 调用Cesium ion全球地形服务  地形图层 */
				terrainProvider: Cesium.createWorldTerrain(),
			});
			const scene = viewer.scene;
			// 事件控件
			const clock = viewer.clock;

			// 实体
			let entity;
			// 位置
			let positionProperty;
			// 创建一个czml数据的新实例
			const dataSourcePromise = Cesium.CzmlDataSource.load(
				"./MilkTruck.czml"
			);
			// 在一个图层上面添加czml
			viewer.dataSources.add(dataSourcePromise).then(function(dataSource) {
				entity = dataSource.entities.getById("CesiumMilkTruck");
				positionProperty = entity.position;
			});

			//添加瓦片数据
			// 添加元素
			const tileset = scene.primitives.add(
				// 3D 模型
				new Cesium.Cesium3DTileset({
					url: Cesium.IonResource.fromAssetId(40866),
				})
			);

			// 设置相机的空间位置
			viewer.camera.setView({
				// 相机位置
				destination: new Cesium.Cartesian3(
					1216403.8845586285,
					-4736357.493351395,
					4081299.715698949
				),
				// 相机方位
				orientation: new Cesium.HeadingPitchRoll(
					4.2892217081808806,
					-0.4799070147502502,
					6.279789177843313
				),
				// 结束变换
				endTransform: Cesium.Matrix4.IDENTITY,
			});

			// 是否支持
			if (scene.clampToHeightSupported) {
				// 一旦初始视图加载完成，此事件就被触发
				tileset.initialTilesLoaded.addEventListener(start);
			} else {
				window.alert("This browser does not support clampToHeight.");
			}

			function start() {
				clock.shouldAnimate = true;
				const objectsToExclude = [entity];
				// 监听帧渲染结束事件，获取实时位置
				scene.postRender.addEventListener(function() {
					const position = positionProperty.getValue(clock.currentTime);
					entity.position = scene.clampToHeight(position, objectsToExclude);
				});
			}
		}
	}
</script>

<style>
	#cesiumContainer {
		width: 100%;
		height: 100%;
	}
</style>
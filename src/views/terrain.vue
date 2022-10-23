<template>
	<div id="cesiumContainer" class="fullSize"></div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer('cesiumContainer',{
				terrainProvider: new Cesium.CesiumTerrainProvider({
					// url:Cesium.IonResource.fromAssetId(1)
					url:'./1'
				})
			});
			// this.viewer.terrainProvider = Cesium.createWorldTerrain();

			// 指南针
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
			console.log('CesiumNavigation:', this.CesiumNavigation);
			this.CesiumNavigation(this.viewer, options);
		}
	}
</script>

<style>

</style>
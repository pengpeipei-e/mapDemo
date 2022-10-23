<template>
	<div>
		<div id="cesiumContainer" class="fullSize"></div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer('cesiumContainer');
			// 这个数据有问题，当前也页面无法达到效果
			let tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
				url: './build/Tile_118/Tile_118_L19_00010t3.json',
				// modelMatrix: Cesium.Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
				baseScreenSpaceError: 1024,
				//【重要】数值加大，能让最终成像变模糊
				skipScreenSpaceErrorFactor: 16,
				skipLevels: 1,
				immediatelyLoadDesiredLevelOfDetail: false,
				loadSiblings: false,
				cullWithChildrenBounds: true,
				skipLevelOfDetail: true, //开启跳级加载
				//这个参数默认是false，同等条件下，叶子节点会优先加载。但是Cesium的tile加载优先级有很多考虑条件，
				//这个只是其中之一，如果skipLevelOfDetail=false，这个参数几乎无意义。所以要配合skipLevelOfDetail=true来使用，
				//此时设置preferLeaves=true。这样我们就能最快的看见符合当前视觉精度的块，对于提升大数据以及网络环境不好的前提下有一点点改善意义。
				preferLeaves: true,
				//【重要】内存建议显存大小的50%左右，内存分配变小有利于倾斜摄影数据回收，提升性能体验
				maximumMemoryUsage: 1024
				//控制切片视角显示的数量，可调整性能
				// maximumScreenSpaceError: 2,//最大的屏幕空间误差
				// maximumNumberOfLoadedTiles: 100000, //最大加载瓦片个数
			}));
			// this.viewer.flyTo(tileset)
			this.viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(120.42774, 31.32849, 44455.4), //经度、纬度、高度

			});
		}
	}
</script>

<style>

</style>
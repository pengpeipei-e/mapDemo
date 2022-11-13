<template>
	<div id="cesiumContainer">
		<button @click="flyto">获取范围</button>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
				cameraInfo: {},
				lgt: null,
				lat: null
			}
		},
		mounted() {
			this.viewer = new Cesium.CesiumWidget("cesiumContainer");
			this.cameraInfo = {
				heading: this.viewer.camera.heading,
				pitch: this.viewer.camera.pitch,
				roll: this.viewer.camera.roll,
			}
			console.log(this.viewer);
			this.viewer.camera.setView({
				destination: Cesium.Cartesian3.fromDegrees(116.3913357270093, 39.90375870453082,
					32.63684101309898),
			});


			// // 选择一个椭球或地图。
			// var result = this.viewer.camera.pickEllipsoid(
			// 	// 2D
			// 	new Cesium.Cartesian2(this.viewer.canvas.clientWidth / 2, this.viewer.canvas.clientHeight / 2)
			// )
			// // 笛卡尔坐标系
			// var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result)
			// console.log('笛卡尔', curPosition);
			// // 将提供的笛卡尔转换为制图表达。直角坐标在椭圆体的中心是不确定的。
			// var lng = (curPosition.longitude * 180) / Math.PI //经度
			// var lat = (curPosition.latitude * 180) / Math.PI //纬度
			// console.log(lng, lat);

			// //获取当前视角的postion（位置）
			// var position = this.viewer.camera.position
			// console.log(position);
			// let _cartographic = new Cesium.Cartographic.fromCartesian(new Cesium.Cartesian3(position.x, position.y, position.z));
			// let _lat = Cesium.Math.toDegrees(curPosition.latitude);
			// let _lng = Cesium.Math.toDegrees(curPosition.longitude);
			// console.log(777, _lng, _lat);

			this.lgt = Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(this.viewer.camera.position).longitude)
			this.lat = Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(this.viewer.camera.position).latitude)
			console.log('a', lgt);

		},
		methods: {
			flyto() {
				// this.viewer.camera.flyTo({
				// 	destination: Cesium.Rectangle.fromDegrees(
				// 		-3.141592653589793, -1.5707963267948966,
				// 		3.141592653589793, 1.5707963267948966)
				// });
				this.viewer.camera.setView({
					destination: Cesium.Cartesian3.fromDegrees(this.lgt, this.lat,
						32.63684101309898),
				});
			}
		}
	}
</script>

<style scoped>
	#cesiumContainer {
		width: 100%;
		height: 100%;
	}
</style>
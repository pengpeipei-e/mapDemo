<template>
	<div id="cesiumContainer" class="fullSize"></div>
</template>

<script>
	export default {
		date() {
			return {
				viewer: null,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer("cesiumContainer");
			// 流动水面效果
			this.viewer.scene.primitives.add(
				new Cesium.Primitive({
					// 几何实例化允许一个 Geometry 对象在多个对象中的位置不同的位置和独特的颜色。
					geometryInstances: new Cesium.GeometryInstance({
						// 要实例化的几何
						geometry: new Cesium.RectangleGeometry({
							 //矩形视角范围
							rectangle: Cesium.Rectangle.fromDegrees(
								113.95, 22.48,
								113.99, 22.52
							),
							// 椭球面外观.顶点格式
							vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
						}),
					}),
					// 创建椭球面外观
					appearance: new Cesium.EllipsoidSurfaceAppearance({
						// 材质
						material: new Cesium.Material({
							fabric: {
								type: "Water",
								uniforms: {
									baseWaterColor: new Cesium.Color(64 / 255.0, 157 / 255.0, 253 / 255.0, 0.5),
									normalMap: './img/water.jpg',
									// 频率
									frequency: 1000.0,
									// 动画速度
									animationSpeed: 0.1,
									// 振幅
									amplitude: 10,
									// 高光强度
									specularIntensity: 10
								}
							}
						})
					}),
				})
			);

			// 视角跳转到水波
			this.viewer.camera.setView({
				// fromDegrees()方法，将经纬度和高程转换为世界坐标
				destination: Cesium.Cartesian3.fromDegrees(113.97, 22.5, 20000.0),
				orientation: {
					heading: 6.283185307179586,
					// 视角
					pitch: -1.5686521559334161,
					roll: 0,
				}
			});

		}
	}
</script>

<style>

</style>
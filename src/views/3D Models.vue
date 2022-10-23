<template>
	<div>
		<el-select v-model="value" placeholder="请选择" @change="models(value)">
			<el-option v-for="(item,idx) in options" :key="idx" :label="item.text" :value="item.text">
			</el-option>
		</el-select>
		<div id="cesiumContainer" class="fullSize"></div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
				value: '',
				options: [{
						text: "Aircraft",
						url: "../../models/Cesium_Air.glb",
						height: 5000.0,
					},
					{
						text: "Drone",
						url: "../../models/CesiumDrone.glb",
						height: 150.0,
					},
					{
						text: "Ground Vehicle",
						url: "../../models/GroundVehicle.glb",
						height: 0,
					},
					{
						text: "Hot Air Balloon",
						url: "../../models/CesiumBalloon.glb",
						height: 1000.0,
					},
					{
						text: "Milk Truck",
						url: "../../models/CesiumMilkTruck.glb",
						height: 0,
					},
					{
						text: "Skinned Character",
						url: "../../models/Cesium_Man.glb",
						height: 0,
					},
					{
						text: "Draco Compressed Model",
						url: "../../models/CesiumMilkTruck.glb",
						height: 0,
					},
					{
						text: "KTX2 Compressed Balloon",
						url: "../../models/CesiumBalloonKTX2.glb",
						height: 1000.0,
					},
				],
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer("cesiumContainer", {
				infoBox: false,
				selectionIndicator: false,
				shadows: true,
				shouldAnimate: true,
			});
		},
		methods: {
			createModel(url, height) {
				// 视图上的直观对象进行清除
				// entities：创建直观的对象
				this.viewer.entities.removeAll();

				/* 
					平面坐标系：Cartesian2（x，y）
					笛卡尔空间直角坐标系-世界坐标：Cartesian3
					弧度：Cartographic
				*/
				const position = Cesium.Cartesian3.fromDegrees(
					-123.0744619,
					44.0503706,
					height
				);
				/* 
						角度转为弧度：弧度值 = Cesium.Math.toRadians(角度值);
						弧度转为角度：角度值 = Cesium.Math.toDegrees(弧度值);
				*/
				const heading = Cesium.Math.toRadians(135);

				/* 
					HeadingPitchRoll：对于模型旋转变换、相机视角变换以及方向变换的处理操作，也就是改变heading、pitch、roll这三个的值
					heading：偏航角ψ（Heading）的值，是控制机体头的朝向位置，这个角的改变，也就是左右方向的改变
					pitch：俯仰角的值，从上图来看是控制机体上下方向的改变，值为正是顺时针旋转；为负则相反。当然，这个是根据坐标轴来旋转的，要是进行了翻滚就不一定是上下旋转了；如果还将头朝向的方向看作前方，其实还是可以看作上下旋转的
					roll：翻滚角， 假如头始终朝着前方看，然后进行侧空翻，翻滚完成也就是旋转了360度。
				*/
				// 弧度的螺距分量
				const pitch = 0;
				// 滚动分量（以弧度为单位）
				const roll = 0;
				// HeadingPitchRoll旋转表示为航向，俯仰和滚动。围绕Z轴。节距是绕负y轴的旋转。滚动是关于正x轴
				const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
				
				const orientation = Cesium.Transforms.headingPitchRollQuaternion(
					position,
					hpr
				);

				// 添加实体
				const entity = this.viewer.entities.add({
					name: url,
					position: position,
					orientation: orientation,
					model: {
						uri: url,
						// 不管缩放如何，模型的最小最小像素
						minimumPixelSize: 128,
						// 模型的最大比例尺大小，minimumPixelSize的上线
						maximumScale: 20000,
					},
				});
				// 获取或设置相机当前正在跟踪的entity实例
				this.viewer.trackedEntity = entity;
			},
			models(value) {
				let target = this.options.find(item => item.text == value);
				this.createModel(target.url, target.height)
			},
		},
	}
</script>

<style>

</style>
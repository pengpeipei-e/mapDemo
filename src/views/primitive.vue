<template>
	<div>
		<div id="cesiumContainer"></div>

		<div id="trackPopUp" class="trackPopUp">
			<div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">
				<a class="leaflet-popup-close-button" href="#">×</a>
				<div class="leaflet-popup-content-wrapper">
					<div id="trackPopUpLink" class="leaflet-popup-content">
						<div>{{spjk.name}}</div>
						<table>
							<tbody>
								<tr>
									<td>监控对象</td>
									<td>{{spjk.info['监测对象']}}</td>
								</tr>
								<tr>
									<td>设备名称</td>
									<td>{{spjk.info['设备名称']}}</td>
								</tr>
								<tr>
									<td>检测点号</td>
									<td>{{spjk.info['检测点号']}}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'primitive',
		data() {
			return {
				spjk: {
					name: null,
					info: {}
				},
			}
		},
		mounted() {
			var viewer = new Cesium.Viewer("cesiumContainer", {
				geocoder: false, //右上角左侧
				homeButton: false,
				sceneModePicker: false,
				baseLayerPicker: false,
				navigationHelpButton: false,
				animation: false,
				// creditContainer:"credit",
				timeline: false,
				fullscreenButton: false,
				vrButton: false,
				selectionIndicator: false, //点击之后显示的聚焦框
				infoBox: false, //点击之后默认显示的提示框
			});
			//设置视角
			viewer.camera.setView({
				// Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
				// fromDegrees(lng,lat,height)方法，将经纬度和高程转换为世界坐标
				destination: Cesium.Cartesian3.fromDegrees(118.57, 37.53, 6000),
				orientation: {
					//指向
					heading: Cesium.Math.toRadians(0),
					//视角
					pitch: Cesium.Math.toRadians(-50),
					roll: Cesium.Math.toRadians(0),
					range: 10000
				}
			})
			viewer.zoomTo(viewer);
			//添加图标
			viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(118.56, 37.57),
				billboard: {
					image: 'sxt.png',
					scale: 0.8,
					width: 25,
					height: 25,
				},
				name: '摄像头1',
				description: {
					"objectid": 45,
					"检测点号": "45",
					"设备名称": "安防设备",
					"监测对象": "二号陵",
					"x": 4252683.213,
					"y": 584420.793,
					"type": "jianceshebei27"
				}

			});


			//鼠标滑过箭头变小手
			const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(function(movement) {
				const pickedObject = viewer.scene.pick(movement.endPosition);
				if (Cesium.defined(pickedObject)) {
					viewer._container.style.cursor = "pointer";
				} else {
					viewer._container.style.cursor = "default";
				}
			}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

			//点击广告牌事件
			var handlerVideo = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handlerVideo.setInputAction((click) => {
				var pick = viewer.scene.pick(click.position);
				if (Cesium.defined(pick)) {
					document.getElementById("trackPopUp").style.display = 'block';
					this.spjk.name = pick.id._name;
					this.spjk.info = pick.id._description._value;
					let position = click.position;
					document.getElementById('trackPopUpContent').style.left = position.x + 'px';
					document.getElementById('trackPopUpContent').style.top = position.y + 'px';
				} else {
					document.getElementById("trackPopUp").style.display = 'none';
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		}
	}
</script>

<style>
	#cesiumContainer {
		width: 100%;
		height: 1000px;
	}

	/*leaflet风格气泡窗口样式模板*/
	.trackPopUp {
		display: none;
		/* color: rgb(255, 255, 255); */
		height: 50px;
		color: black;
	}

	.leaflet-popup {
		position: absolute;
	}

	.leaflet-popup-close-button {
		position: absolute;
		top: 0;
		right: 0;
		padding: 4px 4px 0 0;
		text-align: center;
		font: 25px/25px Tahoma, Verdana, sans-serif;
		color: rgb(255, 255, 255);
		text-decoration: none;
		font-weight: bold;
		background: transparent;
	}

	.leaflet-popup-content-wrapper {
		max-height: 200px;
		overflow-y: auto;
		height: 133px;
		padding: 1px;
		text-align: left;
		border-radius: 12px;
		/* background-image: url('../images/pop/popbackground.png'); */
		background-color: #fff;
	}

	.leaflet-popup-content {
		margin: 5px 20px;
		line-height: 1.4;

	}

	.leaflet-popup-content div {
		text-align: center;
	}

	.leaflet-popup-content div {
		font-size: 18px;
	}

	.leaflet-popup-content table {
		margin-top: 15px;
	}

	.leaflet-popup-content table tr {
		height: 25px;
	}
</style>
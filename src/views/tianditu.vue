<template>
	<div id="cesiumContainer" class="fullSize"></div>
</template>

<script>
	export default {
		mounted() {
			const cesiumPara = {
				viewer: null,
			};
			cesiumPara.cameraPosition = function() {
				let cartographic = cesiumPara.viewer.scene.camera.positionCartographic;
				console.log("经度" + (cartographic.longitude * 180) / Math.PI);
				console.log("纬度" + (cartographic.latitude * 180) / Math.PI);
				console.log("高度" + cartographic.height);
				console.log("偏航" + cesiumPara.viewer.scene.camera.heading);
				console.log("俯仰" + cesiumPara.viewer.scene.camera.pitch);
				console.log("桶滚" + cesiumPara.viewer.scene.camera.roll);
			};
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

			var viewer = new Cesium.Viewer("cesiumContainer", {
				imageryProvider: imageryProviderTDT,
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
			console.log(viewer);
			let tileset = viewer.scene.primitives.add(
				new Cesium.Cesium3DTileset({
					url: "./build/tileset.json",
				})
			);

			tileset.tileLoad.addEventListener(function(tile) {
				console.log(711,tile);
				let content = tile.content;
				let featuresLength = content.featuresLength;
				console.log("要素数量为：");
				console.log(featuresLength);
				console.log("第一个要素为：");
				let feature = content.getFeature(0);
				console.log(feature);
			})

			tileset.style = new Cesium.Cesium3DTileStyle({
				color: {
					conditions: [
						["true", "color('white', 1)"]
					],
				},
			});

			viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					125.29205010375024,
					43.846426460858815,
					931.3050623720223
				),
				orientation: {
					heading: 0.05956398801633167,
					pitch: -0.43653091585028125,
					roll: 0.000011909843509627649,
				},
				duration: 3,
			});


			// HTML overlay for showing feature name on mouseover
			const nameOverlay = document.createElement("div");
			viewer.container.appendChild(nameOverlay);
			nameOverlay.className = "backdrop";
			nameOverlay.style.display = "none";
			nameOverlay.style.position = "absolute";
			nameOverlay.style.bottom = "0";
			nameOverlay.style.left = "0";
			nameOverlay.style["pointer-events"] = "none";
			nameOverlay.style.padding = "4px";
			nameOverlay.style.backgroundColor = "black";
			nameOverlay.style.color = 'white';


			// 移动高亮
			var moveSelected = {
				feature: undefined,
				originalColor: new Cesium.Color(),
			};
			//点击高亮
			var highlighted = {
				feature: undefined,
				originalColor: new Cesium.Color(),
			};

			// 一个实体对象，它将保存有关当前选择的信息框显示功能的信息
			const selectedEntity = new Cesium.Entity();



			// 如果支持剪影，则鼠标悬停时剪影特征为蓝色，鼠标单击时剪影特征为绿色。
			// 如果不支持轮廓，则在鼠标悬停时将特征颜色更改为黄色，在鼠标单击时将其更改为绿色。
			if (
				//是否支持剪影舞台。
				Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)
			) {
				/*
				创建一个检测边缘的后处理阶段。
				当颜色在边缘上时，将颜色写入设置为1.0的输出纹理中。

				此阶段具有以下制服: color 和 length

				color 是突出显示的边缘的颜色。默认值为 Color＃BLACK 。
				length 是边缘的长度，以像素为单位。默认值为 0.5 。
				2D不支持此阶段。

				Returns:
				应用边缘检测效果的后处理阶段。
				*/
				// const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
				// silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
				// silhouetteBlue.uniforms.length = 0.01;
				// silhouetteBlue.selected = [];

				// const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
				// silhouetteGreen.uniforms.color = Cesium.Color.LIME;
				// silhouetteGreen.uniforms.length = 0.01;
				// silhouetteGreen.selected = [];

				// // 后处理效果应用于最终渲染。
				// viewer.scene.postProcessStages.add(
				// 	Cesium.PostProcessStageLibrary.createSilhouetteStage([
				// 		silhouetteBlue,
				// 		silhouetteGreen,
				// 	])
				// );

				// Silhouette a feature blue on hover.
				//设置要在输入事件上执行的功能。
				viewer.screenSpaceEventHandler.setInputAction((
						movement
					) => {
						// If a feature was previously highlighted, undo the highlight
						if (Cesium.defined(moveSelected.feature)) {
							moveSelected.feature.color = moveSelected.originalColor;
							moveSelected.feature = undefined;
						}
						// Pick a new feature
						var pickedFeature = viewer.scene.pick(movement.endPosition);
						if (!Cesium.defined(pickedFeature)) {
							nameOverlay.style.display = "none";
							return;
						} else {
							// A feature was picked, so show it's overlay content
							nameOverlay.style.display = "block";
							nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + "px";
							nameOverlay.style.left = movement.endPosition.x + "px";
							//如果拾取的要素包含属性信息
							if (Cesium.defined(pickedFeature.getProperty)) {
								var name = pickedFeature.getProperty("id");
								nameOverlay.textContent = name;
							}

							// Highlight the feature if it's not already selected.
							if (pickedFeature !== moveSelected.feature) {
								moveSelected.feature = pickedFeature;
								Cesium.Color.clone(pickedFeature.color, moveSelected.originalColor);
								pickedFeature.color = Cesium.Color.YELLOW;
							}
						}
					},
					Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 设置要在输入事件上执行的功能。
				viewer.screenSpaceEventHandler.setInputAction((
						movement
					) => {
						// // 如果以前突出显示某个功能，请撤消突出显示
						// silhouetteGreen.selected = [];

						// // 选择一个新功能
						// const pickedFeature = viewer.scene.pick(movement.position);
						// if (!Cesium.defined(pickedFeature)) {
						// 	//左击功能
						// 	clickHandler(movement);
						// 	return;
						// }

						// // 如果尚未选择功能，请选择它
						// if (silhouetteGreen.selected[0] === pickedFeature) {
						// 	return;
						// }

						// // 保存所选要素的原始颜色
						// const highlightedFeature = silhouetteBlue.selected[0];
						// if (pickedFeature === highlightedFeature) {
						// 	silhouetteBlue.selected = [];
						// }

						// // 突出显示新选择的功能
						// silhouetteGreen.selected = [pickedFeature];

						// 清除之前的高亮元素
						if (Cesium.defined(highlighted.feature)) {
							highlighted.feature.color = highlighted.originalColor;
							highlighted.feature = undefined;
						}
						if (Cesium.defined(moveSelected.feature)) {
							moveSelected.feature.color = moveSelected.originalColor;
							moveSelected.feature = undefined;
						}

						// 选择新要素
						const pickedFeature = viewer.scene.pick(movement.position);
						if (!Cesium.defined(pickedFeature)) {
							return;
						}

						// 存储选中要素的信息
						highlighted.feature = pickedFeature;
						Cesium.Color.clone(
							pickedFeature.color,
							highlighted.originalColor
						);
						// 高亮选中元素
						pickedFeature.color = Cesium.Color.RED;


						// 设置功能信息框描述
						const featureName = pickedFeature.getProperty("name");
						selectedEntity.name = featureName;
						selectedEntity.description =
							'Loading <div class="cesium-infoBox-loading">123</div>';
						viewer.selectedEntity = selectedEntity;
						selectedEntity.description =
							`${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>Floor</th><td>"
      }${pickedFeature.getProperty("Floor")}</td></tr>` +
							`<tr><th>Height</th><td>${pickedFeature.getProperty(
        "Height"
      )}</td></tr>` +
							`<tr><th>id</th><td>${pickedFeature.getProperty(
        "id"
      )}</td></tr>` +
							`</tbody></table>`;
					},
					Cesium.ScreenSpaceEventType.LEFT_CLICK);



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
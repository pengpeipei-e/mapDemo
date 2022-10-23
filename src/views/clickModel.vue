<template>
	<div>
		<div id="cesiumContainer" class="fullSize"></div>
	</div>
</template>

<script>
	export default {
		mounted() {
			// Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOWQ2MjYxMS04ZjU3LTRiYWMtYTliNS0wMjExZDRkYmFjM2IiLCJpZCI6OTY5MDEsImlhdCI6MTY1NDc1ODE5Mn0.DiakGD1iQVMSJ46oE_dDLvQJZYqSi1Yx3TM7s-LXuJM'
			// A simple demo of 3D Tiles feature picking with hover and select behavior
			// Building data courtesy of NYC OpenData portal: http://www1.nyc.gov/site/doitt/initiatives/3d-building.page
			const viewer = new Cesium.Viewer("cesiumContainer", {
				//为 cesium世界地形 CesiumTerrainProvider 实例。
				terrainProvider: Cesium.createWorldTerrain(),
				infoBox: false,
			});
			// depthTestAgainstTerrain 属性的设置问题。属性为true之后，相对于地形表面绘制，所以有地形的时候，会被地形的高程遮挡；如果设为false（默认值），那么将始终在顶部绘制。
			viewer.scene.globe.depthTestAgainstTerrain = true;

			// 设置初始相机视图以查看 Manhattan
			//从以度为单位的经度和纬度值返回Cartesian3位置。
			const initialPosition = Cesium.Cartesian3.fromDegrees(
				-74.01881302800248,
				40.69114333714821,
				753
			);

			//从以度为单位的角度返回一个新的HeadingPitchRoll实例。
			const initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
				21.27879878293835,
				-21.34390550872461,
				0.0716951918898415
			);

			//设置相机的位置，方向和变换。
			viewer.scene.camera.setView({
				destination: initialPosition, //目的地
				orientation: initialOrientation, //方向
				endTransform: Cesium.Matrix4.IDENTITY, //结束变换
			});

			// Load the NYC buildings tileset
			//3D 切片集，用于流式传输大型异构 3D 地理空间数据集。
			const tileset = new Cesium.Cesium3DTileset({
				//封装cesium离子资产访问的 Resource 实例。异步创建一个实例。
				url: Cesium.IonResource.fromAssetId(75343), //cesium离子资产编号。
			});

			//获取基元的集合
			viewer.scene.primitives.add(tileset);

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

			// 有关当前所选功能的信息
			const selected = {
				// feature: undefined,
				originalColor: new Cesium.Color(),
			};

			// 一个实体对象，它将保存有关当前选择的信息框显示功能的信息
			const selectedEntity = new Cesium.Entity();

			// 获取默认的左键单击处理程序，用于在左键单击时未选择功能
			const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
				Cesium.ScreenSpaceEventType.LEFT_CLICK
			);

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
				const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
				silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
				silhouetteBlue.uniforms.length = 0.01;
				silhouetteBlue.selected = [];

				const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
				silhouetteGreen.uniforms.color = Cesium.Color.LIME;
				silhouetteGreen.uniforms.length = 0.01;
				silhouetteGreen.selected = [];

				//后处理效果应用于最终渲染。
				viewer.scene.postProcessStages.add(
					Cesium.PostProcessStageLibrary.createSilhouetteStage([
						silhouetteBlue,
						silhouetteGreen,
					])
				);

				// Silhouette a feature blue on hover.
				//设置要在输入事件上执行的功能。
				viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
						movement
					) {
						// 如果以前突出显示某个功能，请撤消突出显示
						silhouetteBlue.selected = [];

						// Pick a new feature
						//如果为 true ，则启用使用深度缓冲区拾取半透明几何体的功能。
						const pickedFeature = viewer.scene.pick(movement.endPosition);
						// console.log(pickedFeature);
						if (!Cesium.defined(pickedFeature)) {
							nameOverlay.style.display = "none";
							return;
						}

						// A feature was picked, so show it's overlay content
						nameOverlay.style.display = "block";
						nameOverlay.style.bottom = `${
      viewer.canvas.clientHeight - movement.endPosition.y
    }px`;
						nameOverlay.style.left = `${movement.endPosition.x}px`;
						//getProperty  获取属性
						const name = pickedFeature.getProperty("BIN");
						nameOverlay.textContent = name;

						// 如果尚未选择该功能，请突出显示该功能。
						if (pickedFeature !== selected.feature) {
							silhouetteBlue.selected = [pickedFeature];
						}
					},
					Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 设置要在输入事件上执行的功能。
				viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
						movement
					) {
						// 如果以前突出显示某个功能，请撤消突出显示
						silhouetteGreen.selected = [];

						// 选择一个新功能
						const pickedFeature = viewer.scene.pick(movement.position);
						if (!Cesium.defined(pickedFeature)) {
							//左击功能
							clickHandler(movement);
							return;
						}

						// 如果尚未选择功能，请选择它
						if (silhouetteGreen.selected[0] === pickedFeature) {
							return;
						}

						// 保存所选要素的原始颜色
						const highlightedFeature = silhouetteBlue.selected[0];
						if (pickedFeature === highlightedFeature) {
							silhouetteBlue.selected = [];
						}

						// 突出显示新选择的功能
						silhouetteGreen.selected = [pickedFeature];

						// 设置功能信息框描述
						const featureName = pickedFeature.getProperty("name");
						selectedEntity.name = featureName;
						selectedEntity.description =
							'Loading <div class="cesium-infoBox-loading"></div>';
						viewer.selectedEntity = selectedEntity;
						console.log(viewer.selectedEntity);
						selectedEntity.description =
							`${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>BIN</th><td>"
      }${pickedFeature.getProperty("BIN")}</td></tr>` +
							`<tr><th>DOITT ID</th><td>${pickedFeature.getProperty(
        "DOITT_ID"
      )}</td></tr>` +
							`<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
        "SOURCE_ID"
      )}</td></tr>` +
							`</tbody></table>`;
					},
					Cesium.ScreenSpaceEventType.LEFT_CLICK);
			} else {
				// 不支持剪影。 相反，更改特征颜色。

				// 有关当前突出显示的功能的信息
				const highlighted = {
					feature: undefined,
					originalColor: new Cesium.Color(),
				};

				// 在悬停时将特征颜色为黄色。
				viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
						movement
					) {
						// 如果以前突出显示某个功能，请撤消突出显示
						if (Cesium.defined(highlighted.feature)) {
							highlighted.feature.color = highlighted.originalColor;
							highlighted.feature = undefined;
						}
						// 选择一个新功能
						const pickedFeature = viewer.scene.pick(movement.endPosition);
						if (!Cesium.defined(pickedFeature)) {
							nameOverlay.style.display = "none";
							return;
						}
						// 选择了一个特征，所以显示它的覆盖内容
						nameOverlay.style.display = "block";
						nameOverlay.style.bottom = `${
      viewer.canvas.clientHeight - movement.endPosition.y
    }px`;
						nameOverlay.style.left = `${movement.endPosition.x}px`;
						let name = pickedFeature.getProperty("name");
						if (!Cesium.defined(name)) {
							name = pickedFeature.getProperty("id");
						}
						nameOverlay.textContent = name;
						// 如果尚未选择该功能，请突出显示该功能。
						if (pickedFeature !== selected.feature) {
							highlighted.feature = pickedFeature;
							Cesium.Color.clone(
								pickedFeature.color,
								highlighted.originalColor
							);
							pickedFeature.color = Cesium.Color.YELLOW;
						}
					},
					Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 为选择的功能着色并在信息框中显示元数据。
				viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
						movement
					) {
						// 如果之前选择了某个功能，请撤消突出显示
						if (Cesium.defined(selected.feature)) {
							selected.feature.color = selected.originalColor;
							selected.feature = undefined;
						}
						// 选择一个新功能
						const pickedFeature = viewer.scene.pick(movement.position);
						if (!Cesium.defined(pickedFeature)) {
							clickHandler(movement);
							return;
						}
						// 如果尚未选择功能，请选择它
						if (selected.feature === pickedFeature) {
							return;
						}
						selected.feature = pickedFeature;
						// 保存所选要素的原始颜色
						if (pickedFeature === highlighted.feature) {
							Cesium.Color.clone(
								highlighted.originalColor,
								selected.originalColor
							);
							highlighted.feature = undefined;
						} else {
							Cesium.Color.clone(pickedFeature.color, selected.originalColor);
						}
						// 突出显示新选择的功能
						pickedFeature.color = Cesium.Color.LIME;
						// 设置功能信息框描述
						const featureName = pickedFeature.getProperty("name");
						selectedEntity.name = featureName;
						selectedEntity.description =
							'Loading <div class="cesium-infoBox-loading"></div>';
						viewer.selectedEntity = selectedEntity;
						selectedEntity.description =
							`${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>BIN</th><td>"
      }${pickedFeature.getProperty("BIN")}</td></tr>` +
							`<tr><th>DOITT ID</th><td>${pickedFeature.getProperty(
        "DOITT_ID"
      )}</td></tr>` +
							`<tr><th>SOURCE ID</th><td>${pickedFeature.getProperty(
        "SOURCE_ID"
      )}</td></tr>` +
							`<tr><th>Longitude</th><td>${pickedFeature.getProperty(
        "longitude"
      )}</td></tr>` +
							`<tr><th>Latitude</th><td>${pickedFeature.getProperty(
        "latitude"
      )}</td></tr>` +
							`<tr><th>Height</th><td>${pickedFeature.getProperty(
        "height"
      )}</td></tr>` +
							`<tr><th>Terrain Height (Ellipsoid)</th><td>${pickedFeature.getProperty(
        "TerrainHeight"
      )}</td></tr>` +
							`</tbody></table>`;
					},
					Cesium.ScreenSpaceEventType.LEFT_CLICK);
			}


		}
	}
</script>

<style>

</style>
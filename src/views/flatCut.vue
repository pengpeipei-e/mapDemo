<template>
	<div>
		<div style="display: -webkit-flex;display: flex;width: 100%;height: 100%">
			<div style="width: 90%;height: 100%">
				<div id="cesiumContainer"></div>
			</div>
			<div style="width: 10%;height: 100%;background-color: #d3d3d3;padding: 30px">
				<!--<button onclick="cameraLookAtTransform()">模型定位</button>
    <button onclick="clipModel()">裁剪模型</button>-->
				<div id="clipId"></div>
			</div>
		</div>
		<div id="slider"></div>
	</div>
</template>

<script>
	export default {
		mounted() {
			let targetY = 0.0;
			let planeEntities = [];
			let selectedPlane;
			let clippingPlanes;

			let viewer = new Cesium.Viewer('cesiumContainer', {
				geocoder: false,
				homeButton: false,
				sceneModePicker: false,
				baseLayerPicker: false,
				navigationHelpButton: false,
				animation: false,
				timeline: false,
				fullscreenButton: false,
				vrButton: false
			});


			viewer._cesiumWidget._creditContainer.style.display = "none";


			// 定义一个ClippingPlaneCollection类，用来存储裁剪面
			clippingPlanes = new Cesium.ClippingPlaneCollection({
				planes: [ // ClippingPlane对象数组集合
					new Cesium.ClippingPlane( // 裁切面
						new Cesium.Cartesian3(0.0, 0.0, -1.0), // 法线方向
						0.0 // 原点到平面的最短距离，设置0就好
					),
				],
				edgeWidth: 1.0, // 模型被裁切部分的截面线宽
				edgeColor: Cesium.Color.WHITE // 模型裁剪颜色
			});


			let model = new Cesium.Cesium3DTileset({
				url: 'http://54765z.natappfree.cc/qxsj-1/tileset.json',
				clippingPlanes: clippingPlanes,
				// skipLevelOfDetail: true,
				// baseScreenSpaceError: 1024,
				// skipScreenSpaceErrorFactor: 16,
				// skipLevels: 1,
				// immediatelyLoadDesiredLevelOfDetail: false,
				// loadSiblings: false,
				// cullWithChildrenBounds: true
			});


			let tileset = viewer.scene.primitives.add(model);
			tileset.debugShowBoundingVolume = false;
			tileset.readyPromise
				.then(function(tileset) {

					const boundingSphere = tileset.boundingSphere;
					const radius = boundingSphere.radius;
					CreateSlider('slider', 200, 20, 300, 'slider');



					viewer.zoomTo(
						tileset,
						new Cesium.HeadingPitchRange(0.5, -0.2, radius * 4.0)
					);

					// viewer.zoomTo(tileset)

					if (
						!Cesium.Matrix4.equals( // Cesium.Matrix4.equals(a,b)判断两个四维矩阵是否相等
							tileset.root.transform, // 整个根节点模型矩阵，该tileSet=>世界坐标系
							Cesium.Matrix4.IDENTITY // 单位矩阵，对角线值为1.0的4*4矩阵
						)
					) {
						// The clipping plane is initially positioned at the tileset's root transform.
						// Apply an additional matrix to center the clipping plane on the bounding sphere center.

						// 获取模型的世界坐标(笛卡尔)
						// Cesium.Matrix4.getTranslation 通过仿射变换矩阵获取该tileSet的世界坐标
						const transformCenter = Cesium.Matrix4.getTranslation(
							tileset.root.transform,
							new Cesium.Cartesian3()
						);
						// debugger;
						// 将笛卡尔坐标转换为WGS84经纬度坐标（模型的）
						const transformCartographic = Cesium.Cartographic.fromCartesian(
							transformCenter
						);
						// 将笛卡尔坐标转换为WGS84经纬度坐标（截面的）
						const boundingSphereCartographic = Cesium.Cartographic.fromCartesian(
							tileset.boundingSphere.center
						);
						const height =
							boundingSphereCartographic.height - transformCartographic.height;

						// 从一个Cartesian3对象生成Matrix4变换矩阵（裁切面的）
						clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(
							new Cesium.Cartesian3(0.0, 0.0, height)
						);
					}
					// console.log(tileset);

					// 创建添加裁剪平面
					for (let i = 0; i < clippingPlanes.length; ++i) {
						const plane = clippingPlanes.get(i);
						const planeEntity = viewer.entities.add({
							position: boundingSphere.center,
							plane: {
								dimensions: new Cesium.Cartesian2(
									radius * 2.5,
									radius * 2.5
								),
								material: new Cesium.StripeMaterialProperty({
									evenColor: Cesium.Color.WHITE.withAlpha(0.1),

								}), // todo 不知道为啥构建测试的时候报错  Cesium.Color.WHITE.withAlpha(0.1)
								plane: new Cesium.CallbackProperty(
									// 添加绑定事件，不断调用
									createPlaneUpdateFunction(plane),
									false
								),
								outline: true,
								outlineColor: Cesium.Color.WHITE,
							},
						});
						planeEntities.push(planeEntity);
					}


				})
				.catch(function(error) {
					console.log(error);
				});

			//模型定位
			function cameraLookAtTransform() {
				var boundingSphere = model.boundingSphere
				viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(120.0), Cesium.Math.toRadians(-10), boundingSphere.radius * 2.5))
				viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
			}

			function createPlaneUpdateFunction(plane) {
				return function() {
					if (window.localStorage.getItem('slider')) {
						// console.log(window.localStorage.getItem('slider'))
						plane.distance = parseFloat(window.localStorage.getItem('slider'));
						document.getElementById("clipId").innerHTML = "剪切平面距离模型高度：" + plane.distance;
						return plane;
					}
					plane.distance = targetY;
					console.log("444")
					return plane;
				};
			}

			function CreateSlider(f_id, left, top, max, localStoragename) {
				let fEve = document.getElementById(f_id);
				window.localStorage.setItem(localStoragename, 0);
				let sliderDiv = document.createElement('div');
				sliderDiv.style.position = 'absolute';
				sliderDiv.style.left = left + 'px';
				sliderDiv.style.top = top + 'px';
				sliderDiv.style.zIndex = 99;

				//滑动长条
				let outerDiv = document.createElement('div');
				outerDiv.style.position = 'absolute';
				outerDiv.style.width = max + 'px';
				outerDiv.style.height = '8px';
				outerDiv.style.margin = '6px 0 0 0';
				outerDiv.style.background = '#fff';
				outerDiv.style.border = 'none';
				outerDiv.style.borderRadius = '3px';
				sliderDiv.appendChild(outerDiv);

				//滑动条指针
				let innerDiv = document.createElement('div');
				innerDiv.style.position = 'absolute';
				innerDiv.style.height = '20px';
				innerDiv.style.width = '5px';
				innerDiv.style.left = max / 2 + 'px';
				innerDiv.style.background = 'chocolate';
				innerDiv.style.border = '1px solid';
				innerDiv.style.borderRadius = '3px';

				sliderDiv.appendChild(innerDiv);
				fEve.appendChild(sliderDiv);

				function getPos(ev) {
					let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
					let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
					return {
						x: ev.clientX + scrollLeft,
						y: ev.clientY + scrollTop
					};
				}

				function getStyle(obj, name) {
					if (obj.currentStyle) {
						return obj.currentStyle[name];
					} else {
						return getComputedStyle(obj, false)[name];
					}
				}

				innerDiv.onmousedown = function(ev) {
					let oEvent = ev || event;
					let pos = getPos(oEvent);
					let disx = pos.x - parseInt(getStyle(innerDiv, 'left'));
					document.onmousemove = function(ev) {
						let oEvent = ev || event;
						let pos = getPos(oEvent);
						let l = pos.x - disx;
						if (l < 0) {
							l = 0;
						}
						if (l > parseInt(getStyle(outerDiv, 'width')) - parseInt(getStyle(innerDiv, 'width'))) {
							l = parseInt(getStyle(outerDiv, 'width')) - parseInt(getStyle(innerDiv, 'width'))
						}
						innerDiv.style.left = l + 'px';

						window.localStorage.setItem(localStoragename, l - max / 2);
					}
					document.onmouseup = function() {
						document.onmousemove = null;
						document.onmouseup = null;
					}
					return false;
				}
			}
		}
	}
</script>

<style>
	#cesiumContainer {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
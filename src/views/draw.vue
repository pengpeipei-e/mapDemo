<template>
	<div id="cesiumContainer">
		<button @click="drawPoint">点</button>
		<button @click="drawPolygon">面</button>
		<button @click="drawLine">线</button>
		<button @click="drawCircle">圆</button>
		<button @click="drawRectangle">矩形</button>
	</div>
</template>

<script>
	import * as turf from '@turf/turf'
	export default {
		data() {
			return {
				addPolygon: [], // 记录绘制过程中的面实体
				viewer: null,
				drawingMode: 'line',

				activeShapePoints: [],
				activeShape: null,
				floatingPoint: null,


				circle_end_point: null,
				circle_center_entity: null,
				temporary_circle_entity: null,
				circle_entity: null,
				circle_center_point: null,


				activeShapePoints: [],
				activeShape: null,
				floatingPoint: null,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer("cesiumContainer", {
				infoBox: false
			});
			this.viewer.scene.camera.setView({
				destination: new Cesium.Cartesian3.fromDegrees(
					116.4566,
					39.9149,
					5323.445971240632
				),
				orientation: {
					heading: 3.1612,
					pitch: -1.5188,
					roll: 6.283185307179563
				}
			});
		},
		methods: {

			//格式转换
			pointsToDegreesArray(points) {
				let degreesArray = [];
				points.map(item => {
					degreesArray.push(item[0]);
					degreesArray.push(item[1]);
				});
				return degreesArray;
			},
			// 点
			drawPoint() {
				const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
				handler.setInputAction((event) => {
					// We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
					// we get the correct point when mousing over terrain.
					// var earthPosition = this.viewer.scene.pickPosition(event.position);
					var ray = this.viewer.camera.getPickRay(event.position);
					// 笛卡尔坐标系
					var position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
					this.createPoint(position);


					// 笛卡尔坐标转wgs84坐标x、y、z
					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					var xyz = new Cesium.Cartesian3(this.changeToThree(event.position).x, this.changeToThree(event.position).y, this.changeToThree(event.position).z);
					var wgs84 = ellipsoid.cartesianToCartographic(xyz);

					console.log(wgs84);
					let point = turf.point([Cesium.Math.toDegrees(wgs84.longitude), Cesium.Math.toDegrees(wgs84.latitude)]);

					let buffered = turf.buffer(point, 60, {
						units: 'meters'
					});
					let coordinates = buffered.geometry.coordinates[0];
					let degreesArray = this.pointsToDegreesArray(coordinates);
					this.addBufferPolyogn(degreesArray)
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

			},
			// 面
			drawPolygon() {
				const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
				let movePosition = []; // 记录绘制过程中移动的点位置
				let moveEntity = null; // 记录绘制过程中移动的点实体
				let positions = []; // 记录左键点击的点位置
				let polygonEntity = null; // 记录面实体
				let pointEntities = []; // 记录左键点击的点实体
				let polygonBufferPosition = []; //用于缓冲

				// 鼠标移动事件
				handler.setInputAction(event => {
					// 除第一次，每次移动都会删除上次的点实体
					moveEntity && this.viewer.entities.remove(moveEntity);
					// 每次移动，都会删除上次的移动点位置，置为空数组
					movePosition = [];
					// 每次移动都会记录当前点位置
					movePosition.push(this.changeToThree(event.endPosition));
					// 创建移动点实体
					this.viewer.entities.add({
						position: movePosition[0],
						point: {
							pixelSize: 8,
							color: Cesium.Color.fromCssColorString('blue').withAlpha(0.7),
						},
					});
					// 记录点实体
					moveEntity = this.viewer.entities.values.slice(-1)[0];
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 点击左键事件
				handler.setInputAction(event => {
					// 记录左键点击的点实体位置
					positions.push(this.changeToThree(event.position));
					// 笛卡尔坐标转wgs84坐标x、y、z
					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					var xyz = new Cesium.Cartesian3(this.changeToThree(event.position).x, this.changeToThree(event.position).y, this.changeToThree(event.position).z);
					var wgs84 = ellipsoid.cartesianToCartographic(xyz);
					polygonBufferPosition.push([Cesium.Math.toDegrees(wgs84.longitude), Cesium.Math.toDegrees(wgs84.latitude)])

					// 如果左键已经点击产生了一个点，加上移动的点，已经能够构成一个线段了
					if (positions.length === 1) {
						// 添加绘制的面实体
						polygonEntity = this.viewer.entities.add({
							polygon: {
								// 绘制动态面实体时，面的位置信息必须是使用 Cesium.CallbackProperty() 和 Cesium.PolygonHierarchy() 返回的坐标
								hierarchy: new Cesium.CallbackProperty(function() {
									return new Cesium.PolygonHierarchy(positions.concat(movePosition));
								}, false),
								material: Cesium.Color.fromCssColorString('blue').withAlpha(0.1),
							},
							polyline: {
								positions: new Cesium.CallbackProperty(function() {
									return positions.concat(movePosition).concat([positions[0]]);
								}, false),
								material: Cesium.Color.fromCssColorString('blue').withAlpha(0.5),
								// 必须给 golyline 设置贴地，否则会造成绘制的面和线在地图放大到一定程度后有误差
								clampToGround: true,
								width: 3,
							},
						});
					}
					// 添加点实体
					this.viewer.entities.add({
						position: this.changeToThree(event.position),
						point: {
							pixelSize: 8,
							color: Cesium.Color.fromCssColorString('blue').withAlpha(0.7),
						},
					});
					// 记录点实体
					pointEntities.push(this.viewer.entities.values.slice(-1)[0]);
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

				// 点击右键事件
				handler.setInputAction(() => {
					// 删除所有的点实体
					pointEntities.forEach(item => {
						// this.viewer.entities.remove(item);
					});
					// 必须大于等于 3 个点才能创建面，否则删除
					if (positions.length >= 3) {
						this.addPolygon.push(polygonEntity);
						// 将最终的面信息保存起来,为了将面的位置信息保存起来
						polygonEntity.polygon.hierarchy = positions;
						// 计算面实体的面积和周长
						// const polygon = turf.polygon([changeToLnglgt(positions.concat(positions[0]))]);
						// const S = turf.area(polygon);
						// const lineString = turf.lineString(changeToLnglgt(positions.concat(positions[0])));
						// const C = turf.length(lineString);
						// console.log(`该面实体的面积为${ S / 1000000 }km^2, 该面实体的周长为${ C }km`)
					} else {
						this.viewer.entities.remove(polygonEntity);
					};
					// 记录添加的面实体
					this.addPolygon.push(polygonEntity);

					// 缓冲面
					// turf.polygon需要第一个点和最后一个点相同
					polygonBufferPosition.push(polygonBufferPosition[0])
					let polygonF;
					polygonF = turf.polygon([polygonBufferPosition]);

					let buffered = turf.buffer(polygonF, 60, {
						units: 'meters'
					});
					let coordinates = buffered.geometry.coordinates[0];
					let degreesArray = this.pointsToDegreesArray(coordinates);
					this.addBufferPolyogn(degreesArray)


					movePosition = []; // 控制最后右键点击的点是否保留
					// 删除最后一个移动的点实体
					// this.viewer.entities.remove(moveEntity);
					// 取消所有的监听函数
					handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
					handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
					handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},
			// 定义一个将经纬度格式转为世界坐标格式的方法
			changeToThree(position) {
				if (!position) return [];
				return this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(position), this.viewer.scene);
			},
			// 点击删除所有的面实体
			// clearAll() {
			// 	this.addPolygon.forEach(item => {
			// 		this.viewer.entities.remove(item);
			// 	});
			// },
			// 线
			drawLine() {
				const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
				let movePosition = []; // 记录绘制过程中移动的点位置
				let moveEntity = null; // 记录绘制过程中移动的点实体
				let positions = []; // 记录左键点击的点位置
				let polyLineEntity = null; // 记录线实体
				let pointEntities = []; // 记录左键点击的点实体
				let polyLineBufferPosition = []; //用于缓冲

				// 鼠标移动事件
				handler.setInputAction(event => {
					// 除第一次，每次移动都会删除上次的点实体
					moveEntity && this.viewer.entities.remove(moveEntity);
					// 每次移动，都会删除上次的移动点位置，置为空数组
					movePosition = [];
					// 每次移动都会记录当前点位置
					movePosition.push(this.changeToThree(event.endPosition));
					// 创建移动点实体
					this.viewer.entities.add({
						position: movePosition[0],
						point: {
							pixelSize: 8,
							color: Cesium.Color.fromCssColorString('blue').withAlpha(0.7),
						},
					});
					// 记录点实体
					moveEntity = this.viewer.entities.values.slice(-1)[0];
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 点击左键事件
				handler.setInputAction(event => {
					// 记录左键点击的点实体位置
					positions.push(this.changeToThree(event.position));

					// 笛卡尔坐标转wgs84坐标x、y、z
					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					var xyz = new Cesium.Cartesian3(this.changeToThree(event.position).x, this.changeToThree(event.position).y, this.changeToThree(event.position).z);
					var wgs84 = ellipsoid.cartesianToCartographic(xyz);
					polyLineBufferPosition.push([Cesium.Math.toDegrees(wgs84.longitude), Cesium.Math.toDegrees(wgs84.latitude)])

					// 如果左键已经点击产生了一个点，加上移动的点，已经能够构成一个线段了
					if (positions.length === 1) {
						// 添加绘制的面实体
						polyLineEntity = this.viewer.entities.add({
							polyline: {
								positions: new Cesium.CallbackProperty(function() {
									return positions.concat(movePosition);
								}, false),
								material: Cesium.Color.fromCssColorString('blue').withAlpha(0.5),
								// 必须给 golyline 设置贴地，否则会造成绘制的面和线在地图放大到一定程度后有误差
								clampToGround: true,
								width: 3,
							},
						});
					}
					// 添加点实体
					this.viewer.entities.add({
						position: this.changeToThree(event.position),
						point: {
							pixelSize: 8,
							color: Cesium.Color.fromCssColorString('blue').withAlpha(0.7),
						},
					});
					// 记录点实体
					pointEntities.push(this.viewer.entities.values.slice(-1)[0]);
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

				// 点击右键事件
				handler.setInputAction(() => {
					console.log(polyLineBufferPosition);
					let polylineF = turf.lineString(polyLineBufferPosition);
					let buffered = turf.buffer(polylineF, 30, {
						units: 'meters'
					});
					let coordinates = buffered.geometry.coordinates[0];
					let degreesArray = this.pointsToDegreesArray(coordinates);
					this.addBufferPolyogn(degreesArray)

					// 记录添加的面实体
					this.addPolygon.push(polyLineEntity);
					movePosition = []; // 控制最后右键点击的点是否保留
					// 删除最后一个移动的点实体
					// this.viewer.entities.remove(moveEntity);
					// 取消所有的监听函数
					handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
					handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
					handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},

			// 圆
			drawCircle() {
				let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

				// 鼠标点击左键
				handler.setInputAction(event => {
					this.viewer.scene.globe.depthTestAgainstTerrain = true;
					//根据屏幕坐标获取坐标位置
					// const point = GV.GeoPoint.fromScreen(position.position.x, position.position.y, viewer);
					var ray = this.viewer.camera.getPickRay(event.position);
					var position = this.viewer.scene.globe.pick(ray, this.viewer.scene);

					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					let cartographic3 = ellipsoid.cartesianToCartographic(position);
					const point = {
						lon: Cesium.Math.toDegrees(cartographic3.longitude),
						lat: Cesium.Math.toDegrees(cartographic3.latitude)

					}

					if (!point) {
						alert('请点击地球获取坐标！')
						return;
					}

					// 判断圆心是否已经绘制，如果绘制了，再次点击左键的时候，就是绘制最终结果圆形
					if (this.circle_center_entity) {
						// 设置最终点
						this.circle_end_point = {
							lon: point.lon.toFixed(10),
							lat: point.lat.toFixed(10),
							height: 0
						}
						// 绘制结果多边形
						this.draw_circle();
						// 清除事件
						handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
						handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
						// 清除 绘制的中心点和临时圆
						this.viewer.entities.remove(this.circle_center_entity);
						this.viewer.entities.remove(this.temporary_circle_entity);
					} else {
						// 设置中心点坐标和结束点坐标
						this.circle_end_point = this.circle_center_point = {
							lon: point.lon.toFixed(10),
							lat: point.lat.toFixed(10),
							height: 0
						}
						// 绘制圆心点
						this.create_circle_center_point([point.lon.toFixed(10), point.lat.toFixed(10)]);
						// 开始绘制动态圆形
						this.draw_dynamic_circle(this.circle_center_point)
					}

				}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

				// 鼠标移动--实时绘制圆形
				handler.setInputAction((event) => {
					//根据屏幕坐标获取坐标位置
					// const point = GV.GeoPoint.fromScreen(position.endPosition.x, position.endPosition.y, viewer);

					var ray = this.viewer.camera.getPickRay(event.endPosition);
					var positionMouse = this.viewer.scene.globe.pick(ray, this.viewer.scene);
					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					let cartographic3 = ellipsoid.cartesianToCartographic(positionMouse);
					const point = {
						lon: Cesium.Math.toDegrees(cartographic3.longitude),
						lat: Cesium.Math.toDegrees(cartographic3.latitude)

					}

					if (point) {
						if (this.temporary_circle_entity) {
							// 修改结束点-用于动态绘制圆形
							this.circle_end_point = {
								lon: point.lon.toFixed(10),
								lat: point.lat.toFixed(10),
								height: 0
							}
						}
					}
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			},
			// 绘制结果圆形
			draw_circle() {
				this.circle_entity = this.viewer.entities.add({
					position: Cesium.Cartesian3.fromDegrees(this.circle_center_point.lon, this.circle_center_point.lat),
					ellipse: {
						// 半短轴（画圆：半短轴和半长轴一致即可）
						semiMinorAxis: this.two_points_distance(this.circle_center_point, this.circle_end_point),
						// 半长轴
						semiMajorAxis: this.two_points_distance(this.circle_center_point, this.circle_end_point),
						// 填充色
						material: Cesium.Color.RED.withAlpha(0.5),
						// 是否有边框
						outline: true,
						// 边框颜色
						outlineColor: Cesium.Color.WHITE,
						// 边框宽度
						outlineWidth: 4
					},
				});


				this.viewer.entities.add({
					position: Cesium.Cartesian3.fromDegrees(this.circle_center_point.lon, this.circle_center_point.lat),
					ellipse: {
						// 半短轴（画圆：半短轴和半长轴一致即可）
						semiMinorAxis: this.two_points_distance(this.circle_center_point, this.circle_end_point) + 30,
						// 半长轴
						semiMajorAxis: this.two_points_distance(this.circle_center_point, this.circle_end_point) + 30,
						// 填充色
						material: Cesium.Color.BLUE.withAlpha(0.5),
						// 是否有边框
						outline: true,
						// 边框颜色
						outlineColor: Cesium.Color.WHITE,
						// 边框宽度
						outlineWidth: 4
					},
				});

				console.log(this.circle_entity);
			},
			// 创建圆心点
			create_circle_center_point(point_arr) {
				this.circle_center_entity = this.viewer.entities.add({
					// fromDegrees（经度，纬度，高度）以度为单位的经度和纬度值返回Cartesian3位置
					position: Cesium.Cartesian3.fromDegrees(point_arr[0], point_arr[1], 100),
					point: {
						// 点的大小（像素）
						pixelSize: 5,
						// 点位颜色，fromCssColorString 可以直接使用CSS颜色
						color: Cesium.Color.WHITE,
						// 边框颜色
						outlineColor: Cesium.Color.fromCssColorString('#fff'),
						// 边框宽度(像素)
						outlineWidth: 2,
						// 是否显示
						show: true
					}
				});
			},
			// 绘制动态圆
			draw_dynamic_circle(point) {
				this.temporary_circle_entity = this.viewer.entities.add({
					position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
					ellipse: {
						// 半短轴（画圆：半短轴和半长轴一致即可）
						semiMinorAxis: new Cesium.CallbackProperty(() => {
							// PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
							return this.two_points_distance(point, this.circle_end_point);
						}, false),
						// 半长轴
						semiMajorAxis: new Cesium.CallbackProperty(() => {
							// PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
							return this.two_points_distance(point, this.circle_end_point);
						}, false),
						// 填充色
						material: Cesium.Color.RED.withAlpha(0.5),
						// 是否有边框
						outline: true,
						// 边框颜色
						outlineColor: Cesium.Color.WHITE,
						// 边框宽度
						outlineWidth: 4
					},
				});
				console.log(this.temporary_circle_entity);
			},
			// 根据经纬度计算两点之前的直线距离
			two_points_distance(start_point, end_point) {
				// 经纬度转换为世界坐标
				var start_position = Cesium.Cartesian3.fromDegrees(start_point.lon, start_point.lat, start_point.height);
				var end_position = Cesium.Cartesian3.fromDegrees(end_point.lon, end_point.lat, end_point.height);
				// 返回两个坐标的距离（单位：米）
				return Cesium.Cartesian3.distance(start_position, end_position);
			},

			// 矩形
			drawRectangle() {
				var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
				//鼠标左键
				handler.setInputAction((event) => {
					// We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
					// we get the correct point when mousing over terrain.
					// var earthPosition = this.viewer.scene.pickPosition(event.position);
					var ray = this.viewer.camera.getPickRay(event.position);
					// 笛卡尔坐标系
					var position = this.viewer.scene.globe.pick(ray, this.viewer.scene);

					var ellipsoid = this.viewer.scene.globe.ellipsoid;
					let cartographic3 = ellipsoid.cartesianToCartographic(position);
					// 84坐标系
					const point = {
						lon: Cesium.Math.toDegrees(cartographic3.longitude),
						lat: Cesium.Math.toDegrees(cartographic3.latitude)

					}
					// `earthPosition` will be undefined if our mouse is not over the globe.
					// if (Cesium.defined(earthPosition)) {
					// if (this.activeShapePoints.length === 0) {
					this.floatingPoint = this.createPoint(position);
					this.activeShapePoints.push(point);
					// this.activeShape = this.drawShape(dynamicPositions); //绘制动态图
					// }
					if (this.activeShapePoints.length === 2) {
						this.activeShape = this.drawShape(this.activeShapePoints); //绘制动态图
						handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
						handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
					}
					// this.floatingPoint = this.createPoint(position);
					this.createPoint(position);
					// }
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
				//鼠标移动
				handler.setInputAction((event) => {
					if (Cesium.defined(this.floatingPoint)) {
						// var newPosition = this.viewer.scene.pickPosition(event.endPosition);
						var ray = this.viewer.camera.getPickRay(event.endPosition);
						// 笛卡尔坐标系
						var position = this.viewer.scene.globe.pick(ray, this.viewer.scene);

						var ellipsoid = this.viewer.scene.globe.ellipsoid;
						let cartographic3 = ellipsoid.cartesianToCartographic(position);


						// 84坐标系
						const point = {
							lon: Cesium.Math.toDegrees(cartographic3.longitude),
							lat: Cesium.Math.toDegrees(cartographic3.latitude)

						}
						// console.log(position);
						// if (Cesium.defined(newPosition)) {

						// this.floatingPoint.position.setValue(position);
						// this.activeShapePoints.pop();
						// this.activeShapePoints.push(point);
						// this.drawShape(this.activeShapePoints);
						// }
					}
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				handler.setInputAction((event) => {
					// terminateShape();
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},

			//绘制点
			createPoint(worldPosition) {
				var point = this.viewer.entities.add({
					position: worldPosition,
					point: {
						color: Cesium.Color.fromCssColorString('blue').withAlpha(0.7),
						pixelSize: 5,
						heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
					}
				});
				return point;
			},

			drawShape(positionData) {
				console.log(positionData);
				let pointOne = Cesium.Cartesian3.fromDegrees(positionData[0].lon, positionData[0].lat, 0)
				let pointTwo = Cesium.Cartesian3.fromDegrees(positionData[1].lon, positionData[1].lat, 0)
				var shape;
				//当positionData为数组时绘制最终图，如果为function则绘制动态图
				// var arr = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
				shape = this.viewer.entities.add({
					name: 'Blue translucent, rotated, and extruded ellipse with outline',
					rectangle: {
						coordinates: Cesium.Rectangle.fromCartesianArray([pointOne, pointTwo]),
						// coordinates: Cesium.Rectangle.fromCartesianArray([positionData[0].lon,positionData[0].lat,positionData[1].lon,positionData[1].lat]),
						material: Cesium.Color.BLUE.withAlpha(0.5)
					}
				});
				console.log(shape);
				let rectangle = Cesium.Rectangle.fromCartesianArray([pointOne, pointTwo])
				// 西北角弧度坐标（左上）
				const northwest = Cesium.Rectangle.northwest(rectangle)
				// 西南角弧度坐标（左下）
				const southwest = Cesium.Rectangle.southwest(rectangle)
				// 东北角弧度坐标（右上）
				const northeast = Cesium.Rectangle.northeast(rectangle)
				// 东南角弧度坐标（右下）
				const southeast = Cesium.Rectangle.southeast(rectangle)

				// 转换为经纬度
				// 左上坐标
				const leftTop = [Cesium.Math.toDegrees(northwest.longitude), Cesium.Math.toDegrees(northwest.latitude)]
				const leftBottom = [Cesium.Math.toDegrees(southwest.longitude), Cesium.Math.toDegrees(southwest.latitude)]
				const rightTop = [Cesium.Math.toDegrees(northeast.longitude), Cesium.Math.toDegrees(northeast.latitude)]
				const rightBottom = [Cesium.Math.toDegrees(southeast.longitude), Cesium.Math.toDegrees(southeast.latitude)]

				// 缓冲
				var polygon = turf.polygon([
					[leftTop, rightTop, rightBottom, leftBottom, leftTop]
				])
				let buffered = turf.buffer(polygon, 30, {
					units: 'meters'
				});
				let coordinates = buffered.geometry.coordinates[0];
				let degreesArray = this.pointsToDegreesArray(coordinates);
				this.addBufferPolyogn(degreesArray)

			},

			// 缓冲
			addBufferPolyogn(positions) {
				this.viewer.entities.add({
					polygon: {
						hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
						material: Cesium.Color.RED.withAlpha(0.6),
						classificationType: Cesium.ClassificationType.BOTH
					},
				});
			},

		},
	}
</script>

<style>
	#cesiumContainer {
		width: 100%;
		height: 100%;
	}
</style>
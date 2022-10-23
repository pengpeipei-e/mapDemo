<template>
	<div>
		<div id="toolbar">
			<table class="infoPanel">
				<tbody>
					<tr>
						<td>Left click to add a vertex.</td>
					</tr>
					<tr>
						<td>Right click to start new shape.</td>
					</tr>
				</tbody>
			</table>
		</div>
		<el-select v-model="value" placeholder="请选择" @change="drawType">
			<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
			</el-option>
		</el-select>
		<div id="cesiumContainer" class="fullSize"></div>

	</div>
</template>

<script>
	export default {
		data() {
			return {
				options: [{
					value: '线',
					label: '线'
				}, {
					value: '面',
					label: '面'
				}],
				value: '',
				viewer: null,
				drawingMode: "line",
				activeShapePoints: [],
				floatingPoint: undefined,
				activeShape: null,
			}
		},
		mounted() {
			this.viewer = new Cesium.Viewer("cesiumContainer", {
				selectionIndicator: false,
				infoBox: false,
				terrainProvider: Cesium.createWorldTerrain(),
			});

			if (!this.viewer.scene.pickPositionSupported) {
				window.alert("This browser does not support pickPosition.");
			}

			this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
				Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
			);

			// function createPoint(worldPosition) {
			// 	const point = this.viewer.entities.add({
			// 		position: worldPosition,
			// 		point: {
			// 			color: Cesium.Color.WHITE,
			// 			pixelSize: 5,
			// 			heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
			// 		},
			// 	});
			// 	return point;
			// }
			// let drawingMode = "line";

			// function drawShape(positionData) {
			// 	let shape;
			// 	if (this.drawingMode === "line") {
			// 		shape = viewer.entities.add({
			// 			polyline: {
			// 				positions: positionData,
			// 				clampToGround: true,
			// 				width: 3,
			// 			},
			// 		});
			// 	} else if (this.drawingMode === "polygon") {
			// 		shape = viewer.entities.add({
			// 			polygon: {
			// 				hierarchy: positionData,
			// 				material: new Cesium.ColorMaterialProperty(
			// 					Cesium.Color.WHITE.withAlpha(0.7)
			// 				),
			// 			},
			// 		});
			// 	}
			// 	return shape;
			// }
			// let activeShapePoints = [];
			// let activeShape;
			// let floatingPoint;
			const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
			handler.setInputAction((event) => {
				// We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
				// we get the correct point when mousing over terrain.
				const earthPosition = this.viewer.scene.pickPosition(event.position);
				// `earthPosition` will be undefined if our mouse is not over the globe.
				if (Cesium.defined(earthPosition)) {
					if (this.activeShapePoints.length === 0) {
						this.floatingPoint = this.createPoint(earthPosition);
						this.activeShapePoints.push(earthPosition);
						const dynamicPositions = new Cesium.CallbackProperty(function() {
							if (this.drawingMode === "polygon") {
								return new Cesium.PolygonHierarchy(this.activeShapePoints);
							}
							return this.activeShapePoints;
						}, false);
						this.activeShape = this.drawShape(dynamicPositions);
					}
					this.activeShapePoints.push(earthPosition);
					this.createPoint(earthPosition);
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

			handler.setInputAction((event) => {
				if (Cesium.defined(this.floatingPoint)) {
					const newPosition = this.viewer.scene.pickPosition(event.endPosition);
					if (Cesium.defined(newPosition)) {
						this.floatingPoint.position.setValue(newPosition);
						this.activeShapePoints.pop();
						this.activeShapePoints.push(newPosition);
					}
				}
			}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			// Redraw the shape so it's not dynamic and remove the dynamic shape.
			// function terminateShape() {
			// 	activeShapePoints.pop();
			// 	this.drawShape(activeShapePoints);
			// 	this.viewer.entities.remove(floatingPoint);
			// 	this.viewer.entities.remove(activeShape);
			// 	floatingPoint = undefined;
			// 	activeShape = undefined;
			// 	activeShapePoints = [];
			// }
			handler.setInputAction((event) => {
				this.terminateShape();
			}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

			const options = [{
					text: "Draw Lines",
					onselect: function() {
						if (!Cesium.Entity.supportsPolylinesOnTerrain(viewer.scene)) {
							window.alert(
								"This browser does not support polylines on terrain."
							);
						}

						terminateShape();
						drawingMode = "line";
					},
				},
				{
					text: "Draw Polygons",
					onselect: function() {
						terminateShape();
						drawingMode = "polygon";
					},
				},
			];

			// Sandcastle.addToolbarMenu(options);
			// Zoom in to an area with mountains
			this.viewer.camera.lookAt(
				Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0),
				new Cesium.Cartesian3(5000.0, 5000.0, 5000.0)
			);
			this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		},
		methods: {
			drawType(value) {
				if (value == '线') {
					this.terminateShape();
					this.drawingMode = "line";
				} else {
					this.terminateShape();
					this.drawingMode = "polygon";
				}
			},

			drawShape(positionData) {
				let shape;
				if (this.drawingMode === "line") {
					shape = this.viewer.entities.add({
						polyline: {
							positions: positionData,
							clampToGround: true,
							width: 3,
						},
					});
				} else if (this.drawingMode === "polygon") {
					shape = this.viewer.entities.add({
						polygon: {
							hierarchy: positionData,
							material: new Cesium.ColorMaterialProperty(
								Cesium.Color.WHITE.withAlpha(0.7)
							),
						},
					});
				}
				return shape;
			},
			createPoint(worldPosition) {
				const point = this.viewer.entities.add({
					position: worldPosition,
					point: {
						color: Cesium.Color.WHITE,
						pixelSize: 5,
						heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					},
				});
				return point;
			},
			terminateShape() {
				this.activeShapePoints.pop();
				this.drawShape(this.activeShapePoints);
				this.viewer.entities.remove(this.floatingPoint);
				this.viewer.entities.remove(this.activeShape);
				this.floatingPoint = undefined;
				this.activeShape = undefined;
				this.activeShapePoints = [];
			}
		}
	}
</script>

<style>

</style>
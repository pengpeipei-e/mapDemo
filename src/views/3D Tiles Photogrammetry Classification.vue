<template>
	<div>
		<button @click="toggle">切换</button>
		<div id="cesiumContainer" class="fullSize"></div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				checked: false,
				classificationTileset: null,
				nonClassificationTileset: null,
			}
		},
		mounted() {
			// An example of using a b3dm tilset to classify another b3dm tileset.
			const viewer = new Cesium.Viewer("cesiumContainer", {
				terrainProvider: Cesium.createWorldTerrain(),
			});

			// A normal b3dm tileset of photogrammetry
			const tileset = new Cesium.Cesium3DTileset({
				url: Cesium.IonResource.fromAssetId(40866),
			});
			viewer.scene.primitives.add(tileset);
			viewer.zoomTo(tileset);

			const classifcationTilesetUrl =
				"./build/3d.json";
			// A b3dm tileset used to classify the photogrammetry tileset
			this.classificationTileset = new Cesium.Cesium3DTileset({
				url: classifcationTilesetUrl,
				classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
			});
			this.classificationTileset.style = new Cesium.Cesium3DTileStyle({
				color: "rgba(255, 0, 0,1)",
			});
			viewer.scene.primitives.add(this.classificationTileset);

			// The same b3dm tileset used for classification, but rendered normally for comparison.
			this.nonClassificationTileset = new Cesium.Cesium3DTileset({
				url: classifcationTilesetUrl,
				show: true,
			});
			this.nonClassificationTileset.style = new Cesium.Cesium3DTileStyle({
				color: "rgba(255, 0, 0, 0.5)",
			});
			viewer.scene.primitives.add(this.nonClassificationTileset);

			// console.log(788, this.classificationTileset.show);
			// classificationTileset.show = this.checked;
			// nonClassificationTileset.show = !this.checked;

			// Sandcastle.addToggleButton("Show classification", true, function(
			// 	checked
			// ) {
			// 	classificationTileset.show = checked;
			// 	nonClassificationTileset.show = !checked;
			// });
		},
		methods: {
			toggle() {
				console.log(this.classificationTileset.show);
				this.classificationTileset.show = this.checked;
				this.nonClassificationTileset.show = !this.checked

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
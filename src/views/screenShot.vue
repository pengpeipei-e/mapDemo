<template>
	<div id="cesiumContainer" class="fullSize">
		<button>截图</button>
	</div>
</template>

<script>
	import canvas2image from 'canvas2image';

	export default {
		mounted() {
			const viewer = new Cesium.CesiumWidget("cesiumContainer", {
				"contextOptions": {
					"webgl": {
						"alpha": true,
						"depth": false,
						"stencil": true,
						"antialias": true,
						"premultipliedAlpha": true,
						"preserveDrawingBuffer": true,
						"failIfMajorPerformanceCaveat": true
					},
					"allowTextureFilterAnisotropic": true
				}
			});
			var canvas = viewer.scene.canvas;
			console.log(canvas);
			var base64Img = canvas.toDataURL('image/png')
			console.log(base64Img);
			// var imageWidth = 800;
			// var img = canvas2image.convertToImage(canvas, imageWidth, imageWidth * canvas.height / canvas.width, 'png');
			// console.log(img);
		}
	}
</script>

<style>
	.fullSize {
		width: 100%;
		height: 100%;

	}

	button {
		z-index: 999;
		position: absolute;
	}
</style>
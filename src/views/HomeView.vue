<template>
	<div class="home">
		<div class="cesium">
			cesium：
			<router-link to="/about">
				<button>展示三维</button>
			</router-link>
			<router-link to="/clickModel">
				<button>点击模型</button>
			</router-link>
			<router-link to="/tianditu">
				<button title="修改了点击和浮动展示">加载天地图</button>
			</router-link>
			<router-link to="/weather">
				<button>天气</button>
			</router-link>
			<router-link to="/3DModels">
				<button>3D Models</button>
			</router-link>
			<router-link to="/3DTilesPhotogrammetryClassification">
				<button>3D Tiles Photogrammetry Classification</button>
			</router-link>
			<router-link to="/track">
				<button>轨迹</button>
			</router-link>
			<router-link to="/line">
				<button>绘制线面</button>
			</router-link>
			<router-link to="/rollerShutter">
				<button>卷帘</button>
			</router-link>
			<router-link to="/splitScreen">
				<button>分屏对比</button>
			</router-link>
			<router-link to="/tilt">
				<button>倾斜摄影</button>
			</router-link>
			<router-link to="/terrain">
				<button>地形</button>
			</router-link>
			<router-link to="/flowWater">
				<button>流动水面</button>
			</router-link>
			<router-link to="/primitive">
				<button>primitive</button>
			</router-link>
			<router-link to="/kml">
				<button>kml转geojson</button>
			</router-link>
			<router-link to="/screenShot">
				<button>截图</button>
			</router-link>
			<router-link to="/flatCut">
				<button>剪切平面距离模型高</button>
			</router-link>
			<router-link to="/scope">
				<button>获取当前地图的范围</button>
			</router-link>
			<router-link to="/space">
				<button>空间内</button>
			</router-link>
			<router-link to="/draw">
				<button>画</button>
			</router-link>
		</div>
		<div class="openlayer">
			openlayer：
			<router-link to="/feature">
				<button>特征</button>
			</router-link>
		</div>
	</div>
</template>

<script>
	// @ is an alias to /src
	import HelloWorld from '@/components/HelloWorld.vue'

	export default {
		name: 'HomeView',
		components: {
			HelloWorld
		}
	}
</script>
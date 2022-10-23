<template>
	<div class="home">
		<div class="cesium">
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
				<button>3D Tiles Photogrammetry Classification.vue</button>
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
		</div>
		<div class="openlayer">
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
<template>
	<div id="map" class="map"></div>
</template>

<script>
	import "ol/ol.css";
	import {
		Map,
		View,
		Feature
	} from 'ol';
	import {
		OSM,
		Vector as VectorSource
	} from "ol/source";
	import {
		Vector as VectorLayer,
		Tile as TileLayer
	} from "ol/layer";

	import {
		Point,
		LineString,
		Polygon
	} from "ol/geom";

	export default {
		name: "Feature",
		data() {
			return {
				vectorLayer: null,
				map: null,
			}
		},
		mounted() {
			this.map = new Map({
				target: "map",
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
				],
				view: new View({
					projection: "EPSG:4326",
					center: [104.2979180563, 30.528298024],
					zoom: 18,
				}),
			});
			this.addLayer();
		},
		methods: {
			// feature中不能直接getSource()，layer才可以直接getSource()。
			// 但是可以通过自己封装函数来实现通过feature获取layer。feature可以直接getGeometry()
			addLayer() {
				// 是一个矢量图层，我们根据坐标值或者通过绘制生成的几何体，都是使用VectorLayer来添加的。
				this.vectorLayer = new VectorLayer({
					// 图层数据来源
					// 这是所有地图“特征”（圆圈）的存储位置
					source: new VectorSource(),
				});
				// 获取地图数据来源。并且添加属性
				this.vectorLayer.getSource().addFeature(
					//添加点图层
					new Feature({
						geometry: new Point([104.2979180563, 30.528298024]),
					})
					//添加线图层
					// new Feature({
					//   geometry: new LineString([
					//     [104.2979180563, 30.528298024],
					//     [104.2987389704, 30.527798338],
					//   ]),
					// })
					//添加面图层
					// new Feature({
					//   geometry: new Polygon([
					//     [
					//       [104.2979180563, 30.528298024],
					//       [104.2987389704, 30.527798338],
					//       [104.2974397847, 30.5265062907],
					//       [104.2979180563, 30.528298024],
					//     ],
					//   ]),
					// })
				);
				this.map.addLayer(this.vectorLayer);
				let a = new Feature({
					geometry: new LineString([
						[104.2979180563, 30.528298024],
						[104.2987389704, 30.527798338],
					]),
				})

				console.log(a.getProperties(),a,'a');
			},
		}
	}
</script>

<style>
	.map {
		width: 100%;
		height: 1000px;
	}
</style>
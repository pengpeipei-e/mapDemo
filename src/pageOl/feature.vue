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
	import crudOpenlayer from '../utils/crudOpenlayer'

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
					// new Feature({
					// 	geometry: new Point([104.2979180563, 30.528298024]),
					// })
					//添加线图层
					// new Feature({
					//   geometry: new LineString([
					//     [104.2979180563, 30.528298024],
					//     [104.2987389704, 30.527798338],
					//   ]),
					// })
					//添加面图层
					new Feature({
						geometry: new Polygon([
							[
								[106.0242078148728, 38.46239722297439],
								[106.08233607333709, 38.46334673559392],
								[106.05955929079816, 38.40059363758846],
								[106.0242078148728, 38.46239722297439],
							],
						]),
					})

				);
				let feature = new Feature({
					geometry: new Polygon([
						[
							[106.0242078148728, 38.46239722297439],
							[106.08233607333709, 38.46334673559392],
							[106.05955929079816, 38.40059363758846],
							[106.0242078148728, 38.46239722297439],
						],
					]),
				})
				this.map.addLayer(this.vectorLayer);
				let ft = new Feature();
				let properties = feature.getProperties()
				console.log('feature', feature.getProperties());
				ft.setProperties(properties)
				let geom = feature.getGeometry().clone()
				console.log(geom);
				geom.applyTransform((flatCoordinates, flatCoordinates2, stride) => {
					for (var j = 0; j < flatCoordinates.length; j += stride) {
						var y = flatCoordinates[j]
						var x = flatCoordinates[j + 1]
						flatCoordinates[j] = x
						flatCoordinates[j + 1] = y
					}
				})
				ft.setGeometryName('geom'); //设置名称放在前面
				ft.setGeometry(geom);
				delete ft.values_.geometry; //必须删除自带的geometry(会影响XML数据格式添加一个geometry标签)
				console.log(ft);


				// 测试用例
				let geoserverData = {
				  layer: "xmfw", //图层名称不需要带工作区名称
				  uri: "http://j9dnsg.natappfree.cc/xixialing", //工作区uri
				  EPSG: "EPSG:4490",
				  GEOMETRY_NAME: "geom", //重要和数据库中geom字段名称保持一致
				};
				new crudOpenlayer(geoserverData)
				  .queryFeatures(
				    "http://j9dnsg.natappfree.cc/geoserver/xixialing/wfs",
				    // like(
				    //   "子项目名称",
				    //   "SD甘南黄河上游水源涵养区湿地生态修复与生物多样性保护项目"
				    // )
				  )
				  .then((res) => {
				    console.log("测试wfs空间查询", res);
				  });
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
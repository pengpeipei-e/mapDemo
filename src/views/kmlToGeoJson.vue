<template>
	<div id="map" class="map"></div>
</template>

<script>
	import VectorLayer from "ol/layer/Vector";
	import {
		OSM,
		Vector as VectorSource
	} from "ol/source";
	import Map from 'ol/Map';
	import View from 'ol/View';
	import GeoJSON from "ol/format/GeoJSON";
	import Feature from 'ol/Feature';
	import {
		Style,
		Stroke,
		Fill
	} from "ol/style";
	import {
		Polygon,
		MultiPolygon
	} from "ol/geom";
	import {
		defaults as defaultControls,
		OverviewMap
	} from "ol/control";
	import {
		fromLonLat
	} from "ol/proj";
	import "ol/ol.css";
	import TileLayer from "ol/layer/Tile";
	import KML from 'ol/format/KML'
	import CircleStyle from 'ol/style/Circle';
	export default {
		data() {
			return {
				map: null,
			}
		},
		mounted() {
			this.map = new Map({
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
				],
				target: 'map',
				view: new View({
					center: [116.397128, 39.916527],
					zoom: 16,
				}),
			});
			this.getKmlToGeoJson();

		},
		methods: {
			getKmlToGeoJson() {


				// let a = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2"><Document xmlns=""><Style id="style-1"><LineStyle><width>3</width><color>cc13458b</color><colorMode>normal</colorMode></LineStyle><PolyStyle><color>19ffffff</color><colorMode>normal</colorMode></PolyStyle></Style><Placemark id="9a85e9e2-a024-4342-9f2a-c62fd5aba6e7"><name></name><visibility>1</visibility><description></description><styleUrl>#style-1</styleUrl><MultiGeometry><LineString><tessellate>1</tessellate><altitudeMode>clampToGround</altitudeMode><coordinates>105.99979239421904,38.44295411391245,9.313225746154785e-10 106.01858756184045,38.44435425219073,0 106.00766399017961,38.43389821977599,0 105.99979239421904,38.44295411391245,9.313225746154785e-10</coordinates></LineString><Polygon><outerBoundaryIs><LinearRing><coordinates>105.99979239421904,38.44295411391245,0 106.01858756184045,38.44435425219073,0 106.00766399017961,38.43389821977599,0</coordinates></LinearRing></outerBoundaryIs><altitudeMode>absolute</altitudeMode></Polygon></MultiGeometry></Placemark></Document></kml>'

				// using togeojson in nodejs

				const tj = require("@tmcw/togeojson");
				// const fs = require("fs");
				// node doesn't have xml parsing or a dom. use xmldom
				// const DOMParser = require("xmldom").DOMParser;

				// const kml = new DOMParser().parseFromString(fs.readFileSync("./kmlData.kml", "utf8"));

				// const converted = tj.kml(kml);
				// console.log(converted);

				let vectory = new VectorLayer({
					source: new VectorSource({
						url: './kmlData.kml',
						// url: a,
						format: new KML({
							extractStyles: false,
							// crossOrigin:"*"
						})
					}),
					style: new Style({
						fill: new Fill({
							color: 'rgba(255,177,51,0.15)',
						}),
						stroke: new Stroke({
							color: '#FFFF00',
							// lineDash: [10, 10],
							width: 3,
						}),
						text: new Text({
							fill: new Fill({
								color: '#db2d00',
							}),
							stroke: new Stroke({
								color: '#db2d00',
							}),
						}),
						image: new CircleStyle({
							radius: 5,
							stroke: new Stroke({
								color: '#ffb133',
								width: 2,
							}),
							fill: new Fill({
								color: 'rgba(255,177,51,0.15)',
							}),
						}),
					}),
				})
				console.log(vectory);
				this.map.addLayer(vectory)
				setTimeout(() => {
					const feature = vectory.getSource().getFeatures()
					console.log(feature);
					// 点击后把feature 转换为geojson数据
					const json = new GeoJSON().writeFeature(feature[0], {
						dataProjection: 'EPSG:3857',
						featureProjection: 'EPSG:3857'
					})
					console.log(json);
				}, 10000)
			}
		}
	}
</script>

<style>
	.map {
		width: 100%;
		height: 1000px;
	}
</style>
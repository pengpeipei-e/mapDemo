<template>
	<div>
		<el-select v-model="value" placeholder="请选择" @change="weather(value)">
			<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
			</el-option>
		</el-select>
		<el-button type="primary" @click="clearEffect">清除特效</el-button>
		<div id="cesiumContainer" class="fullSize"></div>

	</div>
</template>

<script>
	export default {
		data() {
			return {
				viewer: null,
				options: [{
					value: '晴天',
					label: '晴天'
				}, {
					value: '下雨',
					label: '下雨'
				}, {
					value: '下雪',
					label: '下雪'
				}, {
					value: '雾',
					label: '雾'
				}],
				value: '',
				collection: null,
				specialEffect: null,
			}
		},
		mounted() {
			const cesiumPara = {
				viewer: null,
			};
			cesiumPara.cameraPosition = function() {
				let cartographic = cesiumPara.viewer.scene.camera.positionCartographic;
				console.log("经度" + (cartographic.longitude * 180) / Math.PI);
				console.log("纬度" + (cartographic.latitude * 180) / Math.PI);
				console.log("高度" + cartographic.height);
				console.log("偏航" + cesiumPara.viewer.scene.camera.heading);
				console.log("俯仰" + cesiumPara.viewer.scene.camera.pitch);
				console.log("桶滚" + cesiumPara.viewer.scene.camera.roll);
			};
			let subdomains = ["0", "1", "2", "3", "4", "5", "6", "7"];
			let imageryProviderTDT = new Cesium.WebMapTileServiceImageryProvider({
				url: "https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=797585713b02a32e9ede3d155dffa9ef",
				subdomains: subdomains,
				layer: "tdtImage",
				style: "default",
				format: "image/jpeg",
				tileMatrixSetID: "GoogleMapsCompatible",
				show: true,
				maximumLevel: 18,
			});

			this.viewer = new Cesium.Viewer("cesiumContainer", {
				imageryProvider: imageryProviderTDT,
				geocoder: false, //查找位置工具，查找到之后会将镜头对准找到的地址，默认使用bing地图
				homeButton: false, //视角复位按钮
				sceneModePicker: false, //二三维切换按钮
				baseLayerPicker: false, //底图图层空间显隐
				navigationHelpButton: false, //帮组按钮
				animation: false, //左下角动画部件按钮
				timeline: false, //下侧时间轴
				fullscreenButton: false, //全屏按钮
				vrButton: false, //vr模式按钮
			});

			let tileset = this.viewer.scene.primitives.add(
				new Cesium.Cesium3DTileset({
					url: "./build/tileset.json",
				})
			);

			tileset.style = new Cesium.Cesium3DTileStyle({
				color: {
					conditions: [
						["true", "color('white', 1)"]
					],
				},
			});

			this.viewer.camera.flyTo({
				destination: Cesium.Cartesian3.fromDegrees(
					125.29205010375024,
					43.846426460858815,
					931.3050623720223
				),
				orientation: {
					heading: 0.05956398801633167,
					pitch: -0.43653091585028125,
					roll: 0.000011909843509627649,
				},
				duration: 3,
			});


			// HTML overlay for showing feature name on mouseover
			const nameOverlay = document.createElement("div");
			this.viewer.container.appendChild(nameOverlay);
			nameOverlay.className = "backdrop";
			nameOverlay.style.display = "none";
			nameOverlay.style.position = "absolute";
			nameOverlay.style.bottom = "0";
			nameOverlay.style.left = "0";
			nameOverlay.style["pointer-events"] = "none";
			nameOverlay.style.padding = "4px";
			nameOverlay.style.backgroundColor = "black";
			nameOverlay.style.color = 'white';


			// 移动高亮
			var moveSelected = {
				feature: undefined,
				originalColor: new Cesium.Color(),
			};
			//点击高亮
			var highlighted = {
				feature: undefined,
				originalColor: new Cesium.Color(),
			};

			// 一个实体对象，它将保存有关当前选择的信息框显示功能的信息
			const selectedEntity = new Cesium.Entity();



			// 如果支持剪影，则鼠标悬停时剪影特征为蓝色，鼠标单击时剪影特征为绿色。
			// 如果不支持轮廓，则在鼠标悬停时将特征颜色更改为黄色，在鼠标单击时将其更改为绿色。
			if (
				//是否支持剪影舞台。
				Cesium.PostProcessStageLibrary.isSilhouetteSupported(this.viewer.scene)
			) {
				// Silhouette a feature blue on hover.
				//设置要在输入事件上执行的功能。
				this.viewer.screenSpaceEventHandler.setInputAction((
						movement
					) => {
						// If a feature was previously highlighted, undo the highlight
						if (Cesium.defined(moveSelected.feature)) {
							moveSelected.feature.color = moveSelected.originalColor;
							moveSelected.feature = undefined;
						}
						// Pick a new feature
						var pickedFeature = this.viewer.scene.pick(movement.endPosition);
						if (!Cesium.defined(pickedFeature)) {
							nameOverlay.style.display = "none";
							return;
						} else {
							// A feature was picked, so show it's overlay content
							nameOverlay.style.display = "block";
							nameOverlay.style.bottom = this.viewer.canvas.clientHeight - movement.endPosition.y + "px";
							nameOverlay.style.left = movement.endPosition.x + "px";
							//如果拾取的要素包含属性信息
							if (Cesium.defined(pickedFeature.getProperty)) {
								var name = pickedFeature.getProperty("id");
								nameOverlay.textContent = name;
							}

							// Highlight the feature if it's not already selected.
							if (pickedFeature !== moveSelected.feature) {
								moveSelected.feature = pickedFeature;
								Cesium.Color.clone(pickedFeature.color, moveSelected.originalColor);
								pickedFeature.color = Cesium.Color.YELLOW;
							}
						}
					},
					Cesium.ScreenSpaceEventType.MOUSE_MOVE);

				// 设置要在输入事件上执行的功能。
				this.viewer.screenSpaceEventHandler.setInputAction((
						movement
					) => {
						// 清除之前的高亮元素
						if (Cesium.defined(highlighted.feature)) {
							highlighted.feature.color = highlighted.originalColor;
							highlighted.feature = undefined;
						}
						if (Cesium.defined(moveSelected.feature)) {
							moveSelected.feature.color = moveSelected.originalColor;
							moveSelected.feature = undefined;
						}

						// 选择新要素
						const pickedFeature = this.viewer.scene.pick(movement.position);
						if (!Cesium.defined(pickedFeature)) {
							return;
						}

						// 存储选中要素的信息
						highlighted.feature = pickedFeature;
						Cesium.Color.clone(
							pickedFeature.color,
							highlighted.originalColor
						);
						// 高亮选中元素
						pickedFeature.color = Cesium.Color.RED;


						// 设置功能信息框描述
						const featureName = pickedFeature.getProperty("name");
						selectedEntity.name = featureName;
						selectedEntity.description =
							'Loading <div class="cesium-infoBox-loading">123</div>';
						this.viewer.selectedEntity = selectedEntity;
						selectedEntity.description =
							`${
        '<table class="cesium-infoBox-defaultTable"><tbody>' +
        "<tr><th>Floor</th><td>"
      }${pickedFeature.getProperty("Floor")}</td></tr>` +
							`<tr><th>Height</th><td>${pickedFeature.getProperty(
        "Height"
      )}</td></tr>` +
							`<tr><th>id</th><td>${pickedFeature.getProperty(
        "id"
      )}</td></tr>` +
							`</tbody></table>`;
					},
					Cesium.ScreenSpaceEventType.LEFT_CLICK);
			}

		},
		methods: {
			weather(value) {
				if (this.collection != null) {
					//移除添加的特效
					this.collection.remove(this.pecialEffect);
				}
				if (value == '下雨') {
					this.viewer.shadowMap.darkness = 0.9; //阴影强度
					this.collection = this.viewer.scene.postProcessStages;
					this.pecialEffect = new Cesium.PostProcessStage({
						name: 'czm_rain',
						fragmentShader: `
                uniform sampler2D colorTexture;//输入的场景渲染照片
                varying vec2 v_textureCoordinates;
                uniform float vrain;
    
                float hash(float x){
                    return fract(sin(x*133.3)*13.13);
                }
    
                void main(void){
                    float time = czm_frameNumber / vrain;
                    vec2 resolution = czm_viewport.zw;
                    
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
                    vec3 c=vec3(.6,.7,.8);
                    float a=0.4;
                    float si=sin(a),co=cos(a);
                    uv*=mat2(co,-si,si,co);
                    uv*=length(uv+vec2(0,4.9))*.3+1.;
                    
                    float v=1.-sin(hash(floor(uv.x*100.))*2.);
                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
                   
                    c*=v*b; //屏幕上雨的颜色
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.2); //将雨和三维场景融合
                }
			`,
						uniforms: {
							vrain: function() {
								return 30 //value:时间
							}
						}
					});
					this.collection.add(this.pecialEffect);
				} else if (value == '晴天') {
					this.viewer.shadows = true; //阴影
					this.viewer.shadowMap.enabled = true;
					this.viewer.shadowMap.size = 2048 * 2;
					this.viewer.shadowMap.darkness = 0.6; //阴影强度
					this.viewer.shadowMap.softShadows = true;
					this.viewer.shadowMap.maximumDistance = 10000.0;
					//设置当前时间，阴影角度随时间变化
					this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
				} else if (value == "下雪") {
					this.viewer.shadowMap.darkness = 0.9; //阴影强度
					this.collection = this.viewer.scene.postProcessStages;
					this.pecialEffect = new Cesium.PostProcessStage({
						name: 'czm_snow',
						fragmentShader: `
                uniform sampler2D colorTexture;
                varying vec2 v_textureCoordinates;
                uniform float vsnow;
                
                float snow(vec2 uv,float scale)
                {   float time = czm_frameNumber / vsnow;
                    float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
                    uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
                    uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
                    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
                    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
                    return k*w;
                }
                void main(void){
                    vec2 resolution = czm_viewport.zw;
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
                    vec3 finalColor=vec3(0);
                    float c = 0.0;
                    c+=snow(uv,30.)*.0;
                    c+=snow(uv,20.)*.0;
                    c+=snow(uv,15.)*.0;
                    c+=snow(uv,10.);
                    c+=snow(uv,8.);
                    c+=snow(uv,6.);
                    c+=snow(uv,5.);
                    finalColor=(vec3(c));
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5);
                }
            `,
						uniforms: {
							vsnow: function() {
								return 60 //value:时间，其他为固定值
							}
						}
					});
					this.collection.add(this.pecialEffect);
				} else if (value == '雾') {
					this.viewer.shadowMap.darkness = 0.9; //阴影强度
					this.collection = this.viewer.scene.postProcessStages;
					this.pecialEffect = new Cesium.PostProcessStage({
						name: 'czm_fog',
						fragmentShader: `
                uniform sampler2D colorTexture;
                uniform sampler2D depthTexture;
                varying vec2 v_textureCoordinates;
                uniform float vfog;
                
                void main(void)
                {
                    vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);
                    vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);
                    float depth = czm_readDepth(depthTexture, v_textureCoordinates);
                    vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);
                    float f=(depthcolor.r-0.22)/vfog;
                    if(f<0.0) f=0.0;
                    else if(f>1.0) f=1.0;
                    gl_FragColor = mix(origcolor,fogcolor,f);
                }
                `,
						uniforms: {
							vfog: function() {
								return 0.9 //value:强度，其他为固定值
							}
						}
					});
					this.collection.add(this.pecialEffect);
				}
			},
			clearEffect() {
				if (this.collection != null) {
					//移除添加的特效
					this.collection.remove(this.pecialEffect);
					this.value = '';
				}
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
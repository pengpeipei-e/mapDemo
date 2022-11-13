<template>
  <div id="cesiumContainer">
    <div id="toolbar" style="position: absolute;left: 5px;top: 5px;display: block;z-index:999">
      <button @click="draW('point')">画点</button>
      <button @click="lineBtn">画线</button>
      <!-- <button @click="polyBtn">画面</button> -->
      <!-- <button @click="rectBtn">画矩形</button>
      <button @click="circleBtn">画圆</button>-->
      <!-- <button @click="clearBtn">清除</button> -->
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      viewer: null,
      scene: null,
      drawarr: [],
      activeShapePoints: [],
      activeShape: null,
      floatingPoint: null,
      boundaryPoints: [],
      returnGraphic: null,
      handler: null,
      pointStyle: {
        style: this.constructPoint({
          color: Cesium.Color.RED,
          pixelSize: 10,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 0,
          show: true,
          distanceDisplayCondition: this.viewer.camera.DistanceDisplayCondition(0.1, 2500.0)
        })
      }
    };
  },
  mounted() {
    this.viewer = new Cesium.Viewer("cesiumContainer", {
      infoBox: false
    });
    this.scene = this.viewer.scene;

    var dataUrl =
      // "http://www.supermapol.com/realspace/services/data-cbd/rest/data/featureResults.rjson?returnContent=true";

      this.scene.camera.setView({
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
    //构造point属性
    constructPoint(_param) {
      let PointEntity = {};
      if (!_param) {
        _param = {};
      }
      PointEntity.point = {
        color: _param.color || Cesium.Color.WHITE,
        pixelSize: _param.pixelSize || 1,
        outlineColor: _param.outlineColor || Cesium.Color.BLACK,
        outlineWidth: _param.outlineWidth || 0,
        show: _param.show || true,
        scaleByDistance: _param.scaleByDistance || null,
        translucencyByDistance: _param.translucencyByDistance || null,
        heightReference: _param.heightReference || Cesium.HeightReference.NONE,
        distanceDisplayCondition: _param.distanceDisplayCondition || undefined
      };
      return PointEntity;
    },
    draW(type) {
      switch (type) {
        case "point":
          this.drawGraphic(
            this.viewer,
            "point",
            _entity => {
              console.log(_entity);
              this.drawarr.push(_entity);
            },
            this.pointStyle
          );
          break;
        case "polyline":
          drawGraphic(
            view,
            "polyline",
            (_entity)=>{
              this.drawarr.push(_entity);
            },
            polylineStyle
          );
          break;
        case "polygon":
          drawGraphic(
            view,
            "polygon",
            function(_entity) {
              drawarr.push(_entity);
            },
            polygonStyle
          );
          break;
        case "marker":
          drawGraphic(
            view,
            "marker",
            function(_entity) {
              drawarr.push(_entity);
            },
            markerStyle
          );
          break;
        case "circle":
          drawGraphic(
            view,
            "circle",
            function(_entity) {
              drawarr.push(_entity);
            },
            circleStyle
          );
          break;
        case "rectangle":
          drawGraphic(
            view,
            "rectangle",
            function(_entity) {
              drawarr.push(_entity);
            },
            rectangleStyle
          );
          break;
      }
    },
    //自定义绘制图形，支持 点，线，面，矩形，圆，标识，可自定义绘制过程中的和绘制完的预览
    drawGraphic(view, _mode, _callback, _GraphicProperty) {
      //清空所有可能的监听和画到一半的图形
      if (this.handler) {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      } else {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      }
      if (
        this.activeShapePoints ||
        this.activeShape ||
        this.floatingPoint ||
        this.returnGraphic
      ) {
        if (floatingPoint) {
          this.viewer.entities.remove(floatingPoint);
          this.floatingPoint = undefined;
        }
        if (activeShape) {
          this.viewer.entities.remove(activeShape);
          this.activeShape = undefined;
        }
        this.activeShapePoints = [];
        if (this.boundaryPoints.length > 0) {
          for (let i = 0; i < this.boundaryPoints.length; i++) {
            this.viewer.entities.remove(this.boundaryPoints[i]);
          }
        }
      }
      //配置
      var drawingMode = _mode;
      var GraphicProperty;
      if (
        _GraphicProperty === null ||
        _GraphicProperty === "" ||
        _GraphicProperty === undefined
      ) {
        GraphicProperty = {};
      } else {
        GraphicProperty = _GraphicProperty;
      }

      //模式判断
      if (drawingMode === "point") {
        this.listenClick(this.viewer, (callbackObj, handler) => {
          let position = callbackObj.cartesian3;
          let Point;
          //构造实体
          if (GraphicProperty.style && GraphicProperty.style.point) {
            Point = this.viewer.entities.add({
              id: GraphicProperty.id || null,
              description: GraphicProperty.description || "",
              name: GraphicProperty.name || "",
              position: position,
              point: GraphicProperty.style.point
            });
          } else {
            Point = this.viewer.entities.add({
              type: "Selection tool",
              position: position,
              point: {
                color: Cesium.Color.WHITE,
                pixelSize: 10,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 0,
                show: true
              }
            });
          }
          //回调产生的点
          if (_callback) {
            console.log("7878", Point);
            _callback(Point);
          }
          //销毁左键监听
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          handler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          );
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        });
      } else if (drawingMode === "marker") {
        if (GraphicProperty.style && GraphicProperty.style.billboard) {
          listenClick(_view, function(callbackObj, handler) {
            //此时场景中的点
            let position = callbackObj.cartesian3;
            //赋值，构造点实体Entity
            let Marker = view.entities.add({
              id: GraphicProperty.id || null,
              description: GraphicProperty.description || null,
              name: GraphicProperty.name || "",
              type: "Selection tool",
              show: GraphicProperty.show || true,
              position: position,
              billboard: GraphicProperty.style.billboard
            });
            //回调构造的点
            if (_callback) {
              _callback(Marker);
            }
            //销毁
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(
              Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
            );
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
          });
        } else {
          listenClick(_view, function(callbackObj, handler) {
            //此时场景中的点
            let position = callbackObj.cartesian3;
            //赋值，构造点实体Entity
            let Marker = view.entities.add({
              type: "Selection tool",
              show: true,
              position: position,
              point: {
                color: Cesium.Color.WHITE,
                pixelSize: 10,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 0,
                show: true
              }
            });
            //回调构造的点
            if (_callback) {
              _callback(Marker);
            }
            //销毁
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(
              Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
            );
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
          });
        }
      } else {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        //取消自带的双击放大监听
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );

        //绘制图形
        function drawShape(positionData) {
          var shape;
          if (drawingMode === "polyline") {
            if (GraphicProperty.style && GraphicProperty.style.polyline) {
              GraphicProperty.style.polyline.positions = positionData;
              shape = this.viewer.entities.add({
                id: GraphicProperty.id || null,
                name: GraphicProperty.name || "",
                description: GraphicProperty.description || "",
                polyline: GraphicProperty.style.polyline
              });
            } else {
              shape = this.viewer.entities.add({
                polyline: {
                  positions: positionData,
                  width: 3
                }
              });
            }
          } else if (drawingMode === "polygon") {
            if (GraphicProperty.style && GraphicProperty.style.polygon) {
              GraphicProperty.style.polygon.hierarchy = positionData;
              GraphicProperty.style.polygon.perPositionHeight = true;
              shape = view.entities.add({
                id: GraphicProperty.id || null,
                name: GraphicProperty.name || "",
                description: GraphicProperty.description || "",
                polygon: GraphicProperty.style.polygon
              });
            } else {
              shape = view.entities.add({
                polygon: {
                  hierarchy: positionData,
                  material: new Cesium.ColorMaterialProperty(
                    Cesium.Color.WHITE.withAlpha(0.7)
                  ),
                  perPositionHeight: true
                }
              });
            }
          } else if (drawingMode === "circle") {
            //当positionData为数组时绘制最终图，如果为function则绘制动态图
            let xyz = new Cesium.Cartesian3(
              activeShapePoints[0].x,
              activeShapePoints[0].y,
              activeShapePoints[0].z
            );
            //转WGS84
            let wgs84 = view.scene.globe.ellipsoid.cartesianToCartographic(xyz);
            let height = wgs84.height;
            let value =
              typeof positionData.getValue === "function"
                ? positionData.getValue(0)
                : positionData;
            if (GraphicProperty.style && GraphicProperty.style.ellipse) {
              GraphicProperty.style.ellipse.semiMinorAxis = new Cesium.CallbackProperty(
                function() {
                  //半径 两点间距离
                  var r = Math.sqrt(
                    Math.pow(value[0].x - value[value.length - 1].x, 2) +
                      Math.pow(value[0].y - value[value.length - 1].y, 2)
                  );
                  return r ? r : r + 1;
                },
                false
              );
              GraphicProperty.style.ellipse.semiMajorAxis = new Cesium.CallbackProperty(
                function() {
                  var r = Math.sqrt(
                    Math.pow(value[0].x - value[value.length - 1].x, 2) +
                      Math.pow(value[0].y - value[value.length - 1].y, 2)
                  );
                  return r ? r : r + 1;
                },
                false
              );
              GraphicProperty.style.ellipse.height = height;
              shape = view.entities.add({
                position: activeShapePoints[0],
                id: GraphicProperty.id || null,
                name: GraphicProperty.name || "",
                description: GraphicProperty.description || "",
                ellipse: GraphicProperty.style.ellipse
              });
            } else {
              shape = view.entities.add({
                position: activeShapePoints[0],
                ellipse: {
                  semiMinorAxis: new Cesium.CallbackProperty(function() {
                    //半径 两点间距离
                    var r = Math.sqrt(
                      Math.pow(value[0].x - value[value.length - 1].x, 2) +
                        Math.pow(value[0].y - value[value.length - 1].y, 2)
                    );
                    return r ? r : r + 1;
                  }, false),
                  semiMajorAxis: new Cesium.CallbackProperty(function() {
                    var r = Math.sqrt(
                      Math.pow(value[0].x - value[value.length - 1].x, 2) +
                        Math.pow(value[0].y - value[value.length - 1].y, 2)
                    );
                    return r ? r : r + 1;
                  }, false),
                  material:
                    GraphicProperty.material ||
                    Cesium.Color.BLUE.withAlpha(0.5),
                  height: height,
                  outline: true
                }
              });
            }
          } else if (drawingMode === "rectangle") {
            let xyz = new Cesium.Cartesian3(
              activeShapePoints[0].x,
              activeShapePoints[0].y,
              activeShapePoints[0].z
            );
            //转WGS84
            let wgs84 = view.scene.globe.ellipsoid.cartesianToCartographic(xyz);
            let height = wgs84.height;
            //当positionData为数组时绘制最终图，如果为function则绘制动态图
            let arr =
              typeof positionData.getValue === "function"
                ? positionData.getValue(0)
                : positionData;
            if (GraphicProperty.style && GraphicProperty.style.rectangle) {
              GraphicProperty.style.rectangle.coordinates = new Cesium.CallbackProperty(
                function() {
                  return Cesium.Rectangle.fromCartesianArray(arr);
                },
                false
              );
              GraphicProperty.style.rectangle.height = height;
              shape = view.entities.add({
                id: GraphicProperty.id || null,
                name: GraphicProperty.name || "",
                description: GraphicProperty.description || "",
                rectangle: GraphicProperty.style.rectangle
              });
            } else {
              shape = view.entities.add({
                rectangle: {
                  coordinates: new Cesium.CallbackProperty(function() {
                    return Cesium.Rectangle.fromCartesianArray(arr);
                  }, false),
                  material: Cesium.Color.GREEN.withAlpha(0.5),
                  height: height
                }
              });
            }
          }
          return shape;
        }
        //左键监听，每一次绘制都要留下记录
        handler.setInputAction(event => {
          //在场景中使用深度拾取scene.pickPosition  globe的pick还有camera的pick在场景中拾取不准确
          var earthPosition = view.scene.pickPosition(event.position);
          //当鼠标不在地表时，earthPosition切成未定义undefined
          if (Cesium.defined(earthPosition)) {
            if (activeShapePoints.length === 0) {
              this.floatingPoint = this.createPoint(earthPosition);
              this.activeShapePoints.push(earthPosition);
              var dynamicPositions = new Cesium.CallbackProperty(function() {
                if (this.drawingMode === "polygon") {
                  return new Cesium.PolygonHierarchy(this.activeShapePoints);
                }
                return this.activeShapePoints;
              }, false);
              this.activeShape = this.drawShape(dynamicPositions);
            }
            this.activeShapePoints.push(earthPosition);
            let boundaryPoint = this.createPoint(earthPosition);
            this.boundaryPoints.push(boundaryPoint);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动的监听
        handler.setInputAction(function(event) {
          if (Cesium.defined(floatingPoint)) {
            var newPosition = view.scene.pickPosition(event.endPosition);
            if (Cesium.defined(newPosition)) {
              floatingPoint.position.setValue(newPosition);
              activeShapePoints.pop();
              activeShapePoints.push(newPosition);
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //重置图形，形成最终形态，把动态过程中的图形全部去掉
        function terminateShape() {
          activeShapePoints.pop();
          let final_Entity;
          if (activeShapePoints.length) {
            final_Entity = drawShape(activeShapePoints); //绘制最终图
          }
          view.entities.remove(floatingPoint);
          view.entities.remove(activeShape);
          floatingPoint = undefined;
          activeShape = undefined;
          activeShapePoints = [];
          for (let i = 0; i < boundaryPoints.length; i++) {
            view.entities.remove(boundaryPoints[i]);
          }
          return final_Entity;
        }
        //右键监听，结束画图
        handler.setInputAction(function(event) {
          returnGraphic = terminateShape();
          if (_callback) {
            _callback(returnGraphic);
          }
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          handler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          );
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      }
    },
    //监听左键点击事件
    listenClick(_view, _callback) {
      this.handler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
      this.handler.setInputAction(movement => {
        let position = this.viewer.scene.pickPosition(movement.position);
        let screenPosition = movement.position;
        let callbackObj = {};
        callbackObj.cartesian3 = position;
        callbackObj.movement = movement;
        callbackObj.screenPosition = screenPosition;
        _callback(callbackObj, this.handler);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //构造点，例如在活动的提示点
    createPoint(worldPosition) {
      var point = this.viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.WHITE,
          pixelSize: 5
        }
      });
      return point;
    }
  }
};
</script>

<style lang="css" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>

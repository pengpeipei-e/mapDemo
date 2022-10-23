import {Feature} from "ol";
import WFS from "ol/format/WFS";

/**
 * ogc wfs crud 的类
 */
// 测试用例
// let geoserverData = {
//   layer: "xmfw", //图层名称不需要带工作区名称
//   uri: "http://localhost:8080/gsst", //工作区uri
//   EPSG: "EPSG:4326",
//   GEOMETRY_NAME: "geom", //重要和数据库中geom字段名称保持一致
// };
// new crudOpenlayer(geoserverData)
//   .queryFeatures(
//     "http://192.168.1.101:8080/geoserver/wfs",
//     like(
//       "子项目名称",
//       "SD甘南黄河上游水源涵养区湿地生态修复与生物多样性保护项目"
//     )
//   )
//   .then((res) => {
//     console.log("测试wfs空间查询", res);
//   });

class crudOpenlayer{
  /**
   * 构造函数
   * @param geoserverData
   */
  constructor(geoserverData){
    this.geoserverData = geoserverData;
  }

  transaction(inserts, updates, deletes) {
    let WFSTSerializer = new WFS()
    let featObject = WFSTSerializer.writeTransaction(inserts,
      updates, deletes, {
        featureType: this.geoserverData.layer,
        featureNS: this.geoserverData.uri,
        srsName: this.geoserverData.EPSG
      })
    let serializer = new XMLSerializer();
    let featString = serializer.serializeToString(featObject);
    return featString;
  }

  /**
   * 添加
   * @param features
   * @returns {*}
   */
  addFeatures(features) {
    return features.map((feature)=>{
      let ft = new Feature();
      let properties = feature.getProperties()
      ft.setProperties(properties)
      let geom = feature.getGeometry().clone()
      geom.applyTransform((flatCoordinates, flatCoordinates2, stride) => {
        for (var j = 0; j < flatCoordinates.length; j += stride) {
          var y = flatCoordinates[j]
          var x = flatCoordinates[j + 1]
          flatCoordinates[j] = x
          flatCoordinates[j + 1] = y
        }
      })
      ft.setGeometryName(this.geoserverData.GEOMETRY_NAME); //设置名称放在前面
      ft.setGeometry(geom);
      delete ft.values_.geometry;//必须删除自带的geometry(会影响XML数据格式添加一个geometry标签)
      return ft
    })
  }

  /**
   * 修改
   * @param features
   * @returns {*}
   */
  updateFeatures(features) {
    return  features.map((feature)=> {
      // 1、构造Feature
      let ft = new Feature()
      // 更新操作必须要有id
      let id = feature.getId();
      ft.setId(id);
      ft.setProperties(feature.getProperties());
      let geom = feature.getGeometry().clone();
      //替换坐标顺序
      geom.applyTransform((flatCoordinates, flatCoordinates2, stride) => {
        for (var j = 0; j < flatCoordinates.length; j += stride) {
          var y = flatCoordinates[j]
          var x = flatCoordinates[j + 1]
          flatCoordinates[j] = x
          flatCoordinates[j + 1] = y
        }
      })
      ft.setGeometryName(this.geoserverData.GEOMETRY_NAME);
      ft.setGeometry(geom);
      delete ft.values_.geometry;//必须删除自带的geometry(会影响XML数据格式添加一个geometry标签)
      return ft
    })
  }

  /**
   * 删除
   * @param features
   * @returns {*}
   */
  deleteFeatures(features) {
    return features;
  }


  /**
   * 查询数据
   * @param url 请求路径
   * @param file 过滤条件 like(字段名称,字段值)
   */
  queryFeatures(url,file){
    const featureRequest = new WFS().writeGetFeature({
      featureNS: this.geoserverData.uri,
      srsName: this.geoserverData.EPSG,
      featurePrefix: 'osm',
      featureTypes: [this.geoserverData.layer],
      outputFormat: 'application/json',
      filter:file,
    });

    return fetch(url, {
      method: 'POST',
      body: new XMLSerializer().serializeToString(featureRequest),
    })
    .then(function (response) {
      return response.json();
    })
  }
}
export default crudOpenlayer;




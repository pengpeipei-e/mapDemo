/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.98.1
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

define(['./Matrix2-4d0e6528', './defaultValue-65031fc5', './EllipseGeometry-1604fbea', './RuntimeError-82079f83', './ComponentDatatype-14dc078a', './WebGLConstants-f5c279b9', './Transforms-4368101e', './combine-96aed74b', './EllipseGeometryLibrary-a8fdd55e', './GeometryAttribute-40611b07', './GeometryAttributes-f9b563d6', './GeometryInstance-027fa5ad', './GeometryOffsetAttribute-026030ef', './GeometryPipeline-b3833cfa', './AttributeCompression-71684ca8', './EncodedCartesian3-7d5e8bf8', './IndexDatatype-6603a485', './IntersectionTests-6dea7537', './Plane-b7c65a46', './VertexFormat-5bb35032'], (function (Matrix2, defaultValue, EllipseGeometry, RuntimeError, ComponentDatatype, WebGLConstants, Transforms, combine, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryOffsetAttribute, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, VertexFormat) { 'use strict';

  function createEllipseGeometry(ellipseGeometry, offset) {
    if (defaultValue.defined(offset)) {
      ellipseGeometry = EllipseGeometry.EllipseGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Matrix2.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Matrix2.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseGeometry.EllipseGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseGeometry;

}));

import Vue from "vue";
import VueRouter from "vue-router";
// import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/3dShow.vue"),
  },
  {
    path: "/clickModel",
    name: "clickModel",
    component: () => import("../views/clickModel.vue"),
  },
  {
    path: "/tianditu",
    name: "tianditu",
    component: () => import("../views/tianditu.vue"),
  },
  {
    path: "/weather",
    name: "weather",
    component: () => import("../views/weather.vue"),
  },
  {
    path: "/3DModels",
    name: "3DModels",
    component: () => import("../views/3D Models.vue"),
  },
  {
    path: "/3DTilesPhotogrammetryClassification",
    name: "3DTilesPhotogrammetryClassification",
    component: () =>
      import("../views/3D Tiles Photogrammetry Classification.vue"),
  },
  {
    path: "/track",
    name: "track",
    component: () => import("../views/track.vue"),
  },
  {
    path: "/line",
    name: "line",
    component: () => import("../views/drawLinePolygon.vue"),
  },
  {
    path: "/rollerShutter",
    name: "rollerShutter",
    component: () => import("../views/rollerShutter.vue"),
  },
  {
    path: "/splitScreen",
    name: "splitScreen",
    component: () => import("../views/splitScreen.vue"),
  },
  {
    path: "/tilt",
    name: "tilt",
    component: () => import("../views/tilt.vue"),
  },
  {
    path: "/terrain",
    name: "terrain",
    component: () => import("../views/terrain.vue"),
  },
  {
    path: "/flowWater",
    name: "flowWater",
    component: () => import("../views/flowWater.vue"),
  },
  {
    path: "/feature",
    name: "Feature",
    component: () => import("../pageOl/feature.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

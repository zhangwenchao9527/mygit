<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-2" style="padding-left: 5px; padding-right: 0px">
        <el-tabs type="border-card">
          <el-tab-pane label="经纬度">经纬度</el-tab-pane>
          <el-tab-pane label="行政区">
            <el-form ref="form" :model="sizeForm">
              <el-form-item label="省/市/区">
                <div class="block" >
                  <el-cascader
                    :options="options"
                    :props="{ checkStrictly: true }"
                    v-model="sizeForm.selectedOptions"
                    @change="handleChange"
                    clearable>
                  </el-cascader>
                </div>
              </el-form-item>
              <el-divider></el-divider>
              <el-form-item label="时间">
                <el-date-picker
                  v-model="sizeForm.date1"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">查询</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="矢量导入">矢量导入</el-tab-pane>
          <el-tab-pane label="其他">其他</el-tab-pane>
        </el-tabs>
      </div>
      <div class="col-md-8">
        <div id="map" class="div-border">
          <div id="mouse-position"></div>
          <div id="map_toolbox" style="position:absolute; left: -24px; top:60px; z-index:2000">
            <ul class="leftToolBtn" id="leftDrawMap">
              <li v-on:click="drawMap('Point')" data-toggle="tooltip" data-placement="right" data-original-title="点选"><i
                class="glyphicon glyphicon-record"></i></li>
              <li v-on:click="drawMap('Rectangle')" data-toggle="tooltip" data-placement="right"
                  data-original-title="框选"><i class="glyphicon glyphicon-modal-window"></i></li>
              <li v-on:click="drawMap('Polygon')" data-toggle="tooltip" data-placement="right"
                  data-original-title="多边形"><i class="glyphicon glyphicon-cloud"></i></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-2" style="padding-left: 0px; padding-right: 5px">
        <div class="div-border">
          <h1>Chrome</h1>
          <p>Google Chrome,又称Google浏览器，是一个由Google（谷歌）公司开发的网页浏览器。</p>
        </div>
      </div>
    </div>
  </div>
  <footer class="navbar-fixed-bottom" style="background-color: #3a6fc9; ">
    <div class="container">
      <div class="row">
        <div class="col-md-2"></div>
        <div class="row-content col-md-8">
          <p>Copyright &copy; 2017-2027 GridKnow IncAll rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import XYZ from 'ol/source/XYZ'
import Tile from 'ol/layer/Tile'
import {fromLonLat, getTransform} from 'ol/proj'
import {applyTransform} from 'ol/extent'
import {defaults} from 'ol/control'
import MousePosition from 'ol/control/MousePosition'
import Projection from 'ol/proj/Projection'
import {createStringXY} from 'ol/coordinate'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Draw, {createBox} from 'ol/interaction/Draw'

let pcas = require('../../../static/pcas-code.json')
export default {
  name: 'AppIndex',
  data () {
    return {
      map: null,
      draw: null,
      drawSource: null,
      drawLayer: null,
      transform: null,
      drMap: null,
      options: pcas,
      selectedOptions: [],
      sizeForm: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }

    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.transform = getTransform('EPSG:4326', 'EPSG:3857')
      this.map = new Map({
        target: 'map',
        layers: [
          new Tile({
            source: new XYZ({
              urls: ['http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
                'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
                'http://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
                'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}']
            })
          })
        ],
        view: new View({
          center: fromLonLat([111.53264542399999, 32.515499216]),
          zoom: 5,
          minZoom: 3,
          extent: applyTransform([70, 1, 135, 55], this.transform)
        }),
        controls: defaults({
          zoom: false,
          attribution: false
        }).extend([new MousePosition({
          projection: new Projection({code: 'EPSG:4326'}),
          coordinateFormat: createStringXY(3),
          className: 'custom-mouse-position',
          target: document.getElementById('mouse-position')
        })
        ])
      })
      this.drawSource = new VectorSource({wrapX: false})
      this.drawLayer = new VectorLayer({
        source: this.drawSource
      })
      this.map.addLayer(this.drawLayer)
    },
    /**
     * 地图左侧按钮，画点、框、多边形
     * @param message
     */
    drawMap: function (message) {
      this.map.removeInteraction(this.draw)
      this.drawLayer.getSource().clear()
      if (message === 'Point') {
        this.draw = new Draw({
          type: 'Point',
          source: this.drawLayer.getSource(),
          free: true
        })
      } else if (message === 'Rectangle') {
        this.draw = new Draw({
          type: 'Circle',
          source: this.drawLayer.getSource(),
          free: false,
          geometryFunction: createBox()
        })
      } else {
        this.draw = new Draw({
          type: 'Polygon',
          source: this.drawLayer.getSource(),
          free: false
        })
      }
      this.map.addInteraction(this.draw)
      let drMap = this.map
      this.draw.on('drawend', function () {
        drMap.removeInteraction(this)
      })
    },
    handleChange (value) {
      console.log(value)
    },
    onSubmit () {
      console.log('submit!')
    }
  }
}
</script>

<style scoped>
  .el-col {
    border-radius: 4px;
  }
  .div-border {
    border: 1px solid #9d9d9d;
    border-radius: 6px;
    height: 90vh;
  }

  #mouse-position {
    position: absolute;
    z-index: 2000;

  }

  .leftToolBtn li {
    text-align: center;
    background: #fff;
    border: 1px solid #999;
    border-left: none;
    cursor: pointer;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    margin-bottom: 15px;
    width: 30px;
    height: 30px;
    line-height: 30px;
  }

  ol li, ul li {
    list-style: none;
  }
</style>

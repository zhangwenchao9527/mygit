<template>
  <body style="padding: 0 2px">
  <el-row :gutter="2" >
    <el-col :xs="10" :sm="8" :md="6" :lg="6" :xl="5" style="padding: 2px">
      <div class="div-border">
        <el-tabs type="border-card">
          <el-tab-pane label="经纬度">经纬度</el-tab-pane>
          <el-tab-pane label="行政区">
            <el-form ref="form" :model="sizeForm" label-width="80px">
              <el-form-item label="省/市/区">
                <el-cascader style="width: 95%"
                             :options="options"
                             :props="{ checkStrictly: true }"
                             v-model="sizeForm.city"
                             @change="handleChange"
                             clearable>
                </el-cascader>
              </el-form-item>
              <el-divider></el-divider>
              <el-form-item label="时间">
                <el-date-picker style="width: 95%"
                                v-model="sizeForm.data"
                                type="daterange"
                                range-separator="-"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item style="margin-top: 200px">
                <el-button type="primary" @click="onSubmit">查询</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="矢量导入">矢量导入</el-tab-pane>
          <el-tab-pane label="其他">其他</el-tab-pane>
        </el-tabs>
      </div>
    </el-col>
    <el-col :xs="4" :sm="8" :md="12" :lg="12" :xl="14">
      <div id="map" class="div-border">
        <div id="mouse-position"></div>
        <div id="map_toolbox" style="position: absolute; margin-top: 60px;margin-left: -40px; z-index:2000">
          <ul class="leftToolBtn">
            <!--<li v-on:click="drawMap('Point')" data-toggle="tooltip" data-placement="right" data-original-title="点选"><i-->
            <!--class="glyphicon glyphicon-record"></i></li>-->
            <!--<li v-on:click="drawMap('Rectangle')" data-toggle="tooltip" data-placement="right"-->
            <!--data-original-title="框选"><i class="glyphicon glyphicon-modal-window"></i></li>-->
            <!--<li v-on:click="drawMap('Polygon')" data-toggle="tooltip" data-placement="right"-->
            <!--data-original-title="多边形"><i class="glyphicon glyphicon-cloud"></i></li>-->
            <el-tooltip class="item" effect="dark" content="点选" placement="right-start">
              <el-button v-on:click="drawMap('Point')"><i class="glyphicon glyphicon-record"></i></el-button>
            </el-tooltip>
          </ul>
          <ul class="leftToolBtn">
            <el-tooltip class="item" effect="dark" content="框选" placement="right">
              <el-button v-on:click="drawMap('Rectangle')"><i class="glyphicon glyphicon-modal-window"></i></el-button>
            </el-tooltip>
          </ul>
          <ul class="leftToolBtn" >
            <el-tooltip class="item" effect="dark" content="多边形" placement="right-end">
              <el-button v-on:click="drawMap('Polygon')"><i class="glyphicon glyphicon-cloud"></i></el-button>
            </el-tooltip>
          </ul>
        </div>
      </div>
    </el-col>
    <el-col :xs="10" :sm="8" :md="6" :lg="6" :xl="5" style="padding: 2px">
      <div class="div-border">
        <vxe-table
          border
          resizable
          show-footer
          show-overflow
          row-id="id"
          size="medium"
          :loading="loading2"
          :data="tableData2">
          <vxe-table-column type="checkbox" width="30"></vxe-table-column>
          <vxe-table-column field="size" title="容量" width="80"></vxe-table-column>
          <vxe-table-column field="photoNum" title="文件个数" width="80"></vxe-table-column>
          <vxe-table-column field="type" title="类型" :formatter="fileType" width="100"></vxe-table-column>
          <vxe-table-column field="shootTime" title="采集时间" sortable width="120"></vxe-table-column>
        </vxe-table>

        <vxe-pager style="top: 8px"
                   border
                   size="medium"
                   :loading="loading2"
                   :current-page="tablePage2.currentPage"
                   :page-size="tablePage2.pageSize"
                   :total="tablePage2.totalResult"
                   :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                   @page-change="handlePageChange2">
        </vxe-pager>
      </div>
    </el-col>
  </el-row>
  <footer class="navbar-fixed-bottom" style="background-color: #3c8dbc">
    <div class="container">
      <div class="row">
        <div class="col-md-2"></div>
        <div class="row-content col-md-8">
          <p>Copyright &copy; 2017-2027 GridKnow IncAll rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
  </body>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import XYZ from 'ol/source/XYZ'
import Tile from 'ol/layer/Tile'
import {fromLonLat, getTransform, transform} from 'ol/proj'
import {applyTransform} from 'ol/extent'
import {defaults} from 'ol/control'
import MousePosition from 'ol/control/MousePosition'
import Projection from 'ol/proj/Projection'
import {createStringXY} from 'ol/coordinate'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Draw, {createBox} from 'ol/interaction/Draw'
import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Text from 'ol/style/Text'
import Stroke from 'ol/style/Stroke'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import { Point, Polygon, LineString } from 'ol/geom'

let pcas = require('../../../static/geojson/pcas-code.json')
// let hubeiJson = require('../../../static/geojson/hubei.json')
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
        city: '',
        date: ''
      },
      arr: [],
      cityName: '',
      cityID: '',
      // 存放指定省市区geojson范围图层
      vectorSource: null,
      coordinateArr: [],
      areas: null,

      loading2: false,
      tableData2: [],
      tablePage2: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      typeList: [
        {label: 'OBGS', value: '002'},
        {label: '无人机航片', value: '003'},
        {label: '立体影像', value: '004'},
        {label: '卫片', value: '005'},
        {label: 'DEM', value: '006'}
      ],
      // 存放指定省市区范围内的区域航片信息
      areaListYes: [],
      // 存放根据坐标画矩形的图层的注释Id，当查询下一个指定省市区范围内的航片时，需要清除上一次根据坐标画的矩形注释Id图层
      areaTitleVectorSource: [],
      // 存放根据坐标绘制的图形【点】
      showPointDrawSource: null,
      // 存放根据坐标绘制的图形【线】
      showLinesDrawSource: null,
      // 存放根据坐标画矩形的图层【多边形】
      showAreaDrawSource: null
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init: function () {
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
      // 清除上一次，省市区范围图层
      if (!(this.vectorSource === null)) {
        this.vectorSource.clear()
      }
      // 清除上一次框选图层
      this.drawLayer.getSource().clear()
      // 清除上一次显示的根据坐标显示的点、线、面
      this.clearPointLinesPolygon()
      // 清除上一次显示的注释图层
      if (this.areaTitleVectorSource != null && this.areaTitleVectorSource.length > 0) {
        for (let i = 0; i < this.areaTitleVectorSource.length; i++) {
          this.areaTitleVectorSource[i].clear()
        }
      }
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
      let _this = this
      this.draw.on('drawend', function (evt) {
        drMap.removeInteraction(this)
        // 获取多边形顶点坐标
        const drawCoordinates = evt.feature.getGeometry().getCoordinates()
        _this.showDrawAreaPhotoList(_this.transformDrawCoordinate(drawCoordinates))
      })
    },
    /**
     * @Author zhangwenchao
     * @Description 获取到的多边形顶点进行坐标转换
     * @Date 16:45 2020/6/5
     **/
    transformDrawCoordinate: function (drawCoordinates) {
      const drawCoordinateArr = []
      if (drawCoordinates.length === 2) {
        const coords = {coordinate: transform(drawCoordinates, 'EPSG:3857', 'EPSG:4326')}
        drawCoordinateArr.push(coords)
      } else if (drawCoordinates.length === 1) {
        drawCoordinates.forEach(coordinates => {
          if (coordinates.length > 0) {
            coordinates.forEach(coord => {
              const coords = {coordinate: transform(coord, 'EPSG:3857', 'EPSG:4326')}
              drawCoordinateArr.push(coords)
            })
          }
        })
      }
      return drawCoordinateArr
    },
    /**
     * @Author zhangwenchao
     * @Description 地图上显示用鼠标框选区域内的航片
     * @Date 16:45 2020/6/5
     **/
    showDrawAreaPhotoList: function (drawCoordinateArr) {
      this.$axios.post('/api/areaGeometry/showDrawAreaPhotoList', {
        drawCoordinateArr: JSON.stringify(drawCoordinateArr)
      }).then(successResponse => {
        let areaModeList = successResponse.data.areaModelList
        this.successAreaResponse(areaModeList, 'draw')
      })
    },
    /**
     * @Author zhangwenchao
     * @Description 选择省市区
     * @Date 13:47 2020/6/1
     **/
    handleChange: function (val) {
      this.arr = val.toString().split(',')
      let cityID = this.arr[this.arr.length - 1]
      this.cityID = cityID
      this.addCoverLayer(cityID)
    },
    /**
     * @Author zhangwenchao
     * @Description 地图上显示省市区遮罩范围
     * @Date 13:49 2020/6/1
     **/
    addCoverLayer: function (cityID) {
      // 清除上一次省市区范围图层
      if (!(this.vectorSource === null)) {
        this.vectorSource.clear()
      }
      // 清除上一次显示的框选图层
      this.drawLayer.getSource().clear()
      // 清除上一次显示的根据坐标显示的点、线、面
      this.clearPointLinesPolygon()
      // 清除上一次显示的注释图层
      if (this.areaTitleVectorSource != null && this.areaTitleVectorSource.length > 0) {
        for (let i = 0; i < this.areaTitleVectorSource.length; i++) {
          this.areaTitleVectorSource[i].clear()
        }
      }
      let nmap = this.map
      let _this = this
      // 定义图层样式
      let mystyle = new Style({
        fill: new Fill({
          color: 'rgba(72,61,139, 0.1)' // 重点在这里，采用rgba颜色，最后一个值用来表示透明度
        }),
        stroke: new Stroke({
          color: '#ff1493',
          width: 2
        })
      })
      let url = '../../../maplayers/static/geojson/' + cityID + '.json'
      $.getJSON(url, function (data) {
        let features = (new GeoJSON()).readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
        _this.vectorSource = new VectorSource()
        let vectorLayer = new VectorLayer({
          source: _this.vectorSource,
          style: mystyle
        })
        let conterXY = []
        features.forEach(element => {
          if (String(element.get('adcode')) === cityID) {
            conterXY = element.get('center')
            vectorLayer.getSource().addFeature(element)
            let coordinates = element.get('geometry').getCoordinates()
            _this.$options.methods.transformCoordinate(coordinates, _this)
          }
        })
        _this.$options.methods.centerXYZ(conterXY, nmap)
        nmap.addLayer(vectorLayer)
      })
    },
    /**
     * 刷新地图中心显示点和缩放比例
     * @param conterXY
     */
    centerXYZ: function (conterXY, nmap) {
      let view = nmap.getView()
      view.setCenter(fromLonLat(conterXY))
      view.setZoom(8)
    },
    /**
     * @Author zhangwenchao
     * @Description 装换选择的区域坐标
     * @Date 13:50 2020/6/1
     **/
    transformCoordinate: function (coordinates, _this) {
      let coordinateArr = []
      if (coordinates.length > 0) {
        coordinates.forEach(coordinate => {
          if (coordinate.length > 0) {
            coordinate.forEach(coords => {
              if (coords.length > 0) {
                coords.forEach(coord => {
                  coordinateArr.push(transform(coord, 'EPSG:3857', 'EPSG:4326'))
                })
              }
            })
          }
        })
      }
      _this.coordinateArr = coordinateArr
      this.this = _this
    },
    /**
     * @Author zhangwenchao
     * @Description 根据选择的省市区，获取在范围内的航片
     * @Date 13:51 2020/6/1
     **/
    queryPhotoList: function () {
      if (this.coordinateArr.length === 0) {
        return
      }
      this.$axios
        .post('/api/areaGeometry/queryAreaGeometry', {
          coordinateArr: this.coordinateArr
        })
        .then(successResponse => {
          let areaModeList = successResponse.data.areaModelList
          this.successAreaResponse(areaModeList, 'city')
        })
    },
    /**
     * @Author zhangwenchao
     * @Description 区分行政区域和用鼠标绘制的区域【city表示行政区域；draw表示用鼠标绘制的区域】
     * @Date 12:01 2020/8/17
     **/
    successAreaResponse: function (areaModeList, type) {
      // let coordinateList = [[[114.85916900634766, 30.32065773010254], [114.8717269897461, 30.32065773010254], [114.8717269897461, 30.338424682617188], [114.85916900634766, 30.338424682617188], [114.85916900634766, 30.32065773010254]]]
      // 点
      let pointArr = []
      // 线
      let linesArr = []
      // 面【多边形】
      let polygonArr = []
      // 无人机航片
      // let coordinateArr = []
      // 存放在指定县市区范围内的区域航片，便于在地图上给出注释
      if (areaModeList != null && areaModeList.length > 0) {
        areaModeList.forEach(areaMode => {
          // 无人机【矩形】
          if (areaMode.listLinkedList != null) {
            polygonArr.push(areaMode.listLinkedList)
          }
          // 非无人机航片【要区分点、线、面（多边形）1表示点  2表示线  3表示面 】
          if (areaMode.listObj != null) {
            // 点
            if (areaMode.areaGeometry.geoType === 1) {
              pointArr.push(areaMode.listObj)
            }
            // 线
            if (areaMode.areaGeometry.geoType === 2) {
              linesArr.push(areaMode.listObj)
            }
            // 面【多边形】
            if (areaMode.areaGeometry.geoType === 3) {
              polygonArr.push(areaMode.listObj)
            }
          }
          // areaListYes.push(areaMode.areaGeometry)
        })
      }
      this.showGeometry(pointArr, linesArr, polygonArr, type)
      this.areas = areaModeList
      this.areaListYes = areaModeList
      this.areaTitle()
      this.showTable()
    },

    /**
     * @Author zhangwenchao
     * @Description 显示集合图形
     * @Date 11:04 2020/8/17
     **/
    showGeometry: function (pointArr, linesArr, polygonArr, type) {
      // 清除上一次在地图上用鼠标画的图层【点、矩形、多边形】
      if (type === 'city') {
        this.drawLayer.getSource().clear()
      }
      this.clearPointLinesPolygon()
      this.showArea(polygonArr, this)
      this.showPoint(pointArr, this)
      this.showPolyline(linesArr, this)
    },
    /**
     * @Author zhangwenchao
     * @Description 清除根据坐标绘制的点、线、面
     * @Date 11:59 2020/8/17
     **/
    clearPointLinesPolygon: function () {
      // 清除上一次显示的根据坐标画的点图层
      if (this.showPointDrawSource != null) {
        this.showPointDrawSource.clear()
      }
      // 清除上一次显示的根据坐标画的线图层
      if (this.showLinesDrawSource != null) {
        this.showLinesDrawSource.clear()
      }
      // 清除上一次显示的根据坐标画的矩形图层
      if (this.showAreaDrawSource != null) {
        this.showAreaDrawSource.clear()
      }
    },
    /**
     * @Author zhangwenchao
     * @Description 根据坐标绘制点
     * @Date 9:16 2020/8/14
     **/
    showPoint: function (coordinates, _this) {
      let drawSource = new VectorSource({wrapX: false})
      // 创建图层
      let drawLayer = new VectorLayer({
        source: drawSource
      })
      coordinates.forEach(element => {
        let point = new Point(element)
        point.applyTransform(_this.transform)
        var pointFeature = new Feature(point)
        pointFeature.setStyle(new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({
              color: '#483d8b'
            }),
            stroke: new Stroke({
              color: '#483d8b',
              size: 1
            })
          })
        }))
        drawSource.addFeature(pointFeature)
      })
      _this.map.addLayer(drawLayer)
      this.showPointDrawSource = drawSource
    },
    /**
     * @Author zhangwenchao
     * @Description 根据坐标画线
     * @Date 17:27 2020/8/13
     **/
    showPolyline: function (coordinates, _this) {
      if (coordinates.length === 0) {
        return
      }
      var drawSource = new VectorSource({wrapX: false})
      let vectorLayer = new VectorLayer({
        source: drawSource
      })
      coordinates.forEach(element => {
        let lines = new LineString(element, 'XY')
        lines.applyTransform(_this.transform)
        let linesFeature = new Feature(lines)
        linesFeature.setStyle(new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.1)'
          }),
          stroke: new Stroke({
            color: 'blue',
            width: 3
          })
        }))
        drawSource.addFeature(linesFeature)
      })
      _this.map.addLayer(vectorLayer)
      this.showLinesDrawSource = drawSource
    },
    /**
     * @Author zhangwenchao
     * @Description 根据坐标画多边形
     * @Date 15:13 2020/6/1
     **/
    showArea: function (coordinate, _this) {
      if (coordinate.length === 0) {
        return
      }
      // 创建源
      let drawSource = new VectorSource({wrapX: false})
      // 创建图层
      let drawLayer = new VectorLayer({
        source: drawSource
      })
      // 多边形的数据格式是[[[lng,lat],[lng,lat]……]]外围两个中括号
      // coordinate = [[[[114.85916900634766, 30.32065773010254], [114.8717269897461, 30.32065773010254], [114.8717269897461, 30.338424682617188], [114.85916900634766, 30.338424682617188], [114.85916900634766, 30.32065773010254]]]]
      coordinate.forEach(element => {
        let polygon = new Polygon(element)
        polygon.applyTransform(_this.transform)
        var polygonFeature = new Feature(polygon)
        polygonFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#483d8b',
            width: 1
          })
        }))
        drawSource.addFeature(polygonFeature)
      })
      _this.map.addLayer(drawLayer)
      this.showAreaDrawSource = drawSource
    },
    /**
     * @Author zhangwenchao
     * @Description 给区域航片添加id注释
     * @Date 19:59 2020/6/2
     **/
    areaTitle: function () {
      // 清除上一次显示的注释图层
      if (this.areaTitleVectorSource != null && this.areaTitleVectorSource.length > 0) {
        for (let i = 0; i < this.areaTitleVectorSource.length; i++) {
          this.areaTitleVectorSource[i].clear()
        }
      }
      let list = this.areaListYes
      for (let i = 0; i < list.length; i++) {
        let point = []
        let areaId = list[i].areaGeometry.id
        point.push(list[i].x)
        point.push(list[i].y)
        var iconFeature = new Feature({
          geometry: new Point(fromLonLat(point)),
          name: areaId,
          population: 2115
        })
        // 设置点要素样式
        iconFeature.setStyle(this.createLabelStyle(iconFeature))
        // 矢量标注的数据源
        var vectorSource = new VectorSource({
          features: [iconFeature]
        })
        // 矢量标注图层
        var vectorLayer = new VectorLayer({
          source: vectorSource
        })
        this.map.addLayer(vectorLayer)
        this.areaTitleVectorSource.push(vectorSource)
      }
    },
    /**
     * 矢量标注样式设置函数
     * @param feature
     * textBaseline  基准线
     * text   文本内容
     * @returns {ol.style.Style}
     */
    createLabelStyle: function (feature) {
      return new Style({
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          text: feature.get('name'),
          fill: new Fill({
            color: 'rgba(0.0, 0.0, 0.0, 1.0)'
          }),
          offsetY: -10,
          offsetX: 0
        })
      })
    },
    /**
     * @Author zhangwenchao
     * @Description 查询提交
     * @Date 17:22 2020/8/17
     **/
    onSubmit: function () {
      if (this.cityID === '') {
        return
      }
      this.addCoverLayer(this.cityID)
      this.queryPhotoList()
    },
    /**
     * @Author zhangwenchao
     * @Description 显示数据表格
     * @Date 17:22 2020/8/17
     **/
    showTable: function () {
      this.tableData2 = []
      let areaList = this.areas
      if (areaList.length === 0) {
        return
      }
      for (let i = 0; i < 10; i++) {
        this.tableData2.push(areaList[i].areaGeometry)
      }
      this.tablePage2.totalResult = areaList.length
    },
    fileType: function ({cellValue}) {
      let item = this.typeList.find(item => item.value === cellValue)
      return item ? item.label : ''
    },
    handlePageChange2 ({ currentPage, pageSize }) {
      if (currentPage === 1) {
        this.tableData2 = []
        for (let i = 0; i < 10; i++) {
          this.tableData2.push(this.areas[i])
        }
        this.tablePage2.totalResult = this.areas.length
        this.tablePage2.pageSize = pageSize
        this.tablePage2.currentPage = currentPage
        return
      }
      this.tableData2 = []
      this.tablePage2.pageSize = pageSize
      this.tablePage2.currentPage = currentPage
      let areaList = this.areas
      this.tablePage2.totalResult = areaList.length
      if (areaList.length < 1) {
        return false
      }
      // 12 < 20   取后面2条数据
      if (areaList.length < pageSize * currentPage) {
        for (let i = 0; i < areaList.length; i++) {
          if (i >= pageSize * (currentPage - 1)) {
            this.tableData2.push(areaList[i])
          }
        }
      } else {
        for (let j = 0; j < areaList.length; j++) {
          if (j >= pageSize * currentPage && j < pageSize * (currentPage + 1)) {
            this.tableData2.push(areaList[j])
          }
        }
      }
      this.loading2 = false
    }
  }
}
</script>

<style scoped>
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

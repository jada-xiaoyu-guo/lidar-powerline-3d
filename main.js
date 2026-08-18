import * as THREE from 'three';
import { OrbitControls } from './js/libs/controls/OrbitControls.js';
import { PointerLockControls } from './js/libs/controls/PointerLockControls.js';
import { loadPointCloud, getColorByType } from './utils.js';
import { MarchingCubes } from './js/libs/MarchingCubes.js';
import { GLTFExporter } from './js/libs/GLTFExporter.js';
import { GLTFLoader } from './js/libs/loaders/GLTFLoader.js'; // filepath: d:\softwarecompitition\modelgreat\main.js
// 数据集文件名列表

const DATASETS = [
    { ply: 'refined_power_linesB1.ply', json: 'power_line_metricsB1.json' },
    { ply: 'refined_power_linesB2.ply', json: 'power_line_metricsB2.json' },
    { ply: 'refined_power_linesB3.ply', json: 'power_line_metricsB3.json' },
    { ply: 'refined_power_linesB4.ply', json: 'power_line_metricsB4.json' },
    { ply: 'refined_power_linesB5.ply', json: 'power_line_metricsB5.json' }
];
let currentDatasetIdx = 0;
const ALL_REGION_KEYS = ['B1', 'B2', 'B3', 'B4','B5'];
let allRegionLineData = {}; // { B1: [...], B2: [...], ... }

async function loadAllRegionLineData() {
    for (const key of ALL_REGION_KEYS) {
        const jsonPath = './data/power_line_metrics' + key + '.json';
        try {
            const data = await fetch(jsonPath).then(res => res.json());
            allRegionLineData[key] = data;
        } catch (e) {
            allRegionLineData[key] = [];
        }
    }
}
const WEATHER_ENV = {
    rain: { icon: 'fa-cloud', temp: 18, humidity: 90, label: '雨天' },
    snow: { icon: 'fa-snowflake-o', temp: -2, humidity: 85, label: '雪天' },
    hot:  { icon: 'fa-fire', temp: 38, humidity: 30, label: '高温' }
};
//const PLY_PATH = './data/refined_power_lines.ply';
//const JSON_PATH = './data/power_line_metrics.json';

const TOWER_COORDS = {
    'B1': [
        [457219.31,3121230.32,0,90,0.85],[457186.96,3121222.39,0,120,0.85],[457162.21,3121251.56,0,135,0.85],
        [457198.01,3120974.55,0,95,0.78],[457156.91,3120983.75,0,102,0.78],[459812.54,3119530.34,0,40,0.99],
        [456967.59,3120874.46,0,-60,0.78],[456886.17,3120531.00,0,120,0.92],[456687.99,3120382.75,0,40,1.17],
        [456951.59,3120194.97,0,0,1.06],[457272.65,3120200.96,0,-8,0.78],[457381.24,3120258.56,0,-5,1.27],
        [457478.44,3120301.34,0,5,0.78],[457632.81,3120241.79,0,0,0.78],[457829.94,3120320.05,0,0,0.99],
        [458072.29,3120197.5,0,0,0.78],[458171.53,3120225.75,0,0,0.78],[458354.41,3120262.75,0,5,0.99],
        [458429.04,3120200.00,0,5,0.78],[458772.06,3120120.34,0,5,0.78],[458845.95,3120151.77,0,7,0.78],
        [458849.87,3120210.75,0,7,0.85],[458433.34, 3120158.70,0,5,0.71],[456939.02,3120138.75,0,10,0.81],
        [457876.75, 3120252.23,0,5,0.85],[459168.30,3120080.75,0,40,0.81],[459195.27,3120118.50,0,40,0.78],
        [459210.91,3120166.41,0,40,0.85],[459415.10,3119833.20,0,40,0.78],[459383.68,3119914.46,0,40,0.78],
        [459540.00,3119820.00,0,50,1.13],[459510.28,3119787.75,0,25,0.78],[459686.69,3119551.43,0,45,0.85]
    ],
    'B2': [
        [459878.42, 3119352.25, 0, 40, 0.78],[460535.61, 3118903.75, 0, 40, 0.71],[460831.80, 3118699.75, 0, 40, 0.78],
        [460222.24, 3119122.23, 0, 40, 0.78],[460554.20, 3119019.22, 0, 40, 0.78],[460292.80, 3119191.46, 0, 40, 1.06],
        [461115.93, 3118499.13, 0, 35, 0.85],[461410.31, 3118299.09, 0, 40, 0.78],[461586.05, 3117990.72, 0, 60, 0.81],
        [460806.32, 3118834.47, 0, 40, 1.06],[461694.49, 3117814.97, 0, 30, 0.78],[462054.52, 3117669.00, 0, 30, 0.85],
        [462413.41, 3117525.25, 0, 15, 0.89],[462698.01, 3117407.52, 0, 30, 1.06],[463120.64, 3117240.25, 30, 25, 1.06],
        [463164.65, 3117304.50, 60, 15, 0.85],[463499.53, 3117214.39, 30, 0, 1.06],[463605.44, 3117288.25, 65, 0, 0.85],
        [463949.95, 3117186.25, 40, 0, 0.85]
    ],
    'B3': [
        [464373.10, 3117163.25, 0, 2, 2.41],[464431.79, 3117275.75, 55, 0, 2.05],[464788.35, 3117268.25, 55, 0, 1.98],
        [465061.19, 3117126.00, 65, 0, 1.84],[466030.15, 3117121.50, 0, -5, 1.70],[466240.33, 3117141.21, 0, -30, 1.56],
        [466188.77, 3117234.25, 0, 0, 2.27],[466327.32, 3117094.75, 0, -30, 1.56],[466384.12, 3117288.81, 0, -30, 1.49],
        [464241.78, 3117272.25, 65, 2, 1.56],[465015.94, 3117238.21, 65, 0, 1.84],[465710.70, 3117099.98, 0, -5, 1.56],
        [466468.60, 3117234.31, 0, 0, 1.98],[466695.38, 3117346.20, 0, -5, 2.20],[466853.55, 3117317.04, 0, -5, 2.41],
        [467087.28, 3117416.25, 0, -5, 2.12],[467093.57, 3117361.00, 0, -5, 2.55],[467348.86, 3117782.68, 0, -50, 2.34]
    ],
    'B4': [
        [466475.64, 3124464.75, 0, 0, 1.63],[466340.13, 3124680.52, 0, -80, 0.92],[466430.13, 3124449.00, 0, 90, 1.49],
        [466416.46, 3124096.22, 0, 90, 1.17],[466398.81, 3123801.82, 0, 90, 1.17],[466390.03, 3123503.20, 0, 60, 1.03],
        [466665.59, 3123359.75, 0, 70, 1.17],[466577.92, 3123090.46, 0, 60, 1.03],[466718.35, 3122861.76, 0, 90, 1.03],
        [466883.80, 3122599.49, 0, 60, 1.03],[467039.97, 3122353.97, 0, 75, 1.03],[467079.27, 3122143.67, 0, -50, 0.89],
        [466986.36, 3122022.44, 0, 75, 0.78],[467042.59, 3121950.69, 0, 60, 1.03],[467037.39, 3121865.13, 0, 60, 0.89],
        [467279.31, 3121722.21, 0, 45, 1.03],[467462.66, 3121560.29, 0, 45, 1.03],[467592.49, 3121349.05, 0, 60, 1.06],
        [467758.77, 3121085.74, 0, 60, 1.10],[467833.88, 3121065.91, 0, 30, 0.92],[467927.23, 3120835.37, 0, 60, 1.13]
    ],
    'B5': [
        [467540.50, 3118054.42, 85, -58, 1.74],[467720.83, 3118309.20, 125, -58, 1.70],[467668.78, 3118339.73, 125, -58, 1.70],
        [467962.50, 3118652.90, 0, -58, 2.30],[468008.84, 3118807.47, 0, -58, 1.70],[468343.02, 3119165.68, 0, -58, 1.74],
        [468491.32, 3119376.00, 0, -58, 1.70],[468678.10, 3119638.86, 0, 90, 1.13],[468453.05, 3119998.02, 0, 58, 1.74],
        [468315.56, 3120209.21, 0, 58, 2.55],[468220.01, 3120364.51, 0, 58, 2.23]
    ]
};

let TREE_COORDS = {
    'B1': [
  [456684.26,3120675.39,0,114,21],[459044.17,3120068.86,0,25,20],[459783.26,3119706.44,0,113,19],
  [458456.37,3120344.23,0,72,16],[457295.53,3120461.42,0,24,21],[458142.30,3119962.62,0,107,23],
  [456985.62,3120538.95,0,4,17],[457041.24,3120049.08,0,136,18],[458862.85,3120408.76,0,53,24],
  [458001.50,3120405.48,0,15,21],[457023.25,3121145.94,0,121,21],[457548.33,3120442.27,0,48,20],
  [459316.93,3120292.39,0,99,20],[459184.80,3120313.94,0,89,20],[459706.91,3119287.87,0,179,22]
],
    'B2': [
  [461458.33,3118646.36,0,6,24],[460726.28,3118702.00,0,176,21],[461608.54,3118298.84,0,82,17],
  [460320.79,3119278.60,0,87,21],[462125.07,3117557.17,0,62,24],[463773.02,3117214.81,0,24,22],
  [462719.56,3117578.17,0,116,24],[463438.02,3117310.56,0,176,17],[463862.09,3117112.66,0,83,21],
  [461708.17,3118063.05,0,65,20],[462886.97,3117165.99,0,39,19],[462511.37,3117282.67,0,136,19],
  [461460.64,3117970.82,0,154,17],[462450.60,3117836.15,0,69,22],[462058.86,3117917.30,0,151,22],
  [463988.30,3117384.24,0,133,22]
],
    'B3': [
  [466418.16,3117333.73,0,114,20],[466667.17,3117596.96,0,104,18],[466005.39,3117282.83,0,148,23],
  [467076.92,3117580.15,0,104,23],[465907.55,3117732.31,0,125,23],[467023.51,3117633.99,0,81,22],
  [467083.61,3117890.12,0,37,17],[464278.38,3117493.75,0,147,23],[466791.10,3117633.19,0,59,20]
],
    'B4': [
  [467080.99,3122572.41,0,7,20],[466489.02,3124381.14,0,107,17],[466542.33,3122892.88,0,39,19],
  [467846.55,3120881.34,0,163,17],[468123.50,3120934.81,0,12,21],[467316.39,3122469.75,0,36,20],
  [467490.91,3121029.68,0,111,19],[466880.71,3123410.59,0,88,22],[467393.270,3121240.21,0,38,18],
  [467680.00,3120640.91,0,154,19],[466926.77,3122717.80,0,144,19],[466652.75,3123051.86,0,95,22],
  [467861.17,3121230.96,0,68,18],[468044.38,3121032.57,0,137,16]
],
    'B5': [
  [468571.69,3119561.15,0,140,16],[468118.90,3118822.88,0,134,20],[468220.53,3120245.37,0,48,22],
  [468099.46,3118592.57,0,86,21],[468759.03,3119637.46,0,51,21],[467935.61,3120909.06,0,57,21],
  [468532.61,3119413.62,0,123,20],[468219.62,3119272.56,0,129,19]
]
};

const CAR_COORDS = {
    'B1': [
        [457301.05,3120257.86,0,90],[459892.53,3119620.41,0,45]
    ],
    'B2': [
        [462168.94,3117800.25,0,60]
    ],
    'B3': [
        [466895.38,3117646.20,0,90]
    ],
    'B4': [
        [466530.69,3123535.78,0,60]
    ],
    'B5': [
        [468390.69,3119404.92,0,45],[468217.36,3120224.66,0,80]
    ]
};

const HOUSE_COORDS = {
    'B1': [
        [458138.93,3120296.93,0,90],[459175.36,3119760.00,0,135]
    ],
    'B2': [
        [460593.08,3118558.49,0,-45]
    ],
    'B3': [
        [466795.38,3117546.20,0,70]
    ],
    'B4': [
        [467516.39,3121669.75,0,-30]
    ],
    'B5': [
        [468219.61,3119952.30,0,-30]
    ]
};

let BIRD_COORDS = {
    'B1': [
        [457567.27,3120342.66,100,0,30],[459134.80,3120333.94,120,60,30]
    ],
    'B2': [
        [461350.53,3118385.00,120,20,30],[463379.40,3117305.75,160,40,30]
    ],
    'B3': [
        [465276.38,3117122.81,180,60,30],[466795.38,3117446.20,120,20,30]
    ],
    'B4': [
        [467016.39,3122469.75,120,60,30],[466500.71,3123410.59,140,-20,30]
    ],
    'B5': [
        [468534.18,3119963.44,120,80,30],[468450.06,3119618.24,160,60,30],
        [468440.93,3119388.82,180,-20,30]
    ]
};

let HILL_COORDS = {
    'B2': [
        [463500.72,3116970.88,0,-110,500]
    ],
    'B3': [
        [464800.72,3117700.88,0,66,800]
    ],
    'B5': [
        [467220.71,3118700.67,0,-5,800]
    ]
};

// 风速档位及振幅定义（电力线直径20mm，档位分别为1~5倍）
const LINE_DIAMETER = 20; // 电力线直径mm
const WIND_LEVELS = [
    { label: '微风', minAmp: 20, maxAmp: 30, minSpeed: 2, maxSpeed: 4 },
    { label: '轻风', minAmp: 30, maxAmp: 40, minSpeed: 4, maxSpeed: 7 },
    { label: '中风', minAmp: 40, maxAmp: 45, minSpeed: 7, maxSpeed: 10 },
    { label: '强风', minAmp: 45, maxAmp: 50, minSpeed: 10, maxSpeed: 14 },
    { label: '烈风', minAmp: 50, maxAmp: 55, minSpeed: 14, maxSpeed: 18 }
];
let currentWindLevel = null;
let currentWindAmplitude = 0;
let currentWindSpeed = 0;

const DANG_IMAGES = [
    { img: 'dang1.png', detail: { regionName: '区域 B3', spanName: '档距段1', leftTowerHeight: '25.5', rightTowerHeight: '28.2', lineCount: 3, avgLineLength: '120.5' } },
    { img: 'dang2.png', detail: { regionName: '区域 B3', spanName: '档距段2', leftTowerHeight: '26.1', rightTowerHeight: '27.8', lineCount: 2, avgLineLength: '110.2' } },
    { img: 'dang3.png', detail: { regionName: '区域 B3', spanName: '档距段3', leftTowerHeight: '24.9', rightTowerHeight: '29.0', lineCount: 4, avgLineLength: '130.7' } }
];
let currentDangIdx = 0;

// 页面加载时读取当前数据集索引
const savedIdx = parseInt(localStorage.getItem('currentDatasetIdx'));
if (!isNaN(savedIdx) && savedIdx >= 0 && savedIdx < DATASETS.length) {
    currentDatasetIdx = savedIdx;
}
const PLY_PATH = './data/' + DATASETS[currentDatasetIdx].ply;
const JSON_PATH = './data/' + DATASETS[currentDatasetIdx].json;

// 获取当前数据集key（新增）
const datasetKey = (() => {
    if (PLY_PATH.includes('B1')) return 'B1';
    if (PLY_PATH.includes('B2')) return 'B2';
    if (PLY_PATH.includes('B3')) return 'B3';
    if (PLY_PATH.includes('B4')) return 'B4';
    if (PLY_PATH.includes('B5')) return 'B5';
    return '';
})();

//翻页的逻辑以及刷新页面
function switchDataset(idx) {
    if (idx < 0) idx = DATASETS.length - 1;
    if (idx >= DATASETS.length) idx = 0;
    localStorage.setItem('currentDatasetIdx', idx); // 记忆当前数据集
    location.reload(); // 刷新页面，重新加载
     initialize().then(() => {
        bindManualMeasureCanvasEvent(); // 关键：建模完成后重新绑定
    });
}

// 全局变量
let scene, camera, renderer;
let orbitControls, pointerLockControls;
let currentView = 'overview'; // 初始为全景浏览
let powerlineGroup = new THREE.Group();
window.powerlineGroup = powerlineGroup;
let towerGroup = new THREE.Group();
let powerlineMeta = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let tooltip;
let globalJsonData = null; // 新增：存储电力线元数据
let extendedLineCount = 0; // 统计补全电力线数量
let dangerSpheres = []; // --- 红球体缓存 ---
// 新增：声明初始相机位置和目标变量
let initialCameraPos = null;
let initialCameraTarget = null;
let manualMeasuring = false;
let manualMeasurePoints = [];
let measurePopup, measureResult, measureClose, manualBtn;
window.allDangerRisks = []; 
let currentRemarkLineId = null;
let manualMeasureSpheres = [];
let manualMeasureLine = null;


// 新建模坐标系基向量（世界坐标下）
let modelX = new THREE.Vector3(1, 0, 0); // 红色 x
let modelY = new THREE.Vector3(0, 1, 0); // 蓝色 y
let modelZ = new THREE.Vector3(0, 0, 1); // 绿色 z
let modelOrigin = new THREE.Vector3(0, 0, 0); // 新坐标系原点
let moveRequestId = null;
// 新坐标系计算
function computeModelAxes(jsonData) {
    // 1. 取所有电力线首尾点
    let dirs = [];
    if (jsonData && Array.isArray(jsonData)) {
        jsonData.forEach(line => {
            if (Array.isArray(line.coordinates) && line.coordinates.length >= 2) {
                const s = line.coordinates[0], e = line.coordinates[line.coordinates.length-1];
                if (s && e && s.length === 3 && e.length === 3) {
                    dirs.push(new THREE.Vector3(e[0]-s[0], e[1]-s[1], e[2]-s[2]).normalize());
                }
            }
        });
    }
    // 平均方向为x轴
    let xAxis = dirs.reduce((a,b)=>a.add(b), new THREE.Vector3()).normalize();
    let zAxis = new THREE.Vector3(0,0,1);
    // 保证x,z正交
    xAxis.sub(zAxis.clone().multiplyScalar(xAxis.dot(zAxis))).normalize();
    let yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

    // 取所有点中心为原点
    let allPoints = [];
    jsonData.forEach(line => {
        if (Array.isArray(line.coordinates)) {
            line.coordinates.forEach(pt => {
                if (pt.length === 3) allPoints.push(new THREE.Vector3(pt[0], pt[1], pt[2]));
            });
        }
    });
    let mean = allPoints.reduce((a,b)=>a.add(b), new THREE.Vector3()).multiplyScalar(1/allPoints.length);

    modelOrigin = mean;
    modelX = xAxis;
    modelY = yAxis;
    modelZ = zAxis;
}

// 1. 计算全局包围盒
let globalMin = new THREE.Vector3(Infinity, Infinity, Infinity);
let globalMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
let pointCloud = null; // 全局声明

let autoCruise = false;
let cruiseInterval = null;



function updateGlobalBBox(points) {
    if (!points || !Array.isArray(points)) return;
    for (let i = 0; i < points.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(points, i)) continue; // 跳过稀疏项
        const pt = points[i];
        if (!pt || typeof pt !== 'object' || !pt.position ||
            typeof pt.position.x !== 'number' ||
            typeof pt.position.y !== 'number' ||
            typeof pt.position.z !== 'number' ||
            isNaN(pt.position.x) || isNaN(pt.position.y) || isNaN(pt.position.z)) {
            continue;
        }
        globalMin.min(pt.position);
        globalMax.max(pt.position);
    }
}
const textureLoader = new THREE.TextureLoader();



// 新坐标系下点到平面距离（高度）暂未使用
function pointHeightInModelY(point) {
    // 点到平面距离公式：d = (P - M1)·n
    return point.clone().sub(modelOrigin).dot(modelY);
}

function worldToModelCoords(worldVec) {
    const rel = worldVec.clone().sub(modelOrigin);
    return {
        x: rel.dot(modelX),
        y: rel.dot(modelY),
        z: rel.dot(modelZ)
    };
}

// === 关键：多次强制同步尺寸和重置视角 ===
      function syncRendererAndCamera() {
    const container = document.getElementById('three-container');
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }
}
// 初始化场景
function bindManualMeasureCanvasEvent() {
    const threeContainer = document.getElementById('three-container');
    const threeCanvas = threeContainer.querySelector('canvas');
    if (!threeCanvas) return;

    // 先解绑之前的事件，防止重复绑定
    if (threeCanvas._manualMeasureHandler) {
        threeCanvas.removeEventListener('mousedown', threeCanvas._manualMeasureHandler);
    }

    // 清理上次的高亮
    function clearManualMeasureVisuals() {
        manualMeasureSpheres.forEach(s => scene.remove(s));
        manualMeasureSpheres = [];
        if (manualMeasureLine) {
            scene.remove(manualMeasureLine);
            manualMeasureLine = null;
        }
    }
    // 暴露到全局，方便外部调用
    window.clearManualMeasureVisuals = clearManualMeasureVisuals;

    // 绑定新的事件
    threeCanvas._manualMeasureHandler = function(e) {
        if (!manualMeasuring) return;
        if (!raycaster || !camera) return;
        const rect = this.getBoundingClientRect();
        const mouse = {
            x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((e.clientY - rect.top) / rect.height) * 2 + 1
        };
        raycaster.setFromCamera(mouse, camera);

        const objsToTest = [
            ...(window.towerGroup?.children || []),
            ...(window.treeGroup?.children || []),
            ...(window.carGroup?.children || []),
            ...(window.houseGroup?.children || []),
            ...(window.birdGroup?.children || []),
            ...(window.powerlineGroup?.children || [])
        ];
        const intersects = raycaster.intersectObjects(objsToTest, true);
        if (intersects.length === 0) return;

        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.type && obj.parent !== window.powerlineGroup) {
            obj = obj.parent;
        }
        const point = intersects[0].point;
        let type = obj.userData.type || (obj.parent === window.powerlineGroup ? 'powerline' : '');
        if (!type && obj.parent && obj.parent.userData.type) type = obj.parent.userData.type;

        // 防止两次点击同一个点
        if (manualMeasurePoints.length > 0) {
            const last = manualMeasurePoints[manualMeasurePoints.length - 1];
            if (last && last.position.distanceTo(point) < 1e-3) return;
        }

        // 最多只保留两个点
        if (manualMeasurePoints.length >= 2) {
            manualMeasurePoints = [];
            clearManualMeasureVisuals();
        }

        manualMeasurePoints.push({ type, position: point.clone() });

        // --- 新增：高亮当前点（球体更小，半径2） ---
        const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(point);
        scene.add(sphere);
        manualMeasureSpheres.push(sphere);

        // --- 新增：如果有两个点，连线 ---
        if (manualMeasurePoints.length === 2) {
            if (manualMeasureLine) {
                scene.remove(manualMeasureLine);
                manualMeasureLine = null;
            }
            const [p1, p2] = manualMeasurePoints.map(p => p.position);
            const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
            manualMeasureLine = new THREE.Line(lineGeo, lineMat);
            scene.add(manualMeasureLine);
        }

        // 显示测距信息
        let info = manualMeasurePoints.map((p, i) =>
            `第${i+1}点：${p.type === 'powerline' ? '电力线' :
                p.type === 'tree' ? '树障' :
                p.type === 'car' ? '特种车辆' :
                p.type === 'house' ? '建筑物' :
                p.type === 'bird' ? '挂线' :
                p.type === 'tower' ? '电力塔' : p.type
            } (${p.position.x.toFixed(2)}, ${p.position.y.toFixed(2)}, ${p.position.z.toFixed(2)})`
        ).join('<br>');
        measureResult.innerHTML = info;
        measurePopup.style.display = 'block';
        measureClose.style.display = 'block'; // 保证叉号可见

        // 如果有两个点，显示距离
        if (manualMeasurePoints.length === 2) {
    const p1 = manualMeasurePoints[0].position;
    const p2 = manualMeasurePoints[1].position;
    const dist = p1.distanceTo(p2);
    measureResult.innerHTML += `<br><b>两点距离：</b> ${dist.toFixed(2)} 米`;

    // 判断风险等级并输出
    let riskText = '';
    if (dist < 5.5) {
        riskText = '<span style="color:#e74c3c;font-weight:bold;">特别紧急</span>';
    } else if (dist < 10) {
        riskText = '<span style="color:#f39c12;font-weight:bold;">一般紧急</span>';
    } else {
        riskText = '<span style="color:#2ecc71;font-weight:bold;">安全</span>';
    }
    measureResult.innerHTML += `<br><b>风险等级：</b> ${riskText}`;
}
    };
    
    threeCanvas.addEventListener('mousedown', threeCanvas._manualMeasureHandler);
    console.log('测距事件已绑定');
}

async function initialize() {
    syncModelCoordsFromCode();//（新增）
    console.log('initialize called');
    const cruiseBtn = document.getElementById('auto-cruise-btn');
    if (cruiseBtn) cruiseBtn.style.display = 'none';
    tooltip = document.getElementById('tooltip');
    
     try {
        // 初始化tooltip
        tooltip = document.getElementById('tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'tooltip';
            document.body.appendChild(tooltip);
        }        // 初始化场景组件
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance",
            stencil: false
        });

                let isMouseDown = false;
        renderer.domElement.addEventListener('mousedown', e => {
            if (currentView !== 'first') return;
            isMouseDown = true;
        });
        renderer.domElement.addEventListener('mouseup', e => {
            isMouseDown = false;
        });
        renderer.domElement.addEventListener('mouseleave', e => {
            isMouseDown = false;
        });
        renderer.domElement.addEventListener('mousemove', e => {
            if (currentView !== 'first' || !isMouseDown) return;
            firstPersonYaw -= e.movementX * 0.002;
            firstPersonPitch -= e.movementY * 0.002;
            // 限制pitch范围
            firstPersonPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, firstPersonPitch));
            updateFirstPersonCamera();
        });
        
        // === 关键：获取three-container实际尺寸 ===
        const container = document.getElementById('three-container');
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width || container.clientWidth || 800;
        const height = containerRect.height || container.clientHeight || 600;

        renderer.setSize(window.innerWidth, window.innerHeight);
        //renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        document.getElementById('three-container').appendChild(renderer.domElement);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mousemove', (e) => {
            if (currentView === 'first' || currentView === 'fly') {
                return;
            }
        });

        
        // 设置渐变背景
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0E2FF');
        gradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        scene.background = new THREE.CanvasTexture(canvas);

         // === 关键：相机宽高比与容器同步 ===
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        // 原：camera.position.set(50, 30, 80);
        // 新：y与z交换
        camera.position.set(50, 80, 30);

        orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;

        pointerLockControls = new PointerLockControls(camera, renderer.domElement);
   // 设置场景环境光和HDR环境
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
      
        // 太阳直射光
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(100, 200, 100);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.bias = -0.0001;
        scene.add(dirLight);

        // 添加半球光模拟天空光
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemiLight.position.set(0, 1, 0);
        scene.add(hemiLight);

        // 创建环境贴图
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        // 生成默认的环境贴图
        const envMap = pmremGenerator.fromScene(new THREE.Scene()).texture;
        scene.environment = envMap;
        pmremGenerator.dispose();

        /*// 加载数据
        
        const [dbPointCloud, dbLineMetrics] = await Promise.all([
            fetch('http://localhost:3001/api/refined_power_lines').then(res => res.json()),
            fetch('http://localhost:3001/api/power_line_metrics').then(res => res.json())
        ]);
        console.log('dbPointCloud:', dbPointCloud);
        */

        // 加载数据
        const pointCloud = await loadPointCloud(PLY_PATH);
        const jsonData = await fetch(JSON_PATH).then(res => res.json());

        /* // 组装点云数据结构（数据库）
        const towerPoints = [];
        const linePoints = [];
        pointCloud.forEach(pt => {
            const position = new THREE.Vector3(pt.x, pt.y, pt.z);
            const color = (pt.r !== null && pt.g !== null && pt.b !== null)
                ? new THREE.Color(pt.r / 255, pt.g / 255, pt.b / 255)
                : (pt.labels === 0 ? new THREE.Color(0xCCCCCC) : new THREE.Color(0x202020));
            if (pt.labels === 0) {
                towerPoints.push({ position, color });
            } else if (pt.labels === 1) {
                linePoints.push({ position, color });
            }
        });
        const pointCloud = { towerPoints, linePoints, count: dbPointCloud.length };

        // 组装电力线属性数据（数据库）
        const jsonData = dbLineMetrics.map(row => ({
            id: row.id,
            coordinates: row.coordinates, // 已为数组
            metrics: {
                length: row.length,
                sag: row.sag,
                tension: row.tension,
                confidence: row.confidence
            }
        }));
        */

        // 统一计算全局包围盒
       if (pointCloud.towerPoints && Array.isArray(pointCloud.towerPoints) && pointCloud.towerPoints.length > 0) {
            updateGlobalBBox(pointCloud.towerPoints);
        }
        if (pointCloud.linePoints && Array.isArray(pointCloud.linePoints) && pointCloud.linePoints.length > 0) {
            updateGlobalBBox(pointCloud.linePoints);
        }
        //初始化全局变量（*）
        updateGlobalInfo(jsonData);

    // 生成模型
        await generateModels(pointCloud, jsonData);
   
        if (typeof computeModelAxes === 'function') computeModelAxes(jsonData);
        updateTowerInfo(); // 更新电力塔信息 
        // 完成加载
        document.getElementById('loading').style.display = 'none';
        // 自动重置视角到合适位置
        resetView();

        renderer.domElement.addEventListener('mousemove', (e) => {
            if (currentView === 'first' || currentView === 'fly') {
                return;
            }
        });


        syncRendererAndCamera();
        setTimeout(syncRendererAndCamera, 100);
        setTimeout(syncRendererAndCamera, 300);

        // 最后重置视角，确保居中
        setTimeout(() => {
            syncRendererAndCamera();
            resetView();
        }, 350);

        // 绑定事件
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        bindViewControls();

             // 鼠标悬停电力塔冒蓝光，单击弹出坐标输入框
        // 只高亮当前悬停的塔或树
        let lastHoveredObj = null; // <<<--- 在这里添加声明
        renderer.domElement.addEventListener('mousemove', function(e) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const objs = [
                ...towerGroup.children,
                ...(window.treeGroup?.children || []),
                ...(window.carGroup?.children || []),
                ...(window.houseGroup?.children || []),
                ...(window.birdGroup?.children || []),
                ...(window.hillGroup?.children || [])
            ];
            const intersects = raycaster.intersectObjects(objs, true);

            // --- 核心修复：先恢复上一个，再高亮下一个 ---
            if (lastHoveredObj) {
                lastHoveredObj.traverse(child => {
                    if (child.isMesh && child.material.emissive) {
                        child.material.emissive.set(0x000000); // 恢复成黑色
                    }
                });
                lastHoveredObj = null;
            }

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj.parent && !obj.userData.type) {
                    obj = obj.parent;
                }
                
                if (obj.userData.type) {
                    let color;
                    switch(obj.userData.type) {
                        case 'tower': color = 0x3399ff; break;
                        case 'tree': color = 0x00ff00; break;
                        case 'car': color = 0xffff00; break;
                        case 'house': color = 0xff9900; break;
                    }

                    if (color) {
                        obj.traverse(child => {
                            if (child.isMesh && child.material.emissive) {
                                child.material.emissive.setHex(color);
                            }
                        });
                        lastHoveredObj = obj;
                    }
                }
                renderer.domElement.style.cursor = 'pointer';
            } else {
                renderer.domElement.style.cursor = 'auto';
            }
        });
 
       renderer.domElement.addEventListener('click', function(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(powerlineGroup.children, true);
            
            if (intersects.length > 0) {
                const { object, point } = intersects[0]; // 获取物体和精确的点击坐标
                const meta = object.userData;
                updateLineInfo(meta, point); // 将两者都传递给更新函数
            }
        });

        animate();
        syncRendererAndCamera();
     measurePopup = document.getElementById('measure-popup');
    measureResult = document.getElementById('measure-result');
    measureClose = document.getElementById('measure-close');
    manualBtn = document.getElementById('distance-manual');

    // 关闭弹窗
 if (measureClose) {
     measureClose.onclick = function() {
        measurePopup.style.display = 'none';
        manualMeasuring = false;
        manualMeasurePoints = [];
        if (window.clearManualMeasureVisuals) window.clearManualMeasureVisuals();
    };
}

    // 绑定手动测距按钮
   if (manualBtn) {
    manualBtn.onclick = function() {
        manualMeasuring = true;
        manualMeasurePoints = [];
        measureResult.innerHTML = '请在画面中点击第1个点...';
        measurePopup.style.display = 'block';
        measureClose.style.display = 'block'; // 保证叉号可见
        if (window.clearManualMeasureVisuals) window.clearManualMeasureVisuals();
        bindManualMeasureCanvasEvent();
    };
}

    // 关键：每次建模后都重新绑定canvas事件
    bindManualMeasureCanvasEvent();
    } catch (error) {
        console.error('加载错误:', error);
        document.getElementById('loading').textContent = `加载失败: ${error.message}`;
        // 加载失败时也隐藏箭头
        hideDetailArrows();
    }
    // 初始化结束后再次确保隐藏
// 在initialize最后调用
document.addEventListener('DOMContentLoaded', () => {
  bindDangerModelClick();
});

}

// 坐标轴颜色：x红、y蓝、z绿
function showModelAxes(center, length=10) {
    if (!scene) return; // 防止scene未初始化时报错
    const old = scene.getObjectByName('model-axes-helper');
    if (old) scene.remove(old);
    const axesGroup = new THREE.Group();
    axesGroup.name = 'model-axes-helper';
    // x轴 红色
    axesGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([center, center.clone().add(modelX.clone().multiplyScalar(length))]),
        new THREE.LineBasicMaterial({ color: 0xff0000 })
    ));
    // y轴 蓝色
    axesGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([center, center.clone().add(modelY.clone().multiplyScalar(length))]),
        new THREE.LineBasicMaterial({ color: 0x0066ff })
    ));
    // z轴 绿色
    axesGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([center, center.clone().add(modelZ.clone().multiplyScalar(length))]),
        new THREE.LineBasicMaterial({ color: 0x00ff00 })
    ));
    scene.add(axesGroup);
}

async function generateModels(pointCloud, jsonData) {
    if (!pointCloud || !pointCloud.towerPoints || !pointCloud.linePoints) {
        throw new Error('点云数据格式错误');
    }
    // 保存电力线元数据到全局变量（新增）
    globalJsonData = jsonData;
// 保证所有 group 已初始化
    if (!towerGroup) towerGroup = new THREE.Group();
    if (!window.treeGroup) window.treeGroup = new THREE.Group();
    if (!window.carGroup) window.carGroup = new THREE.Group();
    if (!window.houseGroup) window.houseGroup = new THREE.Group();

    // 确保所有 group 已加入场景
    if (!scene.children.includes(towerGroup)) scene.add(towerGroup);
    if (!scene.children.includes(window.treeGroup)) scene.add(window.treeGroup);
    if (!scene.children.includes(window.carGroup)) scene.add(window.carGroup);
    if (!scene.children.includes(window.houseGroup)) scene.add(window.houseGroup);
  
  // 生成电力线模型
    generatePowerlineModel(pointCloud.linePoints, jsonData);
    // 重新计算建模坐标系
    computeModelAxes(jsonData);
    await placeModelsAtFixedCoords();
bindDangerModelClick();
}
    // ========== 1. 背景网格 ==========
let gridHelper = null;
function updateGridHelper(show) {
    if (gridHelper) { scene.remove(gridHelper); gridHelper = null; }
   if (show) {
        const size = Math.ceil(Math.max(globalMax.x - globalMin.x, globalMax.y - globalMin.y));
        // 原：divisions = size → 边长=1；现调整为 divisions = size/1000 → 边长=1000
        const divisions = Math.max(1, Math.floor(size / 100)); // 确保至少1个格子
        gridHelper = new THREE.GridHelper(size, divisions, 0xD7D7D7, 0xD7D7D7);
        // 旋转到XOY平面（关键：绕X轴-90°）
        gridHelper.rotation.x = -Math.PI / 2; 
        gridHelper.position.set(modelOrigin.x, modelOrigin.y, 0); // 平面中心在模型原点的XOY平面
        gridHelper.material.opacity = 0.55;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
    }
}
document.getElementById('toggle-grid').onchange = e => updateGridHelper(e.target.checked);

// ========== 2. 虚拟摇杆（仅第一人称） ==========
// 直接替换 main.js 里原有的虚拟摇杆相关代码
// 虚拟摇杆相关代码
let joystickDir = {x:0, y:0};
const joystickContainer = document.getElementById('joystick-container');
const joystickBg = document.getElementById('joystick-bg');
const joystickDot = document.getElementById('joystick-dot');

function showJoystick(show) {
    if (joystickContainer) joystickContainer.style.display = show ? 'block' : 'none';
    if (!show && joystickDot) {
        joystickDot.style.transform = 'translate(-50%, -50%)';
        joystickDir = {x:0, y:0};
    }
}

function updateJoystickVisibility() {
    showJoystick(currentView === 'first');
}

// 摇杆事件处理
if (joystickBg) {
    let dragging = false;
    joystickBg.addEventListener('pointerdown', e => {
        dragging = true;
        const rect = joystickBg.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
        const nx = x / (rect.width/2) * len;
        const ny = y / (rect.height/2) * len;
        joystickDot.style.transform = `translate(calc(-50% + ${nx*50}px), calc(-50% + ${ny*50}px))`;
        joystickDir = {x: nx, y: ny};
    });
    
    window.addEventListener('pointermove', e => {
        if (!dragging) return;
        const rect = joystickBg.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
        const nx = x / (rect.width/2) * len;
        const ny = y / (rect.height/2) * len;
        joystickDot.style.transform = `translate(calc(-50% + ${nx*50}px), calc(-50% + ${ny*50}px))`;
        joystickDir = {x: nx, y: ny};
    });
    
    window.addEventListener('pointerup', e => {
        dragging = false;
        joystickDot.style.transform = 'translate(-50%, -50%)';
        joystickDir = {x:0, y:0};
    });
}

// 获取摇杆移动方向
function getJoystickMove() {
    // 摇杆向左(A): x负，向右(D): x正，向上(W): y负，向下(S): y正
    // 但你要求：左y负，右y正，上x负，下x正
    return {
        x: joystickDir.x,      // -1~1，左负右正（y轴）
        y: -joystickDir.y      // -1~1，上负下正（x轴）
    };
}

// 生成电力线几何体（平滑曲线）
function movingAverage(points, windowSize = 11) {
  // 对三维点做移动平均滤波
   windowSize = Math.max(5, Math.min(21, Math.floor(points.length / 20)));
  const smoothed = [];
  for (let i = 0; i < points.length; i++) {
    let sum = new THREE.Vector3(0, 0, 0);
    let count = 0;
    for (let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
      const idx = i + j;
      if (idx >= 0 && idx < points.length) {
        sum.add(points[idx]);
        count++;
      }
    }
    // 关键：每次 push 一个新对象
    smoothed.push(sum.clone().multiplyScalar(1 / count));
  }
  return smoothed;
}

function generatePowerlineModel(powerlinePoints, jsonData, sagFactor = 1.0){
    powerlineGroup.clear();
     if (!jsonData || !Array.isArray(jsonData)) return;
    for (let i = 0; i < jsonData.length; i++) {
        const line = jsonData[i];
        if (!Array.isArray(line.coordinates) || line.coordinates.length < 2) continue;
        const points = line.coordinates.map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
        // 弧垂调整
        let sag = (line.metrics?.sag || 0) * sagFactor;
        // ...对points做弧垂插值调整（略，保持原有算法）...
        // ...生成电力线模型...
        // 记录当前倍率
        line._currentSagFactor = sagFactor;
      
    }
    // 创建Map来追踪每个塔点的连接数
    const towerConnections = new Map();

    
    // 按线段长度排序，优先处理较短的连接
    const sortedLines = [...jsonData].sort((a, b) => {
        const lenA = new THREE.Vector3(...a.coordinates[0]).distanceTo(new THREE.Vector3(...a.coordinates[a.coordinates.length-1]));
        const lenB = new THREE.Vector3(...b.coordinates[0]).distanceTo(new THREE.Vector3(...b.coordinates[b.coordinates.length-1]));
        return lenA - lenB;
    });


    sortedLines.forEach(lineData => {
        // 新增：校验 coordinates 有效性
        if (!Array.isArray(lineData.coordinates) || lineData.coordinates.length < 2) return;
        const is3D = lineData.coordinates.every(pt => Array.isArray(pt) && pt.length === 3);
        if (!is3D) return;

       // 生成原始点集（新增空值过滤）
        const rawPoints = lineData.coordinates
            .filter(pt => Array.isArray(pt) && pt.length === 3) // 过滤无效点
            .map(coord => new THREE.Vector3(coord[0], coord[1], coord[2]));
        
        if (rawPoints.length < 2) return; // 至少需要两个点才能生成曲线

        // 移动平均滤波（平滑处理）
        let points = movingAverage(rawPoints, 21); // 增大窗口提升平滑度
        if (points.length < 2) return; // 滤波后仍需至少两个点

        points = movingAverage(points, 21); // 移动平均滤波

        // 后续使用 points 生成电力线模型的代码（确保在 points 定义后）
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.4,
            clearcoat: 0.2,
            clearcoatRoughness: 0.3,
            reflectivity: 0.6,
            envMapIntensity: 0.7,
            flatShading: false,
            wireframe: false
        });


       const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const lineDirection = endPoint.clone().sub(startPoint).normalize();
        
        // 查找最近的电力塔点
        const towerGeom = towerGroup.children[0]?.geometry;
        if (towerGeom) {
            const towerPositions = towerGeom.getAttribute('position');
            let nearestStartTower = null;
            let nearestEndTower = null;
            let minStartDist = Infinity;
            let minEndDist = Infinity;

            // 每个塔点最多允许4个连接
            const MAX_CONNECTIONS = 2;
            const MAX_DISTANCE = 1; // 减小最大连接距离
            const MIN_ANGLE_COS = Math.cos(Math.PI / 3); // 60度角限制



           for (let i = 0; i < towerPositions.count; i++) {
                const towerPoint = new THREE.Vector3().fromBufferAttribute(towerPositions, i);
                const connectionCount = towerConnections.get(towerPoint.toArray().join(',')) || 0;
                
                if (connectionCount >= MAX_CONNECTIONS) continue;
                
                const startDist = startPoint.distanceTo(towerPoint);
                const endDist = endPoint.distanceTo(towerPoint);
                
                // 检查起点连接
                if (startDist < minStartDist && startDist < MAX_DISTANCE) {
                    const dirToStart = startPoint.clone().sub(towerPoint).normalize();
                    // 检查连接角度是否合理
                    if (Math.abs(dirToStart.dot(lineDirection)) > MIN_ANGLE_COS) {
                        minStartDist = startDist;
                        nearestStartTower = towerPoint;
                    }
                }

                // 检查终点连接
                if (endDist < minEndDist && endDist < MAX_DISTANCE) {
                    const dirToEnd = endPoint.clone().sub(towerPoint).normalize();
                    // 检查连接角度是否合理
                    if (Math.abs(dirToEnd.dot(lineDirection)) > MIN_ANGLE_COS) {
                        minEndDist = endDist;
                        nearestEndTower = towerPoint;
                    }
                }
            }


            // 创建连接结构并更新连接计数
            if (nearestStartTower) {
                const startKey = nearestStartTower.toArray().join(',');
                const startCount = towerConnections.get(startKey) || 0;
                if (startCount < MAX_CONNECTIONS) {
                    const connectorCurveStart = new THREE.CatmullRomCurve3([
                        nearestStartTower,
                        new THREE.Vector3().lerpVectors(nearestStartTower, startPoint, 0.5),
                        startPoint
                    ]);
                    const connectorGeomStart = new THREE.TubeGeometry(
                        connectorCurveStart,
                        20,
                        0.006,
                        8,
                        false
                    );
                    const connectorMeshStart = new THREE.Mesh(connectorGeomStart, material);
                    connectorMeshStart.castShadow = true;
                    connectorMeshStart.receiveShadow = true;
                    powerlineGroup.add(connectorMeshStart);
                    towerConnections.set(startKey, startCount + 1);
                }
            }

            if (nearestEndTower) {
                const endKey = nearestEndTower.toArray().join(',');
                const endCount = towerConnections.get(endKey) || 0;
                if (endCount < MAX_CONNECTIONS) {
                    const connectorCurveEnd = new THREE.CatmullRomCurve3([
                        nearestEndTower,
                        new THREE.Vector3().lerpVectors(nearestEndTower, endPoint, 0.5),
                        endPoint
                    ]);
                    const connectorGeomEnd = new THREE.TubeGeometry(
                        connectorCurveEnd,
                        20,
                        0.006,
                        8,
                        false
                    );
                    const connectorMeshEnd = new THREE.Mesh(connectorGeomEnd, material);
                    connectorMeshEnd.castShadow = true;
                    connectorMeshEnd.receiveShadow = true;
                    powerlineGroup.add(connectorMeshEnd);
                    towerConnections.set(endKey, endCount + 1);
                }
            }
        }

       // 创建主电力线（增加 TubeGeometry 分段数）（优化平滑度）
        const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2); // 张力调小更平滑
        const tubeSegments = Math.max(50, points.length * 2); // 分段数自适应
        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            tubeSegments,
            0.3,
            16,
            false
        );

         const lineMesh = new THREE.Mesh(tubeGeometry, material);
        lineMesh.castShadow = true;
        lineMesh.receiveShadow = true;
        lineMesh.userData = {
            id: lineData.id,
            metrics: {
                ...lineData.metrics,
                tension: lineData.metrics?.tension,
                sag: lineData.metrics?.sag,
                length: lineData.metrics?.length
            }
        };
        // 记录当前倍率和覆冰信息
        lineMesh.userData.metrics._currentSagFactor = sagFactor;
        lineMesh.userData.metrics._icingFactor = 1.0;
        lineMesh.userData.metrics._icingThickness = 0;
        powerlineGroup.add(lineMesh);

    });
     // 收集所有电力线点的投影
    let allLineProjPoints = [];
    jsonData.forEach(line => {
        if (Array.isArray(line.coordinates)) {
            line.coordinates.forEach(pt => {
                allLineProjPoints.push(new THREE.Vector2(pt[0], pt[1])); // 投影到XOY
            });
        }
    });
    // 计算凸包
    function convexHull(points) {
        // Graham scan
        points = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
        const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        const lower = [];
        for (let p of points) {
            while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
            lower.push(p);
        }
        const upper = [];
        for (let i = points.length - 1; i >= 0; i--) {
            let p = points[i];
            while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
            upper.push(p);
        }
        upper.pop();
        lower.pop();
        return lower.concat(upper);
    }
    const hull = convexHull(allLineProjPoints);
    if (hull.length >= 3) {
        // 1. 绿色凸包区域
        const shape = new THREE.Shape(hull.map(p => new THREE.Vector2(p.x, p.y)));
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color: 0x4caf50, opacity: 0.7, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0); // XOY平面
        scene.add(mesh);

        // 2. 草地铺设（凸包外扩50范围内）
        // 计算外扩包围盒
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        hull.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });
        minX -= 200; maxX += 200; minY -= 200; maxY += 200; // --- 修改：50 -> 200 ---

        // 草地参数
        const grassCountX = Math.floor((maxX - minX) / 2.5); // 草丛密度
        const grassCountY = Math.floor((maxY - minY) / 2.5);
        const totalGrass = grassCountX * grassCountY;

        // 草地几何（简易：一片三角形草叶）
        const grassGeo = new THREE.PlaneGeometry(1, 3);
        const grassMat = new THREE.MeshBasicMaterial({ color: 0x3fa34d});

        // InstancedMesh高效渲染
        const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, totalGrass);
        let idx = 0;
        for (let i = 0; i < grassCountX; i++) {
            for (let j = 0; j < grassCountY; j++) {
                const x = minX + (i + Math.random()) * (maxX - minX) / grassCountX;
                const y = minY + (j + Math.random()) * (maxY - minY) / grassCountY;
                // 判断点是否在凸包内或离凸包小于50
                let inside = isPointInPolygon(new THREE.Vector2(x, y), hull);
                function isPointInPolygon(point, polygon) {
                    // point: THREE.Vector2, polygon: Array<THREE.Vector2>
                    let inside = false;
                    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                        const xi = polygon[i].x, yi = polygon[i].y;
                        const xj = polygon[j].x, yj = polygon[j].y;
                        if (
                            ((yi > point.y) !== (yj > point.y)) &&
                            (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-10) + xi)
                        ) {
                            inside = !inside;
                        }
                    }
                    return inside;
                }
                if (!inside) {
                    // 计算到凸包最近距离
                    let minDist = Infinity;
                    for (let k = 0; k < hull.length; k++) {
                        const a = hull[k], b = hull[(k+1)%hull.length];
                        // 点到线段距离
                        const t = Math.max(0, Math.min(1, ((x-a.x)*(b.x-a.x)+(y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2)));
                        const proj = {x: a.x + t*(b.x-a.x), y: a.y + t*(b.y-a.y)};
                        const dist = Math.hypot(x-proj.x, y-proj.y);
                        minDist = Math.min(minDist, dist);
                    }
                    if (minDist > 200) continue; // 超出外扩200的区域不铺草
                }
                // 随机旋转和缩放
                const m = new THREE.Matrix4();
                m.makeRotationZ(Math.random() * Math.PI * 2);
                m.multiply(new THREE.Matrix4().makeScale(0.7 + Math.random()*0.7, 0.7 + Math.random()*1.2, 1));
                m.setPosition(x, y, 0);
                grassMesh.setMatrixAt(idx++, m);
                if (idx >= totalGrass) break;
            }
            if (idx >= totalGrass) break;
        }
        grassMesh.count = idx; // 实际草丛数
        grassMesh.instanceMatrix.needsUpdate = true;
        grassMesh.name = 'instanced-grass';
        scene.add(grassMesh);
    }
    scene.add(powerlineGroup);
}

// 计算线段长度辅助函数(未使用)
function getLineLength(coordinates) {
    let length = 0;
    for (let i = 1; i < coordinates.length; i++) {
        const p1 = new THREE.Vector3(...coordinates[i-1]);
        const p2 = new THREE.Vector3(...coordinates[i]);
        length += p1.distanceTo(p2);
    }
    return length;
}

// 视图控制
function bindViewControls() {
    const btns = document.querySelectorAll('.view-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            switchView(btn.dataset.view);
        };
    });
    // 支持键盘1/2/3切换
    window.addEventListener('keydown', (e) => {
        if (e.key === '1') switchView('god');
        if (e.key === '2') switchView('first');
        if (e.key === '3') switchView('fly');
        if (e.key === 'r') resetView();
    });
}

// 6. 键盘移动（更顺滑，距离更小，方向完全按你要求）
const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
let moveSpeed = 5; // 步长更小

// 7. 动画循环中处理移动
function updateMove() {
    // god/overview/first/fly 视角都支持移动
    if (currentView === 'god' || currentView === 'top'||currentView === 'overview') {

        // XOY平面移动
        let moveX = 0, moveY = 0;
        if (moveState.forward) moveX -= 1;   // W/上键，x负
        if (moveState.backward) moveX += 1;  // S/下键，x正
        if (moveState.left) moveY -= 1;      // A/左键，y负
        if (moveState.right) moveY += 1;     // D/右键，y正
        if (moveX !== 0 || moveY !== 0) {
            let moveVec = new THREE.Vector3();
            moveVec.addScaledVector(modelX, moveX);
            moveVec.addScaledVector(modelY, moveY);
            moveVec.normalize().multiplyScalar(moveSpeed);
            camera.position.add(moveVec);
            orbitControls.target.add(moveVec);
        }
    } 
   else if (currentView === 'first') {
     let moveX = 0, moveY = 0;
        const joy = window.getJoystickMove ? window.getJoystickMove() : {x:0, y:0};
        moveY += joy.x;
        moveX -= joy.y;
        if (moveState.forward) moveX -= 1;
        if (moveState.backward) moveX += 1;
        if (moveState.left) moveY -= 1;
        if (moveState.right) moveY += 1;
        if (moveX !== 0 || moveY !== 0) {
            let moveVec = new THREE.Vector3();
            moveVec.addScaledVector(modelX, moveX);
            moveVec.addScaledVector(modelY, moveY);
            moveVec.normalize().multiplyScalar(moveSpeed * 0.7);
            camera.position.add(moveVec);
            // 保持贴地高度
            const { center, size } = getSceneBoundingBox();
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = center.z - maxDim * 0.02;
            updateFirstPersonCamera();
        }
}
    else if (currentView === 'fly') {
        // 飞行视角：三维自由
        let moveX = 0, moveY = 0, moveZ = 0;
        if (moveState.forward) moveX -= 1;
        if (moveState.backward) moveX += 1;
        if (moveState.left) moveY -= 1;
        if (moveState.right) moveY += 1;
        if (moveState.up) moveZ += 1;    // Q键，z正
        if (moveState.down) moveZ -= 1;  // E键，z负
        if (moveX !== 0 || moveY !== 0 || moveZ !== 0) {
            let moveVec = new THREE.Vector3();
            moveVec.addScaledVector(modelX, moveX);
            moveVec.addScaledVector(modelY, moveY);
            moveVec.addScaledVector(modelZ, moveZ);
            moveVec.normalize().multiplyScalar(moveSpeed * 0.7);
            camera.position.add(moveVec);
        }
    }
    requestAnimationFrame(updateMove);
}
updateMove();

// 切换视角时显示/隐藏摇杆
const oldSwitchView2 = switchView;
switchView = function(...args) {
    oldSwitchView2.apply(this, args);
    updateJoystickVisibility();

};

let firstPersonYaw = 0, firstPersonPitch = 0; //千万别动z
let flyYaw = 0, flyPitch = 0; //千万别动
let firstPersonFixedY = null;
let firstPersonFixedZ = null; // <-- 新增：在此处声明变量
let lastFlyCameraState = null;

function updateFirstPersonCamera() {
    // 以当前 yaw/pitch 计算相机朝向
    const r = 1;
    const dx = Math.cos(firstPersonPitch) * Math.cos(firstPersonYaw);
    const dy = Math.cos(firstPersonPitch) * Math.sin(firstPersonYaw);
    const dz = Math.sin(firstPersonPitch);
    const lookAt = new THREE.Vector3(
        camera.position.x + dx,
        camera.position.y + dy,
        camera.position.z + dz
    );
    camera.lookAt(lookAt);
}
function getSceneBoundingBox() {
    // 收集所有建模物体
    let allObjs = [
        ...towerGroup.children,
        ...(window.treeGroup?.children || []),
        ...(window.carGroup?.children || []),
        ...(window.houseGroup?.children || []),
        ...(window.birdGroup?.children || [])
    ];
    // 若没有建模物体，回退到全局包围盒
    if (allObjs.length === 0) {
        return { center: globalMin.clone().add(globalMax).multiplyScalar(0.5), size: globalMax.clone().sub(globalMin) };
    }
    // 计算所有建模物体的包围盒
    let bbox = new THREE.Box3();
    allObjs.forEach(obj => bbox.expandByObject(obj));
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    return { center, size };
}
function switchView(view) {
    currentView = view;
    updateJoystickVisibility();
    if (view !== 'detail') hideDetailArrows();
    const { center, size } = getSceneBoundingBox();
    const maxDim = Math.max(size.x, size.y, size.z);

    switch(view) {
        case 'overview': {
    camera.position.set(center.x + maxDim * 0.5, center.y + maxDim * 0.5, center.z + maxDim * 0.1);
    camera.lookAt(center.x, center.y, center.z);
    if (orbitControls) {
        orbitControls.target.copy(center);
        orbitControls.update();
    }
    break;
}
case 'god': {
    camera.position.set(center.x, center.y, center.z + maxDim * 1.0);
    camera.lookAt(center.x, center.y, center.z);
    if (orbitControls) {
        orbitControls.target.copy(center);
        orbitControls.update();
    }
    break;
}
        case 'first': {
            camera.position.set(center.x, center.y - maxDim * 0.15, center.z -maxDim * 0.02); // 更贴地
            camera.lookAt(center.x, center.y, center.z);
            camera.up.set(0, 0, 1);
            if (orbitControls) {
                orbitControls.target.copy(center);
                orbitControls.update();
            }
            break;
        }
        case 'fly': {
            const offsetDir = new THREE.Vector3(1, 0.5, 0).normalize();
            const offsetDist = maxDim * 0.07; // 更近
            const camPos = center.clone().add(offsetDir.multiplyScalar(offsetDist));
            camPos.z = center.z + maxDim * 0.12 + 20; // 更低
            camera.position.copy(camPos);
            camera.lookAt(center.x, center.y, center.z);
            camera.up.set(0, 0, 1);
            if (orbitControls) {
                orbitControls.target.copy(center);
                orbitControls.update();
            }
            break;
        }
    }

  //  showModelAxes(modelOrigin, maxDim * 0.5);
    if (orbitControls) {
    orbitControls.enabled = true;
    orbitControls.enableRotate = true;
    orbitControls.enablePan = true;
    orbitControls.enableZoom = true;
    orbitControls.update();
}
    // 信息面板恢复
    switch(view) {
        case 'god':
        case 'first':
        case 'fly':
        case 'overview':
              showGlobalInfo();
                 restoreLineInfoPanel();
            break;
       case 'detail':
            // 同步飞行视角的相机参数
            // 先计算飞行视角的参数
            /*camera.position.set(center.x, center.y, center.z + maxDim * 0.2);
            camera.up.set(0, 0, 1);
            camera.lookAt(center.x + 1, center.y, center.z + maxDim * 0.2);
            orbitControls.target.set(center.x + 1, center.y, center.z + maxDim * 0.2);
            orbitControls.enabled = false;
            orbitControls.enableRotate = false;
            orbitControls.enablePan = false;
            orbitControls.enableZoom = false;
            orbitControls.update();
            renderer.domElement.style.cursor = 'auto';
            showDetailArrows(); // 仅在detail视角显示*/
            // 下面如有细节展示的其它逻辑可继续保留
   
        restoreLineInfoPanel();
            break;
    }
    if (view !== 'detail') {
        hideDetailArrows();
    }
 
    updateTopBarStatus(view);
    updateAutoCruiseBtn();
    updateJoystickVisibility();

    switch(view) {
        case 'god':
        case 'first':
        case 'fly':
        case 'overview':
            showGlobalInfo();
            break;
        case 'detail':
            case 'detail':

    break;         
    }
   renderRiskResult()
}
// 计算电力线平均长度
function calculateAvgLineLength(jsonData) {
    if (!jsonData || jsonData.length === 0) return '-';
    
    let totalLength = 0;
    let validLines = 0;
    
    jsonData.forEach(line => {
        if (line.metrics && line.metrics.length) {
            totalLength += line.metrics.length;
            validLines++;
        }
    });
    
    return validLines > 0 ? (totalLength / validLines).toFixed(2) : '-';
}
// 获取当前区域名称（与上方箭头显示保持一致）
function getCurrentRegionName() {
    const currentName = DATASETS[currentDatasetIdx].ply
        .replace('refined_power_lines', '')
        .replace('.ply', '');
    return `区域 ${currentName}`;
}

function resetView() {
    // 收集所有建模物体
    let allObjs = [
        ...towerGroup.children,
        ...(window.treeGroup?.children || []),
        ...(window.carGroup?.children || []),
        ...(window.houseGroup?.children || []),
        ...(window.birdGroup?.children || [])
    ];
    // 若没有建模物体，回退到原有逻辑
    if (allObjs.length === 0) {
        const center = globalMin.clone().add(globalMax).multiplyScalar(0.5);
        const size = globalMax.clone().sub(globalMin);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x + maxDim * 1.0, center.y + maxDim * 1.0, center.z + maxDim * 0.6);
        camera.lookAt(center.x, center.y, center.z);
        orbitControls.target.set(center.x, center.y, center.z);
        if (orbitControls) orbitControls.update();
       // showModelAxes(modelOrigin, maxDim * 0.5);
        syncRendererAndCamera();
        return;
    }
    // 计算所有建模物体的包围盒
    let bbox = new THREE.Box3();
    allObjs.forEach(obj => bbox.expandByObject(obj));
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // 主建模视角：相机居中且略高
    camera.position.set(center.x + maxDim * 1.0, center.y + maxDim * 1.0, center.z + maxDim * 0.6);
    camera.lookAt(center.x, center.y, center.z);
    orbitControls.target.set(center.x, center.y, center.z);

    if (orbitControls) {
        orbitControls.enabled = true;
        orbitControls.enableRotate = true;
        orbitControls.enablePan = true;
        orbitControls.enableZoom = true;
        orbitControls.update();
    }
   // showModelAxes(modelOrigin, maxDim * 0.5);
    syncRendererAndCamera();
}

//关于绑定视角到按钮
function bindMenuAndFullscreen() {
    // 视角切换
 document.getElementById('menu-god')?.addEventListener('click', () => switchView('god'));
    document.getElementById('menu-first')?.addEventListener('click', () => switchView('first'));
    document.getElementById('menu-fly')?.addEventListener('click', () => switchView('fly'));
    // 修复：简化全景浏览按钮点击事件，避免重复调用
    document.getElementById('menu-overview')?.addEventListener('click', () => switchView('overview'));  // 修改点
   // 细节展示菜单点击，重置为第一个档段
document.getElementById('menu-detail').onclick = () => {
    detailTowerIdx = 0;
    updateDetailView(detailTowerIdx);
    switchView('detail');
 showDetailArrows();
};

    // 放大镜全屏
    const threeContainer = document.getElementById('three-container');
    const mainCard = document.querySelector('.main-card');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenExit = document.getElementById('fullscreen-exit');
    fullscreenBtn?.addEventListener('click', () => {
        mainCard.classList.add('fullscreen-active'); // 改这里
        fullscreenExit.style.display = 'flex';
        document.body.classList.add('fullscreen-lock');
        setTimeout(() => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }, 10);
    });
    fullscreenExit?.addEventListener('click', () => {
        mainCard.classList.remove('fullscreen-active'); // 改这里
        fullscreenExit.style.display = 'none';
        document.body.classList.remove('fullscreen-lock');
        renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
        camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
        camera.updateProjectionMatrix();
    });

    // 窗口变化时自适应
    window.addEventListener('resize', () => {
        if (threeContainer.classList.contains('fullscreen-active')) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
        } else if (renderer) {
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    camera.updateProjectionMatrix();
}
    });
}

// 在initialize最后调用
bindMenuAndFullscreen();
// 鼠标移动事件（显示tooltip）
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(powerlineGroup.children, true);
  if (intersects.length > 0) {
    const { point, object } = intersects[0];
    const meta = object.userData;
    let sagFactor = meta?.metrics?._currentSagFactor || currentSagFactor || 1.0;
    let sag = (meta.metrics?.sag || 0) * sagFactor;
    let icingThick = meta.metrics?._icingThickness || 0;
    const zHeight = point.z;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;
    tooltip.innerHTML = `
        <div style="background: rgba(0,0,0,0.85); padding: 12px; border-radius: 8px; min-width: 200px;">
            <div style="color: #87CEEB; font-weight: bold; margin-bottom: 8px;">电力线 #${meta.id ?? ''}</div>
            <div style="color: white; font-size: 13px; line-height: 1.5;">
                <div>坐标: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})</div>
                <div>高度: ${zHeight.toFixed(2)} m</div>
                <div>长度: ${meta.metrics?.xy_span?.toFixed(2) || meta.metrics?.length?.toFixed(2) || 'N/A'} m</div>
                <div>直径: 20 mm</div>
                <div>张力: ${meta.metrics?.tension?.toFixed(2) || 'N/A'} kN</div>
                <div>弧垂: ${sag.toFixed(2)} m (倍率: ${sagFactor.toFixed(2)})</div>
                <div>覆冰厚度: ${icingThick.toFixed(1)} mm</div>
            </div>
        </div>
    `;
    // 新增：同步下方面板
    //updateLineInfo(meta, point);
  } else {
    tooltip.style.display = 'none';
  }
}

 

// 计算平均高度和直径（假设jsonData每条线有coordinates和metrics）
/*// ========== 4. 左下角数据框 ==========
function updateModelStats() {
    const statsDiv = document.getElementById('model-stats');
    if (!statsDiv) return;
    // 电力塔数量和平均高度
    let towerCount = 0, towerHeights = [];
    if (towerGroup.children.length > 0) {
        const mesh = towerGroup.children[0];
        const posAttr = mesh.geometry.getAttribute('position');
        let maxDist = 0;
        let yStart = null, yEnd = null;
        const step = Math.max(1, Math.floor(posAttr.count / 200));
        for (let j = 0; j < posAttr.count; j += step) {
            for (let k = j + step; k < posAttr.count; k += step) {
                const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, j);
                const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, k);
                const dist = v1.distanceTo(v2);
                if (dist > maxDist) { maxDist = dist; yStart = v1.clone(); yEnd = v2.clone(); }
            }
        }
        towerCount = 1;
        if (yStart && yEnd) {
            const height = yEnd.clone().sub(yStart).dot(modelY);
            towerHeights.push(Math.abs(height));
        }
    }
    // 电力线数量和高度
    let lineCount = 0, lineHeights = [];
    powerlineGroup.children.forEach(obj => {
        if (obj.geometry && obj.geometry.type === 'TubeGeometry') {
            lineCount++;
            const posAttr = obj.geometry.getAttribute('position');
            for (let i = 0; i < posAttr.count; i += Math.max(1, Math.floor(posAttr.count / 50))) {
                const pt = new THREE.Vector3().fromBufferAttribute(posAttr, i);
                const rel = pt.clone().sub(modelOrigin);
                lineHeights.push(rel.dot(modelY));
            }
        }
    });
    let avgTowerHeight = towerHeights.length ? (towerHeights.reduce((a,b)=>a+b,0)/towerHeights.length) : 0;
    let avgLineHeight = lineHeights.length ? (lineHeights.reduce((a,b)=>a+b,0)/lineHeights.length) : 0;
    let minLineHeight = lineHeights.length ? Math.min(...lineHeights) : 0;
    statsDiv.innerHTML = `
      <div>电力塔数量：${towerCount}</div>
      <div>平均塔高(y)：${avgTowerHeight.toFixed(2)} m</div>
      <div>电力线数量：${lineCount}</div>
      <div>平均线高(y)：${avgLineHeight.toFixed(2)} m</div>
      <div>最低线高(y)：${minLineHeight.toFixed(2)} m</div>
    `;
}*/

function updateGlobalInfo(jsonData) {
    if (!jsonData || !Array.isArray(jsonData)) {
        console.warn('updateGlobalInfo: jsonData 无效');
        return;
    }

    // 电力线数量
    const lineCount = jsonData.length;
    
    // 电力线平均高度（所有线的所有点z坐标的平均值）
    let totalHeight = 0, totalPoints = 0;
    jsonData.forEach(line => {
        if (line && Array.isArray(line.coordinates)) {
            line.coordinates.forEach(pt => {
                if (Array.isArray(pt) && pt.length >= 3 && typeof pt[2] === 'number') {
                    totalHeight += pt[2];
                    totalPoints++;
                }
            });
        }
    });
    
    const avgHeight = totalPoints > 0 ? (totalHeight / totalPoints).toFixed(2) : '-';
    
    // 确保DOM元素存在后再更新
    const lineCountEl = document.getElementById('line-count');
    const lineAvgHeightEl = document.getElementById('line-avg-height');
    
    if (lineCountEl) {
        lineCountEl.textContent = lineCount;
    } else {
        console.warn('DOM元素 line-count 不存在');
    }
    
    if (lineAvgHeightEl) {
        lineAvgHeightEl.textContent = avgHeight;
    } else {
        console.warn('DOM元素 line-avg-height 不存在');
    }
    
    // 更新电力塔信息
    updateTowerInfo();
    
    console.log(`更新全局信息: 电力线数量=${lineCount}, 平均高度=${avgHeight}`);
}

function updateTowerInfo() {
    // 电力塔数量
    const towerCount = towerGroup ? towerGroup.children.length : 0;
    
    // 电力塔平均高度 - 使用更准确的计算
    let avgTowerHeight = 25.0; // 默认值
    if (towerCount > 0 && TOWER_COORDS[datasetKey]) {
        const coords = TOWER_COORDS[datasetKey];
        let totalTowerHeight = 0;
        let validTowers = 0;
        coords.forEach(coord => {
            if (Array.isArray(coord) && coord.length >= 3) {
                // 使用z坐标作为高度，如果z为0则使用默认高度25
                const height = coord[2] !== 0 ? coord[2] : 25;
                totalTowerHeight += height;
                validTowers++;
            }
        });
        if (validTowers > 0) {
            avgTowerHeight = totalTowerHeight / validTowers;
        }
    }
    
    // 确保DOM元素存在后再更新
    const towerCountEl = document.getElementById('tower-count');
    const towerAvgHeightEl = document.getElementById('tower-avg-height');
    
    if (towerCountEl) {
        towerCountEl.textContent = towerCount;
    } else {
        console.warn('DOM元素 tower-count 不存在');
    }
    
    if (towerAvgHeightEl) {
        towerAvgHeightEl.textContent = avgTowerHeight.toFixed(2);
    } else {
        console.warn('DOM元素 tower-avg-height 不存在');
    }
    
    console.log(`更新电力塔信息: 数量=${towerCount}, 平均高度=${avgTowerHeight.toFixed(2)}`);
}
function updateLineInfo(line, point) {
    const metrics = line.metrics || {};
    window.lastSelectedLine = line;
    window.lastSelectedPoint = point;

    // 取当前倍率和覆冰厚度，和 onMouseMove 保持一致
    let sagFactor = metrics._currentSagFactor || currentSagFactor || 1.0;
    let sag = (metrics.sag || 0) * sagFactor;
    let icingThick = metrics._icingThickness || 0;

    document.getElementById('selected-line-info').innerHTML = `
        <div>线ID：<span id="line-id">${line.id ?? '-'}</span></div>
        <div>高度：<span id="line-height">${point && typeof point.z === 'number' ? point.z.toFixed(2) : '-'}</span> m</div>
        <div>长度：<span id="line-length">${typeof metrics.xy_span === 'number' ? metrics.xy_span.toFixed(2) : (metrics.length ? metrics.length.toFixed(2) : '-')}</span> m</div>
        <div>直径：<span id="line-diameter">${metrics.diameter ?? 20}</span>mm</div>
        <div>弧垂度：<span id="line-sag">${sag.toFixed(2)}</span> m (倍率: <span id="line-sag-factor">${sagFactor.toFixed(2)}</span>)</div>
        <div>张力：<span id="line-tension">${typeof metrics.tension === 'number' ? metrics.tension.toFixed(2) : '-'}</span> kN</div>
        <div>覆冰厚度：<span id="line-icing">${icingThick.toFixed(1)}</span> mm</div>
        <div id="line-remark-btn" title="添加备注" style="position:absolute;right:18px;bottom:12px;cursor:pointer;">
            <i class="fa fa-pencil-square-o" style="font-size:22px;color:#2196f3;opacity:0.8;"></i>
        </div>
    `;
    bindRemarkBtn();
    updateLineRemarkDisplay(line.id);
}
// 窗口调整事件
function onWindowResize() {
    const container = document.getElementById('three-container');
    let w, h;
    if (container.classList.contains('fullscreen-active')) {
        w = window.innerWidth;
        h = window.innerHeight;
    } else {
        const rect = container.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
}

// 动画循环（优化性能）
// 动画循环（优化性能）
// 8. OrbitControls/PointerLockControls限制
function animate() {
    requestAnimationFrame(animate);
    updateWeatherParticles();
    if (orbitControls) {
        // 只在第一人称/飞行模式禁用
        orbitControls.enabled = (currentView !== 'first' && currentView !== 'fly');
        if (orbitControls.enabled) orbitControls.update();
    }
    renderer.render(scene, camera);
}




// 恢复全局统计的函数（可在切换其它菜单时调用）
function showGlobalInfo() {
    document.getElementById('global-info-title').style.display = '';
    document.getElementById('global-info-content').style.display = '';
    document.getElementById('danger-info-title').style.display = 'none';
    document.getElementById('danger-info-content').style.display = 'none';
    document.getElementById('danger-mini-view').style.display = 'none';
    document.getElementById('global-mini-view').style.display = 'block';
    // 恢复全局统计标题
    document.querySelector('#global-info .info-title span').innerHTML = '<i class="fa fa-bar-chart"></i> 全局统计';
    // 恢复全局统计内容
    document.getElementById('global-info-content').innerHTML = `
        <div>
            <span>电力塔数量：</span><span id="tower-count">-</span>
        </div>
        <div>
            <span>电力塔平均高度：</span><span id="tower-avg-height">-</span> m
        </div>
        <div>
            <span>电力线数量：</span><span id="line-count">-</span>
        </div>
        <div>
            <span>电力线平均高度：</span><span id="line-avg-height">-</span> m
        </div>
    `;
    updateGlobalInfo(globalJsonData);
    
}


// 显示潜在危险物卡片及小视角框
function showDangerInfo(text) {
    // 只显示危险物卡片和危险物小框
    document.getElementById('global-info-title').style.display = 'none';
    document.getElementById('global-info-content').style.display = 'none';
    document.getElementById('danger-info-title').style.display = '';
    document.getElementById('danger-info-content').style.display = '';
    document.getElementById('danger-mini-view').style.display = 'block';
    document.getElementById('global-mini-view').style.display = 'none';
    document.getElementById('danger-info-text').innerHTML = `<span style="font-size:1.2em;font-weight:bold;color:#e74c3c;">${text}</span>`;
}


function bindDatasetSwitcher() {
    const prevBtn = document.getElementById('prev-dataset-btn');
    const nextBtn = document.getElementById('next-dataset-btn');
    const nameDisplay = document.getElementById('dataset-name-display');

    if (nameDisplay) {
        const currentRegionName = getCurrentRegionName(); // 使用统一函数
        nameDisplay.textContent = currentRegionName;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            switchDataset(currentDatasetIdx - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            switchDataset(currentDatasetIdx + 1);
        });
    }
}
document.addEventListener('DOMContentLoaded', bindDatasetSwitcher);


// 启动应用（确保DOM加载完成后执行）
document.addEventListener('DOMContentLoaded', initialize);

window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': moveState.forward = true; break;
        case 's': case 'arrowdown': moveState.backward = true; break;
        case 'a': case 'arrowleft': moveState.left = true; break;
        case 'd': case 'arrowright': moveState.right = true; break;
        case 'q': moveState.down = true; break;
        case 'e': moveState.up = true; break;
    }
});
window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': moveState.forward = false; break;
        case 's': case 'arrowdown': moveState.backward = false; break;
        case 'a': case 'arrowleft': moveState.left = false; break;
        case 'd': case 'arrowright': moveState.right = false; break;
        case 'q': moveState.down = false; break;
        case 'e': moveState.up = false; break;
    }
});

function drawRiskGauge(value = 0.5, enlarge = false) {
    const canvas = document.getElementById('risk-gauge');
    if (!canvas) return;
    // 放大仪表盘
    if (enlarge) {
        canvas.style.width = '180px';
        canvas.style.height = '180px';
    } else {
        canvas.style.width = '140px';
        canvas.style.height = '140px';
    }
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 半圆参数
    const cx = w / 2;
    const radius = (w / 2) * 0.95; // 半径与宽度关联，使其更饱满
     const cy = h - radius; 

    // 1. 外圈半圆
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false);
    ctx.strokeStyle = "#3ecbff";
    ctx.lineWidth = 8;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#3ecbff";
    ctx.stroke();
    ctx.restore();

    // 2. 刻度线
    for (let i = 0; i <= 10; i++) {
        const angle = Math.PI + i * Math.PI / 10;
        const x1 = cx + Math.cos(angle) * (radius - 8);
        const y1 = cy + Math.sin(angle) * (radius - 8);
        const x2 = cx + Math.cos(angle) * (radius + 12);
        const y2 = cy + Math.sin(angle) * (radius + 12);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i < 3 ? "#2ecc71" : (i < 7 ? "#f39c12" : "#e74c3c");
        ctx.lineWidth = i % 2 === 0 ? 4 : 2;
        ctx.globalAlpha = 0.85;
        ctx.shadowBlur = 6;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
        ctx.restore();
    }

    // 3. 半透明内圈
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 18, Math.PI, 0, false);
    ctx.strokeStyle = "rgba(62,203,255,0.18)";
    ctx.lineWidth = 18;
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();

    // 4. 指针
    const pointerAngle = Math.PI + value * Math.PI;
    const px = cx + Math.cos(pointerAngle) * (radius - 28);
    const py = cy + Math.sin(pointerAngle) * (radius - 28);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 7;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#fff";
    ctx.stroke();
    ctx.restore();

    // 5. 指针头部圆点
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, 2 * Math.PI);
    ctx.fillStyle = value > 0.7 ? "#e74c3c" : (value > 0.4 ? "#f39c12" : "#2ecc71");
    ctx.shadowBlur = 16;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.restore();

    // 6. 中心发光
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "#3ecbff";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#3ecbff";
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.restore();

    // 7. 风险等级文字
    ctx.save();
    ctx.font = "bold 1.2em 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let txt = "安全";
    let color = "#2ecc71";
    if (value > 0.7) { txt = "特别紧急"; color = "#e74c3c"; }
    else if (value > 0.4) { txt = "一般紧急"; color = "#f39c12"; }
    ctx.fillStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fillText(txt, cx, cy - radius * 0.55);
    ctx.restore();
}
// 使用示例
//drawRiskGauge(0.3); // 0~1，0为低风险，1为高风险


// 页面加载后演示
document.addEventListener('DOMContentLoaded', () => {
   drawRiskGauge(0.3); // 0~1，0为低风险，1为高风险
});



// 危险物检测子项点击事件绑定
// 树障检测点击事件（已有逻辑补充图片）
document.getElementById('danger-tree').addEventListener('click', function() {
    const treeCount = TREE_COORDS[datasetKey] ? TREE_COORDS[datasetKey].length : 0;
    const text = treeCount > 0 ? `存在树木<br>数量：${treeCount}` : '未检测到树木危险物';
    showDangerInfo(text);
    document.getElementById('global-mini-view').style.display = 'none';
    document.getElementById('danger-mini-image').src = 'tree.png';
});

// 特种车辆检测点击事件
document.getElementById('danger-vehicle').addEventListener('click', function() {
    const vehicleCount = CAR_COORDS[datasetKey] ? CAR_COORDS[datasetKey].length : 0;
    const text = vehicleCount > 0 ? `存在特种车辆<br>数量：${vehicleCount}` : '未检测到特种车辆危险物';
    showDangerInfo(text);
    document.getElementById('global-mini-view').style.display = 'none';
    // 设置车辆图片（路径需用户准备）
    document.getElementById('danger-mini-image').src = 'car.png';
});

// 建筑物检测点击事件
document.getElementById('danger-house').addEventListener('click', function() {
    const houseCount = HOUSE_COORDS[datasetKey] ? HOUSE_COORDS[datasetKey].length : 0;
    const text = houseCount > 0 ? `存在建筑物<br>数量：${houseCount}` : '未检测到建筑物危险物';
    showDangerInfo(text);
    document.getElementById('global-mini-view').style.display = 'none';
    // 设置建筑物图片（路径需用户准备）
    document.getElementById('danger-mini-image').src = 'house.png';
});

// 挂线检测点击事件（修正后）
document.getElementById('danger-bird').addEventListener('click', function() {
    // 统计挂线数量（用 BIRD_COORDS 统计）
    const birdCount = BIRD_COORDS[datasetKey] ? BIRD_COORDS[datasetKey].length : 0;
    const text = birdCount > 0 ? `存在挂线<br>数量：${birdCount}` : '未检测到挂线危险物';
    showDangerInfo(text);
    document.getElementById('global-mini-view').style.display = 'none';
    document.getElementById('danger-mini-image').src = 'bird.png'; // 路径请确保存在
});
// 1. 危险物检测按钮事件
['danger-tree', 'danger-vehicle', 'danger-house', 'danger-bird'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', function() {
            window.lastDangerTypeClickTime = Date.now();
            let arr, label, img, type, prefix;
            if (id === 'danger-tree') {
                arr = TREE_COORDS[datasetKey] || [];
                label = '树障'; img = 'tree.png'; type = 'tree'; prefix = '树';
            } else if (id === 'danger-vehicle') {
                arr = CAR_COORDS[datasetKey] || [];
                label = '特种车辆'; img = 'car.png'; type = 'car'; prefix = '车';
            } else if (id === 'danger-house') {
                arr = HOUSE_COORDS[datasetKey] || [];
                label = '建筑物'; img = 'house.png'; type = 'house'; prefix = '房';
            } else if (id === 'danger-bird') {
                arr = BIRD_COORDS[datasetKey] || [];
                label = '挂线'; img = 'bird.png'; type = 'bird'; prefix = '鸟';
            }
            const text = arr.length > 0 ? `存在${label}<br>数量：${arr.length}` : `未检测到${label}危险物`;
            showDangerInfo(text);
            document.getElementById('global-mini-view').style.display = 'none';
            document.getElementById('danger-mini-image').src = img;
            document.querySelector('#line-info .info-title').innerHTML = '<i class="fa fa-exclamation-triangle"></i> 危险物信息';
            let infoHtml = '';
            if (arr.length > 0) {
                arr.forEach((c, i) => {
                    const height = c[4] !== undefined ? c[4] : (c[2] !== undefined ? c[2] : '-');
                    infoHtml += `<div>${prefix}${i + 1}，高度：${height} m</div>`;
                });
                infoHtml += `<div style="color:#888;margin-top:8px;">请点击自动测距检测危险物</div>`;
            } else {
                infoHtml = `未检测到${label}危险物`;
            }
            document.getElementById('selected-line-info').innerHTML = infoHtml;
            document.getElementById('selected-line-info').style.maxHeight = '120px';
            document.getElementById('selected-line-info').style.overflowY = 'auto';
            document.getElementById('risk-result').innerHTML = arr.length > 0 ? '-' : '<span style="color:green;font-weight:bold;">安全</span>';
            document.getElementById('risk-result').style.maxHeight = 'none';
            document.getElementById('risk-result').style.overflowY = 'hidden';
            window.currentDangerContext = { type, label, arr, img, prefix };
           // clearDangerMark();
        });
    }
});

function getClosestPointOnBoxSurface(point, box) {
    // 先限制点到包围盒内
    const clamped = point.clone().clamp(box.min, box.max);
    // 找到距离clamped最近的面
    const distances = [
        Math.abs(clamped.x - box.min.x),
        Math.abs(clamped.x - box.max.x),
        Math.abs(clamped.y - box.min.y),
        Math.abs(clamped.y - box.max.y),
        Math.abs(clamped.z - box.min.z),
        Math.abs(clamped.z - box.max.z)
    ];
    const minIdx = distances.indexOf(Math.min(...distances));
    switch (minIdx) {
        case 0: clamped.x = box.min.x; break;
        case 1: clamped.x = box.max.x; break;
        case 2: clamped.y = box.min.y; break;
        case 3: clamped.y = box.max.y; break;
        case 4: clamped.z = box.min.z; break;
        case 5: clamped.z = box.max.z; break;
    }
    return clamped;
}

// 全局保存所有检测过的危险物风险
// 2. 自动测距按钮事件
document.getElementById('distance-auto').addEventListener('click', function() {
    const ctx = window.currentDangerContext;
        const now = Date.now();
    if (
        !window.currentDangerContext ||
        !window.currentDangerContext.arr ||
        window.currentDangerContext.arr.length === 0 ||
        !window.lastDangerTypeClickTime ||
        (now - window.lastDangerTypeClickTime > 30000)
    ) {
        alert('请先选择危险物类型');
        return;
    }
    const arr = ctx.arr;
    const label = ctx.label;
    const type = ctx.type;
    const prefix = ctx.prefix;
    const linePoints = getAllPowerlinePoints();

    let riskList = [];
    let maxRiskLevel = 0;
    clearDangerMark();
arr.forEach((c, i) => {
    const group = window[`${type}Group`];
    const obj = group ? group.children[i] : null;
    let minDist = Infinity;
    let closestObjPt = null;
    let closestLinePt = null;
    if (obj) {
        const objBox = new THREE.Box3().setFromObject(obj);
        // 遍历所有电力线点
        linePoints.forEach(lp => {
            // 获取障碍物包围盒表面最近点
            const ptOnObj = objBox.clampPoint(lp, new THREE.Vector3());
            const dist = lp.distanceTo(ptOnObj);
            if (dist < minDist) {
                minDist = dist;
                closestObjPt = ptOnObj.clone();
                closestLinePt = lp.clone();
            }
        });
    }
    // 只高亮有风险的危险物
    if (minDist < 10 && obj && closestObjPt) {
        obj.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.material.emissive.setHex(0xff0000);
                child.material.emissiveIntensity = 1.2;
            }
        });
        // 红球体标记在障碍物包围盒表面最近点
        const sphereGeo = new THREE.SphereGeometry(5, 24, 24);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.copy(closestObjPt);
        scene.add(sphere);
        dangerSpheres.push(sphere);
    }
});
    let infoHtml = '';
    arr.forEach((c, i) => {
        const group = window[`${type}Group`];
        const obj = group ? group.children[i] : null;
        let minDist = Infinity;
        if (obj) {
            const box = new THREE.Box3().setFromObject(obj);
            linePoints.forEach(lp => {
                const d = distancePointToBox(lp, box);
                if (d < minDist) minDist = d;
            });
        }
        let risk = '';
        let color = '';
        let levelClass = '';
        let riskLevel = 0;
        // clearDangerMark();
        if (minDist < 5.5) { risk = '紧急'; color = 'red'; levelClass = 'risk-high'; riskLevel = 2; }
        else if (minDist < 10) { risk = '一般紧急'; color = 'orange'; levelClass = 'risk-medium'; riskLevel = 1; }
        else { risk = '安全'; color = 'green'; levelClass = 'risk-low'; riskLevel = 0; }
        if (riskLevel > maxRiskLevel) maxRiskLevel = riskLevel;
        // 只显示有风险的
        if (riskLevel > 0) {
    const pos = obj.position;
    infoHtml += `
        <div style="margin-bottom:8px;">
            <b>${prefix}${i + 1}</b>（${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})
            <br>距离：${minDist.toFixed(2)} m
            <br><span class="risk-text ${levelClass}" style="font-size:0.4em;">${risk}</span>
        </div>
    `;
    // 关键：加上 riskLevel 字段
    riskList.push({ idx: `${prefix}${i + 1}`, risk, levelClass, riskLevel });
}
    });

    // 如果没有危险，显示安全
    if (riskList.length === 0) {
        infoHtml = `<div style="color:#2ecc71;font-size:1.5em;font-weight:bold;text-align:center;margin-top:24px;">安全</div>`;
    }
    document.getElementById('selected-line-info').innerHTML = infoHtml;
    document.getElementById('selected-line-info').style.maxHeight = '120px';
    document.getElementById('selected-line-info').style.overflowY = 'auto';
    window.allDangerRisks = window.allDangerRisks
        .filter(r => r.type !== type)
        .concat(riskList.map(r => ({ ...r, type })));
         renderRiskResult();
    // 风险评估栏：只展示危险编号和等级
   
    let riskHtml = '';
    if (riskList.length > 0) {
     riskHtml = riskList.map(r =>
    `<div style="font-size:1em;"><b class="risk-text">${r.idx}</b> <span class="risk-text ${r.levelClass}">${r.risk}</span></div>`
).join('');
    } else {
        riskHtml = '<div style="color:#2ecc71;font-size:2em;font-weight:bold;text-align:center;margin-top:24px;">安全</div>';
    }
    document.getElementById('risk-result').innerHTML = riskHtml;
    document.getElementById('risk-result').style.maxHeight = '120px';
    document.getElementById('risk-result').style.overflowY = 'auto';

    // 仪表盘联动并放大
    let gaugeValue = 0;
    if (maxRiskLevel === 2) gaugeValue = 1;
    else if (maxRiskLevel === 1) gaugeValue = 0.6;
    else gaugeValue = 0.2;
    drawRiskGauge(gaugeValue, true); // true=放大
    renderRiskResult();
});
function renderRiskResult() {
    const allRisks = window.allDangerRisks || [];
    let maxRiskLevel = allRisks.reduce((max, r) => Math.max(max, r.riskLevel || 0), 0);
    let riskHtml = '';
    if (allRisks.length > 0) {
        riskHtml = allRisks.map(r =>
            `<div style="font-size:1em;"><b class="risk-text">${r.idx}</b> <span class="risk-text ${r.levelClass}">${r.risk}</span></div>`
        ).join('');
    } else {
        riskHtml = '<div style="color:#2ecc71;font-size:1.5em;font-weight:bold;text-align:center;margin-top:24px;">安全</div>';
    }
    document.getElementById('risk-result').innerHTML = riskHtml;
    document.getElementById('risk-result').style.maxHeight = '120px';
    document.getElementById('risk-result').style.overflowY = 'auto';

    // 仪表盘联动
    let gaugeValue = 0;
    if (maxRiskLevel === 2) gaugeValue = 1;
    else if (maxRiskLevel === 1) gaugeValue = 0.6;
    else gaugeValue = 0.2;
    drawRiskGauge(gaugeValue, true);

}

// 3. 清除危险物高亮
function clearDangerMark() {
    // 恢复所有危险物建模颜色
    ['treeGroup', 'carGroup', 'houseGroup', 'birdGroup'].forEach(groupName => {
        const group = window[groupName];
        if (group) {
            group.children.forEach(obj => {
                obj.traverse(child => {
                    if (child.isMesh && child.material && child.material.emissive) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
            });
        }
    });
    // 移除所有红球体
    dangerSpheres.forEach(s => scene.remove(s));
    dangerSpheres = [];
}

document.getElementById('danger-clear-btn').onclick = clearDangerMark;




// 更新顶部状态栏（日期时间和视角）
function updateTopBarStatus(view) {
    // 日期
    const now = new Date();
    document.getElementById('current-date').textContent =
        now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0');
    // 时间
    document.getElementById('current-time').textContent =
        now.toLocaleTimeString('zh-CN', { hour12: false });
    // 视角
    let viewName = '';
    switch (view || currentView) {
        case 'god': viewName = '上帝视角'; break;
        case 'first': viewName = '第一人称'; break;
        case 'fly': viewName = '飞行视角'; break;
        case 'overview': viewName = '全景浏览'; break;
        case 'detail': viewName = '细节展示'; break;
        default: viewName = '未知';
    }
    document.getElementById('status-text').textContent = viewName;
}
setInterval(() => updateTopBarStatus(), 1000);
updateTopBarStatus();

// 视角切换菜单展开/收起
document.getElementById('menu-view').addEventListener('click', function(e) {
    e.stopPropagation();
    const group = document.getElementById('view-submenu');
    if (group) {
        group.style.display = group.style.display === 'block' ? 'none' : 'block';
        toggleArrow('menu-view-arrow', 'view-submenu');
    }
});

document.getElementById('view-submenu').addEventListener('click', function(e) {
    e.stopPropagation();
});

// 点击空白收起视角切换下拉

document.getElementById('view-submenu').addEventListener('click', function(e) {
    e.stopPropagation();
});
// 展开/收起系统设置子菜单
document.getElementById('menu-system-toggle').onclick = function(e) {
    e.stopPropagation();
    const submenu = document.getElementById('system-submenu');
    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
};

document.getElementById('system-submenu').onclick = function(e) {
    e.stopPropagation();
};


window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        autoCruise = false;
        if (cruiseInterval) {
            clearInterval(cruiseInterval);
            cruiseInterval = null;
        }
    }
});

let cruisePath = [];
let cruiseIndex = 0;
let cruiseSpeed = 2.5; // 可调速度
let cruiseAnimId = null;

// 自动巡航按钮绑定（放在initialize或DOMContentLoaded后）
document.getElementById('auto-cruise-btn').onclick = function() {
    if (currentView !== 'fly') {
        alert('请切换到飞行视角再巡航');
        return;
    }
    autoCruise = !autoCruise;
    const icon = this.querySelector('i');
    const text = this.querySelector('.cruise-text');
    if (autoCruise) {
        icon.className = 'fa fa-pause';
        text.textContent = '停止巡航';
        cruisePath = getCruiseTowerPath();
        if (cruisePath.length < 2) {
            alert('巡航路径点不足，无法自动巡航');
            autoCruise = false;
            icon.className = 'fa fa-play';
            text.textContent = '自动巡航';
            return;
        }
        cruiseIndex = 0;
        // 初始相机位置：第一个塔点抬高30米
        const startTower = cruisePath[0];
        camera.position.copy(startTower.clone().setZ(startTower.z + 30));
        // 朝向第二个塔点
        const nextTower = cruisePath[1];
        camera.lookAt(nextTower.x, nextTower.y, nextTower.z + 30);
        camera.up.set(0, 0, 1);
        cruiseAnimate();
    } else {
        icon.className = 'fa fa-play';
        text.textContent = '自动巡航';
        if (cruiseAnimId)
            cruiseAnimId = null;
    }
};

// 自动巡航动画主循环
function cruiseAnimate() {
    if (!autoCruise || currentView !== 'fly' || cruiseIndex >= cruisePath.length - 1) {
        autoCruise = false;
        const btn = document.getElementById('auto-cruise-btn');
        if (btn) {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('.cruise-text');
            icon.className = 'fa fa-play';
            text.textContent = '自动巡航';
        }
        return;
    }
    // 当前塔和下一塔
    const currTower = cruisePath[cruiseIndex];
    const nextTower = cruisePath[cruiseIndex + 1];
    // 巡航高度，抬高30米
    const cruiseHeight = Math.max(currTower.z, nextTower.z) +80;
    // 当前相机位置
    let currPos = camera.position.clone();
    // 目标点（在两塔连线上，抬高 cruiseHeight）
    let targetPos = nextTower.clone();
    targetPos.z = cruiseHeight;

    // 计算移动方向（当前塔到下一塔的连线方向，忽略z）
    let moveDir = nextTower.clone().setZ(0).sub(currTower.clone().setZ(0)).normalize();
    // 当前相机到目标点的方向
    let camMoveDir = targetPos.clone().sub(currPos).normalize();

    // 每帧移动 cruiseSpeed 米
    camera.position.add(camMoveDir.multiplyScalar(cruiseSpeed));
    // 保证相机高度始终为 cruiseHeight
    camera.position.z = cruiseHeight;

    // 相机始终朝向下一塔（抬高 cruiseHeight）
    camera.lookAt(nextTower.x, nextTower.y, cruiseHeight);

    camera.up.set(0, 0, 1);

    // 判断是否到达目标点
    if (camera.position.distanceTo(targetPos) < cruiseSpeed) {
        cruiseIndex++;
    }
    cruiseAnimId = requestAnimationFrame(cruiseAnimate);
}

// 获取巡航路径（塔点顺序）
function getCruiseTowerPath() {
    const coords = TOWER_COORDS[datasetKey] || [];
    if (coords.length < 2) return [];
    return coords.map(c => new THREE.Vector3(c[0], c[1], c[2]));
}
function updateAutoCruiseBtn() {
    const btn = document.getElementById('auto-cruise-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    const text = btn.querySelector('.cruise-text');
    if (currentView === 'fly') {
        btn.style.display = 'block';
        if (autoCruise) {
            icon.className = 'fa fa-pause';
            text.textContent = '停止巡航';
        } else {
            icon.className = 'fa fa-play';
            text.textContent = '自动巡航';
        }
    } else {
        btn.style.display = 'none';
        autoCruise = false;
        if (cruiseInterval) {
            clearInterval(cruiseInterval);
            cruiseInterval = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateAutoCruiseBtn();
});

// 显示箭头
function showDetailArrows() {
    const arrows = document.getElementById('detail-arrows');
    if (arrows) arrows.style.display = 'flex';
}
// 隐藏箭头
function hideDetailArrows() {
    const arrows = document.getElementById('detail-arrows');
    if (arrows) arrows.style.display = 'none';
}

document.getElementById('toggle-color')?.addEventListener('change', function() {
    const logoImg = document.getElementById('logo-img');
    if (this.checked) {
        document.body.classList.add('light-mode');
        if (logoImg) logoImg.src = 'bule-logo.png';
    } else {
        document.body.classList.remove('light-mode');
        if (logoImg) logoImg.src = 'white-logo.png';
    }
});
//档距段分析
function showDetailSpanInfo(detailData) {
    // 只显示档段距细节分析
    document.getElementById('global-info-title').style.display = '';
    document.getElementById('global-info-content').style.display = '';
    document.getElementById('danger-info-title').style.display = 'none';
    document.getElementById('danger-info-content').style.display = 'none';
    document.getElementById('danger-mini-view').style.display = 'none';
    document.getElementById('global-mini-view').style.display = 'block';
    document.querySelector('#global-info .info-title span').innerHTML = '<i class="fa fa-bar-chart"></i> 档距段细节分析';
    const content = `
        <div>
            <span>当前区域：</span><span>${detailData.regionName ?? '-'}</span>
            <span style="margin-left:18px;">当前档段距：</span><span>${detailData.spanName ?? '-'}</span>
        </div>
        <div>
            <span>左侧电力塔：</span><span>${detailData.leftTowerHeight ?? '-'}</span> m
            <span style="margin-left:18px;">右侧电力塔：</span><span>${detailData.rightTowerHeight ?? '-'}</span> m
        </div>
        <div>
            <span>电力线数量：</span><span>${detailData.lineCount ?? '-'}</span>
            <span style="margin-left:18px;">电力线平均长度：</span><span>${detailData.avgLineLength ?? '-'}</span> m
        </div>
    `;
    document.getElementById('global-info-content').innerHTML = content;
document.getElementById('global-mini-view').style.display = 'none';
}
//恢复全局统计
function restoreGlobalInfo() {
    document.querySelector('#global-info .info-title span').innerHTML = '<i class="fa fa-bar-chart"></i> 全局统计';
    document.getElementById('global-info-content').style.display = '';
    document.getElementById('global-info-title').style.display = '';
    document.getElementById('danger-info-title').style.display = 'none';
    document.getElementById('danger-info-content').style.display = 'none';
    document.getElementById('danger-mini-view').style.display = 'none';
    document.getElementById('global-mini-view').style.display = 'block'; // 保证建模框显示
    updateGlobalInfo(globalJsonData);
}

function setCanvasAndJoystickZIndexForFullscreen() {
    const container = document.getElementById('three-container');
    const canvas = container.querySelector('canvas');
    const joystick = document.getElementById('joystick-container');
    const joystickBg = document.getElementById('joystick-bg');
    if (!canvas || !joystick || !joystickBg) return;

    if (
        document.fullscreenElement ||
        container.classList.contains('fullscreen-active') ||
        document.querySelector('.main-card.fullscreen-active')
    ) {
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'auto';
        joystick.style.zIndex = '10000';
        joystick.style.pointerEvents = 'auto';
        joystick.style.position = 'fixed';
        joystick.style.right = '40px';
        joystick.style.bottom = '40px';
        joystick.style.left = 'auto';
        joystick.style.top = 'auto';
        joystickBg.style.pointerEvents = 'auto'; // 新增，确保摇杆底层可响应
    } else {
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'auto';
        joystick.style.zIndex = '20';
        joystick.style.pointerEvents = 'auto';
        joystick.style.position = 'absolute';
        joystick.style.right = '30px';
        joystick.style.bottom = '30px';
        joystick.style.left = '';
        joystick.style.top = '';
        joystickBg.style.pointerEvents = 'auto'; // 新增
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 强制重新绑定摇杆事件
    const joystickBg = document.getElementById('joystick-bg');
    const joystickDot = document.getElementById('joystick-dot');
    let dragging = false;
    let joystickDir = {x:0, y:0};

    function setJoystickDir(nx, ny) {
        joystickDot.style.transform = `translate(calc(-50% + ${nx*50}px), calc(-50% + ${ny*50}px))`;
        joystickDir = {x: nx, y: ny};
    }

    function resetJoystick() {
        joystickDot.style.transform = 'translate(-50%, -50%)';
        joystickDir = {x:0, y:0};
    }

    if (joystickBg) {
        joystickBg.onpointerdown = null;
        joystickBg.onpointermove = null;
        joystickBg.onpointerup = null;

        joystickBg.addEventListener('pointerdown', function(e) {
            dragging = true;
            const rect = joystickBg.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
            const nx = x / (rect.width/2) * len;
            const ny = y / (rect.height/2) * len;
            setJoystickDir(nx, ny);
        });

        window.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            const rect = joystickBg.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
            const nx = x / (rect.width/2) * len;
            const ny = y / (rect.height/2) * len;
            setJoystickDir(nx, ny);
        });

        window.addEventListener('pointerup', function(e) {
            dragging = false;
            resetJoystick();
        });
    }

    // 全局获取摇杆移动方向函数（可在 updateMove 里调用）
    window.getJoystickMove = function() {
        // 摇杆向左(A): x负，向右(D): x正，向上(W): y负，向下(S): y正
        // 但你要求：左y负，右y正，上x负，下x正
        return {
            x: joystickDir.x,      // -1~1，左负右正（y轴）
            y: -joystickDir.y      // -1~1，上负下正（x轴）
        };
    };
});

function restoreLineInfoPanel() {
    // 恢复标题
    document.querySelector('#line-info .info-title').innerHTML = '<i class="fa fa-info-circle"></i> 电力线信息';
    // 恢复内容（备注按钮必须在这里！）
    document.getElementById('selected-line-info').innerHTML = `
        <div>线ID：<span id="line-id">-</span></div>
        <div>高度：<span id="line-height">-</span> m</div>
        <div>长度：<span id="line-length">-</span> m</div>
        <div>直径：<span id="line-diameter">-</span>mm</div>
        <div>弧垂度：<span id="line-sag">-</span> m</div>
        <div>张力：<span id="line-tension">-</span> kN</div>
        <div id="line-remark-btn" title="添加备注" style="position:absolute;right:18px;bottom:12px;cursor:pointer;">
            <i class="fa fa-pencil-square-o" style="font-size:22px;color:#2196f3;opacity:0.8;"></i>
        </div>
    `;
    document.getElementById('selected-line-info').style.maxHeight = '';
    document.getElementById('selected-line-info').style.overflowY = '';
    bindRemarkBtn();
}

// 监听全屏切换事件
document.addEventListener('fullscreenchange', setCanvasAndJoystickZIndexForFullscreen);
// 初始化时也调用一次
document.addEventListener('DOMContentLoaded', setCanvasAndJoystickZIndexForFullscreen);


// 数据分析菜单跳转到 analysis.html
document.querySelector('[data-tool="analysis"]')?.addEventListener('click', function(e) {
    window.location.href = 'analysis.html';
});

// 1. 页面加载时同步色彩模式
function applyColorModeFromStorage() {
    const mode = localStorage.getItem('color-mode');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('toggle-color').checked = true;
    } else {
        document.body.classList.remove('light-mode');
        document.getElementById('toggle-color').checked = false;
    }
}

// DOMContentLoaded 事件，确保DOM已加载
document.addEventListener('DOMContentLoaded', () => {
    applyColorModeFromStorage();

    // 2. 监听切换按钮
    const colorToggle = document.getElementById('toggle-color');
    if (colorToggle) {
        colorToggle.addEventListener('change', function () {
            if (this.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('color-mode', 'light');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('color-mode', 'dark');
            }
        });
    }

    // 3. 监听 storage 事件，实现多页面联动
    window.addEventListener('storage', (e) => {
        if (e.key === 'color-mode') {
            applyColorModeFromStorage();
        }
    });
});

//危险物检测下拉逻辑
// 展开/收起危险物检测下拉菜单
document.getElementById('menu-danger').addEventListener('click', function(e) {
    e.stopPropagation();
    const submenu = document.getElementById('danger-submenu');
    // 切换显示/隐藏
    submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';
    toggleArrow('menu-danger-arrow', 'danger-submenu');
});
// 点击空白收起
// 阻止点击子菜单时冒泡，防止收起
document.getElementById('danger-submenu').addEventListener('click', function(e) {
    e.stopPropagation();
    // 此处不做任何收起操作
});



//距离测量下拉逻辑
// 展开/收起距离测量下拉菜单
document.getElementById('menu-distance').addEventListener('click', function(e) {
    e.stopPropagation();
    const submenu = document.getElementById('distance-submenu');
    submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';
toggleArrow('menu-distance-arrow', 'distance-submenu');
});

// 阻止点击子菜单时冒泡，防止收起
document.getElementById('distance-submenu').addEventListener('click', function(e) {
    e.stopPropagation();
    // 此处不做任何收起操作
});
//帮助文档

document.addEventListener('DOMContentLoaded', function() {
    
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.getElementById('help-modal-close');
    const helpMenu = document.querySelector('.menu-item[data-page="help"]');
    if (helpMenu && helpModal && helpClose) {
        helpMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            helpModal.style.display = 'flex';
        });
        helpClose.addEventListener('click', function() {
            helpModal.style.display = 'none';
        });
        // 点击遮罩关闭
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) helpModal.style.display = 'none';
        });
    }
});



function getCurrentTowerCoords() {
    if (PLY_PATH.includes('A')) return TOWER_COORDS.A;
    if (PLY_PATH.includes('B1')) return TOWER_COORDS.B1;
    return [];
}

function getCurrentTreeCoords() {
    if (PLY_PATH.includes('B1')) return TREE_COORDS.B1;
    return [];
}

function getCurrentCarCoords() {
    if (PLY_PATH.includes('B1')) return CAR_COORDS.B1;
    return [];
}

function getCurrentHouseCoords() {
    if (PLY_PATH.includes('B1')) return HOUSE_COORDS.B1;
    return [];
}

function updateModelCoords(modelType, index, newCoords) {
    // 先取当前配置
    let coords = getModelCoords(modelType).slice();
    if (index < 0 || index >= coords.length) return;
    coords[index] = newCoords;
    // 只在这里写入 localStorage
    localStorage.setItem(modelType + 'Coords_' + datasetKey, JSON.stringify(coords));
    location.reload();
}

async function placeModelsAtFixedCoords() {
    if (!scene) {
        console.error('scene 未初始化，无法添加建模组');
        return;
    }
    
       const loader = new GLTFLoader();
    const [towerGLB, treeGLB, carGLB, houseGLB, birdGLB, hillGLB] = await Promise.all([
        new Promise(res => loader.load('./data/tower.glb', res)),
        new Promise(res => loader.load('./data/tree.glb', res)),
        new Promise(res => loader.load('./data/car.glb', res)),
        new Promise(res => loader.load('./data/house.glb', res)),
        new Promise(res => loader.load('./data/bird.glb', res)),
        new Promise(res => loader.load('./data/hill.glb', res))
    ]);

     // 1. 塔 (塔的材质通常支持发光，保持原样)
    const towerCoords = JSON.parse(localStorage.getItem('towerCoords_' + datasetKey)) || TOWER_COORDS[datasetKey] || [];
    towerGroup.clear();
    for (let i = 0; i < towerCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 1] = towerCoords[i];
        const tower = towerGLB.scene.clone(true);
        tower.rotation.x = -Math.PI / 2;
        tower.rotation.z = Math.PI;
        tower.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
        tower.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(tower);
        tower.position.set(x, y, z - box.min.z);
        tower.userData = { idx: i, type: 'tower' };
        brightenModelColor(tower, 0xffffff, 0x222222, 0.5);
        addTopLightForModel(tower, 0xffffff, 0.5, 50);
        towerGroup.add(tower);
    }

    // --- 核心修复：确保树、车、房的材质可以发光 ---
    const ensureEmissiveMaterial = (model) => {
        model.traverse(child => {
            if (child.isMesh) {
                let mat = child.material;
                // 处理材质数组
                if (Array.isArray(mat)) {
                    mat.forEach((m, i) => {
                        if (!m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial) {
                            mat[i] = new THREE.MeshStandardMaterial({
                                map: m.map || null,
                                color: m.color || 0xffffff,
                                metalness: 0.1,
                                roughness: 0.8,
                            });
                        }
                        if (!mat[i].emissive) mat[i].emissive = new THREE.Color(0x000000);
                    });
                } else if (mat) {
                    if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: mat.map || null,
                            color: mat.color || 0xffffff,
                            metalness: 0.1,
                            roughness: 0.8,
                        });
                    }
                    if (!child.material.emissive) child.material.emissive = new THREE.Color(0x000000);
                }
            }
        });
    };

    // 2. 树
    if (!window.treeGroup) { window.treeGroup = new THREE.Group(); scene.add(window.treeGroup); }
    const treeCoords = JSON.parse(localStorage.getItem('treeCoords_' + datasetKey)) || TREE_COORDS[datasetKey] || [];
    window.treeGroup.clear();
    for (let i = 0; i < treeCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 20] = treeCoords[i]; // 默认20倍
        const tree = treeGLB.scene.clone(true);
        tree.rotation.x = -Math.PI / 2;
        tree.rotation.z = Math.PI;
        tree.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
        tree.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(tree);
        tree.position.set(x, y, z - box.min.z * scale);
        tree.userData = { idx: i, type: 'tree' };
        ensureEmissiveMaterial(tree); // 应用材质修复
        window.treeGroup.add(tree);
    }
    // 3. 车
    if (!window.carGroup) { window.carGroup = new THREE.Group(); scene.add(window.carGroup); }
    const carCoords = JSON.parse(localStorage.getItem('carCoords_' + datasetKey)) || CAR_COORDS[datasetKey] || [];
    window.carGroup.clear();
    for (let i = 0; i < carCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 5] = carCoords[i]; // 默认5倍
        const car = carGLB.scene.clone(true);
        car.rotation.x = -Math.PI / 2;
        car.rotation.z = Math.PI ;
        car.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
        car.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(car);
        car.position.set(x, y, z - box.min.z);
        car.userData = { idx: i, type: 'car' };
        ensureEmissiveMaterial(car); // 应用材质修复
        window.carGroup.add(car);
    }
    // 4. 房
    if (!window.houseGroup) { window.houseGroup = new THREE.Group(); scene.add(window.houseGroup); }
    const houseCoords = JSON.parse(localStorage.getItem('houseCoords_' + datasetKey)) || HOUSE_COORDS[datasetKey] || [];
    window.houseGroup.clear();
    for (let i = 0; i < houseCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 3] = houseCoords[i]; // 默认3倍
        const house = houseGLB.scene.clone(true);
        house.rotation.x = -Math.PI / 2;
        house.rotation.z = Math.PI ;
        house.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
        house.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(house);
        house.position.set(x, y, z - box.min.z);
        house.userData = { idx: i, type: 'house' };
        ensureEmissiveMaterial(house); // 应用材质修复
        window.houseGroup.add(house);
    }
    // 鸟
    if (!window.birdGroup) { window.birdGroup = new THREE.Group(); scene.add(window.birdGroup); }
    const birdCoords = BIRD_COORDS[datasetKey] || [];
    window.birdGroup.clear();
    for (let i = 0; i < birdCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 1] = birdCoords[i];
        const bird = birdGLB.scene.clone(true);
        // Y轴向上转为Z轴向上
        bird.rotation.x = -Math.PI / 2;
        bird.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
        bird.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(bird);
        bird.position.set(x, y, z - box.min.z);
        bird.userData = { idx: i, type: 'bird' };
        ensureEmissiveMaterial(bird); // 让鸟支持emissive
        window.birdGroup.add(bird);
    }
    // 山
    if (!window.hillGroup) { window.hillGroup = new THREE.Group(); scene.add(window.hillGroup); }
    const hillCoords = HILL_COORDS[datasetKey] || [];
    window.hillGroup.clear();
    for (let i = 0; i < hillCoords.length; i++) {
        const [x, y, z, angle = 0, scale = 1] = hillCoords[i];
        const hill = hillGLB.scene.clone(true);
        // Y轴向上转为Z轴向上，并旋转180°
        hill.rotation.x = -Math.PI / 2;
        hill.rotation.z = Math.PI;
        hill.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180) + Math.PI;
        hill.scale.set(scale, scale, scale);
        const box = new THREE.Box3().setFromObject(hill);
        hill.position.set(x, y, z - box.min.z);;
        hill.userData = { idx: i, type: 'hill' };
        ensureEmissiveMaterial(hill);
        window.hillGroup.add(hill);
    }
}

function addTopLightForModel(model, color = 0xffffff, intensity = 0.3, distance = 50) {
    // 获取模型包围盒中心和高度
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const height = box.max.z - box.min.z;
    // 创建点光源
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(center.x, center.y, box.max.z + height * 0.5);
    // 让光源跟随模型移动
    model.add(light);
}

function brightenModelColor(obj, baseColor = 0xffffff, emissiveColor = 0x222222, intensity = 0.1) {
    obj.traverse(child => {
        if (child.isMesh && child.material) {
            if (child.material.color) {
                child.material.color.lerp(new THREE.Color(baseColor), 0.5);
            }
            if (child.material.emissive) {
                child.material.emissive.set(emissiveColor);
                child.material.emissiveIntensity = intensity;
            }
            if ('metalness' in child.material) child.material.metalness = 0.1;
            if ('roughness' in child.material) child.material.roughness = 0.3;
        }
    });
}

function getAllPowerlinePoints() {
    // 获取所有电力线点
    let points = [];
    powerlineGroup.children.forEach(obj => {
        if (obj.geometry && obj.geometry.type === 'TubeGeometry') {
            const posAttr = obj.geometry.getAttribute('position');
            for (let i = 0; i < posAttr.count; i += 2) { // 步长2加速
                points.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
            }
        }
    });
    return points;
}

// --- 新增：精确的点到包围盒距离函数 ---
function distancePointToBox(point, box) {
    const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
    const dy = Math.max(box.min.y - point.y, 0, point.y - box.max.y);
    const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/*function measureDanger(type) {
    // type: 'tree' | 'car' | 'house' | 'bird'
    let group, label;
    if (type === 'tree') { group = window.treeGroup; label = '树'; }
    else if (type === 'car') { group = window.carGroup; label = '车'; }
    else if (type === 'house') { group = window.houseGroup; label = '房'; }
    else { group = null; label = '鸟'; }
    if (!group) return;

    // 清除旧球体
    dangerSpheres.forEach(s => scene.remove(s));
    dangerSpheres = [];

    const linePoints = getAllPowerlinePoints();
    if (linePoints.length === 0) {
        document.getElementById('measure-result').innerHTML = `<b>${label}危险物检测</b><br>无电力线数据`;
        return;
    }

    let minDistances = [];
    let minPoints = [];
    group.children.forEach((obj) => {
        let minDist = Infinity;
        let minPt = null;
        const modelBox = new THREE.Box3().setFromObject(obj);

        // 精确：点到包围盒距离，并记录最近点
        for (const lp of linePoints) {
            const d = distancePointToBox(lp, modelBox);
            if (d < minDist) {
                minDist = d;
                minPt = lp.clone();
            }
        }

        minDistances.push(minDist);
        minPoints.push(minPt);

        // 标记红光或恢复
        const isDangerous = minDist < 5.5;
        obj.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissive.setHex(isDangerous ? 0xff0000 : 0x000000);
            }
        });

        // 只为危险物体添加红球体
        if (isDangerous && minPt) {
            const sphereGeo = new THREE.SphereGeometry(5, 16, 16);
            const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.copy(minPt);
            scene.add(sphere);
            dangerSpheres.push(sphere);
        }
    });

    // 显示结果
    let html = `<b>${label}危险物检测</b><br>`;
    if (minDistances.length === 0) {
        html += '无建模';
    } else {
        minDistances.forEach((d, i) => {
            html += `${label}${i+1} 最小距离: ${d.toFixed(2)} m ${d<5.5?'<span style="color:red;">(危险!)</span>':''}<br>`;
        });
    }
    document.getElementById('measure-result').innerHTML = html;
}
BIRD_COORDS
/*function clearDangerMark() {
    // 恢复所有建模颜色
    [...(window.treeGroup?.children||[]), ...(window.carGroup?.children||[]), ...(window.houseGroup?.children||[])].forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
            }
        });
    });
    // 塔也需要恢复
    towerGroup.children.forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissive.setHex(0x000000);
            }
        });
    });
    // 移除所有红球体
    dangerSpheres.forEach(s => scene.remove(s));
    dangerSpheres = [];
    document.getElementById('danger-result').innerHTML = '';
}*/

// 绑定按钮
//document.getElementById('generate-trees-btn').onclick = () => generateRandomTreeCoords(20); // <<<--- 新增的按钮绑定
//document.getElementById('danger-tree-btn').onclick = () => measureDanger('tree');
//document.getElementById('danger-car-btn').onclick = () => measureDanger('car');
//document.getElementById('danger-house-btn').onclick = () => measureDanger('house');
//document.getElementById('danger-bird-btn').onclick = () => measureDanger('bird');
//document.getElementById('danger-clear-btn').onclick = clearDangerMark;

function getModelCoords(modelType) {
    switch(modelType) {
        case 'tower': return TOWER_COORDS[datasetKey] || [];
        case 'tree': return TREE_COORDS[datasetKey] || [];
        case 'car': return CAR_COORDS[datasetKey] || [];
        case 'house': return HOUSE_COORDS[datasetKey] || [];
        case 'bird': return BIRD_COORDS[datasetKey] || [];
        default: return [];
    }
}

function syncModelCoordsFromCode() {
    ['tower', 'tree', 'car', 'house','bird'].forEach(type => {
        const codeCoords = getModelCoords(type);
        localStorage.setItem(type + 'Coords_' + datasetKey, JSON.stringify(codeCoords));
    });
}
document.addEventListener('DOMContentLoaded', syncModelCoordsFromCode);

// 3. 所有按钮事件绑定都放到 DOMContentLoaded 里

/**
 * 在草地区域内随机生成树建模坐标
 * @param {number} count 生成数量，默认20
 * @param {number} scaleMin 放大倍数下限，默认16
 * @param {number} scaleMax 放大倍数上限，默认24
 */
function generateRandomTreeCoords(count = 20, scaleMin = 16, scaleMax = 24) {
    // 1. 获取草地区域凸包
    let allLineProjPoints = [];
    if (!globalJsonData) {
        alert('请先加载数据后再生成树坐标！');
        return;
    }
    globalJsonData.forEach(line => {
        if (Array.isArray(line.coordinates)) {
            line.coordinates.forEach(pt => {
                allLineProjPoints.push(new THREE.Vector2(pt[0], pt[1]));
            });
        }
    });
    // 计算凸包
    function convexHull(points) {
        points = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
        const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
        const lower = [];
        for (let p of points) {
            while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
            lower.push(p);
        }
        const upper = [];
        for (let i = points.length - 1; i >= 0; i--) {
            let p = points[i];
            while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
            upper.push(p);
        }
        upper.pop();
        lower.pop();
        return lower.concat(upper);
    }
    const hull = convexHull(allLineProjPoints);
    if (hull.length < 3) {
        alert('草地区域凸包计算失败！');
        return;
    }
    // 2. 计算外扩包围盒
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    hull.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });
    minX -= 200; maxX += 200; minY -= 200; maxY += 200;

    // 3. 判断点是否在凸包或外扩200内
    function isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            if (
                ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 1e-10) + xi)
            ) {
                inside = !inside;
            }
        }
        return inside;
    }

    // 4. 随机采样
    const result = [];
    let tryCount = 0;
    while (result.length < count && tryCount < count * 20) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        const pt = new THREE.Vector2(x, y);
        // 判断是否在凸包或外扩200内
        let inside = isPointInPolygon(pt, hull);
        if (!inside) {
            // 计算到凸包最近距离
            let minDist = Infinity;
            for (let k = 0; k < hull.length; k++) {
                const a = hull[k], b = hull[(k+1)%hull.length];
                const t = Math.max(0, Math.min(1, ((x-a.x)*(b.x-a.x)+(y-a.y)*(b.y-a.y))/((b.x-a.x)**2+(b.y-a.y)**2)));
                const proj = {x: a.x + t*(b.x-a.x), y: a.y + t*(b.y-a.y)};
                const dist = Math.hypot(x-proj.x, y-proj.y);
                minDist = Math.min(minDist, dist);
            }
            if (minDist > 200) { tryCount++; continue; }
        }
        // 生成参数
        const angle = Math.round(Math.random() * 180);
        const scale = Math.round(scaleMin + Math.random() * (scaleMax - scaleMin));
        result.push([x, y, 0, angle, scale]);
        tryCount++;
    }
    // --- 修改部分：不仅输出到控制台，还更新配置并刷新 ---
    console.log('生成的树建模坐标：');
    console.log(JSON.stringify(result, null, 2));

    // 更新 TREE_COORDS['B1'] 或当前数据集的配置
    if (TREE_COORDS[datasetKey]) {
        TREE_COORDS[datasetKey] = result;
        // 保存到 localStorage 并刷新
        localStorage.setItem('treeCoords_' + datasetKey, JSON.stringify(result));
        alert('已生成 ' + result.length + ' 个树坐标，页面将刷新以应用。');
        location.reload();
    } else {
        alert('当前数据集 (' + datasetKey + ') 没有可用的树坐标配置。');
    }
    return result;
}

document.body.addEventListener('click', function (e) {
    // 排除危险物检测按钮、测距按钮、危险物下拉菜单等
    const idsToIgnore = [
        'danger-tree', 'danger-vehicle', 'danger-house', 'danger-bird',
        'distance-auto', 'distance-manual', 'danger-submenu', 'menu-danger'
    ];
    let el = e.target;
    let ignore = false;
    while (el) {
        if (idsToIgnore.includes(el.id)) {
            ignore = true;
            break;
        }
        el = el.parentElement;
    }
    if (!ignore) {
        clearDangerMark();
    }
});

function showComprehensiveRisk() {
    // 1. 先用全局变量 window.allDangerRisks（自动检测时已合并）为基础
    let allRisks = window.allDangerRisks ? [...window.allDangerRisks] : [];

    // 2. 再遍历所有危险物类型，补充未检测过但当前存在风险的危险物
    ['tree', 'car', 'house', 'bird'].forEach(type => {
        const arr = getModelCoords(type);
        const group = window[`${type}Group`];
        if (!arr || !group) return;
        arr.forEach((c, i) => {
            // 如果已在allRisks中（同类型同编号），则跳过
            const prefix = type === 'tree' ? '树' : type === 'car' ? '车' : type === 'house' ? '房' : '鸟';
            const idx = `${prefix}${i + 1}`;
            if (allRisks.some(r => r.idx === idx && r.type === type)) return;
            const obj = group.children[i];
            let minDist = Infinity;
            if (obj) {
                const box = new THREE.Box3().setFromObject(obj);
                getAllPowerlinePoints().forEach(lp => {
                    const d = distancePointToBox(lp, box);
                    if (d < minDist) minDist = d;
                });
            }
            let risk = '';
            let levelClass = '';
            let riskLevel = 0;
            if (minDist < 5.5) { risk = '紧急'; levelClass = 'risk-high'; riskLevel = 2; }
            else if (minDist < 10) { risk = '一般紧急'; levelClass = 'risk-medium'; riskLevel = 1; }
            else { risk = '安全'; levelClass = 'risk-low'; riskLevel = 0; }
            if (riskLevel > 0) {
                allRisks.push({ idx, risk, levelClass, riskLevel, type });
            }
        });
    });

    // 3. 只保留有风险的项
    allRisks = allRisks.filter(r => r.riskLevel > 0);

    // 4. 渲染风险评估内容
    let maxRiskLevel = allRisks.reduce((max, r) => Math.max(max, r.riskLevel), 0);
    let riskHtml = '';
    if (allRisks.length > 0) {
        riskHtml = allRisks.map(r =>
            `<div style="font-size:1.3em;"><b>${r.idx}</b> <span class="risk-text ${r.levelClass}">${r.risk}</span></div>`
        ).join('');
    } else {
        riskHtml = '<div style="color:#2ecc71;font-size:2em;font-weight:bold;text-align:center;margin-top:24px;">安全</div>';
    }
    document.getElementById('risk-result').innerHTML = riskHtml;
    document.getElementById('risk-result').style.maxHeight = '200px';
    document.getElementById('risk-result').style.overflowY = 'auto';

    // 5. 仪表盘联动并放大
    let gaugeValue = 0;
    if (maxRiskLevel === 2) gaugeValue = 1;
    else if (maxRiskLevel === 1) gaugeValue = 0.6;
    else gaugeValue = 0.2;
    drawRiskGauge(gaugeValue, true);
}




// 2. 绑定生成分析报告按钮，弹窗展示统计和详情表格，并支持导出 Word
document.addEventListener('DOMContentLoaded', () => {
    // 绑定生成报告按钮
    document.getElementById('generate-report-btn').addEventListener('click', showReportModal);
    document.getElementById('report-close').addEventListener('click', () => {
        document.getElementById('report-modal').style.display = 'none';
    });
    document.getElementById('export-report-btn').addEventListener('click', exportReport);
/*        document.getElementById('export-report-btn').addEventListener('click', async function() {
        // 1. 获取报告HTML内容（与showReportModal生成内容一致）
        const modal = document.getElementById('report-modal');
        const reportHtml = modal ? modal.querySelector('.report-modal-content').innerHTML : '';
        // 2. 只保留主要内容（可根据实际调整）
        let html = '';
        if (reportHtml) {
            // 只取 .report-section 内容
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = reportHtml;
            const sections = tempDiv.querySelectorAll('.report-section');
            html = '';
            sections.forEach(sec => html += sec.outerHTML);
        }
        // 3. 编码为URL参数
        const encoded = encodeURIComponent(html);
        // 4. 生成二维码内容（本地测试用相对路径，部署用绝对路径）
        const qrUrl = `${window.location.origin}/report-view.html?report=${encoded}`;
        // 5. 显示二维码弹窗
        const qrModal = document.getElementById('report-qrcode-modal');
        const qrCanvas = document.getElementById('report-qrcode-canvas');
        qrModal.style.display = 'block';
        // 清空旧二维码
        qrCanvas.getContext('2d').clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        // 用qrcodejs生成二维码
        // 先移除旧二维码（如果有）
        if (qrCanvas._qrInstance) {
            qrCanvas._qrInstance.clear();
            qrCanvas._qrInstance = null;
        }
        // 用div临时生成，再绘制到canvas
        let tempDiv = document.createElement('div');
        new QRCode(tempDiv, {
            text: qrUrl,
            width: 180,
            height: 180,
            colorDark: "#2196f3",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        // 将生成的img绘制到canvas
        setTimeout(() => {
            const img = tempDiv.querySelector('img');
            if (img) {
                qrCanvas.width = 180;
                qrCanvas.height = 180;
                const ctx = qrCanvas.getContext('2d');
                ctx.clearRect(0, 0, 180, 180);
                ctx.drawImage(img, 0, 0, 180, 180);
            }
        }, 200);
    });
    // 关闭二维码弹窗
    document.getElementById('report-qrcode-close').onclick = function() {
        document.getElementById('report-qrcode-modal').style.display = 'none';
    };
    // 点击遮罩关闭
    document.getElementById('report-qrcode-modal').onclick = function(e) {
        if (e.target === this) this.style.display = 'none';
    };*/
});

// 3. 统计数据（根据你的描述整理，实际可用自动测距结果动态生成）
/*const DANGER_DATA = {
    B1: {
        tree: {
            high: 5,
            medium: 1,
            low: 24,
            details: [
                { coord: "(458430.30, 3120340.20, 0.00)", distance: "5.93", level: "一般紧急" },
                { coord: "(457153.20, 3121300.90, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(456923.00, 3120570.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(457807.30, 3120253.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(457545.80, 3120313.20, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(458862.80, 3120108.70, 0.00)", distance: "0.00", level: "紧急" }
            ]
        },
        car: {
            high: 1,
            medium: 0,
            low: 0,
            details: [
                { coord: "(457301.05, 3120257.86, 9.10)", distance: "0.00", level: "紧急" }
            ]
        },
        house: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        },
        bird: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        }
    },
    B2: {
        tree: {
            high: 9,
            medium: 0,
            low: 16,
            details: [
                { coord: "(460726.20, 3118702.00, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(459149.60, 3119949.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(461283.30, 3118335.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(460845.40, 3118584.20, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(459169.30, 3120173.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(460751.20, 3118877.20, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(459505.90, 3119720.40, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(460373.20, 3118879.80, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(458955.10, 3120083.90, 0.00)", distance: "0.00", level: "紧急" }
            ]
        },
        car: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        },
        house: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        },
        bird: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        }
    },
    B3: {
        tree: {
            high: 5,
            medium: 0,
            low: 13,
            details: [
                { coord: "(462225.00, 3117557.10, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(463563.31, 3117183.05, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(461573.28, 3118018.25, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(463773.02, 3117214.81, 0.00)", distance: "0.00", level: "紧急" },
                { coord: "(461604.58, 3118015.44, 0.00)", distance: "0.00", level: "紧急" }
            ]
        },
        car: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        },
        house: {
            high: 0,
            medium: 0,
            low: 0,
            details: []
        },
        bird: {
            high: 0,
            medium: 0,
            low: 1,
            details: []
        }
    },
    B4: {
        tree: {
            high: 0,
            medium: 0,
            low: 14,
            details: []
            
        },
        car: {
            high: 0,
            medium: 0,
            low: 0,
            details: []
        },
        house: {
            high: 0,
            medium: 0,
            low: 0,
            details: []
        },
        bird: {
            high: 0,
            medium: 0,
            low: 6,
            details: []
        }
    }
};*/
// 1. 类型映射表
const DANGER_TYPE_MAP = {
    tree: '树障',
    car: '特种车辆',
    house: '建筑物',
    bird: '挂线'
};

// 4. 展示报告弹窗并填充表格
// 2. 修改 showReportModal 表格类型显示

// 生成分析报告弹窗
async function showReportModal() {
    const modal = document.getElementById('report-modal');
    const loadingDiv = document.getElementById('report-loading');
    const contentDiv = modal.querySelector('.report-modal-content');
    // 显示弹窗和loading动画
    modal.style.display = 'block';
    loadingDiv.style.display = 'block';
    // 先统计所有危险物距离和风险等级
    await computeAllDangerRisks();
    // 统计平均高度和弧垂
    await loadAllRegionLineData();
    const regions = ['B1', 'B2', 'B3', 'B4', 'B5'];
    let regionStats = {};
    for (const region of ALL_REGION_KEYS) {
        const lines = allRegionLineData[region] || [];
        let totalHeight = 0, totalSag = 0, ptCount = 0, lineCount = 0;
        lines.forEach(line => {
            if (Array.isArray(line.coordinates)) {
                line.coordinates.forEach(pt => { totalHeight += pt[2]; ptCount++; });
            }
            if (line.metrics?.sag) totalSag += line.metrics.sag;
            lineCount++;
        });
        regionStats[region] = {
            avgHeight: ptCount ? (totalHeight / ptCount).toFixed(2) : '-',
            avgSag: lineCount ? (totalSag / lineCount).toFixed(2) : '-' 
        };
    }
    // 分析结论
    let maxHeightRegion = regions[0], minHeightRegion = regions[0];
    let maxSagRegion = regions[0], minSagRegion = regions[0];
    regions.forEach(r => {
        if (parseFloat(regionStats[r].avgHeight) > parseFloat(regionStats[maxHeightRegion].avgHeight)) maxHeightRegion = r;
        if (parseFloat(regionStats[r].avgHeight) < parseFloat(regionStats[minHeightRegion].avgHeight)) minHeightRegion = r;
        if (parseFloat(regionStats[r].avgSag) > parseFloat(regionStats[maxSagRegion].avgSag)) maxSagRegion = r;
        if (parseFloat(regionStats[r].avgSag) < parseFloat(regionStats[minSagRegion].avgSag)) minSagRegion = r;
    });

    // 生成HTML
    const DANGER_DATA = getDynamicDangerData();
    const dangerTypeNames = { tree: '高大树木', car: '特种车辆', house: '建筑物', bird: '挂线' };
    const dangerImages = { tree: 'tree.png', car: 'car.png', house: 'house.png', bird: 'bird.png' };
    const dangerClauses = {
  tree: [
    '违反《电力设施保护条例》第十四条第（八）项，任何单位或个人不得在杆塔、拉线基础的规定范围内取土、打桩、钻探、开挖或倾倒酸、碱、盐及其他有害化学物品。',
    '违反《电力设施保护条例》第十五条第（四）项，任何单位或个人不得在架空电力线路保护区内种植可能危及电力设施安全的植物。',
    '违反《电力设施保护条例》第二十四条第二款，在依法划定的电力设施保护区内种植的或自然生长的可能危及电力设施安全的树木、竹子，电力企业应依法予以修剪或砍伐。'
  ],
  car: [
    '违反《电力设施保护条例》第十二条，在电力设施周围进行爆破作业，必须按照国家有关规定，确保电力设施的安全。',
    '违反《电力设施保护条例》第十七条第（二）项，起重机械的任何部位进入架空电力线路保护区进行施工，必须经县级以上电力管理部门批准并采取安全措施。'
  ],
  house: [
    '违反《电力设施保护条例》第十五条第（三）项，任何单位或个人不得在架空电力线路保护区内兴建建筑物、构筑物。',
    '违反《电力设施保护条例》第十六条第（一）项，任何单位或个人不得在地下电缆保护区内兴建建筑物、构筑物。',
    '违反《电力设施保护条例》第二十二条，公用工程、城市绿化和其他工程在新建、改建或扩建中妨碍电力设施时，双方有关单位必须就迁移、采取必要的防护措施和补偿等问题达成协议后方可施工。'
  ],
  bird: [
    '违反《电力设施保护条例》第十四条第（四）项，任何单位或个人不得擅自在导线上接用电器设备。',
    '违反《电力设施保护条例》第十四条第（五）项，任何单位或个人不得擅自攀登杆塔或在杆塔上架设电力线、通信线、广播线，安装广播喇叭。',
    '违反《电力设施保护条例》第十四条第（七）项，任何单位或个人不得在杆塔、拉线上悬挂物体。'
  ]
};

// 可疑危险物分析
let dangerImagesHtml = '';
for (const type of ['tree', 'car', 'house', 'bird']) {
    dangerImagesHtml += `
    <div style="margin-bottom:12px; display:flex; align-items:center; gap:25px; justify-content:flex-start;">
        <div style="flex-shrink:0;">
            <b>${dangerTypeNames[type]}</b><br>
            <img src="${dangerImages[type]}" style="width:180px;height:180px;object-fit:contain;">
        </div>
        <div style="flex-grow:1;">
            违反条款：<br>${(dangerClauses[type] || []).map(txt => `&nbsp;&nbsp;${txt}`).join('<br>')}
        </div>
    </div>`;
}

    // 区域危险物风险等级统计
    let riskTableHtml = '';
    Object.entries(DANGER_DATA).forEach(([region, types]) => {
        Object.entries(types).forEach(([type, data]) => {
            riskTableHtml += `
                <tr>
                    <td>${region}</td>
                    <td>${dangerTypeNames[type] || type}</td>
                    <td>${data.high}</td>
                    <td>${data.medium}</td>
                    <td>${data.low}</td>
                </tr>
            `;
        });
    });

    // 待处理危险物详情表
    let detailsTableHtml = '';
    Object.entries(DANGER_DATA).forEach(([region, types]) => {
        Object.entries(types).forEach(([type, data]) => {
            data.details.forEach(detail => {
                if (detail.level === '紧急' || detail.level === '一般紧急') {
                    detailsTableHtml += `
                        <tr>
                            <td>${region}</td>
                            <td>${dangerTypeNames[type] || type}</td>
                            <td>${detail.coord}</td>
                            <td>${detail.distance}</td>
                            <td>${detail.level}</td>
                            <td>未处理</td>
                        </tr>
                    `;
                }
            });
        });
    });

    // 拼接完整报告
    const html = `
<h3 style="font-size:26px; margin:20px 0 15px;">电力线路危险物分析报告</h3>
<h4 style="font-size:22px; margin:20px 0 12px;">一、平均距离与弧垂数据分析</h4>
<b style="font-size:19px; display:block; margin:18px 0 10px;">（一）数据概况</b>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>平均高度（米）</th><th>平均弧垂（米）</th></tr>
${regions.map(r => `<tr><td>${r}</td><td>${regionStats[r].avgHeight}</td><td>${regionStats[r].avgSag}</td></tr>`).join('')}
</table>
<b style="font-size:19px; display:block; margin:18px 0 10px;">（二）具体分析</b>
<ul style="margin:10px 0 15px; padding-left:20px;">
<li>平均高度分析：${maxHeightRegion} 平均高度最高（${regionStats[maxHeightRegion].avgHeight}米），${minHeightRegion} 最低（${regionStats[minHeightRegion].avgHeight}米）。高的区域更安全，低的区域需重点关注，建议对${minHeightRegion}区域加强巡检。</li>
<li>弧垂分析：${maxSagRegion} 弧垂最大（${regionStats[maxSagRegion].avgSag}米），${minSagRegion} 最小（${regionStats[minSagRegion].avgSag}米）。弧垂过大易导致电力线与地面或障碍物距离过近，${maxSagRegion}区域需重点排查。</li>
</ul>
<h4 style="font-size:22px; margin:20px 0 12px;">二、安全隐患工单详情</h4>
<b style="font-size:19px; display:block; margin:18px 0 10px;">（一）可疑危险物分析</b>
${dangerImagesHtml}
<h4 style="font-size:22px; margin:20px 0 12px;">（二）区域危险物风险等级统计</h4>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>类型</th><th>紧急（0-5.5m）</th><th>一般（5.5-10m）</th><th>安全（>10m）</th></tr>
${riskTableHtml}
</table>
<h4 style="font-size:22px; margin:20px 0 12px;">（三）待处理危险物详情表</h4>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>类型</th><th>坐标</th><th>距离电力线（m）</th><th>风险等级</th><th>处理情况</th></tr>
${detailsTableHtml}
</table>
`;

    // 填充内容
    contentDiv.innerHTML = `
    <div class="report-header">
        <h3 style="font-size:26px; margin:25px 0 15px;">电力线路危险物分析报告</h3>
        <span class="report-close" id="report-close">&times;</span>
    </div>
    <div id="report-html-content">${html}</div>
    <div class="report-actions">
      <button id="send-report-btn" class="report-action-btn">生成报告二维码</button>
      <button id="export-report-btn" class="report-action-btn">导出Word报告</button>
    </div>
    <div id="report-loading" style="display:none;text-align:center;padding:32px 0;">
        <i class="fa fa-spinner fa-spin" style="font-size:2em;color:#2196f3;"></i>
        <div style="margin-top:12px;color:#2196f3;">正在分析所有区域危险物，请稍候...</div>
    </div>
`;
    // 绑定关闭和导出按钮
    //contentDiv.querySelector('#send-report-btn').onclick = sendReportByEmail;
    contentDiv.querySelector('#export-report-btn').onclick = exportReport;
    contentDiv.querySelector('#report-close').onclick = () => {
        modal.style.display = 'none';
    };
    loadingDiv.style.display = 'none';
    
    // 生成完整报告HTML（和弹框/Word一致）
    function generateFullReportHtml() {
        // 这里拼接所有你想展示的内容，包括表格、分析、结论等
        return `
            <h3>电力线路危险物分析报告</h3>
            <h4>一、平均距离与弧垂数据分析</h4>
            ...（你的分析内容、表格、结论等）...
            <h4>二、安全隐患工单详情</h4>
            ...（你的统计表格、详情表格等）...
        `;
    }

    // 在 showReportModal 函数最后，或 DOMContentLoaded 事件里添加如下代码：

// 绑定生成PDF报告二维码按钮
document.getElementById('send-report-btn').onclick = function() {
    // 只显示弹窗，不再动态生成二维码
    document.getElementById('report-qrcode-modal').style.display = 'block';
};

// 下载二维码图片
document.getElementById('download-qrcode-btn').onclick = function() {
    const img = document.getElementById('report-qrcode-img');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'PDF报告二维码.png';
    link.click();
};

// 关闭二维码弹窗
document.getElementById('report-qrcode-close').onclick = function() {
    document.getElementById('report-qrcode-modal').style.display = 'none';
};

/* 
// 方案二：让用户选择PDF文件自动转base64
document.getElementById('send-report-btn').onclick = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            const pdfDataUrl = ev.target.result; // data:application/pdf;base64,...
            // 生成二维码同上
            const qrDiv = document.getElementById('hidden-qrcode-div');
            qrDiv.innerHTML = '';
            new QRCode(qrDiv, {
                text: pdfDataUrl,
                width: 256,
                height: 256
            });
            setTimeout(() => {
                const qrCanvasInner = qrDiv.querySelector('canvas');
                if (!qrCanvasInner) {
                    alert('二维码生成失败，请刷新页面重试');
                    return;
                }
                const qrCanvas = document.getElementById('report-qrcode-canvas');
                const ctx = qrCanvas.getContext('2d');
                qrCanvas.width = qrCanvasInner.width;
                qrCanvas.height = qrCanvasInner.height;
                ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
                ctx.drawImage(qrCanvasInner, 0, 0);
                document.getElementById('report-qrcode-modal').style.display = 'block';
            }, 300);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};
*/
}

async function exportReport() {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun } = window.docx;
    await computeAllDangerRisks();
    await loadAllRegionLineData();
    const regions = ['B1', 'B2', 'B3', 'B4','B5'];
    const DANGER_DATA = getDynamicDangerData();
    const dangerTypeNames = { tree: '高大树木', car: '特种车辆', house: '建筑物', bird: '挂线' };
    // 修改为数组，每条法规一行
    const dangerClauses = {
      tree: [
        '违反《电力设施保护条例》第十四条第（八）项，任何单位或个人不得在杆塔、拉线基础的规定范围内取土、打桩、钻探、开挖或倾倒酸、碱、盐及其他有害化学物品。',
        '违反《电力设施保护条例》第十五条第（四）项，任何单位或个人不得在架空电力线路保护区内种植可能危及电力设施安全的植物。',
        '违反《电力设施保护条例》第二十四条第二款，在依法划定的电力设施保护区内种植的或自然生长的可能危及电力设施安全的树木、竹子，电力企业应依法予以修剪或砍伐。'
      ],
      car: [
        '违反《电力设施保护条例》第十二条，在电力设施周围进行爆破作业，必须按照国家有关规定，确保电力设施的安全。',
        '违反《电力设施保护条例》第十七条第（二）项，起重机械的任何部位进入架空电力线路保护区进行施工，必须经县级以上电力管理部门批准并采取安全措施。'
      ],
      house: [
        '违反《电力设施保护条例》第十五条第（三）项，任何单位或个人不得在架空电力线路保护区内兴建建筑物、构筑物。',
        '违反《电力设施保护条例》第十六条第（一）项，任何单位或个人不得在地下电缆保护区内兴建建筑物、构筑物。',
        '违反《电力设施保护条例》第二十二条，公用工程、城市绿化和其他工程在新建、改建或扩建中妨碍电力设施时，双方有关单位必须就迁移、采取必要的防护措施和补偿等问题达成协议后方可施工。'
      ],
      bird: [
        '违反《电力设施保护条例》第十四条第（四）项，任何单位或个人不得擅自在导线上接用电器设备。',
        '违反《电力设施保护条例》第十四条第（五）项，任何单位或个人不得擅自攀登杆塔或在杆塔上架设电力线、通信线、广播线，安装广播喇叭。',
        '违反《电力设施保护条例》第十四条第（七）项，任何单位或个人不得在杆塔、拉线上悬挂物体。'
      ]
    };

    // 危险物图片映射关系
    const dangerImagesMap = {
        tree: 'tree.png',
        car: 'car.png',
        house: 'house.png',
        bird: 'bird.png'
    };

    // 图片转Base64函数
    async function getImageBase64(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('图片加载失败:', error);
            return null;
        }
    }

    // 统计平均高度和弧垂
    let regionStats = {};
    for (const region of regions) {
        const lines = allRegionLineData[region] || [];
        let totalHeight = 0, totalSag = 0, ptCount = 0, lineCount = 0;
        lines.forEach(line => {
            if (Array.isArray(line.coordinates)) {
                line.coordinates.forEach(pt => { totalHeight += pt[2]; ptCount++; });
            }
            if (line.metrics?.sag) totalSag += line.metrics.sag;
            lineCount++;
        });
        regionStats[region] = {
            avgHeight: ptCount ? (totalHeight / ptCount).toFixed(2) : '-',
            avgSag: lineCount ? (totalSag / lineCount).toFixed(2) : '-' 
        };
    }
    let maxHeightRegion = regions[0], minHeightRegion = regions[0];
    let maxSagRegion = regions[0], minSagRegion = regions[0];
    regions.forEach(r => {
        if (parseFloat(regionStats[r].avgHeight) > parseFloat(regionStats[maxHeightRegion].avgHeight)) maxHeightRegion = r;
        if (parseFloat(regionStats[r].avgHeight) < parseFloat(regionStats[minHeightRegion].avgHeight)) minHeightRegion = r;
        if (parseFloat(regionStats[r].avgSag) > parseFloat(regionStats[maxSagRegion].avgSag)) maxSagRegion = r;
        if (parseFloat(regionStats[r].avgSag) < parseFloat(regionStats[minSagRegion].avgSag)) minSagRegion = r;
    });

    // 加载所有图片
    const imagePromises = Object.entries(dangerImagesMap).map(async ([type, imgPath]) => {
        if (!imgPath) return { type, base64: null };
        const base64 = await getImageBase64(imgPath);
        return { type, base64 };
    });
    const imageResults = await Promise.all(imagePromises);
    const imagesByType = imageResults.reduce((acc, { type, base64 }) => {
        acc[type] = base64;
        return acc;
    }, {});

    // 组装Word文档
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "电力线路危险物分析报告", bold: true, size: 32 })],
                        alignment: "center"
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "一、平均距离与弧垂数据分析", bold: true }),
                    new Paragraph({ text: "（一）数据概况", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('平均高度（米）')] }),
                                    new TableCell({ children: [new Paragraph('平均弧垂（米）')] })
                                ]
                            }),
                            ...regions.map(r => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(r)] }),
                                    new TableCell({ children: [new Paragraph(regionStats[r].avgHeight)] }),
                                    new TableCell({ children: [new Paragraph(regionStats[r].avgSag)] })
                                ]
                            }))
                        ]
                    }),
                    new Paragraph({ text: "（二）具体分析", bold: true }),
                    new Paragraph({ text: `平均高度分析：${maxHeightRegion} 平均高度最高（${regionStats[maxHeightRegion].avgHeight}米），${minHeightRegion} 最低（${regionStats[minHeightRegion].avgHeight}米）。高的区域更安全，低的区域需重点关注，建议对${minHeightRegion}区域加强巡检。` }),
                    new Paragraph({ text: `弧垂分析：${maxSagRegion} 弧垂最大（${regionStats[maxSagRegion].avgSag}米），${minSagRegion} 最小（${regionStats[minSagRegion].avgSag}米）。弧垂过大易导致电力线与地面或障碍物距离过近，${maxSagRegion}区域需重点排查。` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "二、安全隐患工单详情", bold: true }),
                    new Paragraph({ text: "（一）可疑危险物分析", bold: true }),
                    ...['tree', 'car', 'house', 'bird'].flatMap(type => {
                        const imageBase64 = imagesByType[type];
                        const elements = [];

                        // 添加危险物类型标题
                        elements.push(new Paragraph({
                            children: [new TextRun({ text: `危险物：${dangerTypeNames[type]}`, bold: true })],
                            spacing: { after: 100 }
                        }));

                        // 添加图片（如果有）
                        if (imageBase64) {
                            elements.push(new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0)),
                                        transformation: { width: 120, height: 120 }
                                    })
                                ],
                                alignment: "center",
                                spacing: { after: 100 }
                            }));
                        }

                        // 添加法规文本，每条单独一行
                        if (dangerClauses[type] && Array.isArray(dangerClauses[type])) {
                            dangerClauses[type].forEach(txt => {
                                elements.push(new Paragraph({
                                    children: [new TextRun({ text: txt })],
                                    spacing: { after: 100 }
                                }));
                            });
                        }

                        return elements;
                    }),
                    new Paragraph({ text: "（二）区域危险物风险等级统计", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('类型')] }),
                                    new TableCell({ children: [new Paragraph('紧急（0-5.5m）')] }),
                                    new TableCell({ children: [new Paragraph('一般（5.5-10m）')] }),
                                    new TableCell({ children: [new Paragraph('安全（>10m）')] })
                                ]
                            }),
                            ...Object.entries(DANGER_DATA).flatMap(([region, types]) =>
                                Object.entries(types).map(([type, data]) =>
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(region)] }),
                                            new TableCell({ children: [new Paragraph(dangerTypeNames[type] || type)] }),
                                            new TableCell({ children: [new Paragraph(data.high.toString())] }),
                                            new TableCell({ children: [new Paragraph(data.medium.toString())] }),
                                            new TableCell({ children: [new Paragraph(data.low.toString())] })
                                        ]
                                    })
                                )
                            )
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "（三）待处理危险物详情表", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('类型')] }),
                                    new TableCell({ children: [new Paragraph('坐标')] }),
                                    new TableCell({ children: [new Paragraph('距离电力线（m）')] }),
                                    new TableCell({ children: [new Paragraph('风险等级')] }),
                                    new TableCell({ children: [new Paragraph('处理情况')] })
                                ]
                            }),
                            ...Object.entries(DANGER_DATA).flatMap(([region, types]) =>
                                Object.entries(types).flatMap(([type, data]) =>
                                    data.details
                                        .filter(detail => detail.level === '紧急' || detail.level === '一般紧急')
                                        .map(detail =>
                                            new TableRow({
                                                children: [
                                                    new TableCell({ children: [new Paragraph(region)] }),
                                                    new TableCell({ children: [new Paragraph(dangerTypeNames[type] || type)] }),
                                                    new TableCell({ children: [new Paragraph(detail.coord)] }),
                                                    new TableCell({ children: [new Paragraph(detail.distance)] }),
                                                    new TableCell({ children: [new Paragraph(detail.level)] }),
                                                    new TableCell({ children: [new Paragraph('未处理')] })
                                                ]
                                            })
                                        )
                                )
                            )
                        ]
                    })
                ]
            }
        ]
    });

    // 导出文档
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '电力线路危险物分析报告.docx';
    a.click();
    window.URL.revokeObjectURL(url);
}
document.addEventListener('DOMContentLoaded', function() {
    const remarkModal = document.getElementById('line-remark-modal');
    const remarkClose = document.getElementById('line-remark-close');
    const remarkCancel = document.getElementById('remark-cancel-btn');
    const remarkSave = document.getElementById('remark-save-btn');
    const remarkInput = document.getElementById('remark-input');

    if (remarkSave) {
        remarkSave.onclick = function () {
            if (currentRemarkLineId) {
                localStorage.setItem('line_remark_' + currentRemarkLineId, remarkInput.value.trim());
                remarkModal.style.display = 'none';
                // 立即刷新所有信息
                if (window.lastSelectedLine && typeof updateLineInfo === 'function') {
                    updateLineInfo(window.lastSelectedLine, window.lastSelectedPoint);
                } else {
                    updateLineRemarkDisplay(currentRemarkLineId);
                }
            }
        };
    }

    // 关闭弹窗
    function closeRemarkModal() {
        remarkModal.style.display = 'none';
        currentRemarkLineId = null;
    }
    if (remarkClose) remarkClose.onclick = closeRemarkModal;
    if (remarkCancel) remarkCancel.onclick = closeRemarkModal;

    // 保存备注
if (remarkSave) {
    remarkSave.onclick = function () {
        if (currentRemarkLineId) {
            localStorage.setItem('line_remark_' + currentRemarkLineId, remarkInput.value.trim());
            closeRemarkModal();
            // 立即刷新所有信息（假设你有 lastSelectedLine, lastSelectedPoint 变量）
            if (window.lastSelectedLine && typeof updateLineInfo === 'function') {
                updateLineInfo(window.lastSelectedLine, window.lastSelectedPoint);
            } else {
                updateLineRemarkDisplay(currentRemarkLineId);
            }
        }
    };
}
});

function updateLineRemarkDisplay(lineId) {
    let remark = '';
    if (lineId && lineId !== '-') {
        remark = localStorage.getItem('line_remark_' + lineId) || '';
    }
    const infoDiv = document.getElementById('selected-line-info');
    if (infoDiv) {
        // 找到线ID那一行
        const idRow = Array.from(infoDiv.children).find(div => div.innerHTML && div.innerHTML.includes('线ID'));
        if (idRow) {
            // 先移除旧备注（只移除同一行右侧的span）
            let oldSpan = idRow.querySelector('.line-remark-text');
            if (oldSpan) oldSpan.remove();
            if (remark) {
                // 在span#line-id后面插入备注span
                const idSpan = idRow.querySelector('#line-id');
                if (idSpan) {
                    const remarkSpan = document.createElement('span');
                    remarkSpan.className = 'line-remark-text';
                    remarkSpan.style.marginLeft = '18px';
                    remarkSpan.style.color = '#2196f3';
                    remarkSpan.style.fontSize = '0.98em';
                    remarkSpan.innerHTML = `<b>备注：</b>${remark.replace(/\n/g, '<br>')}`;
                    idSpan.insertAdjacentElement('afterend', remarkSpan);
                }
            }
        }
    }
}




document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('arrow-left').onclick = () => {
    if (detailTowerIdx > 0) {
        detailTowerIdx--;
        updateDetailView(detailTowerIdx);
    }
};
document.getElementById('arrow-right').onclick = () => {
    const towers = getTowerPositions();
    if (detailTowerIdx < towers.length - 2) {
        detailTowerIdx++;
        updateDetailView(detailTowerIdx);
    }
};
});

function bindRemarkBtn() {
    const remarkBtn = document.getElementById('line-remark-btn');
    if (remarkBtn) {
        remarkBtn.onclick = function () {
            const lineId = document.getElementById('line-id').textContent;
            if (!lineId || lineId === '-') return;
            const remarkModal = document.getElementById('line-remark-modal');
            const remarkLineId = document.getElementById('remark-line-id');
            const remarkInput = document.getElementById('remark-input');
            remarkLineId.textContent = lineId;
            remarkInput.value = localStorage.getItem('line_remark_' + lineId) || '';
            remarkModal.style.display = 'flex';
            currentRemarkLineId = lineId; // 关键：全局赋值
        };
    }
}
 


document.addEventListener('DOMContentLoaded', initialize);


// 统计所有区域所有危险物的距离和风险等级
async function computeAllDangerRisks() {
    if (!allRegionLineData || Object.keys(allRegionLineData).length < ALL_REGION_KEYS.length) {
        await loadAllRegionLineData();
    }
    const regionKeys = ALL_REGION_KEYS;
    const dangerTypes = ['tree', 'car', 'house', 'bird'];
    const dangerTypeMap = {
        tree: TREE_COORDS,
        car: CAR_COORDS,
        house: HOUSE_COORDS,
        bird: BIRD_COORDS
    };
    // 预加载所有GLB模型
    const loader = new GLTFLoader();
    const [treeGLB, carGLB, houseGLB, birdGLB] = await Promise.all([
        new Promise(res => loader.load('./data/tree.glb', res)),
        new Promise(res => loader.load('./data/car.glb', res)),
        new Promise(res => loader.load('./data/house.glb', res)),
        new Promise(res => loader.load('./data/bird.glb', res))
    ]);
    const glbMap = { tree: treeGLB, car: carGLB, house: houseGLB, bird: birdGLB };

    window.allDangerRisksMap = {};
    for (const region of regionKeys) {
        window.allDangerRisksMap[region] = {};
        // 获取该区域所有电力线点
        let linePoints = [];
        const jsonData = allRegionLineData[region] || [];
        jsonData.forEach(line => {
            if (Array.isArray(line.coordinates)) {
                line.coordinates.forEach(pt => {
                    if (Array.isArray(pt) && pt.length >= 3) {
                        linePoints.push(new THREE.Vector3(pt[0], pt[1], pt[2]));
                    }
                });
            }
        });
        for (const type of dangerTypes) {
            const arr = dangerTypeMap[type]?.[region] || [];
            window.allDangerRisksMap[region][type] = [];
            for (let i = 0; i < arr.length; i++) {
                const coord = arr[i];
                // --------- 关键：临时生成模型，计算包围盒 ---------
                let minDist = Infinity;
                let model = null;
                // 取模型参数
                let angle = 0, scale = 1;
                if (type === 'tree') { angle = coord[3] || 0; scale = coord[4] || 20; }
                if (type === 'car') { angle = coord[3] || 0; scale = coord[4] || 5; }
                if (type === 'house') { angle = coord[3] || 0; scale = coord[4] || 3; }
                if (type === 'bird') { angle = coord[3] || 0; scale = coord[4] || 1; }
                // 克隆模型
                model = glbMap[type]?.scene?.clone(true);
                if (model) {
                    model.rotation.x = -Math.PI / 2;
                    model.rotation.z = Math.PI;
                    model.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
                    model.scale.set(scale, scale, scale);
                    // 计算包围盒
                    const box = new THREE.Box3().setFromObject(model);
                    model.position.set(coord[0], coord[1], coord[2] - box.min.z);
                    // 重新计算包围盒（带位置）
                    box.setFromObject(model);
                    for (const lp of linePoints) {
                        const d = distancePointToBox(lp, box);
                        if (d < minDist) minDist = d;
                    }
                } else {
                    // 没有模型时退化为点到点
                    const dangerVec = new THREE.Vector3(coord[0], coord[1], coord[2]);
                    for (const lp of linePoints) {
                        const d = dangerVec.distanceTo(lp);
                        if (d < minDist) minDist = d;
                    }
                }
                let risk = '';
                let riskLevel = 0;
                if (minDist < 5.5) { risk = '紧急'; riskLevel = 2; }
                else if (minDist < 10) { risk = '一般紧急'; riskLevel = 1; }
                else { risk = '安全'; riskLevel = 0; }
                const prefix = type === 'tree' ? '树' : type === 'car' ? '车' : type === 'house' ? '房' : '鸟';
                window.allDangerRisksMap[region][type].push({
                    idx: `${prefix}${i + 1}`,
                    risk,
                    riskLevel,
                    distance: minDist,
                    coord: `(${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}, ${coord[2].toFixed(2)})`
                });
            }
        }
    }
}

function getDynamicDangerData() {
    const regionKeys = ALL_REGION_KEYS;
    const dangerTypes = ['tree', 'car', 'house', 'bird'];
    const result = {};
    for (const region of regionKeys) {
        result[region] = {};
        for (const type of dangerTypes) {
            result[region][type] = {
                high: 0,
                medium: 0,
                low: 0,
                details: []
            };
            const risks = (window.allDangerRisksMap && window.allDangerRisksMap[region] && window.allDangerRisksMap[region][type]) || [];
            for (const r of risks) {
                if (r.riskLevel === 2) result[region][type].high++;
                else if (r.riskLevel === 1) result[region][type].medium++;
                else result[region][type].low++;
                result[region][type].details.push({
                    coord: r.coord,
                    distance: r.distance !== undefined ? r.distance.toFixed(2) : '-',
                    level: r.risk
                });
            }
        }
    }
    return result;
}

/*// 1. 生成分析报告HTML（弹窗用）
async function generateAnalysisReportHtml() {
    await loadAllRegionLineData();
    const regions = ['B1', 'B2', 'B3', 'B4'];
    const dangerTypes = ['tree', 'car', 'house', 'bird'];
    const dangerTypeNames = { tree: '高大树木', car: '特种车辆', house: '建筑物', bird: '挂线' };
    const dangerImages = { tree: 'tree.png', car: 'car.png', house: 'house.png', bird: 'bird.png' };
    const dangerClauses = {
        tree: '违反《电力设施保护条例》第十条，任何单位和个人不得在电力线路保护区内种植可能危及电力设施安全的植物。',
        car: '违反《电力设施保护条例》第十五条，任何单位或个人不得在架空电力线路保护区内兴建建筑物、构筑物。',
        house: '违反《电力设施保护条例实施细则》第五条，在架空电力线路保护区内，任何单位或个人不得兴建建筑物、构筑物。',
        bird: '1452104563210456321045863201456'
    };

    // 1.1 统计平均高度和弧垂
    let regionStats = {};
    for (const region of regions) {
        const lines = allRegionLineData[region] || [];
        let totalHeight = 0, totalSag = 0, totalLength = 0, ptCount = 0, lineCount = 0;
        lines.forEach(line => {
            if (Array.isArray(line.coordinates)) {
                line.coordinates.forEach(pt => { totalHeight += pt[2]; ptCount++; });
            }
            if (line.metrics?.sag) totalSag += line.metrics.sag;
            if (line.metrics?.length) totalLength += line.metrics.length;
            lineCount++;
        });
        regionStats[region] = {
            avgHeight: ptCount ? (totalHeight / ptCount).toFixed(2) : '-',
            avgSag: lineCount ? (totalSag / lineCount).toFixed(2) : '-',
            avgLength: lineCount ? (totalLength / lineCount).toFixed(2) : '-'
        };
    }

    // 1.2 分析结论
    let maxHeightRegion = regions[0], minHeightRegion = regions[0];
    let maxSagRegion = regions[0], minSagRegion = regions[0];
    regions.forEach(r => {
        if (parseFloat(regionStats[r].avgHeight) > parseFloat(regionStats[maxHeightRegion].avgHeight)) maxHeightRegion = r;
        if (parseFloat(regionStats[r].avgHeight) < parseFloat(regionStats[minHeightRegion].avgHeight)) minHeightRegion = r;
        if (parseFloat(regionStats[r].avgSag) > parseFloat(regionStats[maxSagRegion].avgSag)) maxSagRegion = r;
        if (parseFloat(regionStats[r].avgSag) < parseFloat(regionStats[minSagRegion].avgSag)) minSagRegion = r;
    });

    // 2. 可疑危险物分析（插图+条款）
    let dangerImagesHtml = '';
    for (const type of dangerTypes) {
        dangerImagesHtml += `
        <div style="margin-bottom:12px;">
            <b>${dangerTypeNames[type]}</b><br>
            图片说明：<img src="${dangerImages[type]}" style="width:32px;height:32px;vertical-align:middle;">
            <br>违反条款：${dangerClauses[type] || ''}
        </div>`;
    }

    // 3. 危险物风险等级统计表
    const DANGER_DATA = getDynamicDangerData();
    let riskTableHtml = '';
    Object.entries(DANGER_DATA).forEach(([region, types]) => {
        Object.entries(types).forEach(([type, data]) => {
            riskTableHtml += `
                <tr>
                    <td>${region}</td>
                    <td>${dangerTypeNames[type] || type}</td>
                    <td>${data.high}</td>
                    <td>${data.medium}</td>
                    <td>${data.low}</td>
                </tr>
            `;
        });
    });

    // 4. 待处理危险物详情表
    let detailsTableHtml = '';
    Object.entries(DANGER_DATA).forEach(([region, types]) => {
        Object.entries(types).forEach(([type, data]) => {
            data.details.forEach(detail => {
                if (detail.level === '紧急' || detail.level === '一般紧急') {
                    detailsTableHtml += `
                        <tr>
                            <td>${region}</td>
                            <td>${dangerTypeNames[type] || type}</td>
                            <td>${detail.coord}</td>
                            <td>${detail.distance}</td>
                            <td>${detail.level}</td>
                            <td>未处理</td>
                        </tr>
                    `;
                }
            });
        });
    });

    // 5. 拼接完整报告
    return `
<h3>电力线路危险物分析报告</h3>
<h4>一、平均距离与弧垂数据分析</h4>
<b>（一）数据概况</b>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>平均高度（米）</th><th>平均弧垂（米）</th></tr>
${regions.map(r => `<tr><td>${r}</td><td>${regionStats[r].avgHeight}</td><td>${regionStats[r].avgSag}</td></tr>`).join('')}
</table>
<b>（二）具体分析</b>
<ul>
<li>平均高度分析：${maxHeightRegion} 平均高度最高（${regionStats[maxHeightRegion].avgHeight}米），${minHeightRegion} 最低（${regionStats[minHeightRegion].avgHeight}米）。高的区域更安全，低的区域需重点关注。</li>
<li>弧垂分析：${maxSagRegion} 弧垂最大（${regionStats[maxSagRegion].avgSag}米），${minSagRegion} 最小（${regionStats[minSagRegion].avgSag}米）。弧垂过大易导致安全隐患。</li>
</ul>
<h4>二、安全隐患工单详情</h4>
<b>（一）可疑危险物分析</b>
${dangerImagesHtml}
<h4>（二）区域危险物风险等级统计</h4>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>类型</th><th>紧急（0-5.5m）</th><th>一般（5.5-10m）</th><th>安全（>10m）</th></tr>
${riskTableHtml}
</table>
<h4>（三）待处理危险物详情表</h4>
<table border="1" style="width:100%;margin:8px 0;">
<tr><th>区域</th><th>类型</th><th>坐标</th><th>距离电力线（m）</th><th>风险等级</th><th>处理情况</th></tr>
${detailsTableHtml}
</table>
`;
}*/

async function sendReportByEmail() {
    const modal = document.getElementById('report-modal');
    const loadingDiv = document.getElementById('report-loading');
    loadingDiv.style.display = 'block';

    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun } = window.docx;
    await computeAllDangerRisks();
    await loadAllRegionLineData();
    const regions = ['B1', 'B2', 'B3', 'B4'];
    const DANGER_DATA = getDynamicDangerData();
    const dangerTypeNames = { tree: '高大树木', car: '特种车辆', house: '建筑物', bird: '挂线' };
    const dangerClauses = {
        tree: '违反《电力设施保护条例》第十条，任何单位和个人不得在电力线路保护区内种植可能危及电力设施安全的植物。',
        car: '违反《电力设施保护条例》第十五条，任何单位或个人不得在架空电力线路保护区内兴建建筑物、构筑物。',
        house: '违反《电力设施保护条例实施细则》第五条，在架空电力线路保护区内，任何单位或个人不得兴建建筑物、构筑物。',
        bird: '违反《电力设施保护条例》第二十四条，任何单位或个人不得在电力线路上悬挂物品。'
    };
    const dangerImagesMap = {
        tree: 'tree.png',
        car: 'car.png',
        house: 'house.png',
        bird: 'bird.png'
    };

    // 图片转Base64
    async function getImageBase64(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // 只要base64部分
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('图片加载失败:', error);
            return null;
        }
    }
    function base64ToUint8Array(base64) {
        let data = base64;
        if (base64.startsWith('data:')) {
            data = base64.split(',')[1];
        }
        data = data.replace(/[^A-Za-z0-9+/=]/g, '');
        const binary = atob(data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    // 统计平均高度和弧垂
    let regionStats = {};
    for (const region of regions) {
        const lines = allRegionLineData[region] || [];
        let totalHeight = 0, totalSag = 0, ptCount = 0, lineCount = 0;
        lines.forEach(line => {
            if (Array.isArray(line.coordinates)) {
                line.coordinates.forEach(pt => { totalHeight += pt[2]; ptCount++; });
            }
            if (line.metrics?.sag) totalSag += line.metrics.sag;
            lineCount++;
        });
        regionStats[region] = {
            avgHeight: ptCount ? (totalHeight / ptCount).toFixed(2) : '-',
            avgSag: lineCount ? (totalSag / lineCount).toFixed(2) : '-'
        };
    }
    let maxHeightRegion = regions[0], minHeightRegion = regions[0];
    let maxSagRegion = regions[0], minSagRegion = regions[0];
    regions.forEach(r => {
        if (parseFloat(regionStats[r].avgHeight) > parseFloat(regionStats[maxHeightRegion].avgHeight)) maxHeightRegion = r;
        if (parseFloat(regionStats[r].avgHeight) < parseFloat(regionStats[minHeightRegion].avgHeight)) minHeightRegion = r;
        if (parseFloat(regionStats[r].avgSag) > parseFloat(regionStats[maxSagRegion].avgSag)) maxSagRegion = r;
        if (parseFloat(regionStats[r].avgSag) < parseFloat(regionStats[minSagRegion].avgSag)) minSagRegion = r;
    });

    // 加载所有图片
    const imagePromises = Object.entries(dangerImagesMap).map(async ([type, imgPath]) => {
        if (!imgPath) return { type, base64: null };
        const base64 = await getImageBase64(imgPath);
        return { type, base64 };
    });
    const imageResults = await Promise.all(imagePromises);
    const imagesByType = imageResults.reduce((acc, { type, base64 }) => {
        acc[type] = base64;
        return acc;
    }, {});

    // 组装Word文档
    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "电力线路危险物分析报告", bold: true, size: 32 })],
                        alignment: "center"
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "一、平均距离与弧垂数据分析", bold: true }),
                    new Paragraph({ text: "（一）数据概况", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('平均高度（米）')] }),
                                    new TableCell({ children: [new Paragraph('平均弧垂（米）')] })
                                ]
                            }),
                            ...regions.map(r => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(r)] }),
                                    new TableCell({ children: [new Paragraph(regionStats[r].avgHeight)] }),
                                    new TableCell({ children: [new Paragraph(regionStats[r].avgSag)] })
                                ]
                            }))
                        ]
                    }),
                    new Paragraph({ text: "（二）具体分析", bold: true }),
                    new Paragraph({ text: `平均高度分析：${maxHeightRegion} 平均高度最高（${regionStats[maxHeightRegion].avgHeight}米），${minHeightRegion} 最低（${regionStats[minHeightRegion].avgHeight}米）。高的区域更安全，低的区域需重点关注，建议对${minHeightRegion}区域加强巡检。` }),
                    new Paragraph({ text: `弧垂分析：${maxSagRegion} 弧垂最大（${regionStats[maxSagRegion].avgSag}毫米），${minSagRegion} 最小（${regionStats[minSagRegion].avgSag}米）。弧垂过大易导致电力线与地面或障碍物距离过近，${maxSagRegion}区域需重点排查。` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "二、安全隐患工单详情", bold: true }),
                    new Paragraph({ text: "（一）可疑危险物分析", bold: true }),
                    ...['tree', 'car', 'house', 'bird'].flatMap(type => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `危险物：${dangerTypeNames[type]}`, bold: true, size: 28 })
                            ],
                            spacing: { after: 100 }
                        }),
                        new Paragraph({
                            children: [
                                imagesByType[type] ? new ImageRun({
                                    data: base64ToUint8Array(imagesByType[type]),
                                    transformation: { width: 64, height: 64 }
                                }) : new TextRun({ text: '[无图片]' })
                            ],
                            alignment: "center",
                            spacing: { after: 100 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: dangerClauses[type], size: 22 })
                            ],
                            spacing: { after: 200 }
                        })
                    ]),
                    new Paragraph({ text: "（二）区域危险物风险等级统计", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('类型')] }),
                                    new TableCell({ children: [new Paragraph('紧急（0-5.5m）')] }),
                                    new TableCell({ children: [new Paragraph('一般（5.5-10m）')] }),
                                    new TableCell({ children: [new Paragraph('安全（>10m）')] })
                                ]
                            }),
                            ...Object.entries(DANGER_DATA).flatMap(([region, types]) =>
                                Object.entries(types).map(([type, data]) =>
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph(region)] }),
                                            new TableCell({ children: [new Paragraph(dangerTypeNames[type] || type)] }),
                                            new TableCell({ children: [new Paragraph(data.high.toString())] }),
                                            new TableCell({ children: [new Paragraph(data.medium.toString())] }),
                                            new TableCell({ children: [new Paragraph(data.low.toString())] })
                                        ]
                                    })
                                )
                            )
                        ]
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "（三）待处理危险物详情表", bold: true }),
                    new Table({
                        alignment: "center",
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph('区域')] }),
                                    new TableCell({ children: [new Paragraph('类型')] }),
                                    new TableCell({ children: [new Paragraph('坐标')] }),
                                    new TableCell({ children: [new Paragraph('距离电力线（m）')] }),
                                    new TableCell({ children: [new Paragraph('风险等级')] }),
                                    new TableCell({ children: [new Paragraph('处理情况')] })
                                ]
                            }),
                            ...Object.entries(DANGER_DATA).flatMap(([region, types]) =>
                                Object.entries(types).flatMap(([type, data]) =>
                                    data.details
                                        .filter(detail => detail.level === '紧急' || detail.level === '一般紧急')
                                        .map(detail =>
                                            new TableRow({
                                                children: [
                                                    new TableCell({ children: [new Paragraph(region)] }),
                                                    new TableCell({ children: [new Paragraph(dangerTypeNames[type] || type)] }),
                                                    new TableCell({ children: [new Paragraph(detail.coord)] }),
                                                    new TableCell({ children: [new Paragraph(detail.distance)] }),
                                                    new TableCell({ children: [new Paragraph(detail.level)] }),
                                                    new TableCell({ children: [new Paragraph('未处理')] })
                                                ]
                                            })
                                        )
                                )
                            )
                        ]
                    })
                ]
            }
        ]
    });

    /*// 2. 生成 Blob
    const blob = await Packer.toBlob(doc);

    // 3. 构造 FormData
    const formData = new FormData();
    formData.append('file', blob, '电力线路危险物分析报告.docx');
    formData.append('to', '3522815669@qq.com'); // 可选，后端也可写死

    // 4. 发送到后端
    try {
        const response = await fetch('http://localhost:3000/api/send-report', {
    method: 'POST',
    body: formData
        });

        let result = {};
        try {
            result = await response.json();
        } catch (e) {
            result = { success: false, message: '服务器无响应或返回格式错误' };
        }

        loadingDiv.style.display = 'none';
        if (result.success) {
            alert('分析报告已发送到邮箱！');
        } else {
            alert('发送失败：' + (result.message || '未知错误'));
        }
    } catch (e) {
        loadingDiv.style.display = 'none';
        alert('发送失败：' + e.message);
    }*/
}

// ========== 天气/高温功能 ==========

// 1. 雨/雪粒子参数（极简优化）
let rainPoints = null, snowPoints = null;
let rainGeo = null, snowGeo = null;
let rainActive = false, snowActive = false;
const RAIN_COUNT = 300, SNOW_COUNT = 300;

// 2. 高温弧垂参数
let hotActive = false;
let hotPowerlineCache = null; // 缓存原始jsonData

// 3. 绑定滑块事件
function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

document.getElementById('rain-toggle').onchange = e => {
    rainActive = e.target.checked;
    if (rainActive) {
        // 关闭其他天气开关
        document.getElementById('snow-toggle').checked = false;
        document.getElementById('hot-toggle').checked = false;
        snowActive = false;
        hotActive = false;

        const idx = Math.floor(Math.random() * WIND_LEVELS.length);
        currentWindLevel = WIND_LEVELS[idx];
        // 随机生成振幅倍数和风速
        const ampFactor = randomInRange(currentWindLevel.minAmp, currentWindLevel.maxAmp);
        currentWindAmplitude = Math.round(ampFactor * LINE_DIAMETER); // 单位mm
        currentWindSpeed = Math.round(randomInRange(currentWindLevel.minSpeed, currentWindLevel.maxSpeed) * 10) / 10; // 保留1位小数
        addRain(); removeSnow(); removeAllIcing(); setAllPowerlineSagFactor(1.0);
    } else {
        removeRain();
        currentWindLevel = null;
        currentWindAmplitude = 0;
        currentWindSpeed = 0;
    }
    updateWeatherStatusBar();
};

document.getElementById('snow-toggle').onchange = e => {
    snowActive = e.target.checked;
    if (snowActive) {
        // 关闭其他天气开关
        document.getElementById('rain-toggle').checked = false;
        document.getElementById('hot-toggle').checked = false;
        rainActive = false;
        hotActive = false;

        const idx = Math.floor(Math.random() * WIND_LEVELS.length);
        currentWindLevel = WIND_LEVELS[idx];
        const ampFactor = randomInRange(currentWindLevel.minAmp, currentWindLevel.maxAmp);
        currentWindAmplitude = Math.round(ampFactor * LINE_DIAMETER);
        currentWindSpeed = Math.round(randomInRange(currentWindLevel.minSpeed, currentWindLevel.maxSpeed) * 10) / 10;
        addSnow(); removeRain(); removeAllIcing(); setAllPowerlineSagFactor(1.0); applyStaticIcing();
    } else {
        removeSnow(); removeAllIcing(); setAllPowerlineSagFactor(1.0);
        currentWindLevel = null;
        currentWindAmplitude = 0;
        currentWindSpeed = 0;
    }
    updateWeatherStatusBar();
};

document.getElementById('hot-toggle').onchange = e => {
    hotActive = e.target.checked;
    if (hotActive) {
        // 关闭其他天气开关
        document.getElementById('rain-toggle').checked = false;
        document.getElementById('snow-toggle').checked = false;
        rainActive = false;
        snowActive = false;

        const idx = Math.floor(Math.random() * WIND_LEVELS.length);
        currentWindLevel = WIND_LEVELS[idx];
        const ampFactor = randomInRange(currentWindLevel.minAmp, currentWindLevel.maxAmp);
        currentWindAmplitude = Math.round(ampFactor * LINE_DIAMETER);
        currentWindSpeed = Math.round(randomInRange(currentWindLevel.minSpeed, currentWindLevel.maxSpeed) * 10) / 10;
        removeRain(); removeSnow(); removeAllIcing(); setAllPowerlineSagFactor(1.1);
    } else {
        currentWindLevel = null;
        currentWindAmplitude = 0;
        currentWindSpeed = 0;
        setAllPowerlineSagFactor(1.0);
    }
    updateWeatherStatusBar();
};
// 4. 雨/雪添加与移除（极简）
function addRain() {
    if (rainPoints) return;
    const { center, size } = getSceneBoundingBox();
    const minX = center.x - size.x / 2, maxX = center.x + size.x / 2;
    const minY = center.y - size.y / 2, maxY = center.y + size.y / 2;
    const minZ = center.z - size.z / 2, maxZ = center.z + size.z / 2;
    rainGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
        pos[i * 3] = minX + Math.random() * (maxX - minX);
        pos[i * 3 + 1] = minY + Math.random() * (maxY - minY);
        pos[i * 3 + 2] = maxZ + 20 + Math.random() * 80; // 高度在建模正上方
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x3399ff, size: 5, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    rainPoints = new THREE.Points(rainGeo, mat);
    rainPoints.frustumCulled = false;
    scene.add(rainPoints);
}
function removeRain() {
    if (rainPoints) { scene.remove(rainPoints); rainPoints.geometry.dispose(); rainPoints.material.dispose(); rainPoints = null; }
}
function addSnow() {
    if (snowPoints) return;

    const { center, size } = getSceneBoundingBox();
    const minX = center.x - size.x / 2, maxX = center.x + size.x / 2;
    const minY = center.y - size.y / 2, maxY = center.y + size.y / 2;
    const minZ = center.z - size.z / 2, maxZ = center.z + size.z / 2;
    snowGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(SNOW_COUNT * 3);
    for (let i = 0; i < SNOW_COUNT; i++) {
        pos[i * 3] = minX + Math.random() * (maxX - minX);
        pos[i * 3 + 1] = minY + Math.random() * (maxY - minY);
        pos[i * 3 + 2] = maxZ + 20 + Math.random() * 80; // 高度在建模正上方
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 8, sizeAttenuation: true, transparent: true, opacity: 0.8 });
    snowPoints = new THREE.Points(snowGeo, mat);
    snowPoints.frustumCulled = false;
    scene.add(snowPoints);
}

function removeSnow() {
    if (snowPoints) { scene.remove(snowPoints); snowPoints.geometry.dispose(); snowPoints.material.dispose(); snowPoints = null; }
}

/*document.getElementById('snow-toggle').onchange = e => {
    snowActive = e.target.checked;
    if (snowActive) {
        // 互斥：关闭高温
        document.getElementById('hot-toggle').checked = false;
        hotActive = false;
        setAllPowerlineSagFactor(1.0);
        addSnow();
        applyStaticIcing(); // 只做一次静态覆冰建模
    } else {
        removeSnow();
        removeAllIcing();
        setAllPowerlineSagFactor(hotActive ? 1.1 : 1.0);
    }
};*/

let currentSagFactor = 1.0; // 当前弧垂倍率，默认1.0



// 5. 高温功能（只在切换时重建电力线，绝不实时计算）
function applyHot() {
    if (!globalJsonData || !pointCloud || !pointCloud.linePoints) return;
    generatePowerlineModel(pointCloud.linePoints, globalJsonData, currentSagFactor);
    powerlineGroup.children.forEach(obj => {
        if (!obj.userData.metrics) obj.userData.metrics = {};
        obj.userData.metrics._icingFactor = 1.0;
        obj.userData.metrics._currentSagFactor = currentSagFactor;
    });
    afterModelOrAxesChanged();
}

function setAllPowerlineSagFactor(factor) {
    powerlineGroup.children.forEach(obj => {
        if (!obj.userData.metrics) obj.userData.metrics = {};
        obj.userData.metrics._currentSagFactor = factor;
        obj.userData.metrics._icingFactor = 1.0;
        obj.userData.metrics._icingThickness = 0;
        // 只在非雪天时隐藏冰层
        if (!snowActive && obj.userData.iceMesh) obj.userData.iceMesh.visible = false;
    });
}

// 6. 动画循环中更新雨/雪粒子（极简for循环，TypedArray直接操作）
const rainSpeed = 5, snowSpeed = 1.0;
function updateWeatherParticles() {
    // 雨滴持续下落
    if (rainPoints && rainGeo) {
        const pos = rainGeo.getAttribute('position');
        const arr = pos.array;
        const { center, size } = getSceneBoundingBox();
        const minZ = center.z - size.z / 2, maxZ = center.z + size.z / 2;
        for (let i = 0; i < RAIN_COUNT; i++) {
            arr[i * 3 + 2] -= rainSpeed;
            if (arr[i * 3 + 2] < minZ) {
                arr[i * 3 + 2] = maxZ + 20 + Math.random() * 80;
            }
        }
        pos.needsUpdate = true;
    }
    // 雪花持续下落（修正：落到底部后重置到顶部）
    if (snowPoints && snowGeo) {
        const pos = snowGeo.getAttribute('position');
        const arr = pos.array;
        const { center, size } = getSceneBoundingBox();
        const minZ = center.z - size.z / 2, maxZ = center.z + size.z / 2;
        for (let i = 0; i < SNOW_COUNT; i++) {
            arr[i * 3 + 2] -= snowSpeed;
            if (arr[i * 3 + 2] < minZ) {
                arr[i * 3 + 2] = maxZ + 20 + Math.random() * 80;
                // 可选：让雪花在XY范围内也随机一下
                arr[i * 3] = center.x - size.x / 2 + Math.random() * size.x;
                arr[i * 3 + 1] = center.y - size.y / 2 + Math.random() * size.y;
            }
        }
        pos.needsUpdate = true;
    }
}

// 7. 在动画循环中调用
let icingActive = false;
let icingState = [];
let icingAnimStart = 0;
const ICING_ANIM_DURATION = 18000; // 18秒

const ICING_TYPES = [
    {thickness:0, factor:1.0},
    {thickness:5, factor:1.2},
    {thickness:10, factor:1.8},
    {thickness:20, factor:2.5}
];
function applyStaticIcing() {
    icingActive = true;
    icingState = [];
    icingAnimStart = Date.now();
    powerlineGroup.children.forEach((obj, i) => {
        const t = ICING_TYPES[Math.floor(Math.random()*ICING_TYPES.length)];
        let baseRadius = 0.3;
        if (obj.geometry && obj.geometry.parameters && obj.geometry.parameters.radius)
            baseRadius = obj.geometry.parameters.radius;
        icingState[i] = { ...t, progress: 0, mesh: null, baseRadius, curve: null, tubeSegments: 0 };
        // 只为厚度>0的电力线创建冰层mesh
        if (t.thickness > 0) {
            // 获取原始曲线和分段数
            const geo = obj.geometry;
            const params = geo.parameters;
            const curve = params.path;
            const tubeSegments = params.tubularSegments;
            icingState[i].curve = curve;
            icingState[i].tubeSegments = tubeSegments;
            // 初始radius为baseRadius
            const iceGeo = new THREE.TubeGeometry(curve, tubeSegments, baseRadius, 12, false);
            const mat = new THREE.MeshPhysicalMaterial({
                color: 0x99eaff,
                transparent: true,
                opacity: 0.7,
                roughness: 0.1,
                metalness: 0.2,
                clearcoat: 0.8
            });
            const iceMesh = new THREE.Mesh(iceGeo, mat);
            // 关键：冰层mesh的position/rotation/scale始终与电力线一致
            iceMesh.position.copy(obj.position);
            iceMesh.rotation.copy(obj.rotation);
            iceMesh.scale.copy(obj.scale);
            scene.add(iceMesh);
            icingState[i].mesh = iceMesh;
            obj.userData.iceMesh = iceMesh;
        }
        // 初始化userData
        if (!obj.userData.metrics) obj.userData.metrics = {};
        obj.userData.metrics._icingThickness = 0;
        obj.userData.metrics._icingFactor = 1.0;
        obj.userData.metrics._currentSagFactor = 1.0;
    });
    requestAnimationFrame(updateIcingAnim);
}




function updateIcingAnim() {
    if (!icingActive) return;
    const now = Date.now();
    const t = Math.min(1, (now - icingAnimStart) / ICING_ANIM_DURATION);

    const batchSize = 10; // 每帧处理10根线
    let i = 0;

    function processBatch() {
        let count = 0;
        while (i < icingState.length && count < batchSize) {
            const s = icingState[i];
            const targetThick = s.thickness;
            const curThick = targetThick * t;
            const curFactor =
                curThick < 1 ? 1.0 :
                curThick < 5 ? 1.0 + 0.2*(curThick/5) :
                curThick < 10 ? 1.2 + 0.6*((curThick-5)/5) :
                1.8 + 0.7*((curThick-10)/10);
            const baseRadius = s.baseRadius || 0.3;
            const curRadius = baseRadius + curThick / 1000;
            if (s.mesh) {
                if (curThick > 0.01) {
                    s.mesh.visible = true;
                    // 关键：每帧重建geometry，radius随动画变化，保证冰层原地生长
                    if (s.mesh.geometry) s.mesh.geometry.dispose();
                    s.mesh.geometry = new THREE.TubeGeometry(s.curve, s.tubeSegments, curRadius, 12, false);
                    // 保证冰层mesh的position/rotation/scale始终与电力线一致
                    const obj = powerlineGroup.children[i];
                    s.mesh.position.copy(obj.position);
                    s.mesh.rotation.copy(obj.rotation);
                    s.mesh.scale.copy(obj.scale);
                } else {
                    s.mesh.visible = false;
                }
            }
            s.progress = t;
            s.curThick = curThick;
            s.curFactor = curFactor;
            // 同步到电力线userData
            const obj = powerlineGroup.children[i];
            if (obj?.userData?.metrics) {
                obj.userData.metrics._icingFactor = curFactor;
                obj.userData.metrics._currentSagFactor = curFactor;
                obj.userData.metrics._icingThickness = curThick;
            }
            i++;
            count++;
        }
        updatePowerlineSagByIcing();
        if (i < icingState.length && t < 1) {
            requestAnimationFrame(processBatch);
        } else if (t < 1) {
            // 继续动画进度
            i = 0;
            requestAnimationFrame(processBatch);
        }
    }
    processBatch();
}


function removeAllIcing() {
    icingActive = false;
    icingState.forEach(s => { if(s.mesh) { scene.remove(s.mesh); s.mesh.geometry.dispose(); s.mesh.material.dispose(); } });
    icingState = [];
    powerlineGroup.children.forEach(obj => {
        obj.userData.icing = null;
        if (obj.userData.metrics) {
            obj.userData.metrics._icingThickness = 0;
            obj.userData.metrics._icingFactor = 1.0;
            obj.userData.metrics._currentSagFactor = hotActive ? 1.1 : 1.0;
        }
        if (obj.userData.iceMesh) {
            scene.remove(obj.userData.iceMesh);
            obj.userData.iceMesh.geometry.dispose();
            obj.userData.iceMesh.material.dispose();
            obj.userData.iceMesh = null;
        }
    });
}

// 动态调整电力线弧垂
function updatePowerlineSagByIcing() {
    powerlineGroup.children.forEach((obj, i) => {
        const meta = obj.userData;
        const icing = icingState[i];
        if (!meta?.metrics || !icing) return;
        const baseSag = meta.metrics.sag || 0;
        const factor = icing.curFactor || 1.0;
        meta.metrics._currentSagFactor = factor;
        meta.metrics._icingThickness = icing.curThick || 0;
        // 可选：如需实时调整几何体，可重建geometry（略，性能考虑只做显示）
    });
}

const DANGER_RULES = {
    tree: [
    '违反《电力设施保护条例》第十四条第（八）项，任何单位或个人不得在杆塔、拉线基础的规定范围内取土、打桩、钻探、开挖或倾倒酸、碱、盐及其他有害化学物品。',
    '违反《电力设施保护条例》第十五条第（四）项，任何单位或个人不得在架空电力线路保护区内种植可能危及电力设施安全的植物。',
    '违反《电力设施保护条例》第二十四条第二款，在依法划定的电力设施保护区内种植的或自然生长的可能危及电力设施安全的树木、竹子，电力企业应依法予以修剪或砍伐。'
  ],
  car: [
    '违反《电力设施保护条例》第十二条，在电力设施周围进行爆破作业，必须按照国家有关规定，确保电力设施的安全。',
    '违反《电力设施保护条例》第十七条第（二）项，起重机械的任何部位进入架空电力线路保护区进行施工，必须经县级以上电力管理部门批准并采取安全措施。'
  ],
  house: [
    '违反《电力设施保护条例》第十五条第（三）项，任何单位或个人不得在架空电力线路保护区内兴建建筑物、构筑物。',
    '违反《电力设施保护条例》第十六条第（一）项，任何单位或个人不得在地下电缆保护区内兴建建筑物、构筑物。',
    '违反《电力设施保护条例》第二十二条，公用工程、城市绿化和其他工程在新建、改建或扩建中妨碍电力设施时，双方有关单位必须就迁移、采取必要的防护措施和补偿等问题达成协议后方可施工。'
  ],
  bird: [
    '违反《电力设施保护条例》第十四条第（四）项，任何单位或个人不得擅自在导线上接用电器设备。',
    '违反《电力设施保护条例》第十四条第（五）项，任何单位或个人不得擅自攀登杆塔或在杆塔上架设电力线、通信线、广播线，安装广播喇叭。',
    '违反《电力设施保护条例》第十四条第（七）项，任何单位或个人不得在杆塔、拉线上悬挂物体。'
  ],

};

// 弹出危险条例（可用自定义弹窗或tooltip）
function showDangerRule(obj, ruleText) {
    // 简单实现：在obj旁边显示div
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    // 屏幕坐标
    const vector = center.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    let div = document.getElementById('danger-rule-popup');
    if (!div) {
        div = document.createElement('div');
        div.id = 'danger-rule-popup';
        div.style.position = 'absolute';
        div.style.background = 'rgba(255,255,255,0.97)';
        div.style.color = '#333';
        div.style.padding = '14px 18px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
        div.style.zIndex = 2000;
        div.style.maxWidth = '320px';
        div.style.fontSize = '14px';
        document.body.appendChild(div);
    }
    div.innerText = ruleText;
    div.style.left = `${x + 20}px`;
    div.style.top = `${y - 20}px`;
    div.style.display = 'block';
    // 自动隐藏
    setTimeout(() => { div.style.display = 'none'; }, 8000);
}
function showDangerRuleModal(type) {
  const modal = document.getElementById('danger-rule-modal');
  const title = document.getElementById('danger-rule-title');
  const list = document.getElementById('danger-rule-list');
  if (!modal || !title || !list) return;
  let name = '';
  switch(type) {
    case 'tree': name = '树障'; break;
    case 'car': name = '特种车辆'; break;
    case 'house': name = '建筑物'; break;
    case 'bird': name = '挂线'; break;
    default: name = type;
  }
  title.textContent = `${name}相关保护条例`;
  list.innerHTML = (DANGER_RULES[type] || []).map((txt, i) =>
    `<div style="margin-bottom:10px;">${i+1}. ${txt}</div>`
  ).join('');
  modal.style.display = 'block';
}
function hideDangerRuleModal() {
  const modal = document.getElementById('danger-rule-modal');
  if (modal) modal.style.display = 'none';
}
// 关闭按钮和点击遮罩关闭
document.getElementById('danger-rule-close').onclick = hideDangerRuleModal;
document.getElementById('danger-rule-modal').onclick = function(e) {
  if (e.target === this) hideDangerRuleModal();
};

function bindDangerModelClick() {
  [
    { group: window.treeGroup, type: 'tree' },
    { group: window.carGroup, type: 'car' },
    { group: window.houseGroup, type: 'house' },
    { group: window.birdGroup, type: 'bird' }
  ].forEach(({group, type}) => {
    if (!group) return;
    group.children.forEach(obj => {
      obj.userData._dangerType = type;
      obj.traverse(child => {
        if (child.isMesh) {
          child.userData._dangerType = type;
        }
      });
    });
  });

  // 监听three.js画布点击
   const threeContainer = document.getElementById('three-container');
  if (!threeContainer) return;
  const canvas = threeContainer.querySelector('canvas');
  if (!canvas) return;

  canvas.removeEventListener('click', canvas._dangerClickHandler); // 移除旧的单击事件
canvas._dangerClickHandler = null;

if (canvas._dangerDblClickBound) return;
canvas._dangerDblClickBound = true;

canvas.addEventListener('dblclick', function(e) {
   
    const rect = canvas.getBoundingClientRect();
    const mouse = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1
    };
    raycaster.setFromCamera(mouse, camera);
    const dangerObjs = [
      ...(window.treeGroup?.children || []),
      ...(window.carGroup?.children || []),
      ...(window.houseGroup?.children || []),
      ...(window.birdGroup?.children || [])
    ];
    const intersects = raycaster.intersectObjects(dangerObjs, true);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      let type = obj.userData._dangerType;
      if (!type && obj.parent && obj.parent.userData._dangerType) type = obj.parent.userData._dangerType;
      if (type && DANGER_RULES[type]) {
        showDangerRuleModal(type);
        e.stopPropagation();
      }
    }
});
}
// 天气预测菜单下拉逻辑
document.getElementById('menu-weather').addEventListener('click', function(e) {
    e.stopPropagation();
    const submenu = document.getElementById('weather-submenu');
    submenu.style.display = (submenu.style.display === 'block' || submenu.style.display === 'flex') ? 'none' : 'block';
     toggleArrow('menu-weather-arrow', 'weather-submenu');
});
document.getElementById('weather-submenu').addEventListener('click', function(e) {
    e.stopPropagation();
});


function updateWeatherStatusBar() {
    const bar = document.getElementById('weather-status-bar');
    let html = '';
    if (rainActive) {
        html += `<span><i class="fa fa-cloud"></i> 雨天</span>`;
        html += `<span>温度：${WEATHER_ENV.rain.temp}℃</span>`;
        html += `<span>湿度：${WEATHER_ENV.rain.humidity}%</span>`;
    }
    if (snowActive) {
        html += `<span><i class="fa fa-snowflake-o"></i> 雪天</span>`;
        html += `<span>温度：${WEATHER_ENV.snow.temp}℃</span>`;
        html += `<span>湿度：${WEATHER_ENV.snow.humidity}%</span>`;
    }
    if (hotActive) {
        html += `<span><i class="fa fa-fire"></i> 高温</span>`;
        html += `<span>温度：${WEATHER_ENV.hot.temp}℃</span>`;
        html += `<span>湿度：${WEATHER_ENV.hot.humidity}%</span>`;
    }
    // 新增风速显示
    if (currentWindLevel && currentWindSpeed) {
        html += `<span><i class="fa fa-flag"></i> 风速：${currentWindLevel.label} (${currentWindSpeed} m/s)</span>`;
    }
    bar.innerHTML = html;
    bar.style.display = html ? 'inline-flex' : 'none';
}

/*function ensureSagAnalysisModal() {
    if (document.getElementById('sag-analysis-modal')) return;
    const div = document.createElement('div');
    div.id = 'sag-analysis-modal';
    div.style = `
        display:none;position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;
        background:rgba(0,0,0,0.18);`;
    div.innerHTML = `
      <div id="sag-analysis-content" style="
        position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        background:rgba(30,40,60,0.98);color:#87CEEB;padding:32px 38px 24px 38px;
        border-radius:14px;box-shadow:0 4px 24px #3ecbff88,0 2px 8px #0008;
        min-width:320px;max-width:90vw;max-height:80vh;overflow:auto;">
        <div style="font-weight:bold;font-size:1.2em;margin-bottom:12px;" id="sag-analysis-title"></div>
        <div id="sag-analysis-body"></div>
        <span id="sag-analysis-close" style="position:absolute;top:12px;right:18px;cursor:pointer;font-size:22px;color:#e74c3c;">×</span>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById('sag-analysis-close').onclick = function() {
        div.style.display = 'none';
    };
    div.onclick = function(e) {
        if (e.target === div) div.style.display = 'none';
    };
}
 ensureSagAnalysisModal();*/

document.addEventListener('DOMContentLoaded', function() {
    // 关闭弹窗
    const sagModal = document.getElementById('sag-analysis-modal');
    const sagClose = document.getElementById('sag-analysis-close');
    if (sagClose && sagModal) {
        sagClose.onclick = () => sagModal.style.display = 'none';
        sagModal.onclick = e => { if (e.target === sagModal) sagModal.style.display = 'none'; };
    }

    // 绑定弧垂分析按钮
    const sagBtn = document.getElementById('sag-analysis-btn');
    if (sagBtn) {
        sagBtn.onclick = function() {
            const modal = document.getElementById('sag-analysis-modal');
            const title = document.getElementById('sag-analysis-title');
            const body = document.getElementById('sag-analysis-body');

            // 判断当前天气场景
            let type = null;
            if (document.getElementById('rain-toggle').checked) type = 'rain';
            else if (document.getElementById('snow-toggle').checked) type = 'snow';
            else if (document.getElementById('hot-toggle').checked) type = 'hot';

            if (!type) {
               showTopBarTip('请先选择天气状况后再进行弧垂分析！');
        return;
            }

            // 计算当前场景下的平均弧垂
            let avgSag = 0, count = 0;
            if (window.powerlineGroup && window.powerlineGroup.children) {
                window.powerlineGroup.children.forEach(obj => {
                    if (obj.userData?.metrics) {
                        const baseSag = obj.userData.metrics.sag || 0;
                        const factor = obj.userData.metrics._currentSagFactor || 1.0;
                        avgSag += baseSag * factor;
                        count++;
                    }
                });
            }
            avgSag = count ? (avgSag / count) : 0;

            // 场景分析内容
            let analysis = '';
            let safe = true;
            if (type === 'rain') {
                analysis = `
                    <b>雨天场景下弧垂分析：</b><br>
                    当前平均弧垂：<span style="color:#3ecbff;font-weight:bold;">${avgSag.toFixed(2)} m</span><br>
                    雨天时，导线因受潮和自重增加，弧垂通常会略有增加，可能导致导线与地面或障碍物距离变小。<br>
                    <b>建议：</b>加强对低洼地带和障碍物附近的巡检，确保安全距离充足，防止因弧垂增加引发安全隐患。
                `;
                safe = avgSag <1;
            } else if (type === 'snow') {
                analysis = `
                    <b>雪天场景下弧垂分析：</b><br>
                    当前平均弧垂：<span style="color:#3ecbff;font-weight:bold;">${avgSag.toFixed(2)} m</span><br>
                    雪天时，导线覆冰积雪，弧垂显著增加，极端情况下可能导致导线下垂过大。<br>
                    <b>建议：</b>重点关注弧垂较大的区段，及时清除覆冰，防止导线与地面或障碍物距离过近，必要时采取加固措施。
                `;
                safe = avgSag <1;
            } else if (type === 'hot') {
                analysis = `
                    <b>高温场景下弧垂分析：</b><br>
                    当前平均弧垂：<span style="color:#3ecbff;font-weight:bold;">${avgSag.toFixed(2)} m</span><br>
                    高温时，导线因热胀冷缩，弧垂增加，尤其在中午和夏季更为明显。<br>
                    <b>建议：</b>加强高温时段的巡视，关注弧垂变化，防止因弧垂过大导致安全距离不足，必要时调整导线张力。
                `;
                safe = avgSag <1;
            }

            // 安全性评估
            analysis += `<br><b>安全评估：</b> <span style="color:${safe ? '#2ecc71' : '#e74c3c'};font-weight:bold;">${safe ? '安全' : '需警惕'}</span>`;

            title.textContent = '弧垂分析';
            body.innerHTML = analysis;
            modal.style.display = 'block';
        };
    }
});

// --- 细节展示功能（极致优化）---
let detailTowerIdx = 0;

function getTowerPositions() {
    // 只取当前场景所有塔的世界坐标
    return towerGroup.children.map(obj => obj.position.clone());
}

function setCameraBetweenTowers(idxA, idxB) {
    const towers = getTowerPositions();
    if (towers.length < 2) return;
    const A = towers[idxA], B = towers[idxB];
    if (!A || !B) return;
    // 中点
    const mid = A.clone().add(B).multiplyScalar(0.5);
    // 塔高
    const hA = A.z, hB = B.z;
    const avgH = (hA + hB) / 2;
    // 方向
    const dir = B.clone().sub(A).normalize();
    // 垂直方向（假设z轴为上）
    const up = new THREE.Vector3(0,0,1);
    // 中垂线方向
    const perp = new THREE.Vector3().crossVectors(dir, up).normalize();
    // 两塔距离
    const dist = A.distanceTo(B);
    // 等边三角形第三点到中点距离
    const h = dist / Math.sqrt(3);
    // 相机位置
    const camPos = mid.clone().add(perp.multiplyScalar(h));
    camPos.z = avgH * 1.3; // 高度提升30%
    camera.position.copy(camPos);
    camera.up.set(0,0,1); // 保证z轴始终垂直向上
    camera.lookAt(mid.x, mid.y, avgH);
    if (orbitControls) {
        orbitControls.target.set(mid.x, mid.y, avgH);
        orbitControls.update();
    }
}

function updateDetailView(idx) {
    const towers = getTowerPositions();
    if (towers.length < 2) return;
    if (idx < 0) idx = 0;
    if (idx > towers.length - 2) idx = towers.length - 2;
    detailTowerIdx = idx;
    setCameraBetweenTowers(idx, idx + 1);

    // 区域名
    const regionName = getCurrentRegionName();
    // 档段距编号
    const spanName = `档段距${idx + 1}`;
    // 塔高（固定值）
    const leftTowerHeight = 28.0;
    const rightTowerHeight = 28.0;
    // 电力线数量和平均长度（合理范围随机数）
    const lineCount = Math.floor(Math.random() * 3) + 2; // 2~4
    const avgLineLength = (100 + Math.random() * 40).toFixed(1); // 100~140

    // 填充下方细节展示
    showDetailSpanInfo({
        regionName,
        spanName,
        leftTowerHeight,
        rightTowerHeight,
        lineCount,
        avgLineLength
    });
}



function bindJoystickEvents() {
    const joystickBg = document.getElementById('joystick-bg');
    const joystickDot = document.getElementById('joystick-dot');
    if (!joystickBg || !joystickDot) return;
    let dragging = false;
    let joystickDir = {x:0, y:0};

    function setJoystickDir(nx, ny) {
        joystickDot.style.transform = `translate(calc(-50% + ${nx*50}px), calc(-50% + ${ny*50}px))`;
        joystickDir = {x: nx, y: ny};
    }
    function resetJoystick() {
        joystickDot.style.transform = 'translate(-50%, -50%)';
        joystickDir = {x:0, y:0};
    }
    joystickBg.onpointerdown = null;
    window.onpointermove = null;
    window.onpointerup = null;

    joystickBg.addEventListener('pointerdown', function(e) {
        dragging = true;
        const rect = joystickBg.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
        const nx = x / (rect.width/2) * len;
        const ny = y / (rect.height/2) * len;
        setJoystickDir(nx, ny);
    });
    window.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        const rect = joystickBg.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        const len = Math.min(1, Math.sqrt(x*x + y*y) / (rect.width/2));
        const nx = x / (rect.width/2) * len;
        const ny = y / (rect.height/2) * len;
        setJoystickDir(nx, ny);
    });
    window.addEventListener('pointerup', function(e) {
        dragging = false;
        resetJoystick();
    });

    window.getJoystickMove = function() {
        return {
            x: joystickDir.x,
            y: -joystickDir.y
        };
    };
}

// 每次全屏切换和视角切换都重新绑定摇杆事件
document.addEventListener('fullscreenchange', bindJoystickEvents);
document.addEventListener('DOMContentLoaded', bindJoystickEvents);

document.getElementById('wind-amplitude-analysis-btn').onclick = showWindAmplitudeAnalysis;
document.getElementById('sag-analysis-close').onclick = function() {
    document.getElementById('sag-analysis-modal').style.display = 'none';
};

function showWindAmplitudeAnalysis() {
    if (!currentWindLevel || !currentWindAmplitude || !currentWindSpeed) {
         showTopBarTip('请先选择天气状况后再进行舞动幅度分析！');
        return;
    }
    const diameter = LINE_DIAMETER;
    const dangerThreshold = diameter * 50; // 1000mm
    const veryDangerThreshold = diameter * 55; // 1100mm
    let riskText = '';
    let riskColor = '#2ecc71';
    if (currentWindAmplitude > veryDangerThreshold) {
        riskText = '非常危险！舞动振幅已超过55倍电力线直径，极易发生断线或碰撞！';
        riskColor = '#e74c3c';
    } else if (currentWindAmplitude > dangerThreshold) {
        riskText = '危险！舞动振幅已超过50倍电力线直径，存在断线或碰撞风险！';
        riskColor = '#f39c12';
    } else {
        riskText = '安全。舞动振幅未超过危险阈值。';
        riskColor = '#2ecc71';
    }
    const modal = document.getElementById('sag-analysis-modal');
    const body = document.getElementById('sag-analysis-body');
    modal.style.display = 'block';
    document.getElementById('sag-analysis-title').innerText = '舞动幅度分析';
    body.innerHTML = `
        <div style="font-size:1.15em;margin-bottom:12px;">
            当前风速档位：<b>${currentWindLevel.label}</b> (${currentWindSpeed} m/s)
        </div>
        <div style="font-size:1.15em;margin-bottom:12px;">
            当前舞动振幅：<b>${currentWindAmplitude} mm</b>
        </div>
        <div style="font-size:1.15em;margin-bottom:12px;">
            电力线直径：<b>${diameter} mm</b>
        </div>
        <div style="font-size:1.15em;margin-bottom:12px;">
            危险阈值：<b>${dangerThreshold} mm</b>，非常危险阈值：<b>${veryDangerThreshold} mm</b>
        </div>
        <div style="font-size:1.2em;font-weight:bold;color:${riskColor};margin-top:18px;">
            ${riskText}
        </div>
    `;
}

function showTopBarTip(msg, duration = 2200) {
    let tipBar = document.getElementById('top-bar-tip');
    if (!tipBar) {
        tipBar = document.createElement('div');
        tipBar.id = 'top-bar-tip';
        tipBar.style = `
            position: fixed;
            top: 0;
            left: 240px;
            right: 0;
            height: 48px;
            background: #ff5f4dff;
            color: #fff;
            font-size: 1.15em;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            box-shadow: 0 2px 8px #e74c3c44;
            letter-spacing: 1px;
        `;
        document.body.appendChild(tipBar);
    }
    tipBar.textContent = msg;
    tipBar.style.display = 'flex';
    setTimeout(() => {
        tipBar.style.display = 'none';
    }, duration);
}

function toggleArrow(menuArrowId, submenuId) {
    const arrow = document.getElementById(menuArrowId);
    const submenu = document.getElementById(submenuId);
    if (!arrow || !submenu) return;
    if (submenu.style.display === 'block' || submenu.style.display === 'flex') {
        arrow.style.display = 'none';
    } else {
        arrow.style.display = '';
    }
}
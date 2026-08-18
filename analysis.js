// ========== 导入所有区域建模与危险物数据 ==========
import { GLTFLoader } from './js/libs/loaders/GLTFLoader.js';
import * as THREE from './js/libs/three.module.js'; // 添加Three.js的相对路径导入
const loader = new GLTFLoader();

// 区域key列表（如有新增区域，直接补充）
const DATASET_KEYS = ['B1', 'B2', 'B3', 'B4','B5'];

// 电力线建模数据文件名
const DATASETS = [
    { ply: 'refined_power_linesB1.ply', json: 'power_line_metricsB1.json' },
    { ply: 'refined_power_linesB2.ply', json: 'power_line_metricsB2.json' },
    { ply: 'refined_power_linesB3.ply', json: 'power_line_metricsB3.json' },
    { ply: 'refined_power_linesB4.ply', json: 'power_line_metricsB4.json' },
    { ply: 'refined_power_linesB5.ply', json: 'power_line_metricsB5.json' }
];
// 电力线建模数据文件名映射（根据DATASETS生成，或保持原有DATASET_FILES）
const DATASET_FILES = DATASETS.reduce((acc, item) => {
    const key = item.json.replace('power_line_metrics', '').replace('.json', ''); // 提取B1/B2等key
    acc[key] = item.json;
    return acc;
}, {});

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

// 页面加载时读取当前数据集索引
let currentDatasetIdx = 0; // 默认使用第一个数据集
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

// ========== 读取所有区域电力线建模数据 ==========

/**
 * 异步加载所有区域的电力线建模数据
 * @returns {Promise<Object>} 形如 { B1: [...], B2: [...], ... }
 */
async function loadAllRegionLineData() {
    const allData = {};
    // 使用Promise.allSettled确保所有请求完成（无论成功/失败）
    const results = await Promise.allSettled(
        DATASET_KEYS.map(key => 
            fetch('./data/' + DATASET_FILES[key])
                .then(res => res.json())
                .catch(err => {
                    console.error(`加载${key}数据失败:`, err);
                    return null; // 失败时返回null
                })
        )
    );
    // 填充成功加载的数据
    results.forEach((result, index) => {
        const key = DATASET_KEYS[index];
        if (result.status === 'fulfilled' && result.value) {
            allData[key] = result.value;
        } else {
            allData[key] = []; // 失败时设为空数组避免后续处理出错
        }
    });
    return allData;
}

// ========== 获取各区域建模物体数量的函数 ==========

/**
 * 获取指定区域的电力塔数量
 * @param {string} key 区域key
 */
function getTowerCount(key) {
    return Array.isArray(TOWER_COORDS[key]) ? TOWER_COORDS[key].length : 0;
}

/**
 * 获取指定区域的电力线数量
 * @param {Object} allLineData 所有区域电力线数据
 * @param {string} key 区域key
 */
function getLineCount(allLineData, key) {
    return Array.isArray(allLineData[key]) ? allLineData[key].length : 0;
}

/**
 * 获取指定区域的危险物数量
 * @param {string} key 区域key
 * @returns {Object} { tree, car, house, bird, total }
 */
function getDangerCounts(key) {
    const tree = Array.isArray(TREE_COORDS[key]) ? TREE_COORDS[key].length : 0;
    const car = Array.isArray(CAR_COORDS[key]) ? CAR_COORDS[key].length : 0;
    const house = Array.isArray(HOUSE_COORDS[key]) ? HOUSE_COORDS[key].length : 0;
    const bird = Array.isArray(BIRD_COORDS[key]) ? BIRD_COORDS[key].length : 0;
    return {
        tree,
        car,
        house,
        bird,
        total: tree + car + house + bird
    };
}

// 判断当前是否为浅色模式
function isLightMode() {
    return document.body.classList.contains('light-mode');
}

// 获取主色/文本色
function getTextColor() {
    return isLightMode() ? '#1a233a' : '#fff';
}
function getSubTextColor() {
    return isLightMode() ? '#3ecbff' : '#00eaff';
}
function getCardBg() {
    return isLightMode() ? '#fff' : 'rgba(0,32,64,0.82)';
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 读取主页面色彩模式
    const mode = localStorage.getItem('color-mode');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    // 加载所有区域的电力线数据
    loadAllRegionLineData().then(allLineData => {
        // 渲染KPI（包含可疑危险物总数）
        renderKPIs(allLineData);
        // 计算风险值
        const riskValue = calculateRiskValue();
        // 渲染风险引擎图
        renderRiskGauge(riskValue);
        // 渲染其他图表
        renderRegionBarLineChart(allLineData);
    }).catch(() => {
        renderKPIs({}); // 数据加载失败时显示占位
        renderRiskGauge(0);
    });

    window.addEventListener('resize', resizeCharts);
});

let chartInstances = [];

function disposeCharts() {
    chartInstances.forEach(c => { try { c.dispose(); } catch(e){} });
    chartInstances = [];
}


function renderKPIs(allLineData) {
    if (!allLineData || typeof allLineData !== 'object') allLineData = {};
    let allLines = Object.values(allLineData).flat().filter(line => line && line.metrics);

    // 如果没有数据，尝试从 main.js 获取
    if (allLines.length === 0 && window.globalJsonData) {
        allLines = window.globalJsonData.filter(line => line && line.metrics);
    }


    // 2. 计算平均高度（替换原平均长度的计算）
    let totalHeight = 0;
    let totalPoints = 0;
    allLines.forEach(line => {
        if (line && Array.isArray(line.coordinates)) {
            line.coordinates.forEach(pt => {
                // 校验坐标有效性（z坐标为第三个元素）
                if (Array.isArray(pt) && pt.length >= 3 && typeof pt[2] === 'number') {
                    totalHeight += pt[2];
                    totalPoints++;
                }
            });
        }
    });
    const avgHeight = totalPoints > 0 ? (totalHeight / totalPoints).toFixed(2) : '--';

    // 3. 计算所有危险物总数（树+车+房+鸟）
   /*let totalDanger = 0;
    DATASET_KEYS.forEach(key => {
        const dangerCounts = getDangerCounts(key);
        totalDanger += dangerCounts.total;
    });*/

    // 4. 计算平均弧垂度
    const totalSag = allLines.reduce((sum, line) => sum + (line.metrics.sag || 0), 0);
    const avgSag = allLines.length > 0 ? (totalSag / allLines.length).toFixed(2) : '--';

    // 5. 计算平均张力
    const totalTension = allLines.reduce((sum, line) => sum + (line.metrics.tension || 0), 0);
    const avgTension = allLines.length > 0 ? (totalTension / allLines.length).toFixed(2) : '--';

    // 填充到HTML
    document.getElementById('avg-length').innerText = avgHeight; // 平均高度
   /* document.getElementById('min-height').innerText = totalDanger;*/
    document.getElementById('avg-sag').innerText = avgSag;
    document.getElementById('avg-tension').innerText = avgTension;
}

// 区域统计柱状图+折线图
async function renderRegionBarLineChart(allLineData) {
    if (!allLineData) allLineData = await loadAllRegionLineData();
    const regions = DATASET_KEYS;
    const lineCounts = regions.map(key => getLineCount(allLineData, key));
    const towerCounts = regions.map(key => getTowerCount(key));

    const regionColors = ['#3ecbff', '#00eaff', '#0099ff', '#0f5bffff', '#0037acff']; // 蓝系渐变，清晰区分

    const chartDom = document.getElementById('region-bar-line');
    if (!chartDom) return;
    const chart = echarts.init(chartDom);

    chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: {
           data: [
                { name: '电力线数量', textStyle: { color: regionColors[0] } }, // 与电力线柱状图首色一致
                { name: '电力塔数量', textStyle: { color: '#ff9800' } } // 与电力塔折线图颜色一致
            ],
            selected: { '电力线数量': true, '电力塔数量': true }
        },
        grid: { left: 40, right: 20, bottom: 40, top: 40 },
        xAxis: {
            type: 'category',
            data: regions,
            axisLabel: { fontWeight: 'bold' }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: Math.ceil(Math.max(...lineCounts, ...towerCounts) / 80) * 80, // 80单位档段
            interval: 80,
            name: '数量'
        },
        series: [
            {
                name: '电力线数量',
                type: 'bar',
                data: lineCounts,
                label: { show: true, position: 'top', fontWeight: 'bold' },
                // 为每个区域应用独立颜色
                itemStyle: { color: (params) => regionColors[params.dataIndex] }
            },
            {
                name: '电力塔数量',
                type: 'line',
                data: towerCounts,
                label: { show: true, position: 'top', fontWeight: 'bold' }, // 标签移至顶部避免重叠
                symbol: 'circle',
                symbolSize: 12,
                lineStyle: { color: '#ff9800', width: 3 }, // 橙色突出显示
                itemStyle: { color: '#ff9800' },
                z: 2 // 提升折线图层级，确保显示在柱状图上方
            }
        ]
    });
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 读取主页面色彩模式（保持不变）
    const mode = localStorage.getItem('color-mode');
    if (mode === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    // 修改：加载所有区域的电力线数据
    loadAllRegionLineData().then(allLineData => {
        loadAndRender(allLineData); // 传递所有区域数据
    }).catch(() => {
        renderKPIs({}); // 数据加载失败时显示占位
    });
    window.addEventListener('resize', resizeCharts);
    // 色彩模式监听（保持不变）
    window.addEventListener('storage', (e) => { /* ... */ });
});

// 修改：接收所有区域电力线数据作为参数
function loadAndRender(allLineData) {
    // 假设需要其他图表渲染（如热力图、仪表盘等），保持原有逻辑
    renderKPIs(allLineData); // 传递所有区域数据给KPI渲染
    renderPieChart(allLineData);
    renderHeatmapChart(allLineData);
    renderRiskGauge(allLineData);
    renderLineChart(allLineData);
    resizeCharts();
}

// 页面加载后调用
document.addEventListener('DOMContentLoaded', () => {
    renderRegionBarLineChart();
});




// 响应式调整
function resizeCharts() {
    chartInstances.forEach(c => { try { c.resize(); } catch(e){} });
}


/*// ========== 危险物距离计算逻辑（从main.js摘抄） ==========
function calculateDangerDistance(dangerCoord, lineCoords) {
    const dangerPoint = new THREE.Vector3(...dangerCoord.slice(0, 3));
    let minDistance = Infinity;
    for (let i = 1; i < lineCoords.length; i++) {
        const p1 = new THREE.Vector3(...lineCoords[i-1]);
        const p2 = new THREE.Vector3(...lineCoords[i]);
        const closestPoint = new THREE.Vector3();
        closestPoint.closestPointToSegment(dangerPoint, p1, p2);
        const distance = dangerPoint.distanceTo(closestPoint);
        if (distance < minDistance) minDistance = distance;
    }
    return minDistance;
}*/

/*// ========== 紧急危险物统计逻辑 ==========
async function getEmergencyDangerCount(allLineData) {
    let count = 0;
    for (const key of DATASET_KEYS) {
        const lineData = allLineData[key] || [];
        const dangers = [
            ...(TREE_COORDS[key] || []),
            ...(CAR_COORDS[key] || []),
            ...(HOUSE_COORDS[key] || []),
            ...(BIRD_COORDS[key] || [])
        ];
        for (const danger of dangers) {
            const lineCoords = lineData.flatMap(line => line.coordinates);
            const distance = calculateDangerDistance(danger, lineCoords);
            if (distance > 0 && distance <= 10) count++;
        }
    }
    return count;
}
// ========== 危险物风险等级定义 ==========
const RISK_LEVELS = {
    HIGH: { min: 0, max: 5.5, label: '非常紧急' },
    MEDIUM: { min: 5.5, max: 10, label: '一般紧急' },
    LOW: { min: 10, max: Infinity, label: '安全' }
};*/

/*// ========== 危险物分类统计函数（关键新增） ==========
function getClassifiedDangerCounts(allLineData) {
    // 初始化统计结构：{ B1: { tree: { high:0, medium:0, low:0 }, car: ... }, B2: ... }
    const result = DATASET_KEYS.reduce((acc, key) => {
        acc[key] = {
            tree: { high: 0, medium: 0, low: 0 },
            car: { high: 0, medium: 0, low: 0 },
            house: { high: 0, medium: 0, low: 0 },
            bird: { high: 0, medium: 0, low: 0 }
        };
        return acc;
    }, {});

    // 遍历所有区域
    for (const key of DATASET_KEYS) {
        const lineData = allLineData[key] || [];
        const lineCoords = lineData.flatMap(line => line.coordinates || []);
        if (lineCoords.length === 0) continue;

        // 遍历所有类型危险物
        const dangers = {
            tree: TREE_COORDS[key] || [],
            car: CAR_COORDS[key] || [],
            house: HOUSE_COORDS[key] || [],
            bird: BIRD_COORDS[key] || []
        };

        // 按类型统计
        Object.entries(dangers).forEach(([type, dangerList]) => {
            dangerList.forEach(danger => {
                const distance = calculateDangerDistance(danger, lineCoords);
                if (distance <= RISK_LEVELS.HIGH.max) {
                    result[key][type].high++;
                } else if (distance <= RISK_LEVELS.MEDIUM.max) {
                    result[key][type].medium++;
                } else {
                    result[key][type].low++;
                }
            });
        });
    }

    return result;
}*/
// ========== 固定危险物统计数据（根据您提供的信息定义） ==========
// ========== 固定危险物统计数据（根据您提供的信息定义） ==========



// ========== 计算风险值 ==========
function calculateRiskValue() {
    // 总紧急危险物（0-5.5米）
    const totalHigh = Object.values(CLASSIFIED_DANGERS).reduce((sum, region) => {
        return sum + region.tree.high + region.car.high + region.house.high + region.bird.high;
    }, 0);

    // 总一般紧急危险物（5.5-10米）
    const totalMedium = Object.values(CLASSIFIED_DANGERS).reduce((sum, region) => {
        return sum + region.tree.medium + region.car.medium + region.house.medium + region.bird.medium;
    }, 0);

    // 需处理危险物数量（分子）
    const dangerousCount = totalHigh + totalMedium;

    // 所有可疑危险物总数（分母：树+车+房+鸟的总数）
    const totalSuspicious = Object.values(CLASSIFIED_DANGERS).reduce((sum, region) => {
        const treeTotal = region.tree.high + region.tree.medium + region.tree.low;
        const carTotal = region.car.high + region.car.medium + region.car.low;
        const houseTotal = region.house.high + region.house.medium + region.house.low;
        const birdTotal = region.bird.high + region.bird.medium + region.bird.low;
        return sum + treeTotal + carTotal + houseTotal + birdTotal;
    }, 0);

    // 风险值 = 需处理数量 / 总可疑数量（避免除零）
    return totalSuspicious > 0 ? dangerousCount / totalSuspicious : 0;
}
/*// ========== 风险值计算 ==========
function getRiskValue(emergencyCount, totalDanger) {
    return totalDanger === 0 ? 0 : (emergencyCount / totalDanger).toFixed(2);
}

// ========== 数据加载与渲染主逻辑（修改） ==========
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const allLineData = await loadAllRegionLineData();
        // 新增：获取分类统计数据
        const classifiedDangers = getClassifiedDangerCounts(allLineData);
        // 计算总危险物数量（非常+一般紧急）
        const totalDanger = Object.values(classifiedDangers).reduce((sum, region) => {
            return sum + Object.values(region).reduce((typeSum, type) => {
                return typeSum + type.high + type.medium;
            }, 0);
        }, 0);
        // 计算非常紧急数量
        const highEmergency = Object.values(classifiedDangers).reduce((sum, region) => {
            return sum + Object.values(region).reduce((typeSum, type) => typeSum + type.high, 0);
        }, 0);
        // 计算一般紧急数量
        const mediumEmergency = Object.values(classifiedDangers).reduce((sum, region) => {
            return sum + Object.values(region).reduce((typeSum, type) => typeSum + type.medium, 0);
        }, 0);
        // 风险值 = (非常紧急 + 一般紧急) / 总危险物数量（避免除零）
        const riskValue = totalDanger > 0 ? (highEmergency + mediumEmergency) / totalDanger : 0;

        // 渲染KPI（示例：显示总紧急数量）
        document.getElementById('min-height').textContent = totalDanger; // 原"可疑危险物数量"KPI
        // 渲染风险引擎图
        renderRiskGauge(riskValue);
        // 渲染分类统计（需新增表格或图表展示classifiedDangers数据）
        renderClassifiedDangerTable(classifiedDangers);
    } catch (error) {
        console.error('数据加载失败:', error);
    }
});*/
// ========== 总危险物数量计算（所有类型+所有区域） ==========

// ========== 数据加载与渲染主逻辑（修改后） ==========



// ========== 风险引擎仪表盘渲染 ==========
// ========== 风险仪表盘渲染 ==========
function renderRiskGauge(riskValue) {
    const chartDom = document.getElementById('risk-gauge');
    if (!chartDom) return;
    const chart = echarts.init(chartDom);
    chart.setOption({
        backgroundColor: 'transparent',
        series: [{
            type: 'gauge',
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 1,
            splitNumber: 10,
            axisLine: {
                lineStyle: {
                    width: 24,
                    color: [
                        [0.3, '#00eaff','#005cff'],
                        [0.7, '#ffe600', '#ff9800'],
                        [1, '#ff4e4e', '#d500f9']
                    ],
                    shadowColor: 'rgba(0,242,254,0.5)',
                    shadowBlur: 20
                }
            },
            pointer: {
                icon: 'path://M12 22.33L12 2.66C12 1.2 13.2 0 14.66 0L21.34 0C22.8 0 24 1.2 24 2.66L24 22.33C24 23.8 22.8 25 21.34 25L14.66 25C13.2 25 12 23.8 12 22.33Z',
                length: '55%',
                width: 12,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color:'#00f2fe' },
                        { offset: 1, color: '#4f00ff' }
                    ]),
                    shadowBlur: 15,
                    shadowColor: '#00f2fe'
                }
            },
            progress: { show: true, width: 18 },
            axisTick: {
                length: 8,
                lineStyle: {
                    color: 'rgba(255,255,255,0.6)',
                    width: 2
                }
            },
            splitLine: {
                length: 20,
                lineStyle: {
                    color: 'rgba(0,242,254,0.6)',
                    width: 3,
                    type: 'dashed'
                }
            },
            axisLabel: { color: '#fff', fontSize: 14 },
            detail: {
                fontSize: 28,
                fontWeight: 'bold',
                color: '#fff',
                formatter: v => `${(v * 100).toFixed(1)}%`
            },
            data: [{ value: riskValue }]
        }]
    });
    document.getElementById('risk-percent').textContent = `风险值：${(riskValue * 100).toFixed(1)}%`;
}


// ========== 初始化入口 ==========
// ========== 动态危险物统计入口 ==========



// ========== HTML结构调整 ==========
// ========== 危险物累计趋势图 ==========
function renderHeatmapChart(classifiedDangers) {
    const chartDom = document.getElementById('heatmap-chart');
    if (!chartDom) return;
    const chart = echarts.init(chartDom);
    const regions = DATASET_KEYS;

    // 统计各类型总数
    const seriesData = {
        tree: regions.map(key =>
            classifiedDangers[key].tree.high +
            classifiedDangers[key].tree.medium +
            classifiedDangers[key].tree.low
        ),
        car: regions.map(key =>
            classifiedDangers[key].car.high +
            classifiedDangers[key].car.medium +
            classifiedDangers[key].car.low
        ),
        house: regions.map(key =>
            classifiedDangers[key].house.high +
            classifiedDangers[key].house.medium +
            classifiedDangers[key].house.low
        ),
        bird: regions.map(key =>
            classifiedDangers[key].bird.high +
            classifiedDangers[key].bird.medium +
            classifiedDangers[key].bird.low
        )
    };

    // 堆叠数据
    const stackedData = {
        tree: [...seriesData.tree],
        car: seriesData.car.map((v, i) => v + seriesData.tree[i]),
        house: seriesData.house.map((v, i) => v + seriesData.car[i] + seriesData.tree[i]),
        bird: seriesData.bird.map((v, i) => v + seriesData.house[i] + seriesData.car[i] + seriesData.tree[i])
    };

    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                const nameMap = {
                    '树木': 'tree',
                    '车辆': 'car',
                    '房屋': 'house',
                    '挂线鸟': 'bird'
                };
                const actualValues = params.map(p => {
                    const idx = p.dataIndex;
                    const type = nameMap[p.seriesName];
                    return `${p.marker} <span style="color:${p.color}">${p.seriesName}</span>: ${seriesData[type][idx]}个`;
                }).join('<br/>');
                return `<div style="font-size:14px;">${params[0].name}</div>${actualValues}`;
            }
        },
        legend: {
            data: ['树木', '车辆', '房屋', '挂线鸟'],
            textStyle: { color: '#fff' }
        },
        xAxis: {
            type: 'category',
            data: regions,
            axisLabel: { fontWeight: 'bold' }
        },
        yAxis: {
            type: 'value',
            name: '危险物数量'
        },
        series: [
            {
                name: '树木',
                type: 'line',
                data: stackedData.tree,
                stack: 'total',
                areaStyle: { color: 'rgba(76, 175, 80, 0.3)' },
                lineStyle: { color: '#4CAF50', width: 3 },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#4CAF50' }
            },
            {
                name: '车辆',
                type: 'line',
                data: stackedData.car,
                stack: 'total',
                areaStyle: { color: 'rgba(255, 152, 0, 0.3)' },
                lineStyle: { color: '#FF9800', width: 3 },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#FF9800' }
            },
            {
                name: '房屋',
                type: 'line',
                data: stackedData.house,
                stack: 'total',
                areaStyle: { color: 'rgba(121, 85, 72, 0.3)' },
                lineStyle: { color: '#795548', width: 3 },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#795548' }
            },
            {
                name: '挂线鸟',
                type: 'line',
                data: stackedData.bird,
                stack: 'total',
                areaStyle: { color: 'rgba(33, 150, 243, 0.3)' },
                lineStyle: { color: '#2196F3', width: 3 },
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: { color: '#2196F3' }
            }
        ]
    });
}


// ========== 饼图渲染 ==========
function renderPieChart(classifiedDangers) {
    const chartDom = document.getElementById('line-chart');
    if (!chartDom) return;

    // 统计三类数据总量
    let totalData = {
        emergency: 0,    // high
        warning: 0,      // medium
        safe: 0          // low
    };

    DATASET_KEYS.forEach(key => {
        const dangers = classifiedDangers[key];
        Object.values(dangers).forEach(type => {
            totalData.emergency += type.high;
            totalData.warning += type.medium;
            totalData.safe += type.low;
        });
    });

    const chart = echarts.init(chartDom);
    chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: ({ data }) => {
                const percent = (data.value / (totalData.emergency + totalData.warning + totalData.safe) * 100).toFixed(1);
                return `${data.name}<br>数量: ${data.value}个 (${percent}%)`;
            }
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['紧急危险物 (0-5.5m)', '需关注危险物 (5.5-10m)', '安全距离危险物'],
            textStyle: { color: '#fff' }
        },
        series: [{
            type: 'pie',
            radius: ['40%', '65%'],
            center: ['55%', '50%'],
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 20 } },
            data: [
                {
                    value: totalData.emergency,
                    name: '紧急危险物 (0-5.5m)',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#ff4e4e' },
                            { offset: 1, color: '#d500f9' }
                        ])
                    }
                },
                {
                    value: totalData.warning,
                    name: '需关注危险物 (5.5-10m)',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#ff9800' },
                            { offset: 1, color: '#ff5722' }
                        ])
                    }
                },
                {
                    value: totalData.safe,
                    name: '安全距离危险物',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#4CAF50' },
                            { offset: 1, color: '#009688' }
                        ])
                    }
                }
            ],
            hoverOffset: 10
        }]
    });
}




async function renderSagHeatmapMatrix() {
    const chartDom = document.getElementById('sag-heatmap-chart');
    if (!chartDom) return;
    const allLineData = await loadAllRegionLineData();
    const regions = ['B1', 'B2', 'B3', 'B4','B5'];

    const designSag = 1;

    // 1. 统计所有区域最大线数
    let maxLineCount = 0;
    regions.forEach(region => {
        const lines = allLineData[region] || [];
        if (lines.length > maxLineCount) maxLineCount = lines.length;
    });

    // 2. 横轴为线号（0,1,2,...,maxLineCount-1），纵轴为区域
    let xLabels = [];
    for (let i = 0; i < maxLineCount; i++) {
        xLabels.push(`第${i + 1}线`);
    }
    let yLabels = regions;

    // 3. 组装热力图数据
    let data = [];
    regions.forEach((region, yIndex) => {
        const lines = allLineData[region] || [];
        for (let xIndex = 0; xIndex < maxLineCount; xIndex++) {
            if (lines[xIndex]) {
                const line = lines[xIndex];
                const sag = line.metrics?.sag ?? 0;
                let level = 0;
                if (sag <= designSag * 1.03) level = 0;
                else if (sag <= designSag * 1.08) level = 1;
                else level = 2;
                data.push([xIndex, yIndex, level, sag, line.id]);
            } else {
                // 没有该编号的线，填null用于空白
                data.push([xIndex, yIndex, null, null, null]);
            }
        }
    });

    // 4. 颜色映射
    const colorMap = [
        '#b3e5fc', // 正常
        '#ffe082', // 偏高
        '#ff8a65'  // 严重偏高
    ];

    // 5. ECharts option
    const option = {
        tooltip: {
            show: true,
            formatter: function(params) {
                const [x, y, level, sag, id] = params.data;
                if (level === null) return '无数据';
                let levelText = ['正常', '偏高', '严重偏高'][level];
                return `
                    <b>区域：</b>${regions[y]}<br/>
                    <b>线号：</b>${xLabels[x]}<br/>
                    <b>线ID：</b>${id}<br/>
                    <b>弧垂度：</b>${sag.toFixed(3)}<br/>
                    <b>等级：</b><span style="color:${colorMap[level]}">${levelText}</span>
                `;
            }
        },
        grid: { left: 80, right: 40, top: 40, bottom: 80 },
        xAxis: {
            type: 'category',
            data: xLabels,
            axisLabel: {
                show: xLabels.length <= 100, // 线数多时自动隐藏
                color: getTextColor(),
                fontSize: 10,
                rotate: 45
            },
            splitLine: { show: false }
        },
        yAxis: {
            type: 'category',
            data: yLabels,
            axisLabel: { color: getTextColor(), fontWeight: 'bold', fontSize: 14 }
        },
        dataZoom: [
            {
                type: 'slider',
                xAxisIndex: 0,
                height: 18,
                bottom: 30,
                start: 0,
                end: Math.min(100, 100 * 200 / xLabels.length), // 默认显示200根线
                showDetail: false
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'weakFilter'
            }
        ],
        series: [{
            name: '弧垂度等级',
            type: 'heatmap',
            data: data.filter(d => d[2] !== null), // 只显示有数据的色块
            label: { show: false },
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 0.5,
                color: function(params) {
                    return colorMap[params.data[2]];
                }
            },
            emphasis: {
                itemStyle: {
                    borderColor: '#000',
                    borderWidth: 2
                }
            }
        }],
        graphic: [
            {
                type: 'rect', left: 120, bottom: 10, shape: { width: 32, height: 12 },
                style: { fill: colorMap[0] }
            },
            {
                type: 'text', left: 160, bottom: 8, style: { text: '正常', fill: getTextColor(), font: '14px sans-serif' }
            },
            {
                type: 'rect', left: 320, bottom: 10, shape: { width: 32, height: 12 },
                style: { fill: colorMap[1] }
            },
            {
                type: 'text', left: 360, bottom: 8, style: { text: '偏高', fill: getTextColor(), font: '14px sans-serif' }
            },
            {
                type: 'rect', left: 520, bottom: 10, shape: { width: 32, height: 12 },
                style: { fill: colorMap[2] }
            },
            {
                type: 'text', left: 560, bottom: 8, style: { text: '严重偏高', fill: getTextColor(), font: '14px sans-serif' }
            }
        ]
    };

    // 6. 渲染
    const chart = echarts.init(chartDom);
    chart.setOption(option);
}



function distancePointToBox(point, box) {
    const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
    const dy = Math.max(box.min.y - point.y, 0, point.y - box.max.y);
    const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

async function computeAllDangerRisks(allRegionLineData) {
    const regionKeys = DATASET_KEYS;
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

    const allDangerRisksMap = {};
    for (const region of regionKeys) {
        allDangerRisksMap[region] = {};
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
            allDangerRisksMap[region][type] = [];
            for (let i = 0; i < arr.length; i++) {
                const coord = arr[i];
                let minDist = Infinity;
                let model = null;
                let angle = 0, scale = 1;
                if (type === 'tree') { angle = coord[3] || 0; scale = coord[4] || 20; }
                if (type === 'car') { angle = coord[3] || 0; scale = coord[4] || 5; }
                if (type === 'house') { angle = coord[3] || 0; scale = coord[4] || 3; }
                if (type === 'bird') { angle = coord[3] || 0; scale = coord[4] || 1; }
                model = glbMap[type]?.scene?.clone(true);
                if (model) {
                    model.rotation.x = -Math.PI / 2;
                    model.rotation.z = Math.PI;
                    model.rotation.y = -Math.PI / 2 + (angle * Math.PI / 180);
                    model.scale.set(scale, scale, scale);
                    const box = new THREE.Box3().setFromObject(model);
                    model.position.set(coord[0], coord[1], coord[2] - box.min.z);
                    box.setFromObject(model);
                    for (const lp of linePoints) {
                        const d = distancePointToBox(lp, box);
                        if (d < minDist) minDist = d;
                    }
                } else {
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
                allDangerRisksMap[region][type].push({
                    idx: `${prefix}${i + 1}`,
                    risk,
                    riskLevel,
                    distance: minDist,
                    coord: `(${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}, ${coord[2].toFixed(2)})`
                });
            }
        }
    }
    return allDangerRisksMap;
}



document.addEventListener('DOMContentLoaded', async () => {
    // 显示等待图标
    document.getElementById('analysis-loading').style.display = 'block';

    try {
        // 色彩模式
        const mode = localStorage.getItem('color-mode');
        if (mode === 'light') document.body.classList.add('light-mode');
        else document.body.classList.remove('light-mode');

        // 加载所有区域电力线数据
        const allLineData = await loadAllRegionLineData();

        // 动态统计所有危险物风险等级
        const allDangerRisksMap = await computeAllDangerRisks(allLineData);

        // 统计各等级数量
        const classifiedDangers = {};
        let totalDangerCount = 0; // 所有危险物总数
        for (const region of DATASET_KEYS) {
            classifiedDangers[region] = { tree: { high: 0, medium: 0, low: 0 }, car: { high: 0, medium: 0, low: 0 }, house: { high: 0, medium: 0, low: 0 }, bird: { high: 0, medium: 0, low: 0 } };
            for (const type of ['tree', 'car', 'house', 'bird']) {
                const arr = allDangerRisksMap[region]?.[type] || [];
                totalDangerCount += arr.length; // 统计所有危险物数量
                arr.forEach(item => {
                    if (item.riskLevel === 2) classifiedDangers[region][type].high++;
                    else if (item.riskLevel === 1) classifiedDangers[region][type].medium++;
                    else classifiedDangers[region][type].low++;
                });
            }
        }

        // 计算风险值
        const totalHigh = Object.values(classifiedDangers).reduce((sum, region) => {
            return sum + region.tree.high + region.car.high + region.house.high + region.bird.high;
        }, 0);
        const totalMedium = Object.values(classifiedDangers).reduce((sum, region) => {
            return sum + region.tree.medium + region.car.medium + region.house.medium + region.bird.medium;
        }, 0);
        const dangerousCount = totalHigh + totalMedium;
        const totalSuspicious = Object.values(classifiedDangers).reduce((sum, region) => {
            const treeTotal = region.tree.high + region.tree.medium + region.tree.low;
            const carTotal = region.car.high + region.car.medium + region.car.low;
            const houseTotal = region.house.high + region.house.medium + region.house.low;
            const birdTotal = region.bird.high + region.bird.medium + region.bird.low;
            return sum + treeTotal + carTotal + houseTotal + birdTotal;
        }, 0);
        const riskValue = totalSuspicious > 0 ? dangerousCount / totalSuspicious : 0;

        // 计算平均高度、平均弧垂度、平均张力
        let totalHeight = 0, totalPoints = 0, totalSag = 0, totalTension = 0, lineCount = 0;
        Object.values(allLineData).forEach(lines => {
            (lines || []).forEach(line => {
                if (Array.isArray(line.coordinates)) {
                    line.coordinates.forEach(pt => {
                        if (Array.isArray(pt) && pt.length >= 3 && typeof pt[2] === 'number') {
                            totalHeight += pt[2];
                            totalPoints++;
                        }
                    });
                }
                if (line.metrics) {
                    totalSag += line.metrics.sag || 0;
                    totalTension += line.metrics.tension || 0;
                    lineCount++;
                }
            });
        });
        const avgHeight = totalPoints > 0 ? (totalHeight / totalPoints).toFixed(2) : '--';
        const avgSag = lineCount > 0 ? (totalSag / lineCount).toFixed(2) : '--';
        const avgTension = lineCount > 0 ? (totalTension / lineCount).toFixed(2) : '--';

        // 填充KPI
        document.getElementById('avg-length').innerText = avgHeight;
        document.getElementById('avg-sag').innerText = avgSag;
        document.getElementById('avg-tension').innerText = avgTension;
        document.getElementById('min-height').innerText = totalDangerCount; // 所有危险物数量
        document.getElementById('emergency-danger-count').innerText = dangerousCount;

        // 渲染风险仪表盘
        renderRiskGauge(riskValue);

        // 渲染热力图
        renderHeatmapChart(classifiedDangers);

        // 渲染饼图
        renderPieChart(classifiedDangers);

        // 渲染区域统计
        renderRegionBarLineChart(allLineData);

        // 弧垂热力分布
        renderSagHeatmapMatrix();

        // 响应式
        window.addEventListener('resize', resizeCharts);

    } catch (error) {
        console.error('数据加载失败:', error);
        document.querySelectorAll('.kpi-value').forEach(el => el.textContent = '--');
        document.getElementById('min-height').textContent = '0';
        document.getElementById('emergency-danger-count').textContent = '0';
        renderRiskGauge(0);
    } finally {
        // 隐藏等待图标
        document.getElementById('analysis-loading').style.display = 'none';
    }
});
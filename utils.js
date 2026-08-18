import * as THREE from './js/libs/three.module.js';
import { PLYLoader } from './js/libs/loaders/PLYLoader.js';

export function getColorByType(type) {
    switch (type) {
        case 0: // 塔
            return new THREE.Color(0xCCCCCC); // 浅灰色
        case 1: // 线
            return new THREE.Color(0x202020); // 深黑色
        default:
            return new THREE.Color(0xCCCCCC);
    }
}

export function loadPointCloud(path) {
    return new Promise((resolve, reject) => {
        const loader = new PLYLoader(); 
        loader.load(
            path,
            (geometry) => {
                // 打印所有属性，便于调试
                console.log('geometry.attributes:', geometry.attributes);
                const positions = geometry.attributes.position;
                const colors = geometry.attributes.color;
                let labels = geometry.attributes.labels;

                if (!positions) {
                    reject(new Error('PLY文件缺少position属性'));
                    return;
                }
                if (!labels) {
                    reject(new Error('PLY文件缺少label/labels属性'));
                    return;
                }

                // 分块处理（每 2000 个点为一个块，减少单次计算量）
                const chunkSize = 4000; // 增大分块大小（原2000）
                let index = 0;
                const total = positions.count;
                const towerPoints = [];
                const linePoints = [];

                // --- 优化：避免在循环中重复创建对象 ---
                const reusableVec3 = new THREE.Vector3();
                const reusableColor = new THREE.Color();

                function processChunk() {
                    const end = Math.min(index + chunkSize, total);
                    while (index < end) {
                        const position = reusableVec3.clone().fromArray(positions.array, index * 3);
                        
                        const color = colors?.array 
                            ? reusableColor.clone().fromArray(colors.array, index * 3)
                            : getColorByType(labels.array[index]);
                        
                        const labelValue = Math.round(labels.array[index]);
                        (labelValue === 0 ? towerPoints : linePoints).push({ position, color });
                        index++;
                    }
                    if (index < total) {
                        requestIdleCallback(processChunk); // 使用空闲回调，避免阻塞主线程
                    } else {
                        resolve({ towerPoints, linePoints, count: total });
                    }
                }
                processChunk();
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% 已加载');
            },
            (error) => {
                reject(new Error(`PLY文件加载失败: ${error.message}`));
            }
        );
    });
}
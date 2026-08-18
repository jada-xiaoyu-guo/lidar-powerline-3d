let selectedFile = null;

const fileDropArea = document.getElementById('file-drop-area');
const fileInput = document.getElementById('file-input');
const fileDropText = document.getElementById('file-drop-text');
const startBtn = document.getElementById('start-btn');
const tipDiv = document.getElementById('welcome-tip');
const loadingDiv = document.getElementById('welcome-loading');

// 拖拽文件
fileDropArea.addEventListener('dragover', e => {
    e.preventDefault();
    fileDropArea.style.borderColor = '#2196f3';
    fileInput.value = ''; // 拖拽进入时先清空输入框状态
});

// 点击选择文件（强化重置逻辑）
fileDropArea.addEventListener('click', () => {
    fileInput.value = ''; // 强制清空输入框，确保每次点击都能触发新的选择
    fileInput.click();
});

// 文件选择变化处理（优化文件获取）
fileInput.addEventListener('change', e => {
    const files = e.target.files; // 使用事件对象直接获取最新文件列表
    if (files?.length > 0) { // 可选链语法防止空值错误
        selectedFile = files[0];
        fileDropText.textContent = selectedFile.name; // 更新显示文件名
        tipDiv.textContent = '文件已选择，点击“开始处理”即可自动分割数据。';
        tipDiv.style.color = '#3ecbff';
        startBtn.disabled = false;
    }
});

// 开始处理按钮
startBtn.onclick = async () => {
    if (!selectedFile) {
        tipDiv.textContent = '请您拖入正确文件。';
        tipDiv.style.color = '#e74c3c';
        return;
    }
    // 显示加载信息
    loadingDiv.style.display = 'block';
    tipDiv.style.display = 'none';
    startBtn.disabled = true;

    // 上传文件到远程服务器
    /*try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        // 远程服务器IP和端口
        const res = await fetch('http://172.31.80.1:8888/api/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('上传失败');
        // 上传成功后跳转
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (e) {
        loadingDiv.style.display = 'none';
        tipDiv.style.display = 'block';
        tipDiv.textContent = '文件上传失败，请检查网络或服务器。';
        tipDiv.style.color = '#e74c3c';
        startBtn.disabled = false;
    }
    */
    // 本地处理：直接跳转
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
};
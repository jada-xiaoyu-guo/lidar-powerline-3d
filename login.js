// 写死的账号密码
const USERNAME = "admin";
const PASSWORD = "123456";

document.getElementById('login-btn').onclick = function() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  if (user === USERNAME && pass === PASSWORD) {
    // 登录成功，跳转
    window.location.href = "welcome.html";
  } else {
    errorDiv.textContent = "账号或密码错误";
  }
};

// 支持回车登录
document.getElementById('password').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
});




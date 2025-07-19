// 1. Manejo de visibilidad de contraseña 
function setupPasswordToggle() {
  const passwordInput = document.getElementById('password');
  const togglePassword = document.querySelector('.toggle-password');
  const eyeIcon = document.querySelector('.eye-icon');

  if (!togglePassword || !passwordInput || !eyeIcon) return;

  togglePassword.addEventListener('click', function() {
    const isActive = this.classList.toggle('active');
    passwordInput.type = isActive ? 'text' : 'password';
    eyeIcon.classList.toggle('fa-eye-slash', isActive);
    eyeIcon.classList.toggle('fa-eye', !isActive);
  });
}

// 2. Manejo de notificaciones 
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// 3. Animaciones de campos 
function setupInputAnimations() {
  const inputs = document.querySelectorAll('.form-group input');
  
  inputs.forEach(input => {
    if (!input.placeholder) input.placeholder = ' ';
    if (input.value) input.dispatchEvent(new Event('input'));
    
    input.addEventListener('input', function() {
      const label = this.nextElementSibling;
      label.classList.toggle('active', !!this.value);
    });
  });
}

// 4. Manejo de login 
function handleLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = document.querySelector('.btn');
    const btnLoader = document.querySelector('.btn-loader');
    const btnText = document.querySelector('.btn-text');
    const usernameOrEmail = document.getElementById('usernameOrEmail').value;
    const password = document.getElementById('password').value;

    // Mostrar estado de carga
    btn.classList.add('loading');
    btnLoader.classList.remove('hidden');
    btnText.textContent = 'Iniciando sesión...';
    
    // Validación básica
    if (!usernameOrEmail || !password) {
      showNotification('Por favor completa todos los campos', 'error');
      resetLoginButton(btn, btnLoader, btnText);
      return;
    }
    
    authenticateUser(usernameOrEmail, password, btn, btnLoader, btnText);
  });
}

// 4a. Autenticación 
function authenticateUser(usernameOrEmail, password, btn, btnLoader, btnText) {
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => 
      (u.email === usernameOrEmail || u.username === usernameOrEmail) && 
      u.password === password
    );
    
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      showNotification('Inicio de sesión exitoso', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1500);
    } else {
      showNotification('Credenciales incorrectas', 'error');
      resetLoginButton(btn, btnLoader, btnText);
    }
  }, 1500);
}

// 4b. Resetear botón
function resetLoginButton(btn, btnLoader, btnText) {
  btn.classList.remove('loading');
  btnLoader.classList.add('hidden');
  btnText.textContent = 'Iniciar Sesión';
}

// Punto único de inicialización
document.addEventListener('DOMContentLoaded', function() {
  setupPasswordToggle();
  handleLoginForm();
  setupInputAnimations();
});
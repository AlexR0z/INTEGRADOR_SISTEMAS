document.addEventListener('DOMContentLoaded', function() {
  // Elementos del formulario de registro
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  const strengthProgress = document.querySelector('.strength-progress');
  const strengthText = document.querySelector('.strength-text');
  const submitBtn = registerForm.querySelector('.btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const notification = document.getElementById('notification');

  // Mostrar/ocultar contraseña
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('.eye-icon');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Medidor de fortaleza de contraseña
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    
    // Validaciones
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Actualizar barra
    const width = (strength / 4) * 100;
    strengthProgress.style.width = `${width}%`;
    
    // Cambiar color y texto
    if (strength <= 1) {
      strengthProgress.style.backgroundColor = '#ef233c';
      strengthText.textContent = 'Seguridad: Débil';
      strengthText.style.color = '#ef233c';
    } else if (strength <= 3) {
      strengthProgress.style.backgroundColor = '#f8961e';
      strengthText.textContent = 'Seguridad: Media';
      strengthText.style.color = '#f8961e';
    } else {
      strengthProgress.style.backgroundColor = '#4cc9f0';
      strengthText.textContent = 'Seguridad: Fuerte';
      strengthText.style.color = '#4cc9f0';
    }
  });

  // Validación del formulario
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar campos
    const usernameValid = validateField('username', value => {
      if (value.length < 4) return 'Mínimo 4 caracteres';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y _';
      return '';
    });
    
    const emailValid = validateField('email', value => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
      return '';
    });
    
    const passwordValid = validateField('password', value => {
      if (value.length < 8) return 'Mínimo 8 caracteres';
      return '';
    });
    
    const confirmValid = validateField('confirmPassword', value => {
      if (value !== passwordInput.value) return 'Las contraseñas no coinciden';
      return '';
    });
    
    const termsChecked = document.querySelector('input[name="terms"]').checked;
    
    if (usernameValid && emailValid && passwordValid && confirmValid && termsChecked) {
      // Mostrar carga
      btnText.textContent = 'Registrando...';
      btnLoader.classList.remove('hidden');
      submitBtn.disabled = true;
      
      // Obtener datos del formulario
      const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        createdAt: new Date().toISOString()
      };
      
      // Guardar usuario en localStorage (simulando base de datos)
      saveUser(userData);
      
      // Mostrar mensaje de éxito
      showNotification('¡Registro exitoso! Redirigiendo...', 'success');
      
      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        window.location.href = 'login.html'; // Cambiar por tu URL de login
      }, 2000);
    } else if (!termsChecked) {
      showNotification('Debes aceptar los términos y condiciones', 'error');
    }
  });

  // Función para guardar usuario en localStorage
  function saveUser(user) {
    // Obtener usuarios existentes o inicializar array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar si el usuario o email ya existen
    const userExists = users.some(u => u.username === user.username || u.email === user.email);
    
    if (userExists) {
      showNotification('El usuario o email ya están registrados', 'error');
      return false;
    }
    
    // Agregar nuevo usuario
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  // Validación en tiempo real
  document.getElementById('username').addEventListener('blur', () => {
    validateField('username', value => {
      if (value.length < 4) return 'Mínimo 4 caracteres';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y _';
      return '';
    });
  });
  
  document.getElementById('email').addEventListener('blur', () => {
    validateField('email', value => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
      return '';
    });
  });
  
  passwordInput.addEventListener('blur', () => {
    validateField('password', value => {
      if (value.length < 8) return 'Mínimo 8 caracteres';
      return '';
    });
  });
  
  confirmPasswordInput.addEventListener('blur', () => {
    validateField('confirmPassword', value => {
      if (value !== passwordInput.value) return 'Las contraseñas no coinciden';
      return '';
    });
  });

  // Función de validación genérica
  function validateField(fieldId, validationFn) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    const errorMessage = validationFn(field.value);
    
    if (errorMessage) {
      field.classList.add('invalid');
      field.classList.remove('valid');
      errorElement.textContent = errorMessage;
      return false;
    } else {
      field.classList.remove('invalid');
      field.classList.add('valid');
      errorElement.textContent = '';
      return true;
    }
  }

  // Mostrar notificación
  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
});
document.addEventListener('DOMContentLoaded', function() {
  // Elementos del formulario de registro
  const registerForm = document.getElementById('loginForm');
  if (!registerForm) return;

  const togglePasswordButtons = document.querySelectorAll('.toggle-password');

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
});

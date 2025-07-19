<?php
header("Access-Control-Allow-Origin: *");
require '../php/conexionBD.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $Contrasena = $_POST['Contrasena'];
    $Correo = $_POST['Correo'];

    // Evitar inyecciones SQL
    $Correo = mysqli_real_escape_string($conn, $Correo);

    $sql = "SELECT IDusuario, Nombre, Correo, Contrasena, Roll FROM usuarios WHERE Correo = '$Correo'";
    $result = mysqli_query($conn, $sql);

    if (!$result) {
        die("Error en consulta a la base de datos.");
    }

    $user = mysqli_fetch_assoc($result);

    // Verificar si el correo está registrado
    if ($user) {
        if ($Contrasena == $user['Contrasena']) {
            $_SESSION['user_id'] = $user['IDusuario'];
            $_SESSION['user_name'] = $user['Nombre'];
            $_SESSION['user_email'] = $user['Correo'];

            if ($user['Roll'] === 'usuario') {
                header('Location: ../views/dashboard.php');
                exit();
            }
        } else {
            $error = "Contraseña incorrecta.";
        }
    } else {
        $error = "No existe una cuenta con ese correo electrónico";
    }
} else {
    // No es una petición POST
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sinme-SAC - Login</title>
  <link rel="stylesheet" href="../public/css/auth.css">
</head>
<body>
  <div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <div class="logo-container">
        <img src="../public/image/logo.png" alt="Sinme-SAC Logo" class="logo">
      </div>
      <h2>Iniciar Sesión</h2>
      <p>Bienvenido de vuelta</p>
    </div>
    
    <!-- Cambiamos el action y method para manejarlo con JavaScript -->
    <form id="loginForm" action="" method="POST">
      <div class="form-group">
        <!-- Cambiamos a text para permitir usuario o email -->
        <input type="text" id="usernameOrEmail" name="Correo" required>
        <label for="usernameOrEmail">Usuario o Correo Electrónico</label>
        <span class="focus-border"></span>
        <!-- Agregamos elemento para mensajes de error -->
        <div id="usernameOrEmail-error" class="error-message"></div>
      </div>
      
      <div class="form-group">
        <input type="password" id="password" name="Contrasena" required>
        <label for="password">Contraseña</label>
        <span class="focus-border"></span>
        <!-- Agregamos elemento para mensajes de error -->
        <div id="password-error" class="error-message"></div>
        <button type="button" class="toggle-password" aria-label="Mostrar contraseña">
          <!-- Asumimos que estás usando Font Awesome -->
          <i class="eye-icon fa fa-eye"></i>
        </button>
      </div>
      
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" name="remember" id="remember">
          <span class="checkmark"></span>
          Recordarme
        </label>
      </div>
      <button type="submit" class="btn">
        <span class="btn-text">Ingresar</span>
        <div class="btn-loader hidden">
          <!-- Spinner de carga -->
          <i class="fa fa-spinner fa-spin"></i>
        </div>
      </button>
    </form>
    
    <div class="auth-footer">
      <p>¿No tienes una cuenta? <a href="../views/register.html">Regístrate aquí</a></p>
      <p class="back-link"><a href="../views/index.html"><i class="fas fa-home"></i> Volver a la página principal</a></p>
    </div>
  </div>
  
  <div class="notification hidden" id="notification"></div>
</div>
  
 <script src="../public/js/auth.js"> </script>
</body>
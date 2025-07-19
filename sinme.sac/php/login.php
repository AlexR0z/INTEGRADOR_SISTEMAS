<?php
header("Access-Control-Allow-Origin: *");
require 'conexionBD.php';
SESSION_START();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $Contraseya = $_POST['Contraseña'];
    $Correo = $_POST['Correo'];
    // Evitar inyecciones SQL
    $Correo = mysqli_real_escape_string($conn, $Correo);
 
    $sql = "SELECT IDusuario, Nombre, Correo, Contraseña ,Roll FROM usuarios WHERE Correo = '$Correo'";

    $result = mysqli_query($conn, $sql);
    if ($result) {
        $user = mysqli_fetch_assoc($result);

        // Verificar si el correo está registrado
        if ($user) {
            // Verificar si la contraseña es correcta
            if (password_verify($Contraseya, $user['Contraseña'])) {
                // Contraseña correcta, iniciamos la sesión
                $_SESSION['user_id'] = $user['IDusuario'];
                $_SESSION['user_name'] = $user['Nombre'];
                $_SESSION['user_email'] = $user['Correo'];
                if ($user['Roll']=== 'usuario') {
                    header('Location: ../views/index.html'); // Redirige al usuario normal a la página principal
                } 
                exit();
            }
            else {
                // Contraseña incorrecta
                $error = "Contraseña incorrecta.";
            }
        } else {
            // Usuario no encontrado
            $error = "No existe una cuenta con ese correo electrónico";
        }
    } else {
        // Error en la consulta
        $error = "Error al consultar la base de datos.";
    }
}     
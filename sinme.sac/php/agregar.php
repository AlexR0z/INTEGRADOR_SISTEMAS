<?php
// Archivo: agregar_usuario.php
include 'conexionBD.php';

function agregarUsuario($conn, $Nombre, $Correo, $Contraseña) {
    $hash = password_hash($Contraseña, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO usuarios (Nombre, Correo, Contraseña) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $Nombre, $Correo, $Contraseña);

    if ($stmt->execute()) {
        echo "✅ Usuario agregado correctamente.\n";
    } else {
        echo "❌ Error al agregar usuario: " . $stmt->error . "\n";
    }

    $stmt->close();
}

// Ejemplo de uso
agregarUsuario($conn, "Raul", "Raul@example.com", "111222");
?>

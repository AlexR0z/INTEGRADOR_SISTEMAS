<?php
session_start();
require 'conexionBD.php'; // Asegúrate de que la conexión es correcta

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if ($id) {
        // Obtener ruta de imagen antes de eliminar
        $stmt = $conn->prepare("SELECT Imagen_url FROM productos WHERE IDproducto = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $producto = $result->fetch_assoc();
        $stmt->close();

        if ($producto) {
            $ruta_imagen = '../public/image/productos/' . $producto['Imagen_url'];
            if (file_exists($ruta_imagen)) {
                unlink($ruta_imagen); // Eliminar archivo físico
            }

            // Eliminar producto
            $stmt = $conn->prepare("DELETE FROM productos WHERE IDproducto = ?");
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'No se pudo eliminar.']);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'error' => 'Producto no encontrado.']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'ID no proporcionado.']);
    }
}
?>

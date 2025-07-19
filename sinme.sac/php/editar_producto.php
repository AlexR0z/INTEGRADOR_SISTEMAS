<?php
session_start();
require 'conexionBD.php'; // Ajusta si está en otra ruta

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['productID'] ?? null;
    $nombre = $_POST['productName'] ?? '';
    $precio = $_POST['productPrice'] ?? '';
    $stock = $_POST['productStock'] ?? '';
    $categoria_id = $_POST['productCategory'] ?? '';

    if (!$id || empty($nombre) || empty($precio) || empty($stock) || empty($categoria_id)) {
        echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE productos SET Nombre = ?, Precio = ?, Stock = ?, CategoriaID = ? WHERE IDproducto = ?");
    $stmt->bind_param("sdiii", $nombre, $precio, $stock, $categoria_id, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo actualizar.']);
    }

    $stmt->close();
}
?>

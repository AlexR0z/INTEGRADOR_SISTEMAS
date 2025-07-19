<?php
header("Access-Control-Allow-Origin: *");
require 'conexionBD.php';

// Verificar si ya existe el correo
$correo = $conn->real_escape_string($_POST['Correo']);
$sql = "SELECT * FROM usuarios WHERE Correo = '$correo'";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
  echo json_encode(["success" => false, "message" => "El correo ya está registrado"]);
  exit;
}

if(isset($_POST['Nombre']) && isset($_POST['Correo']) && isset($_POST['Contrasena']))
{
  $nombre = $conn->real_escape_string($_POST['Nombre']);
  $correo = $conn->real_escape_string($_POST['Correo']);
  $contrasena = $_POST['Contrasena'];

  $sql = "INSERT INTO usuarios (Nombre, Correo, Contrasena) VALUES ('$nombre', '$correo', '$contrasena')";
  $conn->query($sql);
  header('Location: ../views/login.php');
  exit();
}
$conn->close();
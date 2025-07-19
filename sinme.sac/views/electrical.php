<?php
session_start();
require '../php/conexionBD.php'; // Conexión a la base de datos

// Verifica si el formulario fue enviado
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recibir datos del formulario
    $nombre = $_POST['productName'] ?? '';
    $precio = $_POST['productPrice'] ?? '';
    $stock = $_POST['productStock'] ?? '';
    $categoria_id = $_POST['productCategory'] ?? '';

    // Validación de los campos
    if (empty($nombre) || empty($precio) || empty($stock) || empty($categoria_id)) {
        $_SESSION['mensaje_error'] = "Todos los campos son obligatorios.";
        header('Location: electrical.php');
        exit;
    }

    // Verifica si se cargó la imagen
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
        $imagen = $_FILES['imagen'];
        $extensiones_permitidas = ['jpg', 'jpeg', 'png', 'gif'];
        $imagen_extension = pathinfo($imagen['name'], PATHINFO_EXTENSION);

        if (in_array(strtolower($imagen_extension), $extensiones_permitidas)) {
            // Obtener el nombre de la categoría (no el ID) para la carpeta
            $query = $conn->prepare("SELECT Nombre FROM categorias WHERE CategoriaID = ?");
            $query->bind_param("i", $categoria_id);
            $query->execute();
            $resultado = $query->get_result();
            $categoria_data = $resultado->fetch_assoc();
            $query->close();

            if (!$categoria_data) {
                $_SESSION['mensaje_error'] = "Categoría no encontrada.";
                header('Location: electrical.php');
                exit;
            }

            $nombre_categoria = $categoria_data['Nombre'];

            // --- CAMBIOS CLAVE AQUÍ ---

            // Ruta de la subcarpeta de categoría (ej. 'hogar/')
            $subcarpeta_categoria = strtolower(str_replace(' ', '_', $nombre_categoria)) . '/';

            // Ruta ABSOLUTA en el servidor donde se almacenarán los archivos
            // public_html/img/productos/
            $directorio_base_imagenes = realpath(__DIR__ . '/../public/image/productos/');

            // Verificar si el directorio base de imágenes existe
            if (!$directorio_base_imagenes || !is_dir($directorio_base_imagenes)) {
                $_SESSION['mensaje_error'] = "Error: El directorio base de imágenes 'img/productos/' no existe o no es accesible.";
                header('Location: electrical.php');
                exit;
            }

            // Construir el directorio completo para la categoría
            $directorio_destino_real = $directorio_base_imagenes . '/' . $subcarpeta_categoria;

            // Asegurarse de que el directorio de la categoría exista
            if (!is_dir($directorio_destino_real)) {
                if (!mkdir($directorio_destino_real, 0777, true)) { // 0777 permisos, true para recursivo
                    $_SESSION['mensaje_error'] = "Error: No se pudo crear el directorio para la categoría de imágenes.";
                    header('Location: electrical.php');
                    exit;
                }
            }
            // --- FIN CAMBIOS CLAVE ---
            // Guardar con nombre único
            $nombre_imagen = uniqid() . '.' . $imagen_extension;
            $ruta_completa_destino_fisico = $directorio_destino_real . '/' . $nombre_imagen;


            if (move_uploaded_file($imagen['tmp_name'], $ruta_completa_destino_fisico)) {
                // Guardar SOLO la ruta relativa a img/productos/ en la base de datos
                $ruta_guardada_en_db = $subcarpeta_categoria . $nombre_imagen; // <-- ¡Esto es lo que pediste!

                // Insertar en la base de datos
                $stmt = $conn->prepare("INSERT INTO productos (Nombre, Precio, Stock, CategoriaID, Imagen_url) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sdiss", $nombre, $precio, $stock, $categoria_id, $ruta_guardada_en_db);

                if ($stmt->execute()) {
                    $_SESSION['mensaje'] = "Producto añadido con éxito.";
                    header('Location: electrical.php');
                    exit;
                } else {
                    $_SESSION['mensaje_error'] = "Error al insertar el producto en la base de datos: " . $stmt->error;
                    header('Location: electrical.php');
                    exit;
                }

                $stmt->close();
            } else {
                $_SESSION['mensaje_error'] = "Error al mover la imagen al directorio de destino.";
                header('Location: electrical.php');
                exit;
            }
        } else {
            $_SESSION['mensaje_error'] = "Solo se permiten imágenes JPG, JPEG, PNG y GIF.";
            header('Location: electrical.php');
            exit;
        }
    } else {
        $_SESSION['mensaje_error'] = "Error al subir la imagen o no se seleccionó ninguna imagen.";
        header('Location: electrical.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sinme-SAC - Herramientas</title>

    <link rel="stylesheet" href="../public/css/productos.css">
</head>

<body>
    <div class="dashboard-container">
        <aside class="sidebar" aria-label="Menú principal">
            <div class="sidebar-header">
                <a href="dashboard.html" aria-current="page">
                    <img src="../public/image/logo.png" alt="Sinme-SAC Logo" width="150" height="50">
                </a>
                <h3>Panel de Control</h3>
            </div>

            <nav class="sidebar-nav" aria-label="Navegación principal">
                <ul role="menu">
                    <li role="menuitem">
                        <a href="dashboard.php" class="nav-link">
                            <span class="icon">🏠</span>
                            <span class="text">Inicio</span>
                        </a>
                    </li>
                    <li role="menuitem">
                        <a href="herramientas.php" class="nav-link">
                            <span class="icon">🛠️</span>
                            <span class="text">Herramientas</span>
                        </a>
                    </li>
                    <li role="menuitem" class="active">
                        <a href="electrical.php" class="nav-link" aria-current="page">
                            <span class="icon">💡</span>
                            <span class="text">Materiales Eléctricos</span>
                        </a>
                    </li>
                    <li role="menuitem">
                        <a href="sanitary.php" class="nav-link">
                            <span class="icon">🚿</span>
                            <span class="text">Materiales Sanitarios</span>
                        </a>
                    </li>
                    <li role="menuitem" class="logout-item">
                        <a href="login.php" class="nav-link">
                            <span class="icon">🔒</span>
                            <span class="text">Cerrar Sesión</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>

        <main class="main-content" id="main-content">
            <header class="main-header">
                <div class="header-content">
                    <h1>Materiales Electricos</h1>
                    <p class="subtitle">Gestión de inventario</p>
                </div>
                <button class="btn primary-btn" id="addProductBtn" aria-label="Agregar nuevo producto">
                    <span class="btn-icon">+</span> Agregar Producto
                </button>
            </header>

            <section class="products-section" aria-labelledby="products-heading">
                <div class="section-header">
                    <h2 id="products-heading">Inventario Actual</h2>
                    <div class="search-filter">
                        <input type="text" id="productSearch" placeholder="Buscar herramientas..."
                            aria-label="Buscar herramientas">
                        <select id="productFilter" aria-label="Filtrar herramientas">
                            <option value="all">Todos</option>
                            <option value="low-stock">Bajo stock</option>
                            <option value="high-price">Mayor precio</option>
                            <option value="low-price">Menor precio</option>
                        </select>
                    </div>
                </div>

                <div class="products-grid" role="grid" aria-label="Lista de herramientas">
                    <?php
                    $query = "SELECT p.IDproducto, p.Nombre, p.Precio, p.Stock, p.Imagen_url, c.Nombre AS CategoriaNombre
                    FROM productos p 
                    INNER JOIN categorias c ON p.CategoriaID = c.CategoriaID
                    where p.CategoriaID = 3";
                    

                    $result = $conn->query($query);

                    if ($result && $result->num_rows > 0):
                        while ($producto = $result->fetch_assoc()):
                            $imagen_relativa = '../public/image/productos/' . htmlspecialchars($producto['Imagen_url']);
                            $stock = (int) $producto['Stock'];
                            $stock_class = $stock <= 5 ? 'low-stock' : '';
                            $stock_icon = $stock <= 5 ? '⚠️ Bajo stock:' : '✔️ Stock:';
                            ?>
                            <article class="product-card" role="gridcell" data-id="prod<?php echo $producto['IDproducto']; ?>"
                                data-category="<?php echo strtolower($producto['CategoriaNombre']); ?>">
                                <div class="product-image-container">
                                    <img src="<?php echo $imagen_relativa; ?>"
                                        alt="<?php echo htmlspecialchars($producto['Nombre']); ?>" class="product-image"
                                        loading="lazy" width="300" height="200">
                                </div>
                                <div class="product-info">
                                    <h3 class="product-title"><?php echo htmlspecialchars($producto['Nombre']); ?></h3>
                                    <p class="product-sku">ID: <?php echo $producto['IDproducto']; ?></p>

                                    <div class="price-container">
                                        <p class="price">S/ <?php echo number_format($producto['Precio'], 2); ?></p>
                                    </div>

                                    <div class="stock-container">
                                        <p class="stock <?php echo $stock_class; ?>">
                                            <span class="stock-icon"><?php echo $stock_icon; ?></span> <?php echo $stock; ?>
                                            unidades
                                        </p>
                                    </div>

                                    <div class="product-actions">
                                        <button class="btn-sm edit-btn" data-id="<?php echo $producto['IDproducto']; ?>">
                                            Editar
                                        </button>
                                        <button class="btn-sm delete-btn" data-id="<?php echo $producto['IDproducto']; ?>">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </article>
                            <?php
                        endwhile;
                    else:
                        ?>
                        <p>No hay productos registrados.</p>
                    <?php endif; ?>

                </div>
            </section>
        </main>
    </div>

    <!-- Modal para agregar/editar productos -->
    <dialog id="productModal" aria-labelledby="modal-title" >
        <div class="modal-content">
            <h2 id="modal-title">Agregar Nueva Herramienta</h2>
            <form id="productForm" action="" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="productName">Nombre de la Herramienta</label>
                    <input type="text" id="productName" name="productName" required>
                </div>
                <div class="form-group">
                    <label for="productCategory">Categoría</label>
                    <select id="productCategory" name="productCategory" required>
                        <?php
                        $query = "SELECT CategoriaID, Nombre FROM categorias WHERE Nombre = 'Materiales Electricos' LIMIT 1";
                        $result = $conn->query($query);

                        if ($result && $result->num_rows > 0) {
                            $categoria = $result->fetch_assoc();
                            echo "<option value='" . htmlspecialchars($categoria['CategoriaID']) . "' selected>" . htmlspecialchars($categoria['Nombre']) . "</option>";
                        } else {
                            echo "<option value=''>Categoría 'Materiales Electricos' no encontrada</option>";
                        }
                        ?>
                    </select>
                </div>
                <div class="form-group">
                    <label for="productPrice">Precio (S/)</label>
                    <input type="number" id="productPrice" name="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="productStock">Stock</label>
                    <input type="number" id="productStock" name="productStock" required>
                </div>
                <div class="form-group">
                    <label for="productImage">Imagen del Producto</label>
                    <div class="image-upload-container">
                        <input type="file" id="productImage" name="imagen" accept="image/*" style="display: none;">
                        <label for="productImage" class="image-upload-label">
                            <span id="imagePreviewText">Haz clic para subir una imagen</span>
                            <img id="imagePreview" style="display: none; max-width: 100%; max-height: 150px;">
                        </label>
                    </div>
                </div>
                <button class="btn secondary-btn" id="cancelModal">Cancelar</button>
                <button class="btn primary-btn" id="submitModal" type="submit">Guardar</button>
            </form>

        </div>
    </dialog>
    <script src="../public/js/herramientas.js"> </script>
</body>
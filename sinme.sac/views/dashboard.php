<?php
// Conexión a la base de datos
require_once '../php/conexionBD.php'; // Asegúrate que este archivo tenga la conexión $conn
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sinme-SAC - Dashboard</title>

    <link rel="stylesheet" href="../public/css/dashboard.css">

    <!-- Incluir jsPDF para generación de PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
</head>

<body>
    <div class="dashboard-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="../views/dashboard.html" aria-current="page">
                    <img src="../public/image/logo.png" alt="Sinme-SAC Logo" width="150" height="50">
                </a>
                <h3>Panel de Control</h3>
            </div>

            <nav class="sidebar-nav">
                <ul>
                    <li class="active"><a href="dashboard.html" class="nav-link"><span class="icon">🏠</span>Inicio</a>
                    </li>
                    <li><a href="herramientas.php" class="nav-link"><span class="icon">🛠️</span>Herramientas</a></li>
                    <li><a href="electrical.php" class="nav-link"><span class="icon">💡</span>Materiales Eléctricos</a>
                    </li>
                    <li><a href="sanitary.php" class="nav-link"><span class="icon">🚿</span>Materiales Sanitarios</a>
                    </li>
                    <li class="logout-item"><a href="index.html" class="nav-link"><span class="icon">🔒</span>Cerrar
                            Sesión</a></li>
                </ul>
            </nav>
        </aside>

        <main class="main-content">
            <header class="main-header">
                <div class="header-content">
                    <h1>Resumen General</h1>
                    <p class="subtitle">Vista panorámica de tu inventario</p>
                </div>
                <button class="btn primary-btn" id="generateReportBtn">
                    <span class="btn-icon">+</span> Generar Reporte
                </button>
            </header>

            <section class="stats">
                <div class="stat-card">
                    <div class="stat-icon"
                        style="background-color: rgba(67, 97, 238, 0.1); color: var(--primary-color);">📦</div>
                    <h3>Productos Totales</h3>
                    <p id="totalProducts">0</p>

                </div>
                <div class="stat-card">
                    <div class="stat-icon"
                        style="background-color: rgba(247, 37, 133, 0.1); color: var(--danger-color);">🛠️</div>
                    <h3>Herramientas</h3>
                    <p id="toolsCount">0</p>

                </div>
                <div class="stat-card">
                    <div class="stat-icon"
                        style="background-color: rgba(72, 149, 239, 0.1); color: var(--accent-color);">💡</div>
                    <h3>Materiales Eléctricos</h3>
                    <p id="electricalCount">0</p>

                </div>
                <div class="stat-card">
                    <div class="stat-icon"
                        style="background-color: rgba(76, 201, 240, 0.1); color: var(--success-color);">🚿</div>
                    <h3>Materiales Sanitarios</h3>
                    <p id="sanitaryCount">0</p>

                </div>
            </section>

            <section class="products-section">
                <div class="section-header">
                    <h2>Productos con stock bajo</h2>
                    <div class="search-filter">
                        <select id="categoryFilter">
                            <option value="all">Todas las categorías</option>
                            <option value="tools">Herramientas</option>
                            <option value="electrical">Materiales Eléctricos</option>
                            <option value="sanitary">Materiales Sanitarios</option>
                        </select>
                    </div>
                </div>

                <div class="products-grid" id="productsGrid">
                    <!-- Los productos se cargarán dinámicamente con JavaScript -->
                    <?php
                    $query = "SELECT p.IDproducto, p.Nombre, p.Precio, p.Stock, p.Imagen_url, c.Nombre AS Categoria
                    FROM productos p
                    INNER JOIN categorias c ON p.CategoriaID = c.CategoriaID
                    WHERE p.Stock <= 20
                    ORDER BY p.Stock ASC";

                    $result = $conn->query($query);

                    if ($result->num_rows > 0) {
                        while ($producto = $result->fetch_assoc()) {
                            $categoriaSlug = strtolower($producto['Categoria']) === 'herramientas' ? 'tools' :
                                (strtolower($producto['Categoria']) === 'materiales eléctricos' ? 'electrical' :
                                    (strtolower($producto['Categoria']) === 'materiales sanitarios' ? 'sanitary' : 'otros'));

                            // Ruta absoluta desde raíz del proyecto (asumiendo que accedes por http://localhost/sinme.sac/)
                            $imagenUrl = "/sinme.sac/public/image/productos/" . htmlspecialchars($producto['Imagen_url']);

                            echo "<div class='product-card' data-category='{$categoriaSlug}' data-id='{$producto['IDproducto']}'>
            <div class='product-image-container'>
                <img src='{$imagenUrl}' 
                     alt='" . htmlspecialchars($producto['Nombre']) . "' 
                     class='product-image'>
            </div>
            <div class='product-info'>
                <h4 class='product-title'>" . htmlspecialchars($producto['Nombre']) . "</h4>
                <div class='price-container'>
                    <span class='price'>S/ " . number_format($producto['Precio'], 2) . "</span>
                </div>
                <div class='stock-container'>
                    <span class='stock " . ($producto['Stock'] <= 3 ? 'low-stock' : '') . "'>
                        <span class='stock-icon'>" . ($producto['Stock'] <= 3 ? '⚠️' : '📦') . "</span> 
                        {$producto['Stock']} " . ($producto['Stock'] === 1 ? 'unidad' : 'unidades') . "
                    </span>
                </div>
                <div class='product-actions'>
                    <button class='btn edit-btn btn-sm reponer-btn'>Reponer</button>
                    <button class='btn secondary-btn btn-sm detalles-btn'>Detalles</button>
                </div>
            </div>
        </div>";
                        }
                    } else {
                        echo "<p>No hay productos con stock bajo.</p>";
                    }

                    ?>
                </div>
            </section>
        </main>
    </div>

    <!-- Modal para reposición -->
    <div class="modal" id="repositionModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Reponer Stock</h3>
                <button class="close-modal">&times;</button>
            </div>
            <form id="repositionForm">
                <input type="hidden" id="productId">
                <div class="form-group">
                    <label for="productName">Producto</label>
                    <input type="text" id="productName" readonly>
                </div>
                <div class="form-group">
                    <label for="currentStock">Stock Actual</label>
                    <input type="text" id="currentStock" readonly>
                </div>
                <div class="form-group">
                    <label for="quantityToAdd">Cantidad a agregar</label>
                    <input type="number" id="quantityToAdd" min="1" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn secondary-btn close-modal">Cancelar</button>
                    <button type="submit" class="btn primary-btn">Confirmar</button>
                </div>
            </form>
        </div>
    </div>
    <script src="../public/js/dashboard.js"></script>
</body>
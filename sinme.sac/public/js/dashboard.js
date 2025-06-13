// Hacer jsPDF disponible globalmente
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos desde localStorage o usar datos de ejemplo
    const allProducts = JSON.parse(localStorage.getItem('allProducts')) || [
        // Datos de ejemplo iniciales
                    {
                        id: 1,
                        name: "Taladro Percutor 650W",
                        title: "Taladro Percutor 650W",
                        sku: "HERR-TAL650W",
                        price: 249.00,
                        stock: 3,
                        category: "tools",
                        image: "https://images.unsplash.com/photo-15854438784894-089d6a62b8fa?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=180&w=280"
                    },
    ];

    // Guardar los datos iniciales si no existen
    if (!localStorage.getItem('allProducts')) {
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
    }

    // Datos para el dashboard
    const dashboardData = {
        get totalProducts() { return allProducts.length; },
        get tools() { return allProducts.filter(p => p.category === 'tools').length; },
        get electrical() { return allProducts.filter(p => p.category === 'electrical').length; },
        get sanitary() { return allProducts.filter(p => p.category === 'sanitary').length; },
        get lowStockProducts() { return allProducts.filter(p => p.stock <= 20); }
    };

    // Elementos del modal
    const modal = document.getElementById('repositionModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const repositionForm = document.getElementById('repositionForm');
    let currentProduct = null;

    // 1. Actualizar estadísticas
    updateStatistics();

    // 2. Cargar productos con stock bajo
    loadLowStockProducts();

    // 3. Manejar el botón de generar reporte
    document.getElementById('generateReportBtn').addEventListener('click', generatePDFReport);

    // 4. Manejar el filtro de categorías
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // 5. Manejar eventos de los botones de producto
    setupProductButtons();

    // Eventos del modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    repositionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const quantity = parseInt(document.getElementById('quantityToAdd').value);
        if (quantity > 0 && currentProduct) {
            reponerProducto(currentProduct, quantity);
            modal.style.display = 'none';
        }
    });

    function updateStatistics() {
        document.getElementById('totalProducts').textContent = dashboardData.totalProducts;
        document.getElementById('toolsCount').textContent = dashboardData.tools;
        document.getElementById('electricalCount').textContent = dashboardData.electrical;
        document.getElementById('sanitaryCount').textContent = dashboardData.sanitary;
    }

    function loadLowStockProducts() {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = ''; // Limpiar contenedor

        dashboardData.lowStockProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.category = product.category;
            productCard.dataset.id = product.id;

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h4 class="product-title">${product.name}</h4>
                    <p class="product-sku">SKU: ${product.sku}</p>
                    <div class="price-container">
                        <span class="price">S/ ${product.price.toFixed(2)}</span>
                    </div>
                    <div class="stock-container">
                        <span class="stock ${product.stock <= 3 ? 'low-stock' : ''}">
                            <span class="stock-icon">${product.stock <= 3 ? '⚠️' : '📦'}</span> 
                            ${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}
                        </span>
                    </div>
                    <div class="product-actions">
                        <button class="btn edit-btn btn-sm reponer-btn">Reponer</button>
                        <button class="btn secondary-btn btn-sm detalles-btn">Detalles</button>
                    </div>
                </div>
            `;

            productsGrid.appendChild(productCard);
        });
    }

    function filterProducts() {
        const filterValue = this.value;
        const allProducts = document.querySelectorAll('.product-card');

        allProducts.forEach(product => {
            if (filterValue === "all" || product.dataset.category === filterValue) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    function setupProductButtons() {
        document.getElementById('productsGrid').addEventListener('click', function(e) {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const productId = card.dataset.id;
            const product = dashboardData.lowStockProducts.find(p => p.id == productId);

            if (e.target.classList.contains('reponer-btn')) {
                showRepositionModal(product);
            } else if (e.target.classList.contains('detalles-btn')) {
                verDetallesProducto(product);
            }
        });
    }

    function showRepositionModal(product) {
        currentProduct = product;
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('currentStock').value = `${product.stock} unidades`;
        document.getElementById('quantityToAdd').value = '';
        modal.style.display = 'flex';
    }

    function reponerProducto(product, quantity) {
        // Actualizar el producto en los datos
        const productIndex = allProducts.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
            allProducts[productIndex].stock += quantity;
            
            // Guardar en localStorage
            localStorage.setItem('allProducts', JSON.stringify(allProducts));
            
            // Actualizar la UI
            updateStatistics();
            loadLowStockProducts();
            
            // Notificación visual
            showNotification(`Se repusieron ${quantity} unidades de ${product.name}. Stock actual: ${allProducts[productIndex].stock}`, "success");
        }
    }

    function verDetallesProducto(product) {
        showNotification(`Detalles de ${product.name}: SKU ${product.sku}, Precio: S/${product.price.toFixed(2)}, Stock: ${product.stock} unidades`, "info");
    }

    function generatePDFReport() {
        // Crear un nuevo documento PDF
        const doc = new jsPDF();
        
        // Título del reporte
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('Reporte de Inventario', 105, 20, { align: 'center' });
        
        // Fecha del reporte
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Estadísticas generales
        doc.setFontSize(14);
        doc.text('Resumen General', 14, 45);
        
        doc.setFontSize(12);
        doc.text(`Productos Totales: ${dashboardData.totalProducts}`, 20, 55);
        doc.text(`Herramientas: ${dashboardData.tools}`, 20, 65);
        doc.text(`Materiales Eléctricos: ${dashboardData.electrical}`, 20, 75);
        doc.text(`Materiales Sanitarios: ${dashboardData.sanitary}`, 20, 85);
        
        // Productos con stock bajo
        doc.setFontSize(14);
        doc.text('Productos con Stock Bajo', 14, 105);
        
        // Tabla de productos
        const headers = [['Nombre', 'SKU', 'Categoría', 'Stock', 'Precio']];
        const data = dashboardData.lowStockProducts
            .filter(p => p.stock <= 19)
            .map(p => [
                p.name, 
                p.sku, 
                p.category === 'tools' ? 'Herramientas' : 
                 p.category === 'electrical' ? 'Materiales Eléctricos' : 'Materiales Sanitarios',
                p.stock,
                `S/ ${p.price.toFixed(2)}`
            ]);
        
        doc.autoTable({
            startY: 110,
            head: headers,
            body: data,
            theme: 'grid',
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: 255
            },
            styles: {
                cellPadding: 3,
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 'auto' }
            }
        });
        
        // Guardar el PDF
        doc.save(`reporte_inventario_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showNotification("Reporte PDF generado con éxito", "success");
    }

    function showNotification(message, type) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Añadir estilos
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = 'var(--border-radius)';
        notification.style.color = 'white';
        notification.style.fontWeight = '500';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.zIndex = '1000';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
        } else if (type === 'info') {
            notification.style.backgroundColor = 'var(--accent-color)';
        } else if (type === 'error') {
            notification.style.backgroundColor = 'var(--danger-color)';
        }
        
        // Añadir al cuerpo
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});
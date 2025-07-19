document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const cancelModal = document.getElementById('cancelModal');
    const submitModal = document.getElementById('submitModal');
    const productForm = document.getElementById('productForm');
    const productSearch = document.getElementById('productSearch');
    const productFilter = document.getElementById('productFilter');
    const productsGrid = document.querySelector('.products-grid');
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    // Cargar todos los productos desde localStorage
    let allProducts = JSON.parse(localStorage.getItem('allProducts')) || [];
    
    // Filtrar solo productos sanitarios para esta vista
    let sanitaryProducts = allProducts.filter(p => p.category === 'sanitary');
    
    // Si no hay productos sanitarios, crear algunos de ejemplo
    if (sanitaryProducts.length === 0) {
        sanitaryProducts = [
            {
                id: 'prod101',
                name: 'Grifo Monocomando',
                title: 'Grifo Monocomando',
                sku: 'SAN-GRIFMONO',
                price: 89.90,
                stock: 5,
                category: 'sanitary',
                subcategory: 'griferia',
                image: '/images/grifo-monocomando.jpg'
            },
            {
                id: 'prod102',
                name: 'Tubería PVC 1/2" x 6m',
                title: 'Tubería PVC 1/2" x 6m',
                sku: 'SAN-TUBPVC12',
                price: 18.50,
                stock: 25,
                category: 'sanitary',
                subcategory: 'tuberias',
                image: '/images/tuberia-pvc.jpg'
            },
            {
                id: 'prod103',
                name: 'Inodoro Una Pieza',
                title: 'Inodoro Una Pieza',
                sku: 'SAN-INODORO1',
                price: 320.00,
                stock: 7,
                category: 'sanitary',
                subcategory: 'sanitarios',
                image: '/images/inodoro.jpg'
            },
            {
                id: 'prod104',
                name: 'Lavatorio de Porcelana',
                title: 'Lavatorio de Porcelana',
                sku: 'SAN-LAVPORC',
                price: 145.00,
                stock: 2,
                category: 'sanitary',
                subcategory: 'sanitarios',
                image: '/images/lavatorio.jpg'
            }
        ];
        
        // Actualizar la lista completa de productos
        allProducts = [...allProducts, ...sanitaryProducts];
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
    }
    
    // Función para guardar productos
    function saveProducts() {
        // Actualizar la lista completa
        const nonSanitary = allProducts.filter(p => p.category !== 'sanitary');
        allProducts = [...nonSanitary, ...sanitaryProducts];
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
    }
    
    // Variables para edición
    let currentProductId = null;
    let isEditing = false;
    let currentImageFile = null;
    
    // Mostrar vista previa de la imagen
    productImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            currentImageFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Mostrar productos en el grid
    function renderProducts(productsToRender) {
        productsGrid.innerHTML = '';
        
        productsToRender.forEach(product => {
            const isLowStock = product.stock <= 20;
            
            const productCard = document.createElement('article');
            productCard.className = 'product-card';
            productCard.setAttribute('role', 'gridcell');
            productCard.setAttribute('data-id', product.id);
            productCard.setAttribute('data-category', product.subcategory || product.category);
            
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.image}" 
                         alt="${product.title}" 
                         class="product-image"
                         loading="lazy"
                         width="300"
                         height="200">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-sku">${product.sku}</p>
                    
                    <div class="price-container">
                        <p class="price">S/ ${product.price.toFixed(2)}</p>
                    </div>
                    
                    <div class="stock-container">
                        <p class="stock ${isLowStock ? 'low-stock' : ''}">
                            <span class="stock-icon">${isLowStock ? '⚠️' : '✔️'}</span> 
                            ${isLowStock ? 'Bajo stock' : 'Stock'}: ${product.stock} unidades
                        </p>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-sm edit-btn" data-id="${product.id}">
                            Editar
                        </button>
                        <button class="btn-sm delete-btn" data-id="${product.id}">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });
        
        // Agregar event listeners a los botones de editar y eliminar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditProduct);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteProduct);
        });
    }
    
    // Filtrar y buscar productos
    function filterProducts() {
        const searchTerm = productSearch.value.toLowerCase();
        const filterValue = productFilter.value;
        
        let filteredProducts = sanitaryProducts.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchTerm) || 
                                 product.sku.toLowerCase().includes(searchTerm);
            
            if (filterValue === 'all') return matchesSearch;
            if (filterValue === 'low-stock') return matchesSearch && product.stock <= 5;
            if (filterValue === 'high-price') return matchesSearch && product.price > 100;
            if (filterValue === 'low-price') return matchesSearch && product.price <= 100;
            
            return matchesSearch;
        });
        
        renderProducts(filteredProducts);
    }
    
    // Manejar la adición de nuevo producto
    function handleAddProduct() {
        isEditing = false;
        currentProductId = null;
        productForm.reset();
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        currentImageFile = null;
        document.getElementById('modal-title').textContent = 'Agregar Nuevo Producto Sanitario';
        productModal.showModal();
    }
    
    // Manejar la edición de producto
    function handleEditProduct(e) {
        isEditing = true;
        const productId = e.target.getAttribute('data-id');
        currentProductId = productId;
        
        const product = sanitaryProducts.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productName').value = product.title;
            document.getElementById('productCategory').value = product.subcategory || product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            
            // Mostrar imagen actual en vista previa
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
            currentImageFile = null;
            
            document.getElementById('modal-title').textContent = 'Editar Producto Sanitario';
            productModal.showModal();
        }
    }
    
    // Convertir imagen a Base64 para almacenamiento
    function getImageBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    // Manejar el envío del formulario (añadir/editar)
    async function handleSubmitProduct() {
        const name = document.getElementById('productName').value;
        const subcategory = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        
        if (!name || !subcategory || isNaN(price) || isNaN(stock)) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }
        
        try {
            let imageUrl = '/images/sanitario-default.jpg';
            
            if (currentImageFile) {
                imageUrl = await getImageBase64(currentImageFile);
            } else if (isEditing) {
                const existingProduct = sanitaryProducts.find(p => p.id === currentProductId);
                if (existingProduct) imageUrl = existingProduct.image;
            }
            
            if (isEditing) {
                const index = sanitaryProducts.findIndex(p => p.id === currentProductId);
                if (index !== -1) {
                    sanitaryProducts[index] = {
                        ...sanitaryProducts[index],
                        name: name,
                        title: name,
                        subcategory: subcategory,
                        category: 'sanitary', // Asegurar que la categoría principal sea sanitary
                        price: price,
                        stock: stock,
                        image: imageUrl
                    };
                }
            } else {
                const newId = 'prod' + (allProducts.length + 1 + Math.floor(Math.random() * 1000));
                const newSku = 'SAN-' + name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100);
                
                sanitaryProducts.push({
                    id: newId,
                    name: name,
                    title: name,
                    sku: newSku,
                    price: price,
                    stock: stock,
                    category: 'sanitary',
                    subcategory: subcategory,
                    image: imageUrl
                });
            }
            
            saveProducts();
            productModal.close();
            renderProducts(sanitaryProducts);
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al procesar la imagen.');
        }
    }
    
    // Manejar eliminación de producto
    function handleDeleteProduct(e) {
        if (confirm('¿Está seguro que desea eliminar este producto?')) {
            const productId = e.target.getAttribute('data-id');
            sanitaryProducts = sanitaryProducts.filter(product => product.id !== productId);
            saveProducts();
            renderProducts(sanitaryProducts);
        }
    }
    
    // Event Listeners
    addProductBtn.addEventListener('click', handleAddProduct);
    cancelModal.addEventListener('click', () => productModal.close());
    submitModal.addEventListener('click', handleSubmitProduct);
    productSearch.addEventListener('input', filterProducts);
    productFilter.addEventListener('change', filterProducts);
    
    // Cerrar modal al hacer clic fuera de él
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.close();
        }
    });
    
    // Inicializar la vista
    renderProducts(sanitaryProducts);
});
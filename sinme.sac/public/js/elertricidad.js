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
    
    // Filtrar solo productos eléctricos para esta vista
    let electricalProducts = allProducts.filter(p => p.category === 'electrical');
    
    // Si no hay productos eléctricos, crear algunos de ejemplo
    if (electricalProducts.length === 0) {
        electricalProducts = [
            {
                id: 'prod001',
                name: 'Foco LED 12W',
                title: 'Foco LED 12W',
                sku: 'ELEC-FCLED12',
                price: 12.90,
                stock: 8,
                category: 'electrical',
                subcategory: 'iluminacion',
                image: '/images/foco-led.jpg'
            },
            {
                id: 'prod002',
                name: 'Cable THW 2.5mm',
                title: 'Cable THW 2.5mm',
                sku: 'ELEC-CBL25',
                price: 185.00,
                stock: 15,
                category: 'electrical',
                subcategory: 'cables',
                image: '/images/cable-electrico.jpg'
            },
            {
                id: 'prod003',
                name: 'Interruptor Simple',
                title: 'Interruptor Simple',
                sku: 'ELEC-INTSIMP',
                price: 8.50,
                stock: 22,
                category: 'electrical',
                subcategory: 'interruptores',
                image: '/images/interruptor.jpg'
            },
            {
                id: 'prod005',
                name: 'Breaker 20A 2P',
                title: 'Breaker 20A 2P',
                sku: 'ELEC-BRK20A',
                price: 32.00,
                stock: 3,
                category: 'electrical',
                subcategory: 'proteccion',
                image: '/images/breaker.jpg'
            }
        ];
        
        // Actualizar la lista completa de productos
        allProducts = [...allProducts, ...electricalProducts];
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
    }
    
    // Función para guardar productos
    function saveProducts() {
        // Actualizar la lista completa
        const nonElectrical = allProducts.filter(p => p.category !== 'electrical');
        allProducts = [...nonElectrical, ...electricalProducts];
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
        
        let filteredProducts = electricalProducts.filter(product => {
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
        document.getElementById('modal-title').textContent = 'Agregar Nuevo Producto Eléctrico';
        productModal.showModal();
    }
    
    // Manejar la edición de producto
    function handleEditProduct(e) {
        isEditing = true;
        const productId = e.target.getAttribute('data-id');
        currentProductId = productId;
        
        const product = electricalProducts.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productName').value = product.title;
            document.getElementById('productCategory').value = product.subcategory || product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            
            // Mostrar imagen actual en vista previa
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
            currentImageFile = null;
            
            document.getElementById('modal-title').textContent = 'Editar Producto Eléctrico';
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
            let imageUrl = '/images/electrica-default.jpg';
            
            if (currentImageFile) {
                imageUrl = await getImageBase64(currentImageFile);
            } else if (isEditing) {
                const existingProduct = electricalProducts.find(p => p.id === currentProductId);
                if (existingProduct) imageUrl = existingProduct.image;
            }
            
            if (isEditing) {
                const index = electricalProducts.findIndex(p => p.id === currentProductId);
                if (index !== -1) {
                    electricalProducts[index] = {
                        ...electricalProducts[index],
                        name: name,
                        title: name,
                        subcategory: subcategory,
                        category: 'electrical', // Asegurar que la categoría principal sea electrical
                        price: price,
                        stock: stock,
                        image: imageUrl
                    };
                }
            } else {
                const newId = 'prod' + (allProducts.length + 1 + Math.floor(Math.random() * 1000));
                const newSku = 'ELEC-' + name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 100);
                
                electricalProducts.push({
                    id: newId,
                    name: name,
                    title: name,
                    sku: newSku,
                    price: price,
                    stock: stock,
                    category: 'electrical',
                    subcategory: subcategory,
                    image: imageUrl
                });
            }
            
            saveProducts();
            productModal.close();
            renderProducts(electricalProducts);
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al procesar la imagen.');
        }
    }
    
    // Manejar eliminación de producto
    function handleDeleteProduct(e) {
        if (confirm('¿Está seguro que desea eliminar este producto?')) {
            const productId = e.target.getAttribute('data-id');
            electricalProducts = electricalProducts.filter(product => product.id !== productId);
            saveProducts();
            renderProducts(electricalProducts);
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
    renderProducts(electricalProducts);
});
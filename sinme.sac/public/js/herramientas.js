document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productoId = button.dataset.id;

            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                fetch('../php/eliminar_producto.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `id=${encodeURIComponent(productoId)}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Producto eliminado con éxito.');
                        location.reload();
                    } else {
                        alert('Error al eliminar: ' + data.error);
                    }
                })
                .catch(err => {
                    console.error('Error en la solicitud:', err);
                    alert('Error al procesar la solicitud.');
                });
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const addProductBtn = document.getElementById('addProductBtn');
    const modalTitle = document.getElementById('modal-title');

    // Botón "Agregar Producto" - modo creación
    addProductBtn.addEventListener('click', () => {
        form.reset();
        modalTitle.textContent = 'Agregar Nueva Herramienta';
        form.action = ''; // Vacío porque ya apunta al mismo archivo para insert
        modal.setAttribute('data-mode', 'add');
        modal.showModal();
    });

    // Manejo botón "Editar"
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const id = btn.dataset.id;
            const nombre = card.querySelector('.product-title').textContent.trim();
            const precio = card.querySelector('.price').textContent.replace('S/', '').trim();
            const stockText = card.querySelector('.stock').textContent.match(/(\d+)/);
            const stock = stockText ? stockText[1] : 0;

            // Asignar valores al formulario
            document.getElementById('productName').value = nombre;
            document.getElementById('productPrice').value = precio;
            document.getElementById('productStock').value = stock;
            document.getElementById('productCategory').value = card.dataset.category;

            // Crear input oculto con ID del producto
            if (!document.getElementById('productID')) {
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'productID';
                hiddenInput.id = 'productID';
                form.appendChild(hiddenInput);
            }
            document.getElementById('productID').value = id;

            // Cambiar título y acción del formulario
            modalTitle.textContent = 'Editar Herramienta';
            modal.setAttribute('data-mode', 'edit');
            modal.showModal();
        });
    });

    // Interceptar envío del formulario si es edición
    form.addEventListener('submit', function (e) {
        if (modal.getAttribute('data-mode') === 'edit') {
            e.preventDefault();

            const formData = new FormData(form);
            fetch('../php/editar_producto.php', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert('Producto actualizado con éxito.');
                        location.reload();
                    } else {
                        alert('Error al editar: ' + data.error);
                    }
                });
        }
    });
    document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('productModal');
        const cancelBtn = document.getElementById('cancelModal');

        cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.close(); // ✅ Cerramos el modal, no el botón
    });
});
});



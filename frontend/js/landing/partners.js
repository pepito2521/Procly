// PARTNERS PAGE - PARTNERS REGISTRATION FORM

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnersForm');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');
    
    // File upload elements
    const fileInput = document.getElementById('brochure');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileSelected = document.getElementById('fileSelected');
    const fileRemove = document.getElementById('fileRemove');
    let selectedFile = null;

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Show loading state
        setLoadingState(true);
        
        try {
            // Determinar la URL base del backend
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.procly.net';
            
            // Prepare form data to handle file upload
            const formData = new FormData();
            formData.append('nombre_fantasia', form.nombreFantasia.value.trim());
            formData.append('razon_social', form.razonSocial.value.trim());
            formData.append('nombre_contacto', form.nombreContacto.value.trim());
            formData.append('email', form.email.value.trim());
            formData.append('telefono', form.telefono.value.trim());
            formData.append('categoria', form.categoria.value);
            
            // Manejar certificaciones múltiples (nuevos checkboxes)
            const certificacionesCheckboxes = form.querySelectorAll('input[name="certificaciones"]:checked');
            const certificacionesSeleccionadas = Array.from(certificacionesCheckboxes).map(checkbox => checkbox.value);
            if (certificacionesSeleccionadas.length > 0) {
                formData.append('certificaciones', JSON.stringify(certificacionesSeleccionadas));
            }
            
            formData.append('mensaje', form.mensaje.value.trim());
            
            // Add file if selected
            if (selectedFile) {
                formData.append('brochure', selectedFile);
            }
            
            console.log('Hostname actual:', window.location.hostname);
            console.log('¿Es localhost?', isLocalhost);
            console.log('URL del backend:', `${baseUrl}/api/partners/registrar`);
            console.log('Datos a enviar:', Object.fromEntries(formData));
            
            const response = await fetch(`${baseUrl}/api/partners/registrar`, {
                method: 'POST',
                body: formData // No Content-Type header for multipart/form-data
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Show success modal
                showSuccessModal();
                // Reset form and file
                form.reset();
                removeFile();
            } else {
                throw new Error(result.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error al enviar formulario:', error);
            showError('Error al enviar la solicitud. Por favor, intenta nuevamente.');
        } finally {
            // Hide loading state
            setLoadingState(false);
        }
    });

    // Form validation
    function validateForm() {
        const requiredFields = ['nombreFantasia', 'razonSocial', 'nombreContacto', 'email', 'categoria'];
        let isValid = true;

        // Clear previous error states
        clearErrors();

        // Check required fields
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
            }
        });

        // Validate email format
        const emailField = document.getElementById('email');
        if (emailField.value.trim() && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Formato de email inválido');
            isValid = false;
        }

        // Validate phone format (if provided)
        const phoneField = document.getElementById('telefono');
        if (phoneField.value.trim() && !isValidPhone(phoneField.value)) {
            showFieldError(phoneField, 'Formato de teléfono inválido');
            isValid = false;
        }

        // Validate checkbox acceptance
        const checkboxField = document.getElementById('aceptarPoliticas');
        if (!checkboxField.checked) {
            showFieldError(checkboxField, 'Debes aceptar las políticas para continuar');
            isValid = false;
        }

        return isValid;
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }

    // Show field error
    function showFieldError(field, message) {
        // Special handling for checkbox
        if (field.type === 'checkbox') {
            const checkboxWrapper = field.closest('.checkbox-wrapper');
            if (checkboxWrapper) {
                checkboxWrapper.classList.add('error');
            }
        } else {
            field.style.borderColor = '#ef4444';
        }
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.marginTop = '0.25rem';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Clear all field errors
    function clearErrors() {
        // Reset border colors
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });

        // Clear checkbox errors
        const checkboxWrappers = form.querySelectorAll('.checkbox-wrapper.error');
        checkboxWrappers.forEach(wrapper => {
            wrapper.classList.remove('error');
        });

        // Remove error messages
        const errorElements = form.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());
    }

    // Show general error message
    function showError(message) {
        // You can implement a toast notification here
        alert(message);
    }

    // Set loading state
    function setLoadingState(loading) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        if (loading) {
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
        } else {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    // Show success modal
    function showSuccessModal() {
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide success modal
    function hideSuccessModal() {
        successModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Modal event listeners
    modalClose.addEventListener('click', hideSuccessModal);
    modalOk.addEventListener('click', hideSuccessModal);
    
    // Close modal when clicking outside
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal.style.display === 'flex') {
            hideSuccessModal();
        }
    });

    // Real-time validation for email field
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', function() {
        if (this.value.trim() && !isValidEmail(this.value)) {
            showFieldError(this, 'Formato de email inválido');
        } else {
            this.style.borderColor = '';
            const errorElement = this.parentNode.querySelector('.field-error');
            if (errorElement) errorElement.remove();
        }
    });

    // Real-time validation for phone field
    const phoneField = document.getElementById('telefono');
    phoneField.addEventListener('blur', function() {
        if (this.value.trim() && !isValidPhone(this.value)) {
            showFieldError(this, 'Formato de teléfono inválido');
        } else {
            this.style.borderColor = '';
            const errorElement = this.parentNode.querySelector('.field-error');
            if (errorElement) errorElement.remove();
        }
    });

    // Auto-format phone number
    phoneField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Format as (XX) XXXX-XXXX
        if (value.length <= 2) {
            value = value;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length <= 10) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6, 10)}`;
        }
        
        e.target.value = value;
    });

    // File upload functionality
    function initFileUpload() {
        // Click event for file upload area
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change event
        fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop events
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
        fileUploadArea.addEventListener('dragleave', handleDragLeave);

        // Remove file event
        fileRemove.addEventListener('click', removeFile);
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    }

    function handleFileDrop(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    }

    function handleDragLeave(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    }

    function validateAndSetFile(file) {
        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (!allowedTypes.includes(file.type)) {
            showError('Tipo de archivo no permitido. Solo se aceptan archivos PDF, DOC, DOCX, PPT y PPTX.');
            return;
        }

        // Validate file size (25MB max)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSize) {
            showError('El archivo es demasiado grande. El tamaño máximo permitido es 25MB.');
            return;
        }

        // Set the file
        selectedFile = file;
        showSelectedFile(file);
    }

    function showSelectedFile(file) {
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        
        // Update UI
        fileUploadArea.style.display = 'none';
        fileSelected.style.display = 'block';
        fileSelected.querySelector('.file-name').textContent = `${fileName} (${fileSize})`;
    }

    function removeFile() {
        selectedFile = null;
        fileInput.value = '';
        fileUploadArea.style.display = 'block';
        fileSelected.style.display = 'none';
        fileUploadArea.classList.remove('dragover');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Initialize file upload
    initFileUpload();

    // MEJORAR LA EXPERIENCIA DE LOS CHECKBOXES DE CERTIFICACIONES
    function initCertificaciones() {
        const certificacionItems = document.querySelectorAll('.certificacion-item');
        
        if (certificacionItems.length === 0) {
            console.log('No se encontraron items de certificaciones');
            return;
        }
        
        certificacionItems.forEach(item => {
            // Permitir hacer clic en toda el área del item
            item.addEventListener('click', function(e) {
                // No hacer nada si se hace clic directamente en el checkbox
                if (e.target.type === 'checkbox') return;
                
                // Encontrar el checkbox dentro del item
                const checkbox = this.querySelector('.certificacion-checkbox');
                if (checkbox) {
                    // Cambiar el estado del checkbox
                    checkbox.checked = !checkbox.checked;
                    
                    // Disparar evento change para que se actualice el estado visual
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
            
            // Mejorar la accesibilidad del teclado
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const checkbox = this.querySelector('.certificacion-checkbox');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                }
            });
            
            // Hacer el item focusable para navegación por teclado
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'checkbox');
            item.setAttribute('aria-checked', 'false');
            
            // Actualizar aria-checked cuando cambie el estado
            const checkbox = item.querySelector('.certificacion-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function() {
                    const item = this.closest('.certificacion-item');
                    if (item) {
                        item.setAttribute('aria-checked', this.checked.toString());
                    }
                });
            }
        });
        
        console.log('Certificaciones inicializadas:', certificacionItems.length, 'items');
    }

    // Initialize certificaciones
    initCertificaciones();

    // Initialize page
    console.log('Partners page loaded successfully!');
});

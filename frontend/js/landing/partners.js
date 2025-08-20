// PARTNERS PAGE - PARTNERS REGISTRATION FORM

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnersForm');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Show loading state
        setLoadingState(true);
        
        try {
            // Prepare data manually to ensure correct field names
            const data = {
                nombre_fantasia: form.nombreFantasia.value.trim(),
                razon_social: form.razonSocial.value.trim(),
                nombre_contacto: form.nombreContacto.value.trim(),
                email: form.email.value.trim(),
                telefono: form.telefono.value.trim(),
                categoria: form.categoria.value,
                mensaje: form.mensaje.value.trim()
            };
            
            // Send to backend
            // Determinar la URL base del backend
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://www.procly.net';
            
            console.log('Hostname actual:', window.location.hostname);
            console.log('¿Es localhost?', isLocalhost);
            console.log('URL del backend:', `${baseUrl}/api/partners/registrar`);
            console.log('Datos a enviar:', data);
            
            const response = await fetch(`${baseUrl}/api/partners/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Show success modal
                showSuccessModal();
                // Reset form
                form.reset();
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
        field.style.borderColor = '#ef4444';
        
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

    // Initialize page
    console.log('Partners page loaded successfully!');
});

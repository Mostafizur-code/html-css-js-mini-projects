(function() {
    // DOM elements
    const form = document.getElementById('contactForm');
    const feedbackDiv = document.getElementById('formFeedback');

    // Helper to display feedback messages with animation
    function showFeedback(message, isSuccess) {
      feedbackDiv.style.display = 'flex';
      feedbackDiv.innerHTML = `
        <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
      `;
      feedbackDiv.className = `form-message ${isSuccess ? 'success' : 'error'}`;
      
      // Auto-scroll to feedback smoothly
      feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // If success, optionally reset after 5 seconds (but not clearing whole form automatically per UX, you decide)
      if (isSuccess) {
        setTimeout(() => {
          if (feedbackDiv && feedbackDiv.style.display !== 'none') {
            feedbackDiv.style.opacity = '0.9';
          }
        }, 5000);
      }
    }

    // Frontend validation
    function validateForm(data) {
      const { fullname, email, phone, subject, message } = data;
      
      // Check required fields
      if (!fullname.trim()) return 'Full name is required.';
      if (!email.trim()) return 'Email address is required.';
      if (!subject.trim()) return 'Subject is required.';
      if (!message.trim()) return 'Message cannot be empty.';
      
      // Email regex validation (RFC 5322 like)
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
      if (!emailRegex.test(email.trim())) return 'Please enter a valid email address (e.g., name@domain.com).';
      
      // Optional phone validation if user provided, but not required: just suggest format
      if (phone.trim() && !/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,6}[-\s\.]?[0-9]{3,6}$/im.test(phone.trim())) {
        // Soft warning but not blocking, we allow but show a note? Actually we decide it's not mandatory; but if phone has invalid format we can show warning? 
        // For better UX decide to accept any string but warn user? To be robust, we only block if phone is badly formatted? But requirement: frontend validation shows success/error message.
        // We'll consider invalid phone format as error if phone field is non-empty and not matching basic pattern (prevent nonsense).
        if (phone.trim().length < 5) {
          return 'Please enter a valid phone number (at least 5 digits) or leave empty.';
        }
      }
      
      return null; // no error
    }

    // Simulate async form submission (frontend demo)
    async function submitFormToBackend(formDataObj) {
      // Simulate network request delay
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulated success: always resolve true for demo.
          // In real world, you would fetch POST to endpoint.
          console.log('Submitting data:', formDataObj);
          resolve({ success: true, message: 'Message sent successfully! We’ll get back to you soon.' });
        }, 800);
      });
    }

    // Handle form submit
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Collect form values
      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      
      const formData = { fullname, email, phone, subject, message };
      
      // 1. Validate frontend
      const validationError = validateForm(formData);
      if (validationError) {
        showFeedback(validationError, false);
        return;
      }
      
      // Disable submit button to prevent double submission (UX)
      const submitBtn = form.querySelector('.submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';
      
      try {
        // 2. Simulate backend submission
        const response = await submitFormToBackend(formData);
        if (response.success) {
          showFeedback(response.message, true);
          // Optionally reset form fields on success
          form.reset();
          // Clear any previous styling
          setTimeout(() => {
            // after reset, we keep the success message visible but you can optionally clear after 5 seconds
          }, 100);
        } else {
          showFeedback(response.message || 'Submission failed. Please try again.', false);
        }
      } catch (error) {
        showFeedback('Network error. Please check your connection.', false);
        console.error(error);
      } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        // Auto-hide feedback after 6 seconds for cleaner UI, but won't remove user ability to see
        setTimeout(() => {
          if (feedbackDiv.style.display !== 'none') {
            // fade optional: do not hide completely if success? Better keep but can be hidden after 7s.
            if (feedbackDiv.classList.contains('success')) {
              setTimeout(() => {
                feedbackDiv.style.opacity = '0.7';
                setTimeout(() => {
                  if (feedbackDiv) feedbackDiv.style.display = 'none';
                }, 500);
              }, 4000);
            } else {
              setTimeout(() => {
                if (feedbackDiv) feedbackDiv.style.display = 'none';
              }, 5000);
            }
          }
        }, 6000);
      }
    });
    
    // Additional real-time subtle icon improvements (optional)
    const allInputs = document.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
      input.addEventListener('input', () => {
        // if any validation feedback hiding on type maybe
        if (feedbackDiv.style.display !== 'none' && feedbackDiv.classList.contains('error')) {
          // small auto-clear error when user starts typing? optional but better experience
          if (feedbackDiv.innerText.includes('required') || feedbackDiv.innerText.includes('valid')) {
            feedbackDiv.style.display = 'none';
          }
        }
      });
    });
  })();
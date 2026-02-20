// document.addEventListener('DOMContentLoaded', function(){
//     // handle all form submission of ajax form
//     document.body.addEventListener('submit', async function(e) {
//         // check if form would be ajax-form class
//         if(!e.target.matches('.ajax-form')) return;

//         const form = e.target;
//         e.preventDefault();

//         // clear previous errors
//         const errorAlerts = form.querySelectorAll('.alert-danger');
//         errorAlerts.forEach(el => el.remove());

//         const submitBtn = form.querySelector('button[type="submit"]');
//         const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

//         // disable button and show loading status
//         if(submitBtn) {
//             submitBtn.disabled = true;
//             submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
//         }
//         try {
//             const formData = new FormData(form);
//             const data = Object.fromEntries(formData.entries());

//             // determine HTTP method
//             const method = (form.dataset.method || form.method || 'POST').toUpperCase();

//             const response = await fetch(form.action, {
//                method: method,
//                headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify(data)  
//             });
//             const result = await response.json();

//             if (result.ok){

//                 // pass message to toast
//                 if(result.message){
//                     showToast('success', result.message);
//                 }

//                 // close modal if this form is in one
//                 const modalEl = form.closest('.modal');
//                 if(modalEl){
//                     const modalInstance = bootstrap.Modal.getInstance(modalEl);
//                     if(modalInstance) modalInstance.hide();
//                 }

//                 // handle navigation
//                 if(result.redirectUrl){
//                     await handleRedirect(result.redirectUrl);
//                 } else {
//                     // reset form if marked
//                     if(form.getAttribute('data-reset') === 'true'){
//                         form.reset();
//                     }
//                 }
//             } else {
//                 // pass error message to toast
//                 if(result.error) {
//                     showToast('danger', result.error);
//                 }
//             }
//         } catch (error) {
//             console.error("Form submission error", error);
//             showToast('danger', 'An unexpected error from form submission');
//         } finally {
//             if(submitBtn) {
//                 submitBtn.disabled = false;
//                 submitBtn.innerHTML = originalBtnText;
//             }
//         }
//     });
// });

// // handle redirect by fetching new page and replacing main content
// async function handleRedirect(url) {
//     try {
//         // fetch the new page
//         const response = await fetch(url);
//         if(!response.ok) throw new Error('Page not found');
//         const html = await response.text();

//         // parse the Html
//         const parser = new DOMParser();
//         const doc = parser.parseFromString(html, 'text/html');

//         // replace main content
//         const newMain = doc.querySelector('main');
//         const currentMain = document.querySelector('main');

//         if(newMain && currentMain) {
//             currentMain.innerHTML = newMain.innerHTML;
//             currentMain.className = newMain.className;
//         } else {
//             window.location.href = url;
//             return;
//         }
//         // update url
//         window.history.pushState({}, '', url);
//         // remove any open modal backdrops
//         const backdrops = document.querySelectorAll('.modal-backdrop');
//         backdrops.forEach(el => el.remove());
//         document.body.classList.remove('modal-open');
//         document.body.style = '';
//     } catch (error) {
//         console.error('Failed navigation', error);
//         // fallback to full reload
//         window.location.href = url;
//     }
// }

// function showToast(type, message){
//     const toastEl = document.getElementById('liveToast');
//     const toastBody = document.getElementById('toastBody');

//     if(!toastEl || !toastBody) {
//         console.error('Toast element not found in DOM');
//         return;
//     }

//     // reset classes and set new types
//     toastEl.className = 'toast alig-items-center border-0';
//     toastEl.classList.add(`text-bg-${type}`);
//     // ensure close button matches theme
//     const closeBtn = toastEl.querySelector('.btn-close');
//     if (closeBtn) closeBtn.classList.add("btn-close-white");

//     toastBody.textContent = message;
//     const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
//     toast.show();
// }

document.addEventListener('DOMContentLoaded', function () {
    // 1. Generic AJAX Form Handler with PJAX support
    // We use event delegation on document body to handle forms even after content replacement
    document.body.addEventListener('submit', async function (e) {
        if (!e.target.matches('.ajax-form')) return;

        const form = e.target;
        e.preventDefault();

        // Clear previous errors
        const errorAlerts = form.querySelectorAll('.alert-danger');
        errorAlerts.forEach(el => el.remove());

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

        // Disable button and show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        }

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Determine HTTP Method
            const method = (form.dataset.method || form.method || 'POST').toUpperCase();

            const response = await fetch(form.action, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Treat it as success only when HTTP is OK and controller returned success flag
            if (response.ok && result.success) {
                if ( result.redirectUrl === '/dashboard') {
                    // For authentication responses, do a full page redirect
                    window.location.href = result.redirectUrl;
                    return; // Stop further processing
                }
                // Success case

                // 1. Show Toast Immediately (if message exists)
                if (result.message) {
                    showToast('success', result.message);
                }

                // Close modal if this form is in one (Do this before redirecting)
                const modalEl = form.closest('.modal');
                if (modalEl) {
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) modalInstance.hide();
                }

                // 2. Handle Navigation / Updates
                if (result.redirectUrl) {
                    await handlePjaxRedirect(result.redirectUrl);
                } else {
                    // Stay on page logic - just reset form if needed

                    // Reset form if marked
                    if (form.getAttribute('data-reset') === 'true') {
                        form.reset();
                    }
                }
            } else {
                // Error case
                if (result.error) {
                    showToast('danger', result.error);
                }
            }

        } catch (err) {
            console.error('Form submission error:', err);
            showToast('danger', 'An unexpected error occurred. Please try again. from from handler');
        } finally {
            // Re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
});

/**
 * Handles "redirect" by fetching the new page and replacing the main content.
 * @param {string} url - The URL to navigate to
 */
async function handlePjaxRedirect(url) {
    try {
        // 1. Fetch the new page
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const html = await response.text();

        // 2. Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 3. Replace <main> content
        // We assume the structure is consistently <main>...</main>
        const newMain = doc.querySelector('main');
        const currentMain = document.querySelector('main');

        if (newMain && currentMain) {
            currentMain.innerHTML = newMain.innerHTML;
            // Also copy classes/attributes if they might change
            currentMain.className = newMain.className;
        } else {
            // Fallback if structure doesn't match: full reload
            window.location.href = url;
            return;
        }

        // 4. Update URL
        window.history.pushState({}, '', url);

        // 5. Cleanup & Re-initialization

        // Remove any open modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style = ''; // Remove padding-right added by bootstrap

        // Re-initialize Bootstrap components if needed (e.g., tooltips, popovers)
        // Since we use event delegation for forms, we don't need to re-attach form listeners.

        // If there are scripts in the new main that need to run, we might need to handle them,
        // but for now we assume <main> is mostly static HTML with bootstrap data-attrs.

    } catch (error) {
        console.error('PJAX navigation failed:', error);
        // Fallback to full reload
        window.location.href = url;
    }
}

function showToast(type, message) {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastBody');

    if (!toastEl || !toastBody) {
        console.error('Toast element not found in DOM');
        return;
    }

    // Reset classes and set new type
    toastEl.className = 'toast align-items-center border-0';
    toastEl.classList.add(`text-bg-${type}`);

    // Ensure close button matches theme
    const closeBtn = toastEl.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.classList.add('btn-close-white');
    }

    toastBody.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
}

// when the dom content loaded it run functions
document.addEventListener('DOMContentLoaded', function() {
  // add course form handler
  const addCourseForm = document.getElementById('addCourseForm');
  if (addCourseForm) {
      addCourseForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          // converting the formdata to object
          const formData = new FormData(addCourseForm);
          const courseData = Object.fromEntries(formData.entries());

          try {
              const response = await fetch('/courses', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(courseData)
              });

              const result = await response.json();

              if (result.success) {
                  showNotification('Course added successfully!', 'success');
                  addCourseForm.reset();
                  bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide(); // close the modal after submission of the form
                  location.reload(); //refresh the page to show the new course
              } else {
                  showNotification(result.error || 'Error in adding course', 'danger');
              }
          } catch (error) {
              showNotification(`Error occurred ${error.message}`, 'danger');
          }
      });
  }

  // edit course form handler
  const editCourseForm = document.getElementById('editCourseForm');
  if (editCourseForm) {
      editCourseForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          // converting the form data into object
          const courseId = document.getElementById('editCourseId').value;
          const formData = new FormData(editCourseForm);
          const courseData = Object.fromEntries(formData.entries());
        
          try {
              const response = await fetch(`/courses/${courseId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(courseData)
              });

              const result = await response.json();

              if (result.success) {
                  showNotification('Course updated successfully!', 'success');
                  bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide(); // close the modal after the submission
                  location.reload(); // refresh the page to show the updated course
              } else {
                  showNotification(result.error || 'Error updating course', 'danger');
              }
          } catch (error) {
              showNotification(`Error occurred ${error.message}`, 'danger');
          }
      });
  }

  // confirm delete button handler
  document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
      // the attribute that hold value of course id is set in the deleteCourse function
      const courseIdToDelete = this.getAttribute('data-course-id');
      performDelete(courseIdToDelete);
  });
  // filter the courses in table
  const searchInput = document.getElementById('searchInput');
  if (searchInput) { searchInput.addEventListener('input', applyFilter);}
});

async function editCourse(courseId) {
    try {
        const response = await fetch(`/courses/${courseId}`);
        const course = await response.json();
        // receive values from edit modal form
        document.getElementById('editCourseId').value = course.id;
        document.getElementById('editCourseName').value = course.courseName;
        document.getElementById('editCourseDuration').value = course.courseDuration;
        document.getElementById('editCourseFees').value = parseFloat(course.courseFees).toFixed(2);

        const editModal = new bootstrap.Modal(document.getElementById('editCourseModal'));
        editModal.show();
    } catch (error) {
        showNotification(`Error fetching course details ${error.message}`, 'danger');
    }
}

function deleteCourse(courseId) {
    // set the attribute value on btn of course Id
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    confirmDeleteBtn.setAttribute('data-course-id', courseId);
    
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    deleteModal.show();
}

async function performDelete(courseId) {
    try {
        const response = await fetch(`/courses/${courseId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Course deleted successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal')).hide(); // close the modal after successfully deletion
            location.reload(); // refresh the page to remove the deleted course
        } else {
            showNotification(result.error || 'Error deleting course', 'danger');
        }
    } catch (error) {
        showNotification(`Network error occurred ${error.message}`, 'danger');
    }
}

function showNotification(message, type) {

    // create new alert notification 
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // hide alert  after 4 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 4000);
}

function applyFilter() {
  // get value from search input and compare with existed value
  const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();
  const rows = document.querySelectorAll('#coursesTableBody tr');
  const noResultsMessage = document.getElementById('noResultsMessage');
  let visibleCount = 0;
  rows.forEach(row => {
    const courseName = row.getAttribute('data-course-name');
    if (courseName && courseName.includes(searchValue)) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });
  
  // show or hide no results message
  if (visibleCount === 0 && searchValue ) {
      noResultsMessage.style.display = 'block';
  } else {
      noResultsMessage.style.display = 'none';
  }
}
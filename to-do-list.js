// Array to store list of to-do items
var inputs = [];
var originalInputs = [];
var categories = [];  
var activityLogs = []; 

// Adding local storage
if (localStorage.getItem("inputs")) {
    inputs= JSON.parse(localStorage.getItem("inputs"));
    originalInputs = inputs.slice();
    renderInputs();
}
// Adding activity logs from local storage
if (localStorage.getItem("activityLogs")) {
    activityLogs = JSON.parse(localStorage.getItem("activityLogs"));
  }
// Save activity logs to local storage
function saveActivityLogsToLocalStorage() {
    localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
  }
  
// Function to add to the array
function addList() {
    const User_input = document.getElementById("User_input");
    const Category_input = document.getElementById("category_input");
    const Priority_input = document.getElementById("priority_input");
    const Due_date_input = document.getElementById("due_date_input");
    const Tags_input = document.getElementById("tags_input");
    const Input_str = User_input.value.trim();
    const Category_str = Category_input.value.trim();
    const Priority_str = Priority_input.value;
    const Due_date_str = createDueDateFromText(Input_str, Due_date_input.value);
    const Tags_str = Tags_input.value.trim(); 
    if (Input_str != '' && Category_str !== '' && Priority_str !== '') {
        const newInput = {
            inputdetails: Input_str,
            id: Date.now(),
            editing: false , 
            completed: false,
            dueDate: Due_date_str,
            category: Category_str,
            priority: Priority_str,
            tags: Tags_str.split(','),
            subtasks: [] 
        };
        inputs.unshift(newInput);
        // Add category 
        if (!categories.includes(Category_str)) {
            categories.push(Category_str);
            originalInputs.push(Category_str);
            saveCategories_toLocalStorage();
        }
        // Activity Of Adding Task
        const activityLog = {
            timestamp: new Date().toISOString(),
            action: 'add',
            taskId: newInput.id,
        };
        activityLogs.push(activityLog);
        saveActivityLogsToLocalStorage();
        saveInputs_toLocalStorage();
        renderInputs();
        User_input.value = '';
        Due_date_input.value = '';
        Priority_input.value = '';
        Category_input.value = '';
        Tags_input.value = '';
    }
    else {
        alert("Please input a proper value");
    }
}
// Initialize subtasks array 
if (localStorage.getItem("inputs")) {
    inputs = JSON.parse(localStorage.getItem("inputs"));
    inputs.forEach(task => {
        if (!task.hasOwnProperty('subtasks')) {
            task.subtasks = [];
        }
    });
    renderInputs();
}
// edit previous input
function editItem(id) {
    inputs.forEach(elem => {
        if (elem.id == id) {
            elem.editing = true; 
        }
    });
    renderInputs();
}
// save edited inputs
function saveItem(id, newInput) {
    inputs.forEach(elem => {
        if (elem.id == id) {
            elem.inputdetails = newInput;
            elem.editing = false; 
        }
    });
    // Add activity log for task edit
    const activityLog = {
        timestamp: new Date().toISOString(),
        action: 'edit',
        taskId: id
    };
    activityLogs.push(activityLog);
    saveActivityLogsToLocalStorage();
    saveInputs_toLocalStorage();
    renderInputs();
}
function removeLists(id) {
    const categoryToRemove = inputs.find(elem => elem.id === id)?.category;
    inputs = inputs.filter(elem => elem.id !== id);
    // Remove category
    if (categoryToRemove) {
        const index = categories.indexOf(categoryToRemove);
        if (index !== -1) {
            categories.splice(index, 1);
            saveCategories_toLocalStorage();
        }
    }
    // Add activity log for task deletion
    const activityLog = {
        timestamp: new Date().toISOString(),
        action: 'delete',
        taskId: id
    };
    activityLogs.push(activityLog);
    saveActivityLogsToLocalStorage();
    saveInputs_toLocalStorage();
    renderInputs();
}
// Function to display activity logs
function displayActivityLogs() {
    const activityLogList = document.getElementById("activity_log_list");
    activityLogList.innerHTML = '';
    activityLogs.forEach(activity => {
        const li = document.createElement("li");
        li.textContent = `${activity.timestamp}: Task ${activity.action} (ID: ${activity.taskId})`;
        activityLogList.appendChild(li);
    });
    const toDoListContainer = document.getElementById("list_of_input");
    const activityLogListContainer = document.getElementById("activity_log_list");
    toDoListContainer.style.display = "none";
    activityLogListContainer.style.display = "block";
}
document.getElementById("activity_logs_button").addEventListener("click", displayActivityLogs);
// mark task as done
function toggleCompleted(id) {
    inputs.forEach(elem => {
        if (elem.id == id) {
            elem.completed = !elem.completed; 
        }
    });
    saveInputs_toLocalStorage(); 
    renderInputs();
}
// search function
function performSearch() {
    const searchInput = document.getElementById("search_input");
    const searchTerm = searchInput.value.trim().toLowerCase();
    const searchResults = inputs.filter(elem => taskMatchesSearch(elem, searchTerm));
    renderInputs(searchResults);
}
// check if a task matches the search term
function taskMatchesSearch(task, searchTerm) {
    if (task.inputdetails.toLowerCase().includes(searchTerm)) {
        return true;
    }
    if (task.subtasks && task.subtasks.some(subtask => subtask.toLowerCase().includes(searchTerm))) {
        return true;
    }
    if (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        return true;
    }
    return false;
}
// clear search 
function clearSearch() {
    const searchInput = document.getElementById("search_input");
    searchInput.value = '';
    renderInputs(); 
}
// local storage function
function saveInputs_toLocalStorage() {
    localStorage.setItem("inputs", JSON.stringify(inputs));
}
function saveCategories_toLocalStorage() {
    localStorage.setItem("categories", JSON.stringify(categories));
}
// Render function
function renderInputs(inputsToRender) {
    const inputList = document.getElementById("list_of_input");
    inputList.innerHTML = '';
    //fetch from local storage
    if (localStorage.getItem("categories")) {
        categories = JSON.parse(localStorage.getItem("categories"));
    }
    // Add category
    const filterCategorySelect = document.getElementById("category_filter");
    const currentCategoryFilter = filterCategorySelect.value;
    filterCategorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });
    filterCategorySelect.value = currentCategoryFilter;
    const itd = inputsToRender || inputs;
    itd.forEach(elem => {
        const li = document.createElement("li");
        li.classList.add("list_append");
        if (elem.editing) {
            // text-box
            const input = document.createElement("input");
            input.classList.add("edit_bx");
            input.type = "text";
            input.value = elem.inputdetails;
            li.appendChild(input);
            // create save button
            const save_bt = document.createElement("button");
            save_bt.classList.add("save_bt");
            save_bt.textContent = "Save";
            save_bt.addEventListener("click", () => saveItem(elem.id, input.value));
            li.appendChild(save_bt);
        } 
        else {
            //checkbox to mark the task as done
            const checkbox = document.createElement("input");
            checkbox.classList.add("checkbox");
            checkbox.type = "checkbox";
            checkbox.setAttribute('data-task-id', elem.id);
            checkbox.checked = elem.completed;
            checkbox.addEventListener('change', () => {
            const taskId = parseInt(checkbox.getAttribute('data-task-id'));
            toggleCompleted(taskId);
            });
            li.appendChild(checkbox);
            // Add a cross line over the user input if task is done
            const taskLabel = document.createElement("label");
            taskLabel.textContent = elem.inputdetails;
            const subtaskLabel = document.createElement("label");
            subtaskLabel.textContent = elem.subtasks;
            if (elem.completed) {
                taskLabel.style.textDecoration = "line-through";
            }
            li.appendChild(taskLabel);
            // Add priority box 
            if (elem.priority) {
                const priorityBox = document.createElement("div");
                priorityBox.classList.add("priority_box");
                priorityBox.classList.add(`${elem.priority}_priority`);
                li.appendChild(priorityBox);
            }
            // Add due-date 
            if (elem.dueDate) {
                const dueDateLabel = document.createElement("span");
                dueDateLabel.textContent = `Due Date: ${elem.dueDate}`;
                li.appendChild(dueDateLabel);
            }
            // Add category
            if (elem.category) {
                const categoryLabel = document.createElement("span");
                categoryLabel.textContent = `Category: ${elem.category}`;
                li.appendChild(categoryLabel);
            }
            // Add Tags
            if (elem.tags && elem.tags.length > 0) {
                const tagsLabel = document.createElement("span");
                tagsLabel.textContent = `Tags: ${elem.tags.join(', ')}`;
                li.appendChild(tagsLabel);
            }
            // create edit button
            const edit_bt = document.createElement("button");
            edit_bt.classList.add("edit_bt");
            edit_bt.textContent = "Edit";
            edit_bt.addEventListener("click", () => editItem(elem.id));
            li.appendChild(edit_bt);
            // create delete button
            const delete_bt = document.createElement("button");
            delete_bt.classList.add("delete_bt");
            delete_bt.textContent = "Delete";
            delete_bt.addEventListener("click", () => removeLists(elem.id));
            li.appendChild(delete_bt);
            // Create subtasks input field
            const subtasksInput = document.createElement("input");
            subtasksInput.type = "text";
            subtasksInput.id = `subtasks_input_${elem.id}`;
            subtasksInput.placeholder = "Add Subtask";
            subtasksInput.classList.add("subtask_input");
            li.appendChild(subtasksInput);
            // Create "Save Subtasks" button
            const saveSubtasksButton = document.createElement("button");
            saveSubtasksButton.textContent = "Save Subtasks";
            saveSubtasksButton.addEventListener("click", () => saveSubtasks(elem.id));
            saveSubtasksButton.classList.add("subtask_btn");
            li.appendChild(saveSubtasksButton);
            // Display subtasks
            if (elem.subtasks && elem.subtasks.length > 0) {
                const subtasksList = document.createElement("ul");
                subtasksList.classList.add("subtasks_list");
                elem.subtasks.forEach(subtask => {
                    const subtaskItem = document.createElement("li");
                    subtaskItem.textContent = subtask;
                    subtasksList.appendChild(subtaskItem);
                    });
                li.appendChild(subtasksList);
            }
        }
        inputList.appendChild(li);
    });
}
// save subtasks
function saveSubtasks(id) {
    const subtasksInput = document.getElementById(`subtasks_input_${id}`);
    const subtasksValue = subtasksInput.value.trim();
    inputs.forEach(elem => {
        if (elem.id === id && subtasksValue !== '') {
            elem.subtasks.push(subtasksValue);
            saveInputs_toLocalStorage();
            renderInputs();
            subtasksInput.value = ''; 
        }
    });
}
function clearInput() {
    const User_input = document.getElementById("User_input");
    User_input.value = '';
}
// filter based on Category, and Priority
function applyFilters() {
    const categoryFilter = document.getElementById("category_filter").value;
    const priorityFilter = document.getElementById("priority_filter").value;
    let filteredInputs = originalInputs.slice();
    if (categoryFilter !== "") {
        filteredInputs = filteredInputs.filter(elem => elem.category === categoryFilter);
    }
    if (priorityFilter !== "") {
        filteredInputs = filteredInputs.filter(elem => elem.priority === priorityFilter);
    }
    renderInputs(filteredInputs);
}
document.getElementById("category_filter").addEventListener("change", applyFilters);
document.getElementById("priority_filter").addEventListener("change", applyFilters);
applyFilters();
// date range filter
function applyDateRangeFilter() {
    const startDateFilter = document.getElementById("start_date_filter").value;
    const endDateFilter = document.getElementById("end_date_filter").value;
    let filteredInputs = originalInputs.slice();
    if (startDateFilter !== "" && endDateFilter !== "") {
        filteredInputs = filteredInputs.filter(elem => {
            const taskDueDate = new Date(elem.dueDate);
            const startDate = new Date(startDateFilter);
            const endDate = new Date(endDateFilter);
            return taskDueDate >= startDate && taskDueDate <= endDate;
        });
    }
    renderInputs(filteredInputs);
}
// clear date range filter
function clearDateRangeFilter() {
    document.getElementById("start_date_filter").value = "";
    document.getElementById("end_date_filter").value = "";
    renderInputs();
}
// sorting based on selected option
function applySorting() {
    const sortBy = document.getElementById("sort_by").value;
    let sortedInputs = inputs.slice(); 
    switch (sortBy) {
        case "due_date":
            sortedInputs.sort((a, b) => {
                if (a.dueDate && b.dueDate) {
                    return a.dueDate.localeCompare(b.dueDate);
                } else if (!a.dueDate && b.dueDate) {
                    return 1; 
                } else if (a.dueDate && !b.dueDate) {
                    return -1; 
                } else {
                    return 0;
                }
            });
            break;
            case "priority":
                const priorityOrder = ["high", "medium", "low"];
                sortedInputs.sort((a, b) => {
                    const priorityA = priorityOrder.indexOf(a.priority);
                    const priorityB = priorityOrder.indexOf(b.priority);
                    return priorityA - priorityB;
                });
                break;
            case "category":
                sortedInputs.sort((a, b) => {
                    if (a.category && b.category) {
                        return a.category.localeCompare(b.category);
                    } else if (!a.category && b.category) {
                        return 1; 
                    } else if (a.category && !b.category) {
                        return -1;
                    } else {
                        return 0; 
                    }
                });
                break;
        default:
            break;
    }
    renderInputs(sortedInputs); 
}
document.querySelector(".sorting_options button").addEventListener("click", applySorting);
// Extract the date from input text
function extractDateFromInput(inputText) {
    // Regular expression to match date formats
    const datePattern =
      /(\btomorrow\b)|((\d{1,2}(st|nd|rd|th)? (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4})( \d{1,2}:\d{1,2} (am|pm))?)|((\d{1,2}(st|nd|rd|th)? (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}))/i;
    const dateMatch = inputText.match(datePattern);
    return dateMatch ? dateMatch[0] : null;
}
function createDueDateFromText(todoText, dueDateInputValue) {
    const extractedDate = extractDateFromInput(todoText);
    let dueDate;
    if (dueDateInputValue) {
        dueDate = new Date(dueDateInputValue);
    }
    else if (extractedDate) {
      const currentDate = new Date();
      if (extractedDate.toLowerCase() === 'tomorrow') {
        dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 1);
        //const updatedTodoText = todoText.replace(extractedDate, '').trim();
        document.getElementById("User_input").value = todoText.replace(extractedDate, '').trim();
      } else {
        dueDate = new Date(extractedDate);
      }
    }
    if (dueDate) {
      document.getElementById("due_date_input").value = dueDate.toISOString().split('T')[0];
      return dueDate.toISOString().split('T')[0];
    }
    return null;
}
function viewBacklogs() {
    const backlogs = inputs.filter(task => !task.completed);
    renderInputs(backlogs);
}
document.getElementById("view_backlogs_button").addEventListener("click", viewBacklogs);
function clearTasks() {
    renderInputs();
}
document.getElementById("clear_button").addEventListener("click", clearTasks);
// add drag and drop for tasks
function addDragAndDropSupport() {
    const taskListItems = document.querySelectorAll('.list_append:not(.subtask)');
    taskListItems.forEach((item) => {
        item.draggable = true;
        item.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', item.id);
        });
    });
    // drag and drop for subtasks
    const subtaskListItems = document.querySelectorAll('.subtasks_list li');
    subtaskListItems.forEach((subtaskItem) => {
        subtaskItem.draggable = true;
        subtaskItem.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', subtaskItem.id);
        });
    });
    // dragover and rearrange tasks and subtasks
    function handleDragOver(event) {
        event.preventDefault();
        const draggedItemId = event.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(draggedItemId);
        const closestItem = getClosestItem(event.clientY, taskListItems);
        if (closestItem) {
            const isSubtask = draggedItem.classList.contains('subtask');
            const isSameLevel = closestItem.classList.contains('subtasks_list') === isSubtask;
            if (isSameLevel) {
                const container = isSubtask ? closestItem : document.getElementById('list_of_input');
                container.insertBefore(draggedItem, closestItem);
            }
        }
    }
    // find the closest item during drag and drop
    function getClosestItem(yPosition, items) {
        return [...items].reduce((closest, item) => {
            const box = item.getBoundingClientRect();
            const offset = yPosition - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: item };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    const listContainer = document.getElementById('list_of_input');
    listContainer.addEventListener('dragover', handleDragOver);
}
renderInputs();
addDragAndDropSupport();
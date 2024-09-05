const todoForm = document.querySelector("form");
const todoInput = document.getElementById("todo-input");
const todoListUL = document.getElementById("todo-list");

let allTodos = loadTodos();
renderTodos();

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleNewTodo();
});

function handleNewTodo() {
  const todoText = todoInput.value.trim();
  if (!todoText) return;

  addTodo({ text: todoText, completed: false });
  todoInput.value = ""; // Clear the input field
}

function addTodo(todo) {
  allTodos.push(todo);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  todoListUL.innerHTML = "";
  allTodos.forEach((todo, index) => {
    const todoItem = createTodoElement(todo, index);
    todoListUL.appendChild(todoItem);
  });
}

function createTodoElement(todo, index) {
  const todoLI = document.createElement("li");
  todoLI.className = "todo";
  todoLI.draggable = true; // Make the item draggable

  todoLI.innerHTML = `
                <input type="checkbox" id="todo-${index}" ${
    todo.completed ? "checked" : ""
  }>
                <label class="custom-checkbox" for="todo-${index}">
                    <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                    </svg>
                </label>
                <label for="todo-${index}" class="todo-text">${
    todo.text
  }</label>
                <button class="edit-button">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                </button>

                </button>
                <button class="delete-button">
                    <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                    </svg>
                </button>
            `;

  addTodoEventListeners(todoLI, index);

  // Add drag-and-drop event listeners
  todoLI.addEventListener("dragstart", (e) => onDragStart(e, index));
  todoLI.addEventListener("dragover", (e) => onDragOver(e));
  todoLI.addEventListener("drop", (e) => onDrop(e, index));
  todoLI.addEventListener("dragleave", (e) => onDragLeave(e));

  return todoLI;
}

function addTodoEventListeners(todoLI, index) {
  const deleteButton = todoLI.querySelector(".delete-button");
  const editButton = todoLI.querySelector(".edit-button");
  const checkbox = todoLI.querySelector("input");
  const todoTextLabel = todoLI.querySelector(".todo-text");

  deleteButton.addEventListener("click", () => removeTodoItem(index));
  checkbox.addEventListener("change", () =>
    toggleTodoCompletion(index, checkbox.checked)
  );
  editButton.addEventListener("click", () => {
    if (!checkbox.checked) {
      handleEditTodo(todoTextLabel, index);
    }
  });

  // Initially disable the edit button if the todo is completed
  editButton.disabled = checkbox.checked;
}

function handleEditTodo(todoTextLabel, index) {
  const currentText = todoTextLabel.innerText;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className = "edit-input";

  todoTextLabel.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => saveEditedTodoText(input, index));
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveEditedTodoText(input, index);
    }
  });
}

function saveEditedTodoText(input, index) {
  const newTodoText = input.value.trim();
  if (!newTodoText) {
    input.focus();
    return;
  }

  allTodos[index].text = newTodoText;
  saveTodos();
  renderTodos(); // Re-render the list after editing
}

function removeTodoItem(index) {
  allTodos = allTodos.filter((_, i) => i !== index);
  saveTodos();
  renderTodos();
}

function toggleTodoCompletion(index, isCompleted) {
  allTodos[index].completed = isCompleted;
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}

function loadTodos() {
  return JSON.parse(localStorage.getItem("todos") || "[]");
}

// Drag and Drop Functions
let draggedIndex;

function onDragStart(e, index) {
  draggedIndex = index;
  e.target.classList.add("dragging"); // Add class when dragging starts
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", index); // Store the index of the dragged item
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function onDrop(e, index) {
  e.preventDefault();
  const fromIndex = Number(e.dataTransfer.getData("text/plain"));
  if (fromIndex === index) return; // Do nothing if the item is dropped on itself

  // Reorder todos array
  const [movedTodo] = allTodos.splice(fromIndex, 1);
  allTodos.splice(index, 0, movedTodo);
  saveTodos();
  renderTodos();
}

function onDragLeave(e) {
  // Optional: Handle visual feedback on drag leave if needed
}

// Remove the dragging class after the drop is complete
document.addEventListener("dragend", (e) => {
  e.target.classList.remove("dragging");
});

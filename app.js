//elements
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.todo-button');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.todo-filter');

// event listeners
todoButton.addEventListener('click', addTodo);
todoList.addEventListener('click', checkDeleteorOptions);
filterOption.addEventListener('click', filterTodo);

//
todoInput.setAttribute('placeholder','start tipping...');

// functions
function addTodo(event) {
    event.preventDefault();
    
    //create new todo item
    const newTodo = document.createElement('li');
    newTodo.innerText = todoInput.value;
    newTodo.classList.add('todo-item');
    if(todoInput.value.length > 24){
        newTodo.setAttribute('data-size','large');
        newTodo.addEventListener('click', popupTodoComplete);
    }

    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    todoDiv.appendChild(newTodo);

    const optionsButton = document.createElement('button');
    optionsButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>'
    optionsButton.classList.add('options-btn');
    todoDiv.appendChild(optionsButton);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fa fa-check"></i>'
    completedButton.classList.add('check-btn');
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fa fa-trash"></i>';
    trashButton.classList.add('trash-btn');
    todoDiv.appendChild(trashButton);

    //add to local storage
    let todo = {};
    todo.id = crypto.randomUUID();
    todo.text = todoInput.value;
    todo.checked = false;
    // saveTodosLocally(todo);

    todoDiv.setAttribute('data-id', todo.id);

    //append to list
    todoList.insertBefore(todoDiv, todoList.children[0]);

    //clear input
    todoInput.value = '';
}

//adds functionality to every todo in the list
function checkDeleteorOptions(event){
    const item = event.target;

    if(item.classList.contains('check-btn')){
        const todo = item.parentElement;
        //check
        todo.classList.toggle('completed')
    
    }else if(item.classList.contains('trash-btn')){
        const todo = item.parentElement;
        //add a pop-up for confirmation [#homework]
        
        //deletes all subtodos if it has before deleting it self
        if(isComplexTodo(todo) && hasSubTasks(todo)){
            deleteAllSubTodos(todo.parentElement)
            setTimeout(()=>{deleteT(todo)},100);
        }else{
            deleteT(todo);
        }

    }else if(item.classList.contains('options-btn')){
        const todo = item.parentElement;
        if(!isPopoverOpen(todo) && (document.querySelectorAll('.popover-container').length) == 0){
            AddPopover(todo);
            item.classList.add('selected');
        }else{
            closePopover(todo);
            // console.log('closePopover called')
            if(document.querySelectorAll('.popover-container').length != 0){
                // console.log('there are more popovers')
                closePopover(document.querySelector('.popover-container').parentElement);
            }
        }
    }
}

//deletes the todo o subtodo with animation
function deleteT(todo){
    //animation
    todo.classList.add('fall');
    //remove
    todo.addEventListener('transitionend', () => { todo.remove() });
}

function deleteAllSubTodos (todoComplex){
    // Array.from(todoComplex.children[1].children).forEach(e=>console.log(e))
    Array.from(todoComplex.children[1].children).forEach( e => {
        deleteT(e);
    })
}

//add funct right when the sublist is created
// function subCheckDeleteorEdit (e){
function subCheckorDelete (e){
    const item = e.target;
    if(item.classList.contains('sub-check-btn')){
        const subtodo = item.parentElement;
        //check
        subtodo.classList.toggle('completed')
    }else if(item.classList.contains('sub-trash-btn')){
        const subtodo = item.parentElement;
        if(subtodo.parentElement.children.length == 1){
            setTimeout(()=>{            
                changeToSimpleTodo(subtodo.parentElement.parentElement.children[0]);
            },100)
        }
        deleteT(subtodo)
    }
}

//functionality of the filter
function filterTodo (event){
    const todos = todoList.childNodes; 
    todos.forEach((todo)=>{
        switch(event.target.value){
            case 'all':
                todo.style.display = 'flex';
                break;
            case 'completed':
                if(todo.classList.contains('completed')){
                    todo.style.display = 'flex';
                }else{
                    todo.style.display = 'none';
                }
                break;
            case 'uncompleted':
                if(todo.classList.contains('completed')){
                    todo.style.display = 'none';
                }else{
                    todo.style.display = 'flex';
                }
                break;
            default:
                break;
        }
    })
}

//-------------------------------------------------------------------------------
// functions refering to the pop-ups of the todos and sub-todos
function bringPopover(todo){
    let resp;
    for(let i=0;i < todo.children.length; i++){
        if(todo.children[i].classList.contains('popover-container')){
            resp = todo.children[i];
        }
    }
    return resp
}
function isPopoverOpen(todo){
    let resp = false;
    let popover = bringPopover(todo);
    if(popover != undefined){
        resp = true;
    }
    return resp;
}
function closePopover(todo){
    const popover = bringPopover(todo);
    todo.children[1].classList.remove('selected');
    todo.children[2].disabled = false;
    todo.children[3].disabled = false;
    popover.remove();   
}
//------------------------------------------------------------------------------

function editTodo(todo){
    todo.children[0].style = 'display:block';
    todo.children[0].innerText = todo.children[4].children[0].value;
    todo.children[1].style = 'display:block';
    todo.children[2].style = 'display:block';
    todo.children[3].style = 'display:block';
    let inputForm = todo.children[4];
    let cancelbtn = todo.children[5];
    inputForm.remove();
    cancelbtn.remove();
}
function actionEditTodo(e){
    e.preventDefault();
    editTodo(e.target.parentElement.parentElement);
}

function cancelEdit(todo){
    Array.from(todo.children).forEach(e=>e.style = 'display:block');

    let input = todo.children[4];
    let cancelbtn = todo.children[5];
    input.remove();
    cancelbtn.remove();
}

function actionCancelEditTodo(e){
    cancelEdit(e.target.parentElement);
}

//------------------------------------------------------------------------------
function addEditOption(e){
    const todo = e.target.parentElement.parentElement.parentElement;
    //disable li
    todo.children[0].style = 'display:none';
    //disable previous buttons
    todo.children[1].style = 'display:none';
    todo.children[2].style = 'display:none';
    todo.children[3].style = 'display:none';
    
    // console.log('todo',todo);
    const formEditInput = document.createElement('form');
    formEditInput.classList.add('form-edit-todo');
    const editInput = document.createElement('input');
    editInput.classList.add('edit-todo-input');
    editInput.type = 'text';
    editInput.id = `edit-${todo.dataset.id.slice(0,10)}`;
    editInput.placeholder = `${todo.children[0].innerText}`;
    formEditInput.appendChild(editInput);
    //add input
    todo.insertBefore(formEditInput , todo.children[4]);
    //add buttons
    const okBtn = document.createElement('button');
    okBtn.type = 'submit';
    okBtn.classList.add('ok-btn');
    okBtn.innerHTML = '<i class="fa fa-check"></i>';
    okBtn.addEventListener('click', actionEditTodo);
    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.addEventListener('click', actionCancelEditTodo);
    cancelBtn.innerHTML = '<i class="fa-solid fa-x"></i>';
    
    formEditInput.appendChild(okBtn);
    todo.insertBefore(formEditInput, todo.children[5]);
    // todo.insertBefore(okBtn, todo.children[5]);
    todo.insertBefore(cancelBtn, todo.children[6]);
    
    document.querySelector('.edit-todo-input').focus();

    // console.log(document.onclick)
}
//------------------------------------------------------------------------------
function isComplexTodo(todo){
    let resp = false;
    if(todo.parentElement.classList.contains('todo-complex') || todo.classList.contains('todo-complex')){
        resp = true;
    }
    return resp;
}
function hasSubTasks(todo){
    let resp = false;
        if(todo.parentElement.children.length > 1){
            if(todo.parentElement.children[1].classList.contains('list-subtodos') && todo.parentElement.children[1].children.length != 0){
                resp = true;
            }
        }
    return resp
}

function lastSubtask(todo){
    resp = false;
    if(hasSubTasks(todo)){
        if(todo.parentElement.children[1].children.length > 1){
            resp = true;
        }
    }
    return resp
}

function findTodoPosition(todo){
    let position = -1;
    let list = todo.parentElement;
    if(list.classList.contains('todo-list')){
        for(let i = 0; i < list.children.length; i++){
            if(list.children[i].dataset.id === todo.dataset.id){
                position = i;
            }
        }
    }
    return position;
}
//------------------------------------------------------------------------------
function changeToComplexTodo(todo){
    const position = findTodoPosition(todo);
    if(position >= 0){
        const main = todo.parentElement.children[position];

        const complexTodo = document.createElement('div');
        complexTodo.classList.add('todo-complex');
        complexTodo.dataset.id = todo.dataset.id;
        todo.parentNode.replaceChild(complexTodo, main);
        complexTodo.appendChild(main);
        
        const listSubtodos = document.createElement('div');
        listSubtodos.classList.add('list-subtodos');
        complexTodo.appendChild(listSubtodos);
        
        listSubtodos.addEventListener('click', subCheckorDelete);
    }
}
function changeToSimpleTodo(todo){
    let complexTodo,nextSibling;
    let fragment = document.createDocumentFragment();
    complexTodo = todo.parentElement;
    nextSibling = complexTodo.nextElementSibling;
    fragment.appendChild(todo);
    complexTodo.parentElement.insertBefore(fragment, nextSibling);
    complexTodo.remove();    
}

function addSubEditOption(e){
    const subTodo = e.target.parentElement;
    
    //disable li
    subTodo.children[0].style = 'display:none';
    //disable previous buttons
    subTodo.children[1].style = 'display:none';
    subTodo.children[2].style = 'display:none';
    subTodo.children[3].style = 'display:none';

    //duplicated code
    const formEditInput = document.createElement('form');
    formEditInput.classList.add('form-edit-todo');
    const editInput = document.createElement('input');
    editInput.classList.add('edit-subtodo-input');
    editInput.type = 'text';
    // editInput.id = `edit-${subTodo.dataset.id.slice(0,10)}`;
    editInput.placeholder = `${subTodo.children[0].innerText}`;
    formEditInput.appendChild(editInput);

    //add input
    subTodo.appendChild(formEditInput);
    //add buttons
    const okBtn = document.createElement('button');
    okBtn.type = 'submit';
    okBtn.classList.add('sub-ok-btn');
    okBtn.innerHTML = '<i class="fa fa-check"></i>';
    okBtn.addEventListener('click', actionEditTodo);
    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('sub-cancel-btn');
    cancelBtn.addEventListener('click', actionCancelEditTodo);
    cancelBtn.innerHTML = '<i class="fa-solid fa-x"></i>';
    
    formEditInput.appendChild(okBtn);
    subTodo.appendChild(formEditInput);
    subTodo.appendChild(cancelBtn);
    
    document.querySelector('.edit-subtodo-input').focus();

}

function addSubTask(todo, newSubTodoTxt){
    if(!isComplexTodo(todo)){
        changeToComplexTodo(todo);
    }else{
        let subTodoList = todo.parentElement.children[1];
        if(subTodoList.classList.contains('sub-todo-form')){
            subTodoList = todo.parentElement.children[2];
        }
        // console.log(subTodoList);

        const subTodoDiv = document.createElement('div');
        subTodoDiv.classList.add('sub-todo');

        const subTodo = document.createElement('li');
        subTodo.innerText = newSubTodoTxt;
        subTodo.classList.add('todo-item');

        if(newSubTodoTxt.length > 30){
            subTodo.setAttribute('data-size','large');
            subTodo.addEventListener('click', popupTodoComplete);
        }

        subTodoDiv.appendChild(subTodo);

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>'
        editButton.classList.add('sub-todo-edit');
        editButton.addEventListener('click', addSubEditOption);
        subTodoDiv.appendChild(editButton);
    
        const completedButton = document.createElement('button');
        completedButton.innerHTML = '<i class="fa fa-check"></i>'
        completedButton.classList.add('sub-check-btn');
        subTodoDiv.appendChild(completedButton);
    
        const trashButton = document.createElement('button');
        trashButton.innerHTML = '<i class="fa fa-trash"></i>';
        trashButton.classList.add('sub-trash-btn');
        subTodoDiv.appendChild(trashButton);

        subTodoList.insertBefore(subTodoDiv, subTodoList.children[0]);
    }

}
//------------------------------------------------------------------------------
function hasInput4SubTaskOpen(){
    let resp = false;
    if(document.querySelectorAll('.sub-todo-form').length > 0){
        resp = true;
    }
    return resp;
}

function closeSubTodoForm(complexTodo){
    if(complexTodo.children[1].classList.contains('sub-todo-form')){
        const subTodoForm = complexTodo.children[1];
        subTodoForm.remove();

        if(typeof(document.onclick) === 'function'){
            document.onclick = null;
        }
        Array.from(complexTodo.children[0].children).forEach(e => e.setAttribute('style', ''));
    }
}
function actionCloseSubTodoForm(e){
    e.preventDefault();
    let todo = e.target.parentElement.parentElement.children[0]
    closeSubTodoForm(e.target.parentElement.parentElement);
    changeToSimpleTodo(todo)
}
//------------------------------------------------------------------------------
function actionAddSubTask(e){
    e.preventDefault();
    const todo = e.target.parentElement.parentElement.children[0];
    const newSubTodoTxt = e.target.parentElement.children[0].value;
    addSubTask(todo, newSubTodoTxt);
    closeSubTodoForm(todo.parentElement);
}

//creates the form to create the new subtask 
function addInput4SubTask(e){
    const todo = e.target.parentElement.parentElement.parentElement;
    //creates the form element to add a subtask
    if(!isComplexTodo(todo)){
        changeToComplexTodo(todo);
    }
    const subTodoForm = document.createElement('form');
    subTodoForm.classList.add('sub-todo-form');

    const subTodoInput = document.createElement('input');
    subTodoInput.type = 'text';
    subTodoInput.id = `inputNewSub-${todo.dataset.id.slice(0,10)}`;
    subTodoInput.placeholder = 'start tipping...';
    subTodoInput.classList.add('sub-todo-input');
    subTodoForm.appendChild(subTodoInput);

    const newSubTodoButton = document.createElement('button');
    newSubTodoButton.type = 'submit';
    newSubTodoButton.innerHTML = '<i class="fa-regular fa-square-plus"></i>';
    newSubTodoButton.classList.add('add-input-subtask');
    newSubTodoButton.addEventListener('click', actionAddSubTask);
    subTodoForm.appendChild(newSubTodoButton);

    const cancelNewSubButton = document.createElement('button');
    cancelNewSubButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    cancelNewSubButton.classList.add('close-input-subtask');
    cancelNewSubButton.addEventListener('click', actionCloseSubTodoForm);
    subTodoForm.appendChild(cancelNewSubButton);

    todo.parentElement.insertBefore(subTodoForm, todo.parentElement.children[1])
    
    todo.children[1].setAttribute('style', 'pointer-events: none');
    todo.children[2].setAttribute('style', 'pointer-events: none');
    todo.children[3].setAttribute('style', 'pointer-events: none');

    document.querySelector('.sub-todo-input').focus();

    setTimeout(()=>{
        document.onclick = function listenerInput (e){
            if(!e.target.classList.contains('sub-todo-input') && !e.target.classList.contains('add-input-subtask') && !e.target.classList.contains('close-input-subtask')){
                console.error("e.target.classList.contains('add-input-subtask')",e.target.classList.contains('add-input-subtask'))
                closeSubTodoForm(todo.parentElement);
                if(todo.parentElement.children[1].children.length == 0){
                    changeToSimpleTodo(todo)
                }
                //for when it doesnt close by itself
                // document.onclick = null;
            }else{
                console.warn('error ln 475')
            }
        };
    }, 50);


    //closes de from input and adds the new subtask
    //add event to the hole document to close the input if clicked outside this input
    //checks to avoid having more than one instance of the editor open 
    //change style to pointer-events: none;
}

function addNewOption(e){
    if(!hasInput4SubTaskOpen()){
        addInput4SubTask(e);
    }else{
        // closeSubTodoForm(e.target.parentElement.parentElement.parentElement);
        closeSubTodoForm(document.querySelector('.sub-todo-form').parentElement);
    }
}
//------------------------------------------------------------------------------

function saveEditedTodo(id, edit){
}

//------------------------------------------------------------------------------

///checks if it's the same option btn
const isSameBox = (e,todo)=>{
    let res = false;
    if(e.target.classList.contains('options-btn')){
        if(e.target.parentElement.dataset.id === todo.dataset.id){
            res = true;
        }
    }
    return res;
}

function AddPopover(todo){

    const popoverContainer = document.createElement('div');
    popoverContainer.classList.add('popover-container');
    const popover = document.createElement('div');
    popover.classList.add('popover');

    const popoverBtnTop = document.createElement('button');
    popoverBtnTop.classList.add('popover-btn-top');
    popoverBtnTop.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    popoverBtnTop.innerHTML += '<p style="margin: 0px 4px;position: absolute;left: 37px;">edit</p>';
    popover.appendChild(popoverBtnTop);
    popoverBtnTop.addEventListener('click',addEditOption);

    const popoverBtnBottom = document.createElement('button');
    popoverBtnBottom.classList.add('popover-btn-bottom');
    popoverBtnBottom.innerHTML = '<i class="fa-regular fa-square-plus"></i>';
    popoverBtnBottom.innerHTML += '<p style="margin-left: 4px;">add sub tasks</p>';
    popover.appendChild(popoverBtnBottom);
    popoverBtnBottom.addEventListener('click', addNewOption);
    // ------------------------------------------------------------
    
    popoverContainer.appendChild(popover);
    todo.appendChild(popoverContainer);

    todo.children[2].disabled = true;
    todo.children[3].disabled = true;

    document.onclick = function listener (e){
        // if(!e.target.classList.contains('popover-container') && !isSameBox(e,todo)){
        if(!isSameBox(e,todo)){
            closePopover(todo);
            // document.removeEventListener('onclick', listener);
            document.onclick = null;
            // console.log('errasing onclick for the hole document',document.onclick)
        }
        // console.log('still has it',document.onclick)
    };
}

function popupTodoComplete(e){
    let txt = e.target.innerHTML;
    
    if(document.querySelector('.modal') == null){
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.addEventListener('click', (e)=>{
            if(e.target == modal){
                e.target.remove();
            }
        })
        
        const popUpTodo = document.createElement('div');
        popUpTodo.classList.add('pop-up-todo');
        
        const text = document.createElement('p');
        text.innerText = txt;
        popUpTodo.appendChild(text);
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fa-solid fa-x"></i>';
        closeBtn.classList.add('pop-up-btn-close');
        closeBtn.addEventListener('click', (e)=>{
            e.target.parentElement.parentElement.remove();
        })
        popUpTodo.appendChild(closeBtn);
        
        modal.appendChild(popUpTodo);
        
        document.querySelector('.main').appendChild(modal);
    }

}
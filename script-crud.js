// Seleciona elementos do DOM
const taskListContainer = document.querySelector('.app__section-task-list')
const formTask = document.querySelector('.app__form-add-task')
const toggleFormTaskBtn = document.querySelector('.app__button--add-task')
const formLabel = document.querySelector('.app__form-label')
const cancelFormTaskBtn = document.querySelector('.app__form-footer__button--cancel')
const taskAtiveDescription = document.querySelector('.app__section-active-task-description')
const textarea = document.querySelector('.app__form-textarea')
const btnCancelar = document.querySelector('.app__form-footer__button--cancel')
const btnDeletar = document.querySelector('.app__form-footer__button--delete')
const btnDeletarConcluidas = document.querySelector('#btn-remover-concluidas')
const btnDeletarTodas = document.querySelector('#btn-remover-todas')

// Obtém tarefas do armazenamento local e inicializa um array de tarefas
const localStorageTarefas = localStorage.getItem('tarefas')
let tarefas = localStorageTarefas ? JSON.parse(localStorageTarefas) : []

// Define uma representação de ícone SVG como uma string
const taskIconSvg = `
<svg class="app__section-task-icon-status" width="24" height="24" viewBox="0 0 24 24"
    fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FFF" />
    <path
        d="M9 16.1719L19.5938 5.57812L21 6.98438L9 18.9844L3.42188 13.4062L4.82812 12L9 16.1719Z"
        fill="#01080E" />
</svg>
`

// Variáveis para rastrear a tarefa selecionada
let tarefaSelecionada = null
let itemTarefaSelecionada = null

// Variáveis para edição de tarefa
let tarefaEmEdicao = null
let paragraphEmEdicao = null

// Função para remover tarefas (possivelmente somente as concluídas)
const removerTarefas = (somenteConcluidas) => {
    const seletor = somenteConcluidas ? '.app__section-task-list-item-complete' : '.app__section-task-list-item'
    document.querySelectorAll(seletor).forEach((element) => {
        element.remove();
    });

    tarefas = somenteConcluidas ? tarefas.filter(t => !t.concluida) : []
    updateLocalStorage()
}

// Função para selecionar uma tarefa e exibir sua descrição
const selecionaTarefa = (tarefa, elemento) => {
    if (tarefa.concluida) {
        return
    }

    document.querySelectorAll('.app__section-task-list-item-active').forEach(function (button) {
        button.classList.remove('app__section-task-list-item-active')
    })

    if (tarefaSelecionada == tarefa) {
        taskAtiveDescription.textContent = null
        itemTarefaSelecionada = null
        tarefaSelecionada = null
        return
    }

    tarefaSelecionada = tarefa
    itemTarefaSelecionada = elemento
    taskAtiveDescription.textContent = tarefa.descricao
    elemento.classList.add('app__section-task-list-item-active')
}

// Função para limpar o formulário e dados de edição de tarefa
const limparForm = () => {
    tarefaEmEdicao = null
    paragraphEmEdicao = null
    textarea.value = ''
    formTask.classList.add('hidden')
}

// Função para selecionar uma tarefa para edição
const selecionaTarefaParaEditar = (tarefa, elemento) => {
    if (tarefaEmEdicao == tarefa) {
        limparForm()
        return
    }

    formLabel.textContent = 'Editando tarefa'
    tarefaEmEdicao = tarefa
    paragraphEmEdicao = elemento
    textarea.value = tarefa.descricao
    formTask.classList.remove('hidden')
}

// Função para criar elementos de tarefa
function createTask(tarefa) {
    const li = document.createElement('li')
    li.classList.add('app__section-task-list-item')

    const svgIcon = document.createElement('svg')
    svgIcon.innerHTML = taskIconSvg

    const paragraph = document.createElement('p')
    paragraph.classList.add('app__section-task-list-item-description')
    paragraph.textContent = tarefa.descricao

    const button = document.createElement('button')

    button.classList.add('app_button-edit')
    const editIcon = document.createElement('img')
    editIcon.setAttribute('src', '/imagens/edit.png')

    button.appendChild(editIcon)

    button.addEventListener('click', (event) => {
        event.stopPropagation()
        selecionaTarefaParaEditar(tarefa, paragraph)
    })

    li.onclick = () => {
        selecionaTarefa(tarefa, li)
    }

    svgIcon.addEventListener('click', (event) => {
        if (tarefa == tarefaSelecionada) {
            event.stopPropagation()
            button.setAttribute('disabled', true)
            li.classList.add('app__section-task-list-item-complete')
            tarefaSelecionada.concluida = true
            updateLocalStorage()
        }
    })

    if (tarefa.concluida) {
        button.setAttribute('disabled', true)
        li.classList.add('app__section-task-list-item-complete')
    }

    li.appendChild(svgIcon)
    li.appendChild(paragraph)
    li.appendChild(button)
    
    return li
}

// Adiciona tarefas existentes à lista no carregamento da página
tarefas.forEach(task => {
    const taskItem = createTask(task)
    taskListContainer.appendChild(taskItem)
})

// Tratamento de eventos para cancelar o formulário
cancelFormTaskBtn.addEventListener('click', () => {
    formTask.classList.add('hidden')
})

btnCancelar.addEventListener('click', limparForm)

// Tratamento de eventos para mostrar/ocultar o formulário de adição
toggleFormTaskBtn.addEventListener('click', () => {
    formLabel.textContent = 'Adicionando tarefa'
    formTask.classList.toggle('hidden')
})

// Tratamento de eventos para deletar uma tarefa
btnDeletar.addEventListener('click', () => {
    if (tarefaSelecionada) {
        const index = tarefas.indexOf(tarefaSelecionada);
        if (index !== -1) {
            tarefas.splice(index, 1);
        }
        
        itemTarefaSelecionada.remove()
        tarefas.filter(t => t != tarefaSelecionada) 
        itemTarefaSelecionada = null
        tarefaSelecionada = null
    }

    updateLocalStorage()
    limparForm()
})

// Função para atualizar os dados no armazenamento local
const updateLocalStorage = () => {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

// Tratamento de eventos para envio do formulário
formTask.addEventListener('submit', (evento) => {
    evento.preventDefault()
    if (tarefaEmEdicao) {
        tarefaEmEdicao.descricao = textarea.value
        paragraphEmEdicao.textContent = textarea.value
    } else {
        const task = {
            descricao: textarea.value,
            concluida: false
        }
        tarefas.push(task)
        const taskItem = createTask(task)
        taskListContainer.appendChild(taskItem)
    }
    updateLocalStorage()
    limparForm()
})

// Tratamento de eventos para remover tarefas concluídas
btnDeletarConcluidas.addEventListener('click', () => removerTarefas(true))
btnDeletarTodas.addEventListener('click', () => removerTarefas(false))

// Evento personalizado para marcar tarefas como concluídas
document.addEventListener("TarefaFinalizada", function (e) {
    if (tarefaSelecionada) {
        tarefaSelecionada.concluida = true
        itemTarefaSelecionada.classList.add('app__section-task-list-item-complete')
        itemTarefaSelecionada.querySelector('button').setAttribute('disabled', true)
        updateLocalStorage()
    }
});

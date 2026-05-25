import React, { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [tabs, setTabs] = useState(() => {
    const savedTabs = localStorage.getItem('todo_tabs');
    return savedTabs ? JSON.parse(savedTabs) : [{ id: 'geral', name: 'Geral' }];
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [activeTab, setActiveTab] = useState('geral');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskGroup, setNewTaskGroup] = useState('');
  const [newTabName, setNewTabName] = useState('');
  
  const [showAddTabModal, setShowAddTabModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('todo_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTab = (e) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    const newTab = { id: Date.now().toString(), name: newTabName.trim() };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setNewTabName('');
    setShowAddTabModal(false);
  };

  const handleDeleteTab = (tabId, e) => {
    e.stopPropagation();
    if (window.confirm('Deletar esta aba apagará todas as tarefas dela. Continuar?')) {
      setTabs(tabs.filter(tab => tab.id !== tabId));
      setTasks(tasks.filter(task => task.tabId !== tabId));
      setActiveTab('geral');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      tabId: activeTab,
      title: newTaskTitle.trim(),
      deadline: newTaskDeadline,
      group: newTaskGroup.trim() || 'Sem Grupo',
      completed: false,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDeadline('');
    setNewTaskGroup('');
    setShowAddTaskModal(false);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const activeTasks = tasks.filter(task => !task.completed && task.tabId === activeTab);
  const completedTasks = tasks.filter(task => task.completed);

  const groupedTasks = activeTasks.reduce((groups, task) => {
    const groupName = task.group;
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(task);
    return groups;
  }, {});

  const formatDeadline = (dateTimeString) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚡ TaskFlow</h1>
        <button className="btn-add-tab" onClick={() => setShowAddTabModal(true)}>+ Nova Aba</button>
      </header>

      <nav className="tabs-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>📁 {tab.name}</span>
            {tab.id !== 'geral' && (
              <span className="delete-tab-icon" onClick={(e) => handleDeleteTab(tab.id, e)}>×</span>
            )}
          </button>
        ))}
        <button
          className={`tab-button tab-completed ${activeTab === 'concluidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('concluidos')}
        >
          <span>✅ Concluídos</span>
          <span className="badge">({completedTasks.length})</span>
        </button>
      </nav>

      <main className="app-content">
        {activeTab !== 'concluidos' ? (
          <div className="tasks-section">
            {Object.keys(groupedTasks).length === 0 ? (
              <p className="empty-state">Nenhuma tarefa pendente nesta aba. 🙌</p>
            ) : (
              Object.keys(groupedTasks).map(groupName => (
                <div key={groupName} className="task-group">
                  <h4 className="group-title">📁 {groupName}</h4>
                  <div className="tasks-list">
                    {groupedTasks[groupName].map(task => (
                      <div key={task.id} className="task-item">
                        <label className="checkbox-container">
                          <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} />
                          <span className="checkmark"></span>
                        </label>
                        <div className="task-details">
                          <span className="task-title">{task.title}</span>
                          {task.deadline && <span className="task-deadline">📅 {formatDeadline(task.deadline)}</span>}
                        </div>
                        <button className="btn-delete-task" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <button className="btn-trigger-task-modal" onClick={() => setShowAddTaskModal(true)}>
              ➕ Adicionar Tarefa
            </button>
          </div>
        ) : (
          <div className="tasks-section">
            <h2>Tarefas Concluídas</h2>
            {completedTasks.length === 0 ? (
              <p className="empty-state">Nenhuma tarefa concluída ainda. 🚀</p>
            ) : (
              <div className="tasks-list">
                {completedTasks.map(task => (
                  <div key={task.id} className="task-item completed">
                    <label className="checkbox-container">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} />
                      <span className="checkmark"></span>
                    </label>
                    <div className="task-details">
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta-info">Aba original: {tabs.find(t => t.id === task.tabId)?.name || 'Deletada'} | Grupo: {task.group}</span>
                    </div>
                    <button className="btn-delete-task" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAddTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nova Tarefa</h3>
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="O que precisa ser feito?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                autoFocus
              />
              <div className="modal-form-row">
                <input type="datetime-local" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} />
                <input type="text" placeholder="Grupo (ex: Trabalho)" value={newTaskGroup} onChange={(e) => setNewTaskGroup(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddTaskModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddTabModal && (
        <div className="modal-overlay" onClick={() => setShowAddTabModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Criar Nova Aba</h3>
            <form onSubmit={handleCreateTab}>
              <input type="text" placeholder="Nome da Aba" value={newTabName} onChange={(e) => setNewTabName(e.target.value)} autoFocus required />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddTabModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
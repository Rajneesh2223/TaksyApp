import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CreateTask from './CreateTask';
const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pdfViewerModal, setPdfViewerModal] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [currentPdfPath, setCurrentPdfPath] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
 const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    dueDateRange: 'all'
  });
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const {token , role} = useSelector((state) => state.user);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filters, sortBy, sortOrder]);

  useEffect(() => {
    if (filteredTasks.length > 0 && !selectedTask) {
      setSelectedTask(filteredTasks[0]);
    }
  }, [filteredTasks]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      
      if (data && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        throw new Error('Invalid tasks data format');
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

 
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dueDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(task => {
        const dueDate = new Date(task.dueDate);
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        switch (filters.dueDateRange) {
          case 'overdue':
            return dueDateOnly < today;
          case 'today':
            return dueDateOnly.getTime() === today.getTime();
          case 'thisWeek':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return dueDateOnly >= today && dueDateOnly <= weekFromNow;
          case 'thisMonth':
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(today.getMonth() + 1);
            return dueDateOnly >= today && dueDateOnly <= monthFromNow;
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredTasks(filtered);
    
    if (selectedTask && !filtered.find(task => task._id === selectedTask._id)) {
      setSelectedTask(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      


      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
        console.log("task",taskId)
        alert('Task deleted successfully');
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task: ' + error.message);
    }
  };
 const handleEditTask = (task) => {
    navigate(`/edit/${task._id}`);
  };

  const getFileName = (filePath) => {
    return filePath.split(/[/\\]/).pop();
  };

  const handleViewPdf = async (documentPath) => {
    try {
      const filename = getFileName(documentPath);
      const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
      console.log(pdfUrl)
      
      const response = await fetch(pdfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      setCurrentPdf(blobUrl);
      setCurrentPdfPath(documentPath);
      setPdfViewerModal(true);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Error viewing PDF: ' + error.message);
    }
  };

  const handleDownloadPdf = async (documentPath) => {
    try {
      const filename = getFileName(documentPath);
      const pdfUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
      
      const response = await fetch(pdfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Failed to download PDF: ${response.statusText}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    }
  };

  const handleDownloadFromViewer = () => {
    if (currentPdfPath) handleDownloadPdf(currentPdfPath);
  };

  const closePdfViewer = () => {
    if (currentPdf) URL.revokeObjectURL(currentPdf);
    setCurrentPdf(null);
    setCurrentPdfPath(null);
    setPdfViewerModal(false);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
      dueDateRange: 'all'
    });
    setSortBy('dueDate');
    setSortOrder('asc');
  };

  const getDueDateStatus = (dueDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate);
    const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    
    if (dueOnly < today) return 'overdue';
    if (dueOnly.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  console.log(selectedTask)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Task Dashboard</h1>
          {
            role === 'admin' && (
 <button
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Task
          </button>
            )
          }
         
        </div>
      </div>

    
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 bg-white border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.dueDateRange}
                  onChange={(e) => setFilters({...filters, dueDateRange: e.target.value})}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="status">Sort by Status</option>
                  <option value="createdAt">Sort by Created</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

            
              <div className="text-sm text-gray-600 text-center">
                {filteredTasks.length} of {tasks.length} tasks
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading tasks...</div>
              </div>
            )}

            {error && (
              <div className="p-4 text-red-600 bg-red-50 border-l-4 border-red-400">
                Error: {error}
              </div>
            )}

            {!loading && !error && filteredTasks.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No tasks found</div>
              </div>
            )}

            {filteredTasks.map((task) => {
              const dueDateStatus = getDueDateStatus(task.dueDate);
              return (
                <div
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTask?._id === task._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{task.description}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <div className={`text-xs mt-2 ${
                        dueDateStatus === 'overdue' ? 'text-red-600' :
                        dueDateStatus === 'today' ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {dueDateStatus === 'overdue' && ' (Overdue)'}
                        {dueDateStatus === 'today' && ' (Today)'}
                      </div>
                    </div>

                    {task.documents?.length > 0 && (
                      <div className="ml-2 flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="flex-1 bg-white">
          {selectedTask ? (
            <div className="h-full flex flex-col">
              {/* Task Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditTask(selectedTask)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  {
  role === "admin" && (
    <button
      onClick={() => handleDeleteTask(selectedTask._id)}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Task"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  )
}

                  </div>
                </div>

               
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedTask.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                    <div className={`text-sm ${
                      getDueDateStatus(selectedTask.dueDate) === 'overdue' ? 'text-red-600 font-medium' :
                      getDueDateStatus(selectedTask.dueDate) === 'today' ? 'text-orange-600 font-medium' :
                      'text-gray-900'
                    }`}>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                      {getDueDateStatus(selectedTask.dueDate) === 'overdue' && ' (Overdue)'}
                      {getDueDateStatus(selectedTask.dueDate) === 'today' && ' (Today)'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                    <div className="text-sm text-gray-900">
                      {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

             
              <div className="flex-1 p-6 overflow-y-auto">
                {selectedTask.documents?.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Documents ({selectedTask.documents.length})
                    </h3>
                    <div className="grid gap-4">
                      {selectedTask.documents.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{getFileName(doc)}</h4>
                                <p className="text-sm text-gray-600">PDF Document</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPdf(doc)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadPdf(doc)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
                    <p className="text-gray-600">This task doesn't have any documents attached.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Task</h3>
                <p className="text-gray-600">Choose a task from the list to view its details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative overflow-y-auto max-h-screen">
            <div className="absolute top-3 right-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <CreateTask 
              taskToEdit={editingTask}
              onTaskCreated={() => {
                setShowModal(false);
                fetchTasks();
              }} 
            />
          </div>
        </div>
      )}

     {pdfViewerModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] relative flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">PDF Viewer</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadFromViewer}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={closePdfViewer}
                  className="text-gray-600 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {currentPdf && (
                <iframe
                  src={currentPdf}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              )}
            </div>
          </div>
        </div>
      )}
      </div>
  )}

  export default Dashboard
  
// import React from 'react';

// const App: React.FC = () => {

  /*

    TODO: starting from this skeleton, build a dashboard to fullfill the use cases provided. The dashboard should be:
    - visually appealing (we don't expect anything fancy, but don't use plain text either)
    - clean and well-organized
    - easy to use

    Organize your code as you see fit.

  */

//   return <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
//     <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <div className="bg-white shadow-lg rounded-xl p-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">A better TODO system</h1>
//         <div className="rounded-lg p-3">
//           <p>TODO</p>
//         </div>
//       </div>
//     </div>
//   </div>

// };

// export default App;

import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  estimated_time: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]); // Specify Todo type
  const [newTodo, setNewTodo] = useState<{ title: string; estimated_time: number }>({ title: "", estimated_time: 0 });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:8000/todos");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };
  

  const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/todos", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo),
    });
    await response.json();
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this todo?");
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:8000/todos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchTodos(); // Refresh the todos list after deletion
        } else {
          console.error("Failed to delete todo:", await response.text());
        }
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">TODO List</h1>
          
          <ul className="mb-6">
            {todos.map(todo => (
              <li key={todo.id} className="flex justify-between items-center p-2 border-b border-gray-300">
                <span>{todo.title} - {todo.estimated_time} minutes</span>
                <button 
                  onClick={() => deleteTodo(todo.id)} 
                  className="text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">Add a new TODO</h2>
          <form onSubmit={addTodo} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newTodo.title}
              onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Estimated time (minutes)"
              value={newTodo.estimated_time}
              onChange={e => setNewTodo({ ...newTodo, estimated_time: parseInt(e.target.value) })}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit" 
              className="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-700 transition"
            >
              Add TODO
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

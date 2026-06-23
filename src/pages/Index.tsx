"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Check, Trash2, RotateCcw, Edit2, AlertTriangle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // ✅ verificar usuário
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        navigate("/login");
      } else {
        fetchTasks(data.user);
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // ✅ buscar tarefas (ativas + deletadas)
  const fetchTasks = async (user) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      setTasks(data.filter((t) => !t.deleted));
      setDeletedTasks(data.filter((t) => t.deleted));
    }
  };

  // ✅ adicionar trabalho
  const addTask = async () => {
    if (!newTask.trim()) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    await supabase.from("tasks").insert([
      {
        title: newTask.trim(),
        user_id: user.id,
        deleted: false,
      },
    ]);

    setNewTask("");
    fetchTasks(user);
  };

  // ✅ SOFT DELETE (com confirmação)
  const deleteTask = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este trabalho?");
    if (!confirmar) return;

    await supabase
      .from("tasks")
      .update({ deleted: true })
      .eq("id", id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ RESTAURAR
  const restoreTask = async (id) => {
    await supabase
      .from("tasks")
      .update({ deleted: false })
      .eq("id", id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ marcar concluído
  const toggleCompleted = async (id, currentStatus) => {
    await supabase
      .from("tasks")
      .update({ completed: !currentStatus })
      .eq("id", id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ editar
  const editTask = async (task) => {
    const novoTitulo = prompt("Editar trabalho:", task.title);
    if (!novoTitulo || !novoTitulo.trim()) return;

    await supabase
      .from("tasks")
      .update({ title: novoTitulo.trim() })
      .eq("id", task.id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ logout
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Controle de Trabalhos</h1>
                <p className="text-sm text-gray-500">Gerencie suas tarefas com estilo</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mb-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Sair
            </button>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">Novo trabalho</h2>

            <div className="flex gap-3 mb-6">
              <input
                placeholder="Digite seu trabalho"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={addTask}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Check className="h-4 w-4" />
                Adicionar
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">Meus trabalhos</h2>
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum trabalho adicionado ainda. Comece adicionando uma tarefa acima!</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 p-4 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center space-x-3"
                  >
                    <div className="flex-1 flex items-center space-x-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg">
                        {task.completed ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-dashed border-gray-400 rounded-full" />
                        )}
                      </div>
                      <span
                        onClick={() => toggleCompleted(task.id, task.completed)}
                        className={`cursor-pointer flex-1 text-left ${task.completed ? "line-through text-gray-500" : ""}`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => editTask(task)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Editar
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Trabalhos excluídos</h2>
            {deletedTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum trabalho excluído.</p>
            ) : (
              <ul className="space-y-2">
                {deletedTasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-red-50 hover:bg-red-100 transition-colors duration-200 p-3 rounded-lg border border-red-200 hover:border-red-300 flex items-center justify-between"
                  >
                    <span className="text-red-600 line-through">{task.title}</span>
                    <button
                      onClick={() => restoreTask(task.id)}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restaurar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
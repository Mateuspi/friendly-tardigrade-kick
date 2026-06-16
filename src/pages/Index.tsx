"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // 🔹 Verificar login + buscar tarefas
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

  // 🔹 Buscar tarefas
  const fetchTasks = async (user) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (data) setTasks(data);
  };

  // 🔹 Adicionar tarefa
  const addTask = async () => {
    if (!newTask) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    await supabase.from("tasks").insert([
      {
        title: newTask,
        user_id: user.id,
      },
    ]);

    setNewTask("");
    fetchTasks(user);
  };

  // 🔹 Logout
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Meu To Do ✅</h1>

      <button onClick={logout}>Sair</button>

      <hr />

      <h3>Nova tarefa</h3>

      <input
        placeholder="Digite sua tarefa"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />

      <button onClick={addTask}>Adicionar</button>

      <hr />

      <h3>Minhas tarefas</h3>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Index;

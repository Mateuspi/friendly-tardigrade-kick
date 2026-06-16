"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
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

  // ✅ buscar tarefas
  const fetchTasks = async (user) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (data) setTasks(data);
  };

  // ✅ adicionar tarefa
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

  // ✅ excluir tarefa
  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ marcar como concluída
  const toggleCompleted = async (id, currentStatus) => {
    await supabase
      .from("tasks")
      .update({ completed: !currentStatus })
      .eq("id", id);

    const { data } = await supabase.auth.getUser();
    fetchTasks(data.user);
  };

  // ✅ logout
  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Carregando...</p>;
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        background: "#fff",
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>Meu To Do ✅</h1>

      <button
        onClick={logout}
        style={{
          marginBottom: "15px",
          padding: "5px 10px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Sair
      </button>

      <h3>Nova tarefa</h3>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Digite sua tarefa"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={addTask}
          style={{
            padding: "8px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Adicionar
        </button>
      </div>

      <h3>Minhas tarefas</h3>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              marginBottom: "8px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f9f9f9",
            }}
          >
            <span
              onClick={() => toggleCompleted(task.id, task.completed)}
              style={{
                cursor: "pointer",
                textDecoration: task.completed
                  ? "line-through"
                  : "none",
              }}
            >
              {task.completed ? "✅" : "⬜"} {task.title}
            </span>

            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "5px",
                borderRadius: "5px",
              }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;
``
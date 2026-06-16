"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // ✅ Verifica usuário e busca tarefas
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

  // ✅ Buscar tarefas do usuário
  const fetchTasks = async (user) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id);

    if (data) setTasks(data);
  };

  // ✅ Criar tarefa
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

  // ✅ Logout
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
              textAlign: "left",
              background: "#f9f9f9",
            }}
          >
            ✅ {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;
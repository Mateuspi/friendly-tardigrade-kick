"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
    if (!newTask) return;

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    await supabase.from("tasks").insert([
      {
        title: newTask,
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
    if (!novoTitulo) return;

    await supabase
      .from("tasks")
      .update({ title: novoTitulo })
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
    return <p style={{ textAlign: "center" }}>Carregando...</p>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        paddingTop: "50px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "auto",
          padding: "20px",
          borderRadius: "12px",
          background: "#ffffff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>📘 Controle de Trabalhos</h1>

        <button
          onClick={logout}
          style={{
            marginBottom: "20px",
            padding: "6px 12px",
            background: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>

        <h3>Novo trabalho</h3>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            placeholder="Digite seu trabalho"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={addTask}
            style={{
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Adicionar
          </button>
        </div>

        <h3>Meus trabalhos</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                padding: "12px",
                border: "1px solid #ddd",
                marginBottom: "10px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <span
                onClick={() => toggleCompleted(task.id, task.completed)}
                style={{
                  cursor: "pointer",
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.completed ? "✅" : "⬜"} {task.title}
              </span>

              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => editTask(task)}
                  style={{
                    background: "#ffa500",
                    color: "white",
                    border: "none",
                    padding: "6px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "6px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h3>Trabalhos excluídos</h3>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {deletedTasks.map((task) => (
            <li
              key={task.id}
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#999" }}>{task.title}</span>

              <button
                onClick={() => restoreTask(task.id)}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "6px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Restaurar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Index;

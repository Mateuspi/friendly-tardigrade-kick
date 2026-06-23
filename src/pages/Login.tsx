"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else if (data.session) {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow-lg">
        {/* App Name */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Controle de Trabalhos</h2>
          <p className="text-gray-600 text-center mb-4">Sua plataforma de gestão de tarefas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors duration-200"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 text-center mt-2">
            {error}
          </p>
        )}

        <p className="text-center text-sm mt-4">
          Não tem conta?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Cadastrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Index;
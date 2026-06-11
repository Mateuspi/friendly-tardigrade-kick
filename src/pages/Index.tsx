"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Você está logado ✅</h1>
        <p className="text-xl text-gray-600">
          Bem-vindo ao seu app To Do!
        </p>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/login");
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Sair
        </button>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;
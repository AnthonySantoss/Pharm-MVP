"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-bg">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-severity-grave/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-severity-grave"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L14.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-dark-text">
          Algo deu errado
        </h1>
        <p className="text-muted-text text-sm">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={reset}
            className="bg-sec-default text-on-sec hover:bg-sec-hover rounded-full"
          >
            Tentar novamente
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="rounded-full"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
}

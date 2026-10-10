import { Rol } from "@prisma/client";
import "@auth/core/types";
import "@auth/core/jwt";

declare module "@auth/core/types" {
  interface User {
    id?: string;
    usuario?: string;
    nombre?: string;
    correo?: string;
    rol?: Rol;
    departamentoId?: number;
    departamentoNombre?: string;
  }

  interface Session {
    user: {
      id: string;
      usuario: string;
      nombre: string;
      correo: string;
      rol: Rol;
      departamentoId: number;
      departamentoNombre: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    usuario?: string;
    nombre?: string;
    correo?: string;
    rol?: Rol;
    departamentoId?: number;
    departamentoNombre?: string;
  }
}

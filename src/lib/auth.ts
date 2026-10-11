import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/schemas/auth.schema";
import type { Rol } from "@prisma/client";

export class InactiveUserError extends CredentialsSignin {
  code = "inactive_user";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { usuario, password } = parsedCredentials.data;

        // Buscar por nombre de usuario o por correo electrónico (incluyendo inactivos para verificar)
        const user = await db.usuario.findFirst({
          where: {
            OR: [
              { usuario: usuario.toLowerCase() },
              { correo: usuario.toLowerCase() },
            ],
          },
          include: {
            departamento: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        // Si la contraseña es correcta pero la cuenta está inactiva, lanzar InactiveUserError
        if (!user.activo) {
          throw new InactiveUserError();
        }

        return {
          id: String(user.id),
          usuario: user.usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol,
          departamentoId: user.departamentoId,
          departamentoNombre: user.departamento.nombre,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.usuario = user.usuario;
        token.nombre = user.nombre;
        token.correo = user.correo;
        token.rol = user.rol;
        token.departamentoId = user.departamentoId;
        token.departamentoNombre = user.departamentoNombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.usuario = (token.usuario as string) ?? "";
        session.user.nombre = (token.nombre as string) ?? "";
        session.user.correo = (token.correo as string) ?? "";
        session.user.rol = token.rol as Rol;
        session.user.departamentoId = (token.departamentoId as number) ?? 0;
        session.user.departamentoNombre = (token.departamentoNombre as string) ?? "";
      }
      return session;
    },
  },
});

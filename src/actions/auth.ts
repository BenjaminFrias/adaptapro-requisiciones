'use server';

import { signIn, signOut, auth, InactiveUserError } from '@/lib/auth';
import { db } from '@/lib/db';
import { changePasswordSchema, loginSchema } from '@/schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export async function loginAction(formData: FormData) {
	const usuario = formData.get('usuario') as string;
	const password = formData.get('password') as string;

	const validation = loginSchema.safeParse({ usuario, password });
	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || 'Datos inválidos',
		};
	}

	try {
		await signIn('credentials', {
			usuario,
			password,
			redirectTo: '/dashboard',
		});

		return { success: true };
	} catch (error) {
		if (error instanceof AuthError) {
			const cause =
				typeof error.cause === 'object' && error.cause !== null
					? (error.cause as Record<string, unknown>)
					: null;
			const causeErr =
				cause && typeof cause.err === 'object' && cause.err !== null
					? (cause.err as Record<string, unknown>)
					: null;

			const isInactive =
				error instanceof InactiveUserError ||
				('code' in error && error.code === 'inactive_user') ||
				(cause !== null && cause.code === 'inactive_user') ||
				(causeErr !== null && causeErr.code === 'inactive_user') ||
				error.message.includes('inactive_user');

			if (isInactive) {
				return {
					success: false,
					error: 'Tu cuenta se encuentra inactiva. Contacta al administrador del sistema.',
				};
			}

			switch (error.type) {
				case 'CredentialsSignin':
					return {
						success: false,
						error: 'Usuario o contraseña incorrectos',
					};
				default:
					return {
						success: false,
						error: 'Error al iniciar sesión. Inténtelo de nuevo.',
					};
			}
		}
		// Re-lanzar para que Next.js maneje el redirect interno de server action
		throw error;
	}
}

export async function logoutAction() {
	await signOut({ redirectTo: '/login' });
}

export async function changePasswordAction(formData: FormData) {
	const session = await auth();

	if (!session?.user) {
		return {
			success: false,
			error: 'No estás autenticado',
		};
	}

	const currentPassword = formData.get('currentPassword') as string;
	const newPassword = formData.get('newPassword') as string;
	const confirmPassword = formData.get('confirmPassword') as string;

	const validation = changePasswordSchema.safeParse({
		currentPassword,
		newPassword,
		confirmPassword,
	});

	if (!validation.success) {
		return {
			success: false,
			error: validation.error.issues[0]?.message || 'Datos inválidos',
		};
	}

	const userId = parseInt(session.user.id, 10);

	const user = await db.usuario.findUnique({
		where: { id: userId },
	});

	if (!user) {
		return {
			success: false,
			error: 'Usuario no encontrado',
		};
	}

	const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
	if (!passwordsMatch) {
		return {
			success: false,
			error: 'La contraseña actual es incorrecta',
		};
	}

	const newHash = await bcrypt.hash(newPassword, 10);
	await db.usuario.update({
		where: { id: userId },
		data: { password: newHash },
	});

	return {
		success: true,
		message: 'Contraseña actualizada exitosamente',
	};
}

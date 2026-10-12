import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				'h-11 w-full min-w-0 rounded-md border border-slate-300/80 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors outline-none placeholder:text-slate-400/90 hover:border-slate-400/80 focus-visible:border-[#035786] focus-visible:ring-3 focus-visible:ring-[#035786]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-0 md:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-600 dark:focus-visible:border-[#035786] dark:disabled:bg-zinc-800 dark:aria-invalid:border-red-500',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };

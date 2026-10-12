import { ReactNode } from 'react';

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
					{title}
				</h1>
				{description && (
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
						{description}
					</p>
				)}
			</div>
			{children && (
				<div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
					{children}
				</div>
			)}
		</div>
	);
}

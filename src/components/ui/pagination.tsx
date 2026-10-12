'use client';

import * as React from 'react';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from 'cn';

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	startItem: number;
	endItem: number;
	canNext: boolean;
	canPrev: boolean;
	onPageChange: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSizeOptions?: number[];
	className?: string;
	showPageSizeSelector?: boolean;
}

export function Pagination({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	startItem,
	endItem,
	canNext,
	canPrev,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 15, 25, 50],
	className,
	showPageSizeSelector = true,
}: PaginationProps) {
	// Opciones para el selector de cantidad de registros por página
	const selectItems = React.useMemo(() => {
		return pageSizeOptions.map((opt) => ({
			value: String(opt),
			label: `${opt} por página`,
		}));
	}, [pageSizeOptions]);

	// Generar lista de números de páginas con puntos suspensivos
	const pageNumbers = React.useMemo(() => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		if (currentPage <= 4) {
			return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages] as const;
		}

		if (currentPage >= totalPages - 3) {
			return [
				1,
				'ellipsis-start',
				totalPages - 4,
				totalPages - 3,
				totalPages - 2,
				totalPages - 1,
				totalPages,
			] as const;
		}

		return [
			1,
			'ellipsis-start',
			currentPage - 1,
			currentPage,
			currentPage + 1,
			'ellipsis-end',
			totalPages,
		] as const;
	}, [currentPage, totalPages]);

	if (totalItems === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				'flex flex-col sm:flex-row items-center justify-between gap-3.5 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-xs text-slate-500 dark:text-slate-400 select-none',
				className,
			)}
		>
			{/* Información de Registros y Selector de Tamaño */}
			<div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
				<div className="text-xs text-slate-500 dark:text-slate-400">
					Mostrando{' '}
					<span className="font-medium text-slate-700 dark:text-slate-300">
						{startItem}–{endItem}
					</span>{' '}
					de{' '}
					<span className="font-medium text-slate-700 dark:text-slate-300">
						{totalItems}
					</span>{' '}
					{totalItems === 1 ? 'resultado' : 'resultados'}
				</div>

				{showPageSizeSelector && onPageSizeChange && (
					<div className="flex items-center gap-1.5">
						<span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
							Mostrar:
						</span>
						<Select
							items={selectItems}
							value={String(pageSize)}
							onValueChange={(val) => {
								if (val) {
									onPageSizeChange(Number(val));
								}
							}}
						>
							<SelectTrigger
								size="sm"
								className="h-7.5 px-2.5 text-xs bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700/80 rounded-md min-w-28 text-slate-600 dark:text-slate-300 font-medium"
							>
								<SelectValue>
									{(val) => `${val} por pág.`}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="rounded-md border-slate-200 dark:border-zinc-800">
								{selectItems.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			{/* Controles de Navegación entre Páginas */}
			{totalPages > 1 && (
				<div className="flex items-center gap-1 sm:gap-1.5 self-center sm:self-auto">
					{/* Primera página (solo si hay muchas páginas) */}
					{totalPages > 5 && (
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(1)}
							disabled={!canPrev}
							aria-label="Primera página"
							className="h-8 w-8 rounded-md border-slate-200 dark:border-zinc-700/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
						>
							<ChevronsLeft className="w-3.5 h-3.5" />
						</Button>
					)}

					{/* Anterior */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage - 1)}
						disabled={!canPrev}
						className="h-8 px-2.5 text-xs gap-1 rounded-md border-slate-200 dark:border-zinc-700/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-40"
					>
						<ChevronLeft className="w-3.5 h-3.5" />
						<span className="hidden sm:inline">Anterior</span>
					</Button>

					{/* Botones de Páginas Numéricas */}
					<div className="flex items-center gap-1 px-1">
						{pageNumbers.map((page, idx) => {
							if (page === 'ellipsis-start' || page === 'ellipsis-end') {
								return (
									<span
										key={`ellipsis-${idx}`}
										className="flex items-center justify-center w-7 h-8 text-slate-400 select-none"
									>
										<MoreHorizontal className="w-3.5 h-3.5" />
									</span>
								);
							}

							const isActive = page === currentPage;

							return (
								<Button
									key={`page-${page}`}
									variant={isActive ? 'default' : 'outline'}
									size="icon-sm"
									onClick={() => onPageChange(page)}
									className={cn(
										'h-8 w-8 text-xs font-semibold rounded-md transition-all',
										isActive
											? 'bg-[#035786] hover:bg-[#02456b] text-white border-transparent'
											: 'border-slate-200 dark:border-zinc-700/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300',
									)}
								>
									{page}
								</Button>
							);
						})}
					</div>

					{/* Siguiente */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(currentPage + 1)}
						disabled={!canNext}
						className="h-8 px-2.5 text-xs gap-1 rounded-md border-slate-200 dark:border-zinc-700/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-40"
					>
						<span className="hidden sm:inline">Siguiente</span>
						<ChevronRight className="w-3.5 h-3.5" />
					</Button>

					{/* Última página (solo si hay muchas páginas) */}
					{totalPages > 5 && (
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(totalPages)}
							disabled={!canNext}
							aria-label="Última página"
							className="h-8 w-8 rounded-md border-slate-200 dark:border-zinc-700/70 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
						>
							<ChevronsRight className="w-3.5 h-3.5" />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

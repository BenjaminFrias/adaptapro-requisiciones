'use client';

import { useState, useMemo } from 'react';

export interface UsePaginationOptions<T> {
	items: T[];
	initialPageSize?: number;
}

export interface UsePaginationReturn<T> {
	currentPage: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	paginatedItems: T[];
	startItem: number;
	endItem: number;
	canNext: boolean;
	canPrev: boolean;
	goToPage: (page: number) => void;
	nextPage: () => void;
	prevPage: () => void;
	setPageSize: (size: number) => void;
	resetPage: () => void;
}

export function usePagination<T>({
	items,
	initialPageSize = 15,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSizeState] = useState(initialPageSize);
	const [prevItemsLength, setPrevItemsLength] = useState(items.length);

	// Resetear a página 1 cuando la cantidad total de elementos cambia (filtros, búsquedas)
	// Patrón oficial de React para ajustar estado durante el render sin efectos secundarios
	if (items.length !== prevItemsLength) {
		setPrevItemsLength(items.length);
		setCurrentPage(1);
	}

	const totalItems = items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

	// Asegurar que la página actual esté siempre dentro de los límites válidos
	const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

	const paginatedItems = useMemo(() => {
		const startIndex = (validCurrentPage - 1) * pageSize;
		return items.slice(startIndex, startIndex + pageSize);
	}, [items, validCurrentPage, pageSize]);

	const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
	const endItem = Math.min(validCurrentPage * pageSize, totalItems);

	const goToPage = (page: number) => {
		const target = Math.min(Math.max(1, page), totalPages);
		setCurrentPage(target);
	};

	const nextPage = () => {
		if (validCurrentPage < totalPages) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	const prevPage = () => {
		if (validCurrentPage > 1) {
			setCurrentPage((prev) => prev - 1);
		}
	};

	const setPageSize = (newPageSize: number) => {
		setPageSizeState(newPageSize);
		setCurrentPage(1);
	};

	const resetPage = () => {
		setCurrentPage(1);
	};

	return {
		currentPage: validCurrentPage,
		pageSize,
		totalPages,
		totalItems,
		paginatedItems,
		startItem,
		endItem,
		canNext: validCurrentPage < totalPages,
		canPrev: validCurrentPage > 1,
		goToPage,
		nextPage,
		prevPage,
		setPageSize,
		resetPage,
	};
}

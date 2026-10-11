'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { parseMontoBs, formatMontoBs } from '@/utils/currency';
import { cn } from 'cn';

function formatInteger(digits: string): string {
	if (!digits) return '';
	const clean = digits.replace(/^0+(?=\d)/, '');
	return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getCursorPosition(
	formatted: string,
	digitsBeforeCursor: number,
): number {
	if (digitsBeforeCursor <= 0) return 0;
	let count = 0;
	for (let i = 0; i < formatted.length; i++) {
		if (/\d/.test(formatted[i])) {
			count++;
			if (count === digitsBeforeCursor) {
				return i + 1;
			}
		}
	}
	return formatted.length;
}

export interface CurrencyInputProps
	extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
	value: number | null | undefined;
	onChange: (val: number | null) => void;
}

export const CurrencyInput = React.forwardRef<
	HTMLInputElement,
	CurrencyInputProps
>(function CurrencyInput(
	{ value, onChange, placeholder = '0,00', className, onBlur, onKeyDown, onPaste, ...props },
	forwardedRef,
) {
	const internalRef = React.useRef<HTMLInputElement>(null);
	React.useImperativeHandle(forwardedRef, () => internalRef.current as HTMLInputElement);

	const [texto, setTexto] = React.useState(() => {
		if (value !== null && value !== undefined && !isNaN(value)) {
			return formatMontoBs(value);
		}
		return '';
	});
	const [prevValue, setPrevValue] = React.useState(value);

	if (prevValue !== value) {
		setPrevValue(value);
		if (value === null || value === undefined) {
			setTexto('');
		} else if (!isNaN(value)) {
			const currentParsed = parseMontoBs(texto);
			if (currentParsed !== value) {
				setTexto(formatMontoBs(value));
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;

		const selStart = internalRef.current?.selectionStart ?? texto.length;
		const selEnd = internalRef.current?.selectionEnd ?? texto.length;
		const commaIdx = texto.indexOf(',');

		// Si el usuario presiona coma o punto para pasar a decimales
		if (e.key === ',' || e.key === '.') {
			e.preventDefault();
			if (!texto) {
				const formatted = '0,00';
				setTexto(formatted);
				onChange(0);
				requestAnimationFrame(() => {
					internalRef.current?.setSelectionRange(2, 2);
				});
				return;
			}
			if (commaIdx !== -1) {
				const nextPos = commaIdx + 1;
				requestAnimationFrame(() => {
					internalRef.current?.setSelectionRange(nextPos, nextPos);
				});
			}
			return;
		}

		// Si el usuario presiona un dígito y el cursor está en los decimales
		if (
			/^\d$/.test(e.key) &&
			commaIdx !== -1 &&
			selStart > commaIdx &&
			selStart === selEnd
		) {
			e.preventDefault();
			const decOffset = selStart - (commaIdx + 1); // 0 o 1
			if (decOffset < 2) {
				const parts = texto.split(',');
				const curDec = (parts[1] || '00').split('');
				curDec[decOffset] = e.key;
				const newDec = curDec.slice(0, 2).join('');
				const newText = parts[0] + ',' + newDec;
				setTexto(newText);
				const parsed = parseMontoBs(newText);
				onChange(parsed);
				const nextPos = selStart + 1;
				requestAnimationFrame(() => {
					internalRef.current?.setSelectionRange(nextPos, nextPos);
				});
			}
			return;
		}

		// Si todo el texto está seleccionado y se escribe un dígito
		if (
			/^\d$/.test(e.key) &&
			selStart === 0 &&
			selEnd === texto.length &&
			texto.length > 0
		) {
			e.preventDefault();
			const newText = e.key + ',00';
			setTexto(newText);
			const num = Number(e.key);
			onChange(num);
			requestAnimationFrame(() => {
				internalRef.current?.setSelectionRange(1, 1);
			});
			return;
		}

		// Manejo de Backspace
		if (e.key === 'Backspace') {
			if (selStart !== selEnd) {
				if (selStart === 0 && selEnd === texto.length) {
					e.preventDefault();
					setTexto('');
					onChange(null);
				}
				return;
			}

			if (commaIdx !== -1) {
				// Cursor en decimales
				if (selStart > commaIdx) {
					e.preventDefault();
					const decOffset = selStart - (commaIdx + 1);
					const parts = texto.split(',');
					const curDec = (parts[1] || '00').split('');
					if (decOffset === 2) {
						curDec[1] = '0';
						const newText = parts[0] + ',' + curDec.join('');
						setTexto(newText);
						onChange(parseMontoBs(newText));
						requestAnimationFrame(() => {
							internalRef.current?.setSelectionRange(
								selStart - 1,
								selStart - 1,
							);
						});
					} else if (decOffset === 1) {
						curDec[0] = '0';
						const newText = parts[0] + ',' + curDec.join('');
						setTexto(newText);
						onChange(parseMontoBs(newText));
						requestAnimationFrame(() => {
							internalRef.current?.setSelectionRange(commaIdx, commaIdx);
						});
					} else if (decOffset === 0) {
						requestAnimationFrame(() => {
							internalRef.current?.setSelectionRange(commaIdx, commaIdx);
						});
					}
					return;
				}

				// Cursor en parte entera: si solo queda 1 dígito y se borra
				const intDigits = texto.slice(0, commaIdx).replace(/\D/g, '');
				if (intDigits.length <= 1 && selStart <= commaIdx) {
					e.preventDefault();
					setTexto('');
					onChange(null);
					return;
				}

				// Si el cursor está justo tras un punto de miles (ej. 2.|000,00)
				if (selStart > 0 && texto[selStart - 1] === '.') {
					e.preventDefault();
					const beforeDot = texto.slice(0, selStart - 2);
					const afterDot = texto.slice(selStart);
					const rawCombined = beforeDot + afterDot;
					const parts = rawCombined.split(',');
					const newIntDigits = parts[0].replace(/\D/g, '');
					if (!newIntDigits) {
						setTexto('');
						onChange(null);
						return;
					}
					const formattedInt = formatInteger(newIntDigits);
					const dec = parts[1] || '00';
					const newText = formattedInt + ',' + dec;
					setTexto(newText);
					onChange(parseMontoBs(newText));
					const digitsBefore = (beforeDot.match(/\d/g) || []).length;
					const nextCursor = getCursorPosition(newText, digitsBefore);
					requestAnimationFrame(() => {
						internalRef.current?.setSelectionRange(nextCursor, nextCursor);
					});
					return;
				}
			}
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (!raw.trim()) {
			setTexto('');
			onChange(null);
			return;
		}

		const commaIdx = raw.indexOf(',');
		let intRaw = raw;
		let decRaw = '00';

		if (commaIdx !== -1) {
			intRaw = raw.slice(0, commaIdx);
			decRaw = raw.slice(commaIdx + 1);
		}

		const intDigits = intRaw.replace(/\D/g, '');
		const decDigits = decRaw.replace(/\D/g, '').slice(0, 2).padEnd(2, '0');

		if (!intDigits) {
			setTexto('');
			onChange(null);
			return;
		}

		const formattedInt = formatInteger(intDigits);
		const formatted = formattedInt + ',' + decDigits;
		setTexto(formatted);

		const parsed = parseMontoBs(formatted);
		onChange(parsed);

		const cursorPos = e.target.selectionStart ?? raw.length;
		const textBeforeCursor = raw.slice(0, cursorPos);
		const digitsBeforeCursor = (textBeforeCursor.match(/\d/g) || []).length;
		const nextCursor = getCursorPosition(formatted, digitsBeforeCursor);

		requestAnimationFrame(() => {
			internalRef.current?.setSelectionRange(nextCursor, nextCursor);
		});
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		onPaste?.(e);
		if (e.defaultPrevented) return;

		e.preventDefault();
		const pasted = e.clipboardData.getData('text');
		const parsed = parseMontoBs(pasted);
		if (parsed !== null && !isNaN(parsed)) {
			const formatted = formatMontoBs(parsed);
			setTexto(formatted);
			onChange(parsed);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		onBlur?.(e);
		if (!texto.trim()) {
			setTexto('');
			onChange(null);
			return;
		}
		const parsed = parseMontoBs(texto);
		if (parsed !== null && !isNaN(parsed)) {
			setTexto(formatMontoBs(parsed));
			onChange(parsed);
		} else {
			setTexto('');
			onChange(null);
		}
	};

	return (
		<Input
			ref={internalRef}
			type="text"
			inputMode="decimal"
			placeholder={placeholder}
			value={texto}
			onKeyDown={handleKeyDown}
			onChange={handleChange}
			onPaste={handlePaste}
			onBlur={handleBlur}
			className={cn(
				'h-9 text-xs bg-white dark:bg-zinc-800 rounded-lg border-slate-200 dark:border-zinc-700 focus-visible:ring-[#301996]/20 focus-visible:border-[#301996] text-right font-mono',
				className,
			)}
			{...props}
		/>
	);
});

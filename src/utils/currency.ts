/**
 * Utilidades para manejo, parseo y formateo de montos y divisas en formato venezolano (VES / Bs.)
 */

/**
 * Parsea un monto escrito en formato venezolano o estándar:
 * "Bs. 32.432,35", "32.432,35", "2.000,00", "2000,00", "2000", etc.
 * Retorna un número positivo o null si no es válido.
 */
export function parseMontoBs(val: string | null | undefined): number | null {
	if (!val) return null;
	// Remover "Bs.", "Bs", espacios
	let clean = val.replace(/bs\.?/gi, '').trim();
	if (!clean) return null;

	// Si tiene puntos y comas (ej. 32.432,35 o 2.000,00)
	if (clean.includes('.') && clean.includes(',')) {
		clean = clean.replace(/\./g, '').replace(',', '.');
	} else if (clean.includes(',')) {
		// Si solo tiene coma (ej. 2000,00 o 32432,35)
		clean = clean.replace(',', '.');
	} else if (clean.includes('.')) {
		// Si solo tiene punto:
		const parts = clean.split('.');
		if (parts.length > 2) {
			// ej. 1.000.000
			clean = parts.join('');
		} else if (parts[1]?.length === 3 && parts[0].length <= 3) {
			// ej. "2.000" -> miles
			clean = parts.join('');
		} else {
			// ej. "2000.50" -> decimal
			clean = clean;
		}
	}

	const num = parseFloat(clean);
	return isNaN(num) || num < 0 ? null : num;
}

/**
 * Formatea un número a formato venezolano estándar ("32.432,35" o "Bs. 32.432,35")
 */
export function formatMontoBs(
	num: number | null | undefined,
	conPrefijo = false,
): string {
	if (num === null || num === undefined || isNaN(num)) return '';
	const formatted = new Intl.NumberFormat('es-VE', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
	return conPrefijo ? `Bs. ${formatted}` : formatted;
}

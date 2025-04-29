/**
 * Button styling constants for consistent UI across the application
 */

export const primaryButtonStyles =
	"px-8 py-3 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors border border-gray-400";

export const secondaryButtonStyles =
	"px-6 py-2 bg-transparent text-black rounded-full text-base font-medium hover:bg-gray-100 transition-colors border border-gray-300";

export const tertiaryButtonStyles =
	"px-4 py-2 bg-transparent text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors";

/**
 * Returns primary button styles with optional additional classes
 */
export function getPrimaryButtonClasses(additionalClasses?: string): string {
	return additionalClasses
		? `${primaryButtonStyles} ${additionalClasses}`
		: primaryButtonStyles;
}

/**
 * Returns secondary button styles with optional additional classes
 */
export function getSecondaryButtonClasses(additionalClasses?: string): string {
	return additionalClasses
		? `${secondaryButtonStyles} ${additionalClasses}`
		: secondaryButtonStyles;
}

/**
 * Returns tertiary button styles with optional additional classes
 */
export function getTertiaryButtonClasses(additionalClasses?: string): string {
	return additionalClasses
		? `${tertiaryButtonStyles} ${additionalClasses}`
		: tertiaryButtonStyles;
}

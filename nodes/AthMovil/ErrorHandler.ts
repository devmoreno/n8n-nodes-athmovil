import { IDataObject } from 'n8n-workflow';

// ATH Móvil API Error Codes mapping
// Reference: https://github.com/evertec/ATHM-Payment-Button-API#error-messages
export const ATH_MOVIL_ERROR_CODES: { [key: string]: string } = {
	// Communication and Internal Errors
	BTRA_9998: 'Communication Error',
	BTRA_9999: 'Internal Error',

	// Authorization Errors
	BTRA_0401: 'Invalid authorization token',
	BTRA_0402: 'Authorization token expired',
	BTRA_0403: 'Invalid authorization token',
	BTRA_0017: 'Invalid authorization token',

	// Transaction Amount Errors
	BTRA_0001: 'The transfer amount is under minimum allowed',
	BTRA_0004: 'Amount is over the limits',
	BTRA_0013: 'Amount is zero',
	BTRA_0020: 'Numeric value out of bounds (<4 digits>.<2 digits> expected)',
	BTRA_0028: 'Amount is less than 0.01',
	BTRA_0042: 'Tip amount is over limits',
	BTRA_0044: 'Amount is over limits of the Financial Institution',
	BTRA_0045: 'Amount is over the limits of the card',
	BTRA_0051: 'The amount of the tip must not exceed the value of the transaction amount',

	// Customer/Card Errors
	BTRA_0002: 'Customer status is Pending Regain Access Verification',
	BTRA_0003: 'Card number from the customer is the same as the business',
	BTRA_0011: 'Card number does not belong to the business',
	BTRA_0012: 'Source and target card numbers are the same',
	BTRA_0049: 'customerId does not exist',

	// Transaction Status Errors
	BTRA_0005: 'Transaction failed with status error',
	BTRA_0030: 'The refund failed with a status error',
	BTRA_0032: 'The status of the e-commerce is not confirmed',
	BTRA_0035: 'The e-commerce transaction has not the expected status',
	BTRA_0037: 'Cannot confirm a transaction with status Canceled or Failed',
	BTRA_0039: 'Valid time to execute the transaction has expired',

	// Transaction ID Errors
	BTRA_0007: 'TransactionId does not exist',
	BTRA_0008: 'TransactionId does not belong to the business',
	BTRA_0014: 'TransactionId does not exist for the current business',
	BTRA_0031: 'EcommerceId does not exist',
	BTRA_0053: 'ReferenceNumber not found',

	// Business Status Errors
	BTRA_0009: 'Business is not active',
	BTRA_0010: 'Business status is not active',
	BTRA_0027: 'The organization is not a Non Profit organization',
	BTRA_0043: 'The business is not the owner of payment',
	BTRA_0050: 'Tip configuration is disabled for the business',

	// Validation Errors
	BTRA_0006: 'Invalid format',
	BTRA_0018: 'Field must not be blank',
	BTRA_0019: 'Field must not be null',
	BTRA_0029: 'Required parameter is not present',
	BTRA_0038: 'The metadata field exceeds the maximum supported characters (40)',
	BTRA_0040: 'The message cannot exceed 50 characters',
	BTRA_0052: 'Cannot fill both fields (tipAmount and percentage), just fill one',

	// E-commerce Specific Errors
	BTRA_0033: 'Error creating BusinessEcommerce record',
	BTRA_0034: 'BusinessEcommerce exists in the dynamoDB',
	BTRA_0036: 'The e-commerce you are trying to confirm is already assigned to another customer',
	BTRA_0041: 'The e-commerce transaction already has a phone number assigned',

	// Report/Date Errors
	BTRA_0022: 'No records for report',
	BTRA_0023: 'Error with the From date',
	BTRA_0024: 'Error with the To date',
	BTRA_0025: 'The From date must be before the To date',
	BTRA_0026: 'The difference between dates must be lower than specified days',
	BTRA_0046: 'There are no transactions for the indicated date range',
	BTRA_0047: 'Date from cannot be future',
	BTRA_0048: 'Date to cannot be future',

	// Other Errors
	BTRA_0015: 'Communication Error',
	BTRA_0016: 'Communication Error',
	BTRA_0021: 'TransactionType is not valid',
};

export interface AthMovilErrorResponse {
	status: string;
	message: string;
	errorcode?: string;
	data: null;
}

export function isAthMovilError(error: any): error is AthMovilErrorResponse {
	return (
		error &&
		typeof error === 'object' &&
		'status' in error &&
		error.status === 'error' &&
		'message' in error
	);
}

export function parseAthMovilError(error: any): {
	message: string;
	errorCode?: string;
	description?: string;
	details: IDataObject;
} {
	// Check if it's an HTTP error with response body
	if (error.response && error.response.body) {
		const body = error.response.body;

		// Check if it's an ATH Móvil error response
		if (isAthMovilError(body)) {
			const errorCode = body.errorcode || 'UNKNOWN';
			const apiMessage = body.message || 'An error occurred';
			const friendlyMessage = ATH_MOVIL_ERROR_CODES[errorCode] || apiMessage;

			return {
				message: `ATH Móvil Error: ${friendlyMessage}`,
				errorCode,
				description: `Error Code: ${errorCode}\nAPI Message: ${apiMessage}`,
				details: {
					errorCode,
					apiMessage,
					friendlyMessage,
					status: body.status,
				},
			};
		}
	}

	// Check if error object itself is an ATH Móvil error
	if (isAthMovilError(error)) {
		const errorCode = error.errorcode || 'UNKNOWN';
		const apiMessage = error.message || 'An error occurred';
		const friendlyMessage = ATH_MOVIL_ERROR_CODES[errorCode] || apiMessage;

		return {
			message: `ATH Móvil Error: ${friendlyMessage}`,
			errorCode,
			description: `Error Code: ${errorCode}\nAPI Message: ${apiMessage}`,
			details: {
				errorCode,
				apiMessage,
				friendlyMessage,
				status: error.status,
			},
		};
	}

	// Parse generic HTTP errors
	if (error.statusCode) {
		const statusCode = error.statusCode;
		const errorMessage = error.message || error.error || 'HTTP Error';

		return {
			message: `HTTP ${statusCode}: ${errorMessage}`,
			description: `Status Code: ${statusCode}`,
			details: {
				statusCode,
				error: errorMessage,
			},
		};
	}

	// Generic error
	const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
	return {
		message: errorMessage,
		details: {
			error: errorMessage,
		},
	};
}

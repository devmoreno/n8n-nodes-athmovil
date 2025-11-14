import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import { parseAthMovilError } from './ErrorHandler';

export class AthMovilTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ATH Móvil Tool',
		name: 'athMovilTool',
		icon: 'file:icon.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Process payments, refunds, and transactions using ATH Móvil, Puerto Rico\'s mobile payment platform',
		defaults: {
			name: 'ATH Móvil Tool',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'athMovilApi',
				required: true,
			},
		],
		usableAsTool: true,
		requestDefaults: {
			baseURL: 'https://payments.athmovil.com',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		},
		codex: {
			categories: ['AI', 'Payment Processing', 'Financial Services'],
			subcategories: {
				'AI': ['Tools', 'Actions'],
				'Payment Processing': ['Payment Gateways'],
				'Financial Services': ['Payments', 'Refunds'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://github.com/evertec/ATHM-Payment-Button-API',
					},
				],
			},
			alias: ['payment', 'refund', 'transaction', 'athmovil', 'ath'],
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createPayment',
				description: 'The operation to perform',
				options: [
					{
						name: 'Create Payment',
						value: 'createPayment',
						description: 'Create a new payment transaction with ATH Móvil. Returns ecommerceId and auth_token for future operations.',
						action: 'Create a payment transaction',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/payment',
							},
						},
					},
					{
						name: 'Find Payment',
						value: 'findPayment',
						description: 'Retrieve payment transaction details and status (OPEN, CONFIRM, COMPLETED, CANCEL) using ecommerceId',
						action: 'Get payment status and details',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/business/findPayment',
							},
						},
					},
					{
						name: 'Authorize Payment',
						value: 'authorizePayment',
						description: 'Process and complete a payment that was confirmed by the customer. Requires auth_token from create payment.',
						action: 'Authorize and process a confirmed payment',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/authorization',
							},
						},
					},
					{
						name: 'Update Phone Number',
						value: 'updatePhoneNumber',
						description: 'Update the customer phone number associated with an existing payment transaction',
						action: 'Update transaction phone number',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/payment/updatePhoneNumber',
							},
						},
					},
					{
						name: 'Refund Payment',
						value: 'refundPayment',
						description: 'Issue a full or partial refund for a completed payment transaction. Requires auth_token, reference number, and amount.',
						action: 'Process a payment refund',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/refund',
							},
						},
					},
					{
						name: 'Cancel Payment',
						value: 'cancelPayment',
						description: 'Cancel a pending payment transaction that has not been completed. Cannot cancel completed payments.',
						action: 'Cancel a pending payment',
						routing: {
							request: {
								method: 'POST',
								url: '/api/business-transaction/ecommerce/cancel',
							},
						},
					},
				],
			},

			// Create Payment fields
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				default: '',
				required: true,
				description: 'ATH Móvil account phone number',
			},
			{
				displayName: 'Total',
				name: 'total',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				default: 1.00,
				required: true,
				description: 'Payment amount (1.00-1500.00)',
				typeOptions: {
					minValue: 1.00,
					maxValue: 1500.00,
					numberPrecision: 2,
				},
			},
			{
				displayName: 'Items',
				name: 'items',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				default: {},
				required: true,
				placeholder: 'Add Item',
				options: [
					{
						name: 'item',
						displayName: 'Item',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Item name',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Item description',
							},
							{
								displayName: 'Price',
								name: 'price',
								type: 'number',
								default: 0,
								typeOptions: {
									numberPrecision: 2,
								},
								description: 'Item price',
							},
							{
								displayName: 'Quantity',
								name: 'quantity',
								type: 'number',
								default: 1,
								description: 'Item quantity',
							},
							{
								displayName: 'Tax',
								name: 'tax',
								type: 'number',
								default: 0,
								typeOptions: {
									numberPrecision: 2,
								},
								description: 'Tax amount',
							},
							{
								displayName: 'Metadata',
								name: 'metadata',
								type: 'string',
								default: '',
								description: 'Item metadata',
							},
						],
					},
				],
			},
			{
				displayName: 'Metadata 1',
				name: 'metadata1',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				default: '',
				required: true,
				description: 'Transaction metadata (max 40 characters)',
			},
			{
				displayName: 'Metadata 2',
				name: 'metadata2',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				default: '',
				required: true,
				description: 'Transaction metadata (max 40 characters)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['createPayment'],
					},
				},
				options: [
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						default: 600,
						description: 'Transaction timeout in seconds (120-600)',
						typeOptions: {
							minValue: 120,
							maxValue: 600,
						},
					},
					{
						displayName: 'Tax',
						name: 'tax',
						type: 'number',
						default: 0,
						typeOptions: {
							numberPrecision: 2,
						},
						description: 'Total tax amount',
					},
					{
						displayName: 'Subtotal',
						name: 'subtotal',
						type: 'number',
						default: 0,
						typeOptions: {
							numberPrecision: 2,
						},
						description: 'Subtotal amount',
					},
				],
			},

			// Find Payment fields
			{
				displayName: 'Ecommerce ID',
				name: 'ecommerceId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['findPayment', 'authorizePayment', 'updatePhoneNumber', 'refundPayment', 'cancelPayment'],
					},
				},
				default: '',
				required: true,
				description: 'The transaction ID returned from Create Payment',
			},

			// Update Phone Number fields
			{
				displayName: 'New Phone Number',
				name: 'newPhoneNumber',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['updatePhoneNumber'],
					},
				},
				default: '',
				required: true,
				description: 'New phone number to update',
			},

			// Authorize Payment field
			{
				displayName: 'Auth Token',
				name: 'authToken',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['authorizePayment', 'refundPayment'],
					},
				},
				default: '',
				required: true,
				description: 'Authorization token from Create Payment response',
			},

			// Refund Payment fields
			{
				displayName: 'Reference Number',
				name: 'referenceNumber',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['refundPayment'],
					},
				},
				default: '',
				required: true,
				description: 'Unique reference number for the refund transaction',
			},
			{
				displayName: 'Amount',
				name: 'refundAmount',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['refundPayment'],
					},
				},
				default: 0,
				required: true,
				description: 'Amount to refund',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0.01,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('athMovilApi');
		const operation = this.getNodeParameter('operation', 0) as string;

		const baseUrl = 'https://payments.athmovil.com';

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject = {};

				if (operation === 'createPayment') {
					const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
					const total = this.getNodeParameter('total', i) as number;
					const metadata1 = this.getNodeParameter('metadata1', i) as string;
					const metadata2 = this.getNodeParameter('metadata2', i) as string;
					const itemsData = this.getNodeParameter('items', i) as IDataObject;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const body: IDataObject = {
						publicToken: credentials.publicToken,
						phoneNumber,
						total,
						metadata1,
						metadata2,
						items: (itemsData.item as IDataObject[]) || [],
					};

					if (additionalFields.timeout) {
						body.timeout = additionalFields.timeout;
					}
					if (additionalFields.tax !== undefined) {
						body.tax = additionalFields.tax;
					}
					if (additionalFields.subtotal !== undefined) {
						body.subtotal = additionalFields.subtotal;
					}

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/payment`,
						body,
						json: true,
					});
				} else if (operation === 'findPayment') {
					const ecommerceId = this.getNodeParameter('ecommerceId', i) as string;

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/business/findPayment`,
						body: {
							publicToken: credentials.publicToken,
							ecommerceId,
						},
						json: true,
					});
				} else if (operation === 'authorizePayment') {
					const ecommerceId = this.getNodeParameter('ecommerceId', i) as string;
					const authToken = this.getNodeParameter('authToken', i) as string;

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/authorization`,
						headers: {
							authorization: authToken,
						},
						body: {
							publicToken: credentials.publicToken,
							ecommerceId,
						},
						json: true,
					});
				} else if (operation === 'updatePhoneNumber') {
					const ecommerceId = this.getNodeParameter('ecommerceId', i) as string;
					const newPhoneNumber = this.getNodeParameter('newPhoneNumber', i) as string;

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/payment/updatePhoneNumber`,
						body: {
							publicToken: credentials.publicToken,
							ecommerceId,
							phoneNumber: newPhoneNumber,
						},
						json: true,
					});
				} else if (operation === 'refundPayment') {
					const ecommerceId = this.getNodeParameter('ecommerceId', i) as string;
					const authToken = this.getNodeParameter('authToken', i) as string;
					const referenceNumber = this.getNodeParameter('referenceNumber', i) as string;
					const refundAmount = this.getNodeParameter('refundAmount', i) as number;

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/refund`,
						headers: {
							authorization: authToken,
						},
						body: {
							publicToken: credentials.publicToken,
							privateToken: credentials.privateToken,
							ecommerceId,
							referenceNumber,
							amount: refundAmount,
						},
						json: true,
					});
				} else if (operation === 'cancelPayment') {
					const ecommerceId = this.getNodeParameter('ecommerceId', i) as string;

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/cancel`,
						body: {
							publicToken: credentials.publicToken,
							ecommerceId,
						},
						json: true,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				const parsedError = parseAthMovilError(error);

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: parsedError.message,
							errorCode: parsedError.errorCode,
							...parsedError.details,
						},
						pairedItem: { item: i },
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), parsedError.message, {
					itemIndex: i,
					description: parsedError.description,
				});
			}
		}

		return [returnData];
	}
}

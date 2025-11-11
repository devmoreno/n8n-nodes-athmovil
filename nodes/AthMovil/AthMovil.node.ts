import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class AthMovil implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ATH Móvil',
		name: 'athMovil',
		icon: 'file:icon.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with ATH Móvil Payment Button API',
		defaults: {
			name: 'ATH Móvil',
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
		codex: {
			categories: ['AI', 'Payment Processing'],
			subcategories: {
				'AI': ['Tools'],
				'Payment Processing': ['Payment Gateways'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://github.com/evertec/ATHM-Payment-Button-API',
					},
				],
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Payment',
						value: 'createPayment',
						description: 'Create a new payment transaction',
						action: 'Create a payment',
					},
					{
						name: 'Find Payment',
						value: 'findPayment',
						description: 'Get payment transaction details',
						action: 'Find a payment',
					},
					{
						name: 'Authorize Payment',
						value: 'authorizePayment',
						description: 'Authorize a confirmed payment',
						action: 'Authorize a payment',
					},
					{
						name: 'Update Phone Number',
						value: 'updatePhoneNumber',
						description: 'Update phone number for a transaction',
						action: 'Update phone number',
					},
					{
						name: 'Refund Payment',
						value: 'refundPayment',
						description: 'Refund a completed payment',
						action: 'Refund a payment',
					},
					{
						name: 'Cancel Payment',
						value: 'cancelPayment',
						description: 'Cancel a pending payment',
						action: 'Cancel a payment',
					},
				],
				default: 'createPayment',
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

					responseData = await this.helpers.request({
						method: 'POST',
						url: `${baseUrl}/api/business-transaction/ecommerce/refund`,
						headers: {
							authorization: authToken,
						},
						body: {
							publicToken: credentials.publicToken,
							ecommerceId,
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
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
				const errorDescription = error instanceof Error && 'description' in error
					? (error as any).description
					: undefined;

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: errorMessage,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
					description: errorDescription,
				});
			}
		}

		return [returnData];
	}
}

import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class AthMovilApi implements ICredentialType {
	name = 'athMovilApi';
	displayName = 'ATH Móvil API';
	documentationUrl = 'https://github.com/evertec/ATHM-Payment-Button-API';
	properties: INodeProperties[] = [
		{
			displayName: 'Public Token',
			name: 'publicToken',
			type: 'string',
			default: '',
			required: true,
			description: 'The public token from your ATH Business account',
		},
		{
			displayName: 'Private Token',
			name: 'privateToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The private token from your ATH Business account',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
			],
			default: 'production',
			description: 'ATH Móvil environment to use',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://payments.athmovil.com',
			url: '/api/business-transaction/ecommerce/business/findPayment',
			method: 'POST' as IHttpRequestMethods,
			body: {
				publicToken: '={{$credentials.publicToken}}',
				ecommerceId: 'credential-test-dummy-id',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'errorcode',
					value: 'BTRA_0031',
					message: 'Public token is valid! The error "EcommerceId does not exist" confirms the API accepted your credentials.',
				},
			},
		],
	};
}

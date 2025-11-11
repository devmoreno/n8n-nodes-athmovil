import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
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

	// Note: Automatic credential testing is not available for ATH Móvil API
	// The API requires valid transaction data and returns 409 status codes for test requests
	// To verify your credentials, use the node with actual payment data or test in the ATH Móvil dashboard
}

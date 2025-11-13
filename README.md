# n8n-nodes-ath-movil

This is an n8n community node package for integrating with ATH Móvil, Puerto Rico's popular mobile payment platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

### In n8n (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-ath-movil` in the npm package name field
4. Check the acknowledgment checkbox
5. Click **Install**

The node will be installed and available after n8n restarts.

### Manual Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials Setup

Before using ATH Móvil nodes, you need to configure your API credentials:

1. Go to **Credentials** in n8n
2. Click **Add Credential**
3. Search for "ATH Móvil API"
4. Fill in the required fields:
   - **Public Token**: Your ATH Móvil public API token
   - **Private Token**: Your ATH Móvil private API token

### Where to Get Your Tokens

1. Log in to [ATH Móvil Business](https://www.athmovil.com/business)
2. Navigate to Settings → Development → API Keys
3. Copy your Public Token and Private Token

## Available Nodes

This package includes two nodes:

### 1. ATH Móvil (Standard Node)
Use this node in regular workflows and App Actions.

### 2. ATH Móvil Tool (AI Agent Tool)
Use this node with AI Agent workflows for autonomous payment processing.

## Operations

### Create Payment
Creates a new payment transaction with ATH Móvil.

**Required Fields:**
- Phone Number: Customer's ATH Móvil phone number
- Total: Payment amount ($1.00 - $1,500.00)
- Items: List of items being purchased
- Metadata 1 & 2: Transaction metadata (max 40 characters each)

**Optional Fields:**
- Timeout: Transaction timeout in seconds (120-600)
- Tax: Total tax amount
- Subtotal: Subtotal amount

**Returns:**
- `ecommerceId`: Transaction ID for future operations
- `auth_token`: Authorization token for completing the payment

**Example:**
```json
{
  "phoneNumber": "7871234567",
  "total": 25.50,
  "items": [
    {
      "name": "Product A",
      "description": "Description of Product A",
      "price": 20.00,
      "quantity": 1,
      "tax": 2.00,
      "metadata": "SKU-12345"
    }
  ],
  "metadata1": "Order #12345",
  "metadata2": "Customer ID: 789"
}
```

### Find Payment
Retrieves payment transaction details and status.

**Required Fields:**
- Ecommerce ID: The transaction ID from Create Payment

**Returns:**
- Transaction status: OPEN, CONFIRM, COMPLETED, or CANCEL
- Full transaction details including items, amounts, and customer info

**Possible Statuses:**
- `OPEN`: Payment created, waiting for customer
- `CONFIRM`: Customer confirmed, ready to authorize
- `COMPLETED`: Payment successfully processed
- `CANCEL`: Payment cancelled

### Authorize Payment
Process and complete a payment that was confirmed by the customer.

**Required Fields:**
- Ecommerce ID: The transaction ID
- Auth Token: Authorization token from Create Payment response

**Use Case:** After creating a payment and the customer confirms it in their ATH Móvil app, use this operation to complete the transaction.

### Update Phone Number
Updates the customer phone number for an existing payment transaction.

**Required Fields:**
- Ecommerce ID: The transaction ID
- New Phone Number: Updated phone number

**Use Case:** If the customer provided an incorrect phone number, update it before they attempt payment.

### Refund Payment
Issues a full or partial refund for a completed payment.

**Required Fields:**
- Ecommerce ID: The transaction ID
- Auth Token: Authorization token from Create Payment
- Reference Number: Unique reference for the refund
- Amount: Amount to refund

**Example:**
```json
{
  "ecommerceId": "4f798731-bf18-11f0-abf6-f12ddc4f8927",
  "authToken": "eyJraWQiOiJV...",
  "referenceNumber": "REFUND-12345",
  "refundAmount": 25.50
}
```

### Cancel Payment
Cancels a pending payment transaction that has not been completed.

**Required Fields:**
- Ecommerce ID: The transaction ID

**Note:** You cannot cancel completed payments. Use Refund Payment for completed transactions.

## Common Workflows

### Basic Payment Flow

1. **Create Payment** → Returns `ecommerceId` and `auth_token`
2. Customer opens ATH Móvil app and confirms payment
3. **Find Payment** → Check if status is `CONFIRM`
4. **Authorize Payment** → Complete the transaction
5. **Find Payment** → Verify status is `COMPLETED`

### Payment with Webhook (Coming Soon)
For real-time payment notifications, ATH Móvil supports webhooks. Webhook trigger node will be added in a future version.

### Refund Flow

1. **Find Payment** → Verify payment is `COMPLETED`
2. **Refund Payment** → Issue refund with reference number

## Error Handling

The node includes comprehensive error handling:

- **Continue On Fail**: Enable this in node settings to continue workflow execution even if an operation fails
- **Error Messages**: All API errors are returned with detailed messages
- **Status Codes**: HTTP status codes are preserved for debugging

## Best Practices

1. **Store Credentials Securely**: Always use n8n's credential system, never hardcode tokens
2. **Save Transaction IDs**: Store `ecommerceId` and `auth_token` for future operations
3. **Check Status Before Actions**: Always verify payment status before authorizing or refunding
4. **Unique Reference Numbers**: Use unique reference numbers for refunds to avoid duplicates
5. **Test in Sandbox**: Use sandbox credentials for testing (when available)

## AI Agent Integration

The **ATH Móvil Tool** node can be used with n8n AI Agents:

1. Add the tool to your AI Agent
2. The agent can autonomously:
   - Create payment requests
   - Check payment status
   - Process refunds based on customer requests
   - Update customer information

## Troubleshooting

### "EcommerceId does not exist" Error
- Verify the transaction ID is correct
- Check that the transaction was created successfully

### "Invalid phone number" Error
- Ensure phone number is in format: 7871234567 (10 digits)
- Verify the customer has an ATH Móvil account

### "Amount exceeds limit" Error
- Maximum transaction amount is $1,500.00
- Minimum transaction amount is $1.00

### "Refund failed" Error
- Verify the payment status is `COMPLETED`
- Check that you're using the correct `auth_token`
- Ensure the refund amount doesn't exceed the original payment

## API Rate Limits

ATH Móvil API has rate limits. If you encounter rate limit errors:
- Add delays between operations
- Batch process transactions during off-peak hours
- Contact ATH Móvil Business support for increased limits

## Support & Resources

- **ATH Móvil Business Support**: (787) 773-5466
- **ATH Móvil FAQ**: https://athmovilbusiness.com/preguntas
- **API Documentation**: https://github.com/evertec/ATHM-Payment-Button-API
- **n8n Community**: https://community.n8n.io

## Version History

- **0.8.3** - Removed webhook trigger (temporary), stable release
- **0.7.1** - Fixed display name for AI Tool
- **0.7.0** - Restored App Actions support, added refund fields
- **0.1.0** - Initial release

## Compatibility

- **n8n Version**: 1.0.0 and above
- **Node Version**: 16.x or higher
- **Supported Operations**: All ATH Móvil Business API operations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE.md)

## Sponsorship

This project is maintained by [devmoreno](https://github.com/devmoreno). If you find this node useful and would like to support its development, consider sponsoring us on [GitHub Sponsors](https://github.com/sponsors/devmoreno).

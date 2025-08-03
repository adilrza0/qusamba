const { sendPaymentConfirmationEmail } = require('./utils/email');

// Mock order data for testing
const mockOrder = {
  _id: '60d5ec49f54a51a8b8b8b8b8',
  orderNumber: 'QUS123456',
  totalAmount: 2499,
  status: 'confirmed',
  payment: {
    method: 'razorpay',
    paidAt: new Date(),
    status: 'completed'
  },
  createdAt: new Date(),
  items: [
    {
      name: 'Golden Bangle Set',
      quantity: 2,
      price: 1249.50
    }
  ]
};

async function testPaymentConfirmationEmail() {
  try {
    console.log('Testing payment confirmation email...');
    
    await sendPaymentConfirmationEmail(
      'customer@example.com',
      'John Doe',
      mockOrder
    );
    
    console.log('✅ Payment confirmation email sent successfully!');
    console.log('Check your email logs or preview URL above');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testPaymentConfirmationEmail();
}

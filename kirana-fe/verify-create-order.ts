
import { createOrder } from './lib/phonepe/create-order';
import { randomUUID } from 'crypto';

(async () => {
    try {
        const orderId = randomUUID();
        const response = await createOrder(
            orderId,
            1000,
            'https://example.com/callback',
            true
        );
        console.log('Order Created:', response);
    } catch (error) {
        console.error('Expected Error (Unauthorized):', error.message || error);
    }
})();

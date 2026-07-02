import client from '../../shared/api/client';

export const createPayment = ({ amount, orderLines, orderId }) =>
  client
    .post('/create-payment/', { amount: amount * 100, currency: 'PEN', order_id: orderId, orderLines })
    .then(r => r.data);

export const validatePayment = ({ clientAnswer, hash }) =>
  client
    .post('/validate-payment/', { 'kr-answer': clientAnswer, 'kr-hash': hash })
    .then(r => r.data);

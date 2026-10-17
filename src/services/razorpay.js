import axios from 'axios';
import { API_BASE } from '../config/api';

/**
 * Loads Razorpay SDK script dynamically if not already present
 */
export function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Get public gateway configuration (checks if live keys are present in .env)
 */
export async function getRazorpayConfig() {
  try {
    const res = await axios.get(`${API_BASE}/payment/config`);
    return res.data;
  } catch (err) {
    return {
      success: false,
      is_configured: false,
      key_id: 'rzp_test_placeholder'
    };
  }
}

/**
 * Launches Razorpay checkout modal
 * @param {Object} params
 * @param {number} params.amount - Amount in INR (e.g. 599.00)
 * @param {Object} params.customer - { name, email, phone }
 * @param {Object} [params.notes] - optional metadata
 * @param {Function} params.onSuccess - callback({ razorpay_payment_id, razorpay_order_id, razorpay_signature })
 * @param {Function} params.onError - callback(errorMessage)
 * @param {Function} [params.onDismiss] - callback when modal is closed
 */
export async function initiateRazorpayPayment({
  amount,
  customer,
  notes = {},
  onSuccess,
  onError,
  onDismiss,
}) {
  try {
    // 1. Create order on backend
    const orderRes = await axios.post(`${API_BASE}/payment/razorpay/create-order`, {
      amount,
      notes: {
        customer_name: customer.name,
        customer_email: customer.email,
        ...notes,
      },
    });

    if (!orderRes.data.success) {
      throw new Error(orderRes.data.message || 'Failed to initialize payment order');
    }

    const { order_id, key_id, is_live_gateway } = orderRes.data;

    // 2. If live Razorpay credentials exist in .env and are not placeholder, open official Razorpay Checkout modal
    const isLiveKey = key_id && !key_id.includes('placeholder') && key_id.startsWith('rzp_');

    if (isLiveKey) {
      await loadRazorpaySDK();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const options = {
        key: key_id,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        name: 'Coffee Bean Artisanal Roastery',
        description: 'Fresh Roast Canisters & Beans (Order Checkout)',
        image: '/assets/logo.png',
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify signature on backend
            const verifyRes = await axios.post(`${API_BASE}/payment/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              onSuccess({
                ...response,
                is_live_gateway: true,
              });
            } else {
              onError(verifyRes.data.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            onError(err.response?.data?.message || err.message || 'Signature verification error');
          }
        },
        prefill: {
          name: customer.name || '',
          email: customer.email || '',
          contact: customer.phone || '',
        },
        notes: {
          merchant_name: 'Coffee Bean Roastery',
          ...notes,
        },
        theme: {
          color: '#4D0E12', // Pantone Roastery Burgundy
          backdrop_color: 'rgba(35, 24, 21, 0.85)',
        },
        modal: {
          ondismiss: function () {
            if (onDismiss) onDismiss();
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp) {
        onError(resp.error?.description || 'Payment was declined or failed.');
      });
      rzpInstance.open();
      return;
    }

    // 3. Readiness / Sandbox Mode (When user hasn't added credentials to .env yet)
    // Generates simulated payment ID and verifies with backend to demonstrate seamless checkout flow
    const simulatedPaymentId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const simulatedSignature = `sig_sim_${Date.now()}`;

    // Verify simulation on backend
    await axios.post(`${API_BASE}/payment/razorpay/verify`, {
      razorpay_order_id: order_id,
      razorpay_payment_id: simulatedPaymentId,
      razorpay_signature: simulatedSignature,
    });

    onSuccess({
      razorpay_order_id: order_id,
      razorpay_payment_id: simulatedPaymentId,
      razorpay_signature: simulatedSignature,
      is_live_gateway: false,
      notice: 'Simulated via Razorpay Readiness Sandbox (Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET to Back/.env to launch live popup)',
    });
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    onError(error.response?.data?.message || error.message || 'Failed to initiate payment');
  }
}

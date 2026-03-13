import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

export const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro',
    price: 9,
  },
  team: {
    priceId: process.env.STRIPE_TEAM_PRICE_ID!,
    name: 'Team',
    price: 29,
  },
};

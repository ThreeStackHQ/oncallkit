import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { workspaces } from '@oncallkit/db';
import { eq } from '@oncallkit/db';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent> | null = null;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Update workspace plan
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;

      const plan =
        priceId === process.env.STRIPE_PRO_PRICE_ID
          ? 'pro'
          : priceId === process.env.STRIPE_TEAM_PRICE_ID
            ? 'team'
            : 'free';

      await db
        .update(workspaces)
        .set({ plan, stripeCustomerId: customerId, stripePriceId: priceId })
        .where(eq(workspaces.stripeCustomerId, customerId));

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      const plan =
        priceId === process.env.STRIPE_PRO_PRICE_ID
          ? 'pro'
          : priceId === process.env.STRIPE_TEAM_PRICE_ID
            ? 'team'
            : 'free';

      await db
        .update(workspaces)
        .set({ plan, stripePriceId: priceId ?? null })
        .where(eq(workspaces.stripeCustomerId, customerId));

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await db
        .update(workspaces)
        .set({ plan: 'free', stripePriceId: null })
        .where(eq(workspaces.stripeCustomerId, customerId));

      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}

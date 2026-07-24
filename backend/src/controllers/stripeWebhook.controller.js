import Stripe from "stripe";

import User from "../models/User.js";
import { logger } from "../utils/logger.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_missing");

const priceToPlan = {
  [process.env.STRIPE_PRO_PRICE_ID]: "pro",
  [process.env.STRIPE_TEAM_PRICE_ID]: "team",
};

const mapPriceToPlan = (priceId) => priceToPlan[priceId] || "free";

export const handleStripeWebhook = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(501).json({ message: "Stripe webhook is not configured" });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.warn({ error: error.message }, "Invalid Stripe webhook signature");
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan =
      event.type === "customer.subscription.deleted"
        ? "free"
        : mapPriceToPlan(priceId);

    await User.findOneAndUpdate(
      { stripeCustomerId: subscription.customer },
      { plan },
      { new: true }
    );
  }

  return res.sendStatus(200);
};


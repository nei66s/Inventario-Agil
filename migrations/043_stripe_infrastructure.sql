-- Migration 043: Stripe Integration
-- Desc: Adds columns for Stripe integration while maintaining compatibility with billing status.

ALTER TABLE tenants 
ADD COLUMN stripe_customer_id VARCHAR(100),
ADD COLUMN stripe_subscription_id VARCHAR(100);

/**
 * Customer Service Agent Package
 * 
 * Exports the CustomerServiceAgent and all handlers
 */

export { CustomerServiceAgent } from './CustomerServiceAgent';
export type { CustomerServiceConfig, EscalationReason } from './CustomerServiceAgent';

export { OrderStatusHandler } from './handlers/OrderStatusHandler';
export { ProductionStatusHandler } from './handlers/ProductionStatusHandler';
export { InvoiceHandler } from './handlers/InvoiceHandler';
export { GeneralInquiryHandler } from './handlers/GeneralInquiryHandler';


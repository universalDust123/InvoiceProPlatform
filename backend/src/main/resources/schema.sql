-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    notify_payment_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    notify_invoice_confirmations BOOLEAN NOT NULL DEFAULT TRUE,
    notify_weekly_reports BOOLEAN NOT NULL DEFAULT TRUE,
    notify_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    theme_preference VARCHAR(50) NOT NULL DEFAULT 'dark',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE(email),
    INDEX idx_email_tenant (email, tenant_id),
    INDEX idx_tenant (tenant_id)
);

-- Create Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    billing_address TEXT,
    tax_id VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    INDEX idx_tenant (tenant_id),
    INDEX idx_email (email)
);

-- Create Line Item Templates table
CREATE TABLE IF NOT EXISTS line_item_templates (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_price DECIMAL(10, 2) NOT NULL,
    tax_percentage DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    INDEX idx_tenant (tenant_id)
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    customer_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_total DECIMAL(12, 2) NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    UNIQUE(invoice_number, tenant_id)
);

-- Create Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percentage DECIMAL(5, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id)
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    INDEX idx_user_tenant (user_id, tenant_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

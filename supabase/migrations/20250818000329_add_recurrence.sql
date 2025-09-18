-- Add recurrence fields to transactions table
ALTER TABLE transactions 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN next_occurrence DATE,
ADD COLUMN end_date DATE;

-- Create index for recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring, next_occurrence);

-- Function to generate recurring transactions
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS void AS $$
DECLARE
    transaction_record RECORD;
    next_date DATE;
BEGIN
    -- Loop through all recurring transactions that are due
    FOR transaction_record IN 
        SELECT * FROM transactions 
        WHERE is_recurring = TRUE 
        AND next_occurrence <= CURRENT_DATE
        AND (end_date IS NULL OR next_occurrence <= end_date)
    LOOP
        -- Insert the recurring transaction
        INSERT INTO transactions (
            user_id, 
            title, 
            amount, 
            type, 
            category, 
            date,
            is_recurring,
            recurrence_type,
            recurrence_interval,
            next_occurrence,
            end_date
        ) VALUES (
            transaction_record.user_id,
            transaction_record.title,
            transaction_record.amount,
            transaction_record.type,
            transaction_record.category,
            transaction_record.next_occurrence,
            FALSE, -- This is the generated transaction, not the template
            NULL,
            NULL,
            NULL,
            NULL
        );

        -- Calculate next occurrence
        CASE transaction_record.recurrence_type
            WHEN 'daily' THEN
                next_date := transaction_record.next_occurrence + (transaction_record.recurrence_interval || ' days')::INTERVAL;
            WHEN 'weekly' THEN
                next_date := transaction_record.next_occurrence + (transaction_record.recurrence_interval || ' weeks')::INTERVAL;
            WHEN 'monthly' THEN
                next_date := transaction_record.next_occurrence + (transaction_record.recurrence_interval || ' months')::INTERVAL;
            WHEN 'yearly' THEN
                next_date := transaction_record.next_occurrence + (transaction_record.recurrence_interval || ' years')::INTERVAL;
        END CASE;

        -- Update the template transaction with next occurrence
        UPDATE transactions 
        SET next_occurrence = next_date
        WHERE id = transaction_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run this function daily (if using pg_cron extension)
-- SELECT cron.schedule('generate-recurring-transactions', '0 0 * * *', 'SELECT generate_recurring_transactions();');

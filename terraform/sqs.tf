# Main SQS queue for generate-report
resource "aws_sqs_queue" "generate_report_queue" {
  name                       = "${local.project_name}-generate-report-queue"
  delay_seconds              = 0
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.generate_report_dlq.arn
    maxReceiveCount     = 3
  })
}

# Dead Letter Queue (DLQ) for generate-report
resource "aws_sqs_queue" "generate_report_dlq" {
  name                      = "${local.project_name}-generate-report-dlq"
  message_retention_seconds = 1209600
}
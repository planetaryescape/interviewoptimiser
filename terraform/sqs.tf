# Main SQS queue for optimise-cv
resource "aws_sqs_queue" "optimise_cv_queue" {
  name                       = "${local.project_name}-optimize-cv-queue"
  delay_seconds              = 0
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.optimise_cv_dlq.arn
    maxReceiveCount     = 3
  })
}

# Dead Letter Queue (DLQ) for optimise-cv
resource "aws_sqs_queue" "optimise_cv_dlq" {
  name                      = "${local.project_name}-optimize-cv-dlq"
  message_retention_seconds = 1209600
}

# Main SQS queue for generate-cover-letter
resource "aws_sqs_queue" "generate_cover_letter_queue" {
  name                       = "${local.project_name}-generate-cover-letter-queue"
  delay_seconds              = 0
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.generate_cover_letter_dlq.arn
    maxReceiveCount     = 3
  })
}

# Dead Letter Queue (DLQ) for generate-cover-letter
resource "aws_sqs_queue" "generate_cover_letter_dlq" {
  name                      = "${local.project_name}-generate-cover-letter-dlq"
  message_retention_seconds = 1209600
}
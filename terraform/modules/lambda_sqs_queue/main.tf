# Dead Letter Queue (DLQ) for request-call
resource "aws_sqs_queue" "dlq" {
  name                      = "${var.project_name}-${var.queue_name}-dlq"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "sqs_queue" {
  name                       = "${var.project_name}-${var.queue_name}"
  delay_seconds              = 0
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10
  visibility_timeout_seconds = 600

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })
}


resource "aws_lambda_event_source_mapping" "sqs_mapping" {
  event_source_arn = aws_sqs_queue.sqs_queue.arn
  function_name    = var.lambda_function_name
  batch_size       = 1
  enabled          = true
}

# Lambda permissions
resource "aws_lambda_permission" "allow_sqs_to_call_lambda" {
  statement_id  = "AllowSQSTriggerLambda"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.sqs_queue.arn
}


resource "aws_iam_policy" "sqs_policy" {
  name        = "${var.project_name}-${var.queue_name}-sqs-policy"
  description = "IAM policy for SQS access from Lambda"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility",
          "sqs:SendMessage"
        ],
        Resource = [
          aws_sqs_queue.sqs_queue.arn,
          aws_sqs_queue.dlq.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "sqs_policy_attachment" {
  role       = var.lambda_execution_role_name
  policy_arn = aws_iam_policy.sqs_policy.arn
}

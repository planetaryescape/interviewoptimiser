# IAM Role for Lambda Execution with least privilege
resource "aws_iam_role" "lambda_execution_role" {
  name = local.lambda_execution_role

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Effect = "Allow",
        Sid    = ""
      }
    ]
  })

  tags = {
    Name = "LambdaExecutionRole"
  }
}

# Add SQS permissions to the Lambda execution role
resource "aws_iam_policy" "lambda_sqs_policy" {
  name        = "${local.project_name}-lambda-sqs-policy"
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
          aws_sqs_queue.generate_report_queue.arn,
          aws_sqs_queue.generate_report_dlq.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_sqs_policy.arn
}

# Add S3 write permissions to the Lambda execution role
resource "aws_iam_policy" "lambda_s3_write_policy" {
  name        = "${local.project_name}-lambda-s3-write-policy"
  description = "IAM policy for writing to S3 from Lambda"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:PutObjectAcl",
          "s3:ListBucket",
          "s3:ListObjectsV2"
        ],
        Resource = [
          aws_s3_bucket.lambda_bucket.arn,
          "${aws_s3_bucket.lambda_bucket.arn}/*",
          "${aws_s3_bucket.lambda_bucket.arn}/pdfs/*",
          "${aws_s3_bucket.lambda_bucket.arn}/backups/database/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_write_policy_attachment_generate_report" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_s3_write_policy.arn
}

# Attach the AWSLambdaBasicExecutionRole managed policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Add CloudWatch PutMetricData permission to the Lambda execution role
resource "aws_iam_policy" "lambda_cloudwatch_metric_policy" {
  name        = "${local.project_name}-lambda-cloudwatch-metric-policy"
  description = "IAM policy for putting CloudWatch metrics from Lambda"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "cloudwatch:PutMetricData"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatch_metric_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_cloudwatch_metric_policy.arn
}
# IAM policy to allow the backup Lambda to access the S3 bucket
resource "aws_iam_policy" "lambda_backup_s3_access" {
  name        = "${var.project_name}-backup-database-s3-access"
  description = "Allow backup Lambda to access S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:PutObjectAcl",
          "s3:ListBucket",
          "s3:ListObjectsV2"
        ]
        Resource = [
          aws_s3_bucket.database_backups.arn,
          "${aws_s3_bucket.database_backups.arn}/*"
        ]
      }
    ]
  })
}

# Attach the S3 access policy to the shared-infra-backup-database Lambda role
resource "aws_iam_role_policy_attachment" "lambda_backup_s3_policy_attachment" {
  policy_arn = aws_iam_policy.lambda_backup_s3_access.arn
  role       = local.backup_lambda_role
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch_to_call_backup_database" {
  statement_id  = "${var.project_name}-AllowCloudWatchToInvokeBackupDatabase"
  action        = "lambda:InvokeFunction"
  function_name = local.backup_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_database_backup.arn
}
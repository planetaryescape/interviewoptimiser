# CloudWatch Event Rule for vet-review Lambda
resource "aws_cloudwatch_event_rule" "daily_review_vetting" {
  name                = "${local.project_name}-daily-review-vetting"
  description         = "Trigger review vetting Lambda function daily"
  schedule_expression = "cron(0 1 * * ? *)" # Run at 1am UTC daily
}

resource "aws_cloudwatch_event_target" "vet_review_target" {
  rule      = aws_cloudwatch_event_rule.daily_review_vetting.name
  target_id = "${local.project_name}-VetReviewLambda"
  arn       = aws_lambda_function.lambdas["vet_review"].arn
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch_to_call_vet_review" {
  statement_id  = "${local.project_name}-AllowCloudWatchToInvokeVetReview"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["vet_review"].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_review_vetting.arn
}

# CloudWatch Event Rule for database backup Lambda
resource "aws_cloudwatch_event_rule" "daily_database_backup" {
  name                = "${local.project_name}-daily-database-backup"
  description         = "Trigger database backup Lambda function daily"
  schedule_expression = "cron(0 1 * * ? *)" # Run at 1am UTC daily
}

resource "aws_cloudwatch_event_target" "backup_database_target" {
  rule      = aws_cloudwatch_event_rule.daily_database_backup.name
  target_id = "${local.project_name}-BackupDatabaseLambda"
  arn       = "arn:aws:lambda:${local.region}:${local.account_id}:function:shared-infra-backup-database"

  input = jsonencode({
    projectName = local.project_name
    databaseUrl = var.DATABASE_URL
    bucketName  = local.s3_bucket_name
    backupKey   = "backups/database"
  })
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch_to_call_backup_database" {
  statement_id  = "${local.project_name}-AllowCloudWatchToInvokeBackupDatabase"
  action        = "lambda:InvokeFunction"
  function_name = "shared-infra-backup-database"
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_database_backup.arn
}

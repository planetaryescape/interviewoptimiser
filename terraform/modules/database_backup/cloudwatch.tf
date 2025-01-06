# CloudWatch Event Rule for database backup Lambda
resource "aws_cloudwatch_event_rule" "daily_database_backup" {
  name                = "${var.project_name}-daily-database-backup"
  description         = "Trigger database backup Lambda function daily"
  schedule_expression = var.backup_schedule
}

resource "aws_cloudwatch_event_target" "backup_database_target" {
  rule      = aws_cloudwatch_event_rule.daily_database_backup.name
  target_id = "${var.project_name}-BackupDatabaseLambda"
  arn       = "arn:aws:lambda:${var.region}:${var.account_id}:function:${local.backup_lambda_name}"

  input = jsonencode({
    projectName = var.project_name
    databaseUrl = var.database_url
    bucketName  = aws_s3_bucket.database_backups.id
    backupKey   = "backups/database"
  })

  depends_on = [aws_cloudwatch_event_rule.daily_database_backup]
}
output "backup_bucket_name" {
  description = "Name of the S3 bucket storing database backups"
  value       = aws_s3_bucket.database_backups.id
}

output "backup_bucket_arn" {
  description = "ARN of the S3 bucket storing database backups"
  value       = aws_s3_bucket.database_backups.arn
}

output "cloudwatch_rule_arn" {
  description = "ARN of the CloudWatch Event Rule triggering backups"
  value       = aws_cloudwatch_event_rule.daily_database_backup.arn
}

output "backup_schedule" {
  description = "Cron expression for the backup schedule"
  value       = var.backup_schedule
}
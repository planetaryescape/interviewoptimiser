module "database_backup" {
  source = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/database_backup"

  project_name = local.project_name
  region       = local.region
  account_id   = local.account_id
  database_url = var.DATABASE_URL
  environment  = "Production"

  # Optional: Configure backup lifecycle
  backup_retention_days      = 365                 # Keep backups for 1 year
  transition_to_ia_days      = 30                  # Move to IA after 30 days
  transition_to_glacier_days = 90                  # Move to Glacier after 90 days
  backup_schedule            = "cron(0 1 * * ? *)" # Run at 1 AM UTC daily
}

# Export the bucket name for reference
output "database_backup_bucket" {
  description = "Name of the S3 bucket storing database backups"
  value       = module.database_backup.backup_bucket_name
}

output "database_backup_schedule" {
  description = "Schedule for database backups"
  value       = module.database_backup.backup_schedule
}
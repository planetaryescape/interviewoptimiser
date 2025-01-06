variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "region" {
  type        = string
  description = "AWS region where resources will be created"
}

variable "account_id" {
  type        = string
  description = "AWS account ID"
}

variable "database_url" {
  type        = string
  description = "Database URL to backup"
}

variable "backup_retention_days" {
  type        = number
  description = "Number of days to retain backups before deletion"
  default     = 365
}

variable "backup_schedule" {
  type        = string
  description = "Cron expression for backup schedule"
  default     = "cron(0 1 * * ? *)" # Run at 1am UTC daily
}

variable "transition_to_ia_days" {
  type        = number
  description = "Number of days before transitioning to IA storage"
  default     = 30
}

variable "transition_to_glacier_days" {
  type        = number
  description = "Number of days before transitioning to Glacier storage"
  default     = 90
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., Production, Staging)"
  default     = "Production"
}
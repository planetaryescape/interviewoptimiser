# S3 bucket for database backups
resource "aws_s3_bucket" "database_backups" {
  bucket = "${var.project_name}-database-backups"

  tags = {
    Name        = "${var.project_name}-database-backups"
    Environment = var.environment
  }
}

# Enable versioning for the database backups bucket
resource "aws_s3_bucket_versioning" "database_backups_versioning" {
  bucket = aws_s3_bucket.database_backups.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption for the database backups bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "database_backups_encryption" {
  bucket = aws_s3_bucket.database_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access to the database backups bucket
resource "aws_s3_bucket_public_access_block" "database_backups_public_access" {
  bucket = aws_s3_bucket.database_backups.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

# Lifecycle rule to transition old backups to cheaper storage
resource "aws_s3_bucket_lifecycle_configuration" "database_backups_lifecycle" {
  bucket = aws_s3_bucket.database_backups.id

  rule {
    id     = "transition-to-ia-and-glacier"
    status = "Enabled"

    transition {
      days          = var.transition_to_ia_days
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = var.transition_to_glacier_days
      storage_class = "GLACIER"
    }

    expiration {
      days = var.backup_retention_days
    }
  }
}
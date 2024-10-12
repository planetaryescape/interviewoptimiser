# S3 Bucket for Lambda function deployments
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = local.s3_bucket_name
  tags = {
    Name        = "${local.project_name}-lambda-deployments-bucket"
    Environment = "Dev"
  }
}

# Server-side encryption for the S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "lambda_bucket_sse" {
  bucket = aws_s3_bucket.lambda_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256" # Default encryption algorithm
    }
  }
}

# Enable versioning for the S3 bucket
resource "aws_s3_bucket_versioning" "lambda_bucket_versioning" {
  bucket = aws_s3_bucket.lambda_bucket.id

  versioning_configuration {
    status = var.versioning_enabled ? "Enabled" : "Suspended"
  }
}

# Block public access to the S3 bucket for security
resource "aws_s3_bucket_public_access_block" "public_access_block" {
  bucket = aws_s3_bucket.lambda_bucket.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

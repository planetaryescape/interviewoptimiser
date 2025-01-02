
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = local.s3_bucket_name
  tags = {
    Name        = "${var.function_name}-lambda-deployments-bucket"
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
    status = "Enabled"
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

resource "aws_s3_object" "lambda_zip" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = local.lambda_s3_filepath
  source = data.archive_file.lambda_zip.output_path

  source_hash = filemd5(data.archive_file.lambda_zip.output_path)

  depends_on = [
    aws_s3_bucket.lambda_bucket,
    aws_s3_bucket_versioning.lambda_bucket_versioning,
    aws_s3_bucket_server_side_encryption_configuration.lambda_bucket_sse
  ]
}
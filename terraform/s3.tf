###############################################
# S3 Bucket for Audio Recordings
###############################################

resource "aws_s3_bucket" "audio_recordings" {
  bucket = "interviewoptimiser-audio-recordings-${var.environment}"

  tags = {
    Name        = "InterviewOptimiser Audio Recordings"
    Environment = var.environment
  }
}

# Enable versioning to maintain backup copies
resource "aws_s3_bucket_versioning" "audio_recordings_versioning" {
  bucket = aws_s3_bucket.audio_recordings.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configure server-side encryption with Amazon S3 managed keys
resource "aws_s3_bucket_server_side_encryption_configuration" "audio_recordings_encryption" {
  bucket = aws_s3_bucket.audio_recordings.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Implement lifecycle rules for cost-effective storage management
resource "aws_s3_bucket_lifecycle_configuration" "audio_recordings_lifecycle" {
  bucket = aws_s3_bucket.audio_recordings.id

  rule {
    id     = "transition-to-standard-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    # Transition old versions to Glacier after 60 days
    transition {
      days          = 60
      storage_class = "GLACIER"
    }

    # Expire old versions after 365 days
    expiration {
      days = 365
    }
  }
}

# Make the bucket private by default
resource "aws_s3_bucket_public_access_block" "audio_recordings_access" {
  bucket = aws_s3_bucket.audio_recordings.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configure CORS to allow web browsers to play the audio
resource "aws_s3_bucket_cors_configuration" "audio_recordings_cors" {
  bucket = aws_s3_bucket.audio_recordings.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = compact([
      "https://*.interviewoptimiser.com",
      "https://interviewoptimiser.com",
      # var.environment == "dev" ? "http://localhost:3000" : ""
      "http://localhost:3000"
    ])
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "audio_recordings_policy" {
  bucket = aws_s3_bucket.audio_recordings.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.audio_recordings.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.audio_cdn.arn
          }
        }
      }
    ]
  })
  depends_on = [aws_cloudfront_distribution.audio_cdn]
}

###############################################
# CloudFront Distribution for CDN
###############################################

resource "aws_cloudfront_origin_access_control" "audio_oac" {
  name                              = "interviewoptimiser-audio-oac"
  description                       = "Origin Access Control for audio recordings"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "audio_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "InterviewOptimiser Audio CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations to reduce costs

  origin {
    domain_name              = aws_s3_bucket.audio_recordings.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.audio_recordings.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.audio_oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.audio_recordings.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600  # 1 hour
    max_ttl                = 86400 # 24 hours
    compress               = true
  }

  # Cache behavior for audio files
  ordered_cache_behavior {
    path_pattern     = "*.mp3"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.audio_recordings.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400  # 24 hours
    max_ttl                = 604800 # 7 days
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.wav"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.audio_recordings.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400  # 24 hours
    max_ttl                = 604800 # 7 days
    compress               = true
  }

  # Geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate - Using CloudFront default certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = var.environment
    Name        = "InterviewOptimiser Audio CDN"
  }
}

###############################################
# Outputs
###############################################

output "audio_bucket_name" {
  description = "The name of the S3 bucket for audio recordings"
  value       = aws_s3_bucket.audio_recordings.id
}

output "audio_bucket_arn" {
  description = "The ARN of the S3 bucket for audio recordings"
  value       = aws_s3_bucket.audio_recordings.arn
}

output "audio_cdn_domain_name" {
  description = "The domain name of the CloudFront distribution for audio recordings"
  value       = aws_cloudfront_distribution.audio_cdn.domain_name
}

output "audio_cdn_arn" {
  description = "The ARN of the CloudFront distribution for audio recordings"
  value       = aws_cloudfront_distribution.audio_cdn.arn
}
module "save_chat_audio_to_s3_lambda" {
  source        = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/lambda_function"
  function_name = "save-chat-audio-to-s3"
  region        = local.current_region
  project_name  = local.project_name

  environment_variables = {
    DATABASE_URL           = var.DATABASE_URL
    OPENAI_API_KEY         = var.OPENAI_API_KEY
    HELICONE_API_KEY       = var.HELICONE_API_KEY
    POSTHOG_KEY            = var.POSTHOG_KEY
    DISCORD_BOT_TOKEN      = var.DISCORD_BOT_TOKEN
    SENTRY_DSN             = "https://2d9dd3b4af832d4da3eafb6b792fc663@o4508119114514432.ingest.de.sentry.io/4509272856854608"
    SENTRY_RELEASE_VERSION = var.sentry_release_version
    HUME_API_KEY           = var.HUME_API_KEY
    AUDIO_BUCKET_NAME      = aws_s3_bucket.audio_recordings.id
    AUDIO_CDN_DOMAIN       = aws_cloudfront_distribution.audio_cdn.domain_name

    SQS_QUEUE_URL = module.save_chat_audio_to_s3_lambda_sqs.sqs_queue_url
    DLQ_URL       = module.save_chat_audio_to_s3_lambda_sqs.dlq_url
  }

}

# IAM policy document for S3 access
data "aws_iam_policy_document" "save_chat_audio_s3_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      "${aws_s3_bucket.audio_recordings.arn}",
      "${aws_s3_bucket.audio_recordings.arn}/*",
    ]
  }
}

# Create the IAM policy
resource "aws_iam_policy" "save_chat_audio_s3_policy" {
  name        = "save-chat-audio-s3-policy"
  description = "Policy allowing the save-chat-audio-to-s3 Lambda to interact with the audio recordings S3 bucket"
  policy      = data.aws_iam_policy_document.save_chat_audio_s3_policy.json
}

# Attach the policy to the Lambda role
resource "aws_iam_role_policy_attachment" "save_chat_audio_s3_attachment" {
  role       = module.save_chat_audio_to_s3_lambda.lambda_execution_role_name
  policy_arn = aws_iam_policy.save_chat_audio_s3_policy.arn
}

module "save_chat_audio_to_s3_lambda_sqs" {
  source                     = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/lambda_sqs_queue"
  queue_name                 = "save-chat-audio-to-s3-queue"
  project_name               = local.project_name
  lambda_execution_role_name = module.save_chat_audio_to_s3_lambda.lambda_execution_role_name
  lambda_function_name       = module.save_chat_audio_to_s3_lambda.function_name
}

output "save_chat_audio_to_s3_lambda_sqs_queue_url" {
  value = module.save_chat_audio_to_s3_lambda_sqs.sqs_queue_url
}

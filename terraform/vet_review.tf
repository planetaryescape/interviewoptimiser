module "vet_review_lambda" {
  source        = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/lambda_function"
  function_name = "vet-review"
  project_name  = local.project_name
  region        = local.region
  environment_variables = {
    DATABASE_URL           = var.DATABASE_URL
    OPENAI_API_KEY         = var.OPENAI_API_KEY
    RESEND_API_KEY         = var.RESEND_API_KEY
    PINO_LOG_LEVEL         = "info"
    LAMBDA_AWS_REGION      = local.region
    DISCORD_BOT_TOKEN      = var.DISCORD_BOT_TOKEN
    SENTRY_RELEASE_VERSION = var.sentry_release_version
    SENTRY_DSN             = "https://6c0af4af9084afc6ecc6166ade3c37c4@o4508119114514432.ingest.de.sentry.io/4508248043814992"
  }
}

# CloudWatch Event Rule for vet-review Lambda
resource "aws_cloudwatch_event_rule" "daily_review_vetting" {
  name                = "vet-review-schedule"
  description         = "Trigger review vetting Lambda function daily"
  schedule_expression = "cron(0 1 * * ? *)" # Run at 1am UTC daily
}

resource "aws_cloudwatch_event_target" "vet_review_target" {
  rule      = aws_cloudwatch_event_rule.daily_review_vetting.name
  target_id = "vet-review-schedule"
  arn       = module.vet_review_lambda.function_arn
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch_to_call_vet_review" {
  statement_id  = "allow-cloudwatch-to-invoke-vet-review"
  action        = "lambda:InvokeFunction"
  function_name = module.vet_review_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_review_vetting.arn
}

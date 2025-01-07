module "regenerate_incomplete_reports_lambda" {
  source        = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/lambda_function"
  function_name = "regenerate-incomplete-reports"
  region        = local.region
  project_name  = local.project_name
  environment_variables = {
    DATABASE_URL       = var.DATABASE_URL
    OPENAI_API_KEY     = var.OPENAI_API_KEY
    REPORT_LAMBDA_NAME = module.generate_report_lambda.function_name
    SQS_QUEUE_URL      = module.generate_report_lambda_sqs.sqs_queue_url
    PINO_LOG_LEVEL     = "info"
    DISCORD_BOT_TOKEN  = var.DISCORD_BOT_TOKEN
    SENTRY_DSN         = "https://abf04e7d8150b91d6693971ce1495588@o4508119114514432.ingest.de.sentry.io/4508324268605520"
  }
}

# CloudWatch Event Rule
resource "aws_cloudwatch_event_rule" "regenerate_incomplete_reports_schedule" {
  name                = "regenerate-incomplete-reports-schedule"
  description         = "Trigger regenerate-incomplete-reports Lambda function every 10 minutes"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "regenerate_incomplete_reports_target" {
  rule      = aws_cloudwatch_event_rule.regenerate_incomplete_reports_schedule.name
  target_id = "RegenerateIncompleteReportsLambda"
  arn       = module.regenerate_incomplete_reports_lambda.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_regenerate_incomplete_reports" {
  statement_id  = "AllowCloudWatchToInvokeRegenerateIncompleteReportsLambda"
  action        = "lambda:InvokeFunction"
  function_name = module.regenerate_incomplete_reports_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.regenerate_incomplete_reports_schedule.arn
}



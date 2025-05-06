module "generate_missing_audio_lambda" {
  source        = "git@github.com:planetaryescape/shared-infra.git//terraform/modules/lambda_function"
  function_name = "generate-missing-audio"
  region        = local.region
  project_name  = local.project_name
  environment_variables = {
    DATABASE_URL       = var.DATABASE_URL
    OPENAI_API_KEY     = var.OPENAI_API_KEY
    REPORT_LAMBDA_NAME = module.generate_report_lambda.function_name
    PINO_LOG_LEVEL     = "info"
    DISCORD_BOT_TOKEN  = var.DISCORD_BOT_TOKEN
    HUME_API_KEY       = var.HUME_API_KEY
    SENTRY_DSN         = "https://5a46050ef988ec233196cd7ce06a4fc0@o4508119114514432.ingest.de.sentry.io/4509276040134736"
    API_GATEWAY_URL    = "https://90w85lvw6l.execute-api.eu-west-2.amazonaws.com/prod/shared-infra-add-to-queue"
  }
}

resource "aws_cloudwatch_event_rule" "generate_missing_audio_schedule" {
  name                = "generate-missing-audio-schedule"
  description         = "Trigger generate-missing-audio Lambda function every 10 minutes"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "generate_missing_audio_target" {
  rule      = aws_cloudwatch_event_rule.generate_missing_audio_schedule.name
  target_id = "GenerateMissingAudioLambda"
  arn       = module.generate_missing_audio_lambda.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_generate_missing_audio" {
  statement_id  = "AllowCloudWatchToInvokeGenerateMissingAudioLambda"
  action        = "lambda:InvokeFunction"
  function_name = module.generate_missing_audio_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.generate_missing_audio_schedule.arn
}
module "generate_report_lambda" {
  source        = "./modules/lambda_function"
  function_name = "generate-report"
  region        = local.current_region
  project_name  = local.project_name

  environment_variables = {
    DATABASE_URL      = var.DATABASE_URL
    OPENAI_API_KEY    = var.OPENAI_API_KEY
    HELICONE_API_KEY  = var.HELICONE_API_KEY
    POSTHOG_KEY       = var.POSTHOG_KEY
    DISCORD_BOT_TOKEN = var.DISCORD_BOT_TOKEN
    SENTRY_DSN        = "https://a1c3a134e74ec680a4cc42024dee1a08@o4508119114514432.ingest.de.sentry.io/4508248038572112"

    SQS_QUEUE_URL = module.generate_report_lambda_sqs.sqs_queue_url
    DLQ_URL       = module.generate_report_lambda_sqs.dlq_url
  }

}

module "generate_report_lambda_sqs" {
  source                     = "./modules/lambda_sqs_queue"
  queue_name                 = "generate-report-queue"
  project_name               = local.project_name
  lambda_execution_role_name = module.generate_report_lambda.lambda_execution_role_name
  lambda_function_name       = module.generate_report_lambda.function_name
}

output "generate_report_lambda_sqs_queue_url" {
  value = module.generate_report_lambda_sqs.sqs_queue_url
}

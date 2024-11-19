// lambda.tf

# Archive Lambda functions (except generate-pdf)
data "archive_file" "lambda_zips" {
  for_each = {
    for k, v in local.lambda_details : k => v
  }

  type        = "zip"
  source_dir  = each.value.lambda_path
  output_path = "${each.value.lambda_path}${each.value.lambda_zip_filename}"
}

# Create Lambda functions (except generate-pdf)
resource "aws_lambda_function" "lambdas" {
  for_each = {
    for k, v in local.lambda_details : k => v
  }

  function_name    = each.value.function_name
  runtime          = local.lambda_runtime
  handler          = "index.handler"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = data.archive_file.lambda_zips[each.key].output_path
  source_code_hash = filebase64sha256(data.archive_file.lambda_zips[each.key].output_path)
  timeout          = 300
  memory_size      = 512

  environment {
    variables = local.lambda_environment_variables[each.key]
  }

  lifecycle {
    create_before_destroy = true
    # Remove the non-configurable attributes
    ignore_changes = []
  }
}

# Event source mapping for generate_report Lambda function
resource "aws_lambda_event_source_mapping" "generate_report_mapping" {
  event_source_arn = aws_sqs_queue.generate_report_queue.arn
  function_name    = aws_lambda_function.lambdas["generate_report"].arn
  batch_size       = 1
  enabled          = true
}

# Lambda permissions
resource "aws_lambda_permission" "allow_sqs_to_call_generate_report" {
  statement_id  = "AllowSQSTriggerGenerateReport"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["generate_report"].function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.generate_report_queue.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_regenerate_incomplete_reports" {
  statement_id  = "AllowCloudWatchToInvokeRegenerateIncompleteReportsLambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["regenerate_incomplete_reports"].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_10m_regenerate_incomplete_reports.arn
}

# CloudWatch Event Rule
resource "aws_cloudwatch_event_rule" "every_10m_regenerate_incomplete_reports" {
  name                = "every-10m-regenerate-incomplete-reports"
  description         = "Trigger regenerate-incomplete-reports Lambda function every 10 minutes"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "regenerate_incomplete_reports_target" {
  rule      = aws_cloudwatch_event_rule.every_10m_regenerate_incomplete_reports.name
  target_id = "RegenerateIncompleteReportsLambda"
  arn       = aws_lambda_function.lambdas["regenerate_incomplete_reports"].arn
}

// lambda.tf

# Archive Lambda functions (except generate-pdf)
data "archive_file" "lambda_zips" {
  for_each = {
    for k, v in local.lambda_details : k => v
    if k != "generate_pdf"
  }

  type        = "zip"
  source_dir  = each.value.lambda_path
  output_path = "${each.value.lambda_path}${each.value.lambda_zip_filename}"
}

# Create Lambda functions (except generate-pdf)
resource "aws_lambda_function" "lambdas" {
  for_each = {
    for k, v in local.lambda_details : k => v
    if k != "generate_pdf"
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
    ignore_changes        = [last_modified, version, qualified_arn]
  }
}

# Archive generate-pdf Lambda function
data "archive_file" "generate_pdf_zip" {
  type        = "zip"
  source_dir  = local.lambda_details["generate_pdf"].lambda_path
  output_path = "${local.lambda_details["generate_pdf"].lambda_path}${local.lambda_details["generate_pdf"].lambda_zip_filename}"
}

# Create generate-pdf Lambda function
resource "aws_s3_object" "generate_pdf_lambda_package" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "lambda_functions/generate_pdf_${filemd5(data.archive_file.generate_pdf_zip.output_path)}.zip"
  source = data.archive_file.generate_pdf_zip.output_path
  etag   = filemd5(data.archive_file.generate_pdf_zip.output_path)
}

resource "aws_lambda_function" "generate_pdf" {
  function_name    = "${local.project_name}-generate-pdf"
  s3_bucket        = aws_s3_bucket.lambda_bucket.id
  s3_key           = aws_s3_object.generate_pdf_lambda_package.key
  source_code_hash = filebase64sha256(data.archive_file.generate_pdf_zip.output_path)
  handler          = "index.handler"
  runtime          = local.lambda_runtime
  role             = aws_iam_role.lambda_execution_role.arn
  timeout          = 900
  memory_size      = 1024

  environment {
    variables = local.lambda_environment_variables["generate_pdf"]
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [last_modified]
  }
}

# Event source mapping for optimise_cv Lambda function
resource "aws_lambda_event_source_mapping" "optimise_cv_mapping" {
  event_source_arn = aws_sqs_queue.optimise_cv_queue.arn
  function_name    = aws_lambda_function.lambdas["optimise_cv"].arn
  batch_size       = 1
  enabled          = true
}

# Event source mapping for generate_cover_letter Lambda function
resource "aws_lambda_event_source_mapping" "generate_cover_letter_mapping" {
  event_source_arn = aws_sqs_queue.generate_cover_letter_queue.arn
  function_name    = aws_lambda_function.lambdas["generate_cover_letter"].arn
  batch_size       = 1
  enabled          = true
}

# Lambda permissions
resource "aws_lambda_permission" "allow_sqs_to_call_optimise_cv" {
  statement_id  = "AllowSQSTriggerOptimiseCV"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["optimise_cv"].function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.optimise_cv_queue.arn
}

resource "aws_lambda_permission" "allow_sqs_to_call_generate_cover_letter" {
  statement_id  = "AllowSQSTriggerGenerateCoverLetter"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["generate_cover_letter"].function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.generate_cover_letter_queue.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_restart_incomplete_optimizations" {
  statement_id  = "AllowCloudWatchToInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["restart_incomplete_optimizations"].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_10m_restart_incomplete_optimizations.arn
}

# CloudWatch Event Rule
resource "aws_cloudwatch_event_rule" "every_10m_restart_incomplete_optimizations" {
  name                = "every-10m-restart-incomplete-optimizations"
  description         = "Trigger restart-incomplete-optimizations Lambda function every 10 minutes"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "restart_incomplete_optimizations_target" {
  rule      = aws_cloudwatch_event_rule.every_10m_restart_incomplete_optimizations.name
  target_id = "RestartIncompleteOptimizationsLambda"
  arn       = aws_lambda_function.lambdas["restart_incomplete_optimizations"].arn
}

# Lambda permission for API Gateway v2
resource "aws_lambda_permission" "api_gateway_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambdas["add_to_queue"].function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda permission for API Gateway v2 to invoke generate-pdf
resource "aws_lambda_permission" "api_gateway_generate_pdf" {
  statement_id  = "AllowAPIGatewayInvokeGeneratePDF"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_pdf.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.generate_pdf.execution_arn}/*/*"
}
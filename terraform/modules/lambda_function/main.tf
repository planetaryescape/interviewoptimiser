data "archive_file" "lambda_zip" {
  type = "zip"

  source_dir  = local.lambda_path
  output_path = "${local.artifacts_dir}/${local.lambda_zip_filename}"
}

resource "aws_lambda_function" "lambdas" {
  function_name    = local.function_name
  runtime          = local.lambda_runtime
  handler          = "index.handler"
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)
  timeout          = 440
  memory_size      = 512

  environment {
    variables = merge(
      var.environment_variables
    )
  }

  depends_on = [aws_s3_object.lambda_zip]
}

